import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const createOrder = asyncHandler(async (req, res) => {
  const { sellerId, productId, amount } = req.body;

  const buyerId = req.user.id;
  if (!buyerId || !sellerId || !productId || !amount) {
    throw new ApiError(
      400,
      "Buyer ID, Seller ID, Product ID, and Amount are required"
    );
  }

  if (
    !mongoose.Types.ObjectId.isValid(buyerId) ||
    !mongoose.Types.ObjectId.isValid(sellerId) ||
    !mongoose.Types.ObjectId.isValid(productId)
  ) {
    throw new ApiError(400, "Invalid ID format");
  }

  // Check if product exists and has stock
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (product.amountLeft - amount < 0) {
    throw new ApiError(400, "Product is out of stock");
  }

  const order = await Order.create({
    buyerId,
    sellerId,
    productId,
    amount,
  });

  if (!order) {
    throw new ApiError(500, "Something went wrong while creating the order");
  }

  // Decrease product stock
  await Product.findByIdAndUpdate(
    productId,
    { $inc: { amountLeft: -amount } },
    { new: true }
  );

  const createdOrder = await Order.findById(order._id)
    .populate("buyerId", "fullName email phone")
    .populate("sellerId", "shopName ownerName email address")
    .populate("productId", "name description price category");

  return res
    .status(201)
    .json(new ApiResponse(201, createdOrder, "Order created successfully"));
});

const getAllOrders = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

  const orders = await Order.find()
    .populate("buyerId", "fullName email phone")
    .populate("sellerId", "shopName ownerName email phone")
    .populate("productId", "name description price category")
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const totalOrders = await Order.countDocuments();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        orders,
        totalOrders,
        totalPages: Math.ceil(totalOrders / limit),
        currentPage: page,
      },
      "Orders fetched successfully"
    )
  );
});

const getOrderById = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(400, "Invalid order ID");
  }

  const order = await Order.findById(orderId)
    .populate("buyerId", "fullName email phone")
    .populate("sellerId", "shopName ownerName email phone")
    .populate("productId", "name description price category");

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order fetched successfully"));
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { isCancelled, isDelivered } = req.body;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(400, "Invalid order ID");
  }

  const updateFields = {};
  if (isCancelled !== undefined) updateFields.isCancelled = isCancelled;
  if (isDelivered !== undefined) updateFields.isDelivered = isDelivered;

  const order = await Order.findByIdAndUpdate(
    orderId,
    { $set: updateFields },
    { new: true, runValidators: true }
  )
    .populate("buyerId", "fullName email phone")
    .populate("sellerId", "shopName ownerName email phone")
    .populate("productId", "name description price category");

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // If order is cancelled, increase product stock back
  if (isCancelled && !order.isCancelled) {
    await Product.findByIdAndUpdate(
      order.productId._id,
      { $inc: { amountLeft: 1 } },
      { new: true }
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order status updated successfully"));
});

const cancelOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid order ID");
  }

  let order;
  if (req.user.role === "BUYER") {
    order = await Order.findOne({ _id: id, buyerId: req.user.id });
  } else {
    order = await Order.findOne({ _id: id, sellerId: req.user.id });
  }

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.isDeprecated) {
    throw new ApiError(400, "Order is already cancelled");
  }

  if (order.isDelivered) {
    throw new ApiError(400, "Cannot cancel a delivered order");
  }

  const updatedOrder = await Order.findByIdAndUpdate(
    id,
    { $set: { isDeprecated: true } },
    { new: true }
  )
    .populate("buyerId", "fullName email phone")
    .populate("sellerId", "shopName ownerName email phone")
    .populate("productId", "name description price category");

  // Increase product stock back
  await Product.findByIdAndUpdate(
    order.productId,
    { $inc: { amountLeft: order.amount } },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedOrder, "Order cancelled successfully"));
});

const markOrderAsDelivered = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid order ID");
  }
  if (req.user.role !== "SELLER") {
    throw new ApiError(403, "Only sellers can mark orders as delivered");
  }
  const order = await Order.findById(id);

  if (order.sellerId.toString() !== req.user.id) {
    throw new ApiError(403, "You are not authorized to deliver this order");
  }

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.isCancelled) {
    throw new ApiError(400, "Cannot deliver a cancelled order");
  }

  if (order.isDelivered) {
    throw new ApiError(400, "Order is already delivered");
  }

  const updatedOrder = await Order.findByIdAndUpdate(
    id,
    { $set: { isDelivered: true } },
    { new: true }
  )
    .populate("buyerId", "fullName email phone")
    .populate("sellerId", "shopName ownerName email phone")
    .populate("productId", "name description price category");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedOrder,
        "Order marked as delivered successfully"
      )
    );
});

const getOrdersByBuyer = asyncHandler(async (req, res) => {
  const { buyerId } = req.params;
  const { page = 1, limit = 10, status } = req.query;

  if (!mongoose.Types.ObjectId.isValid(buyerId)) {
    throw new ApiError(400, "Invalid buyer ID");
  }

  const filter = { buyerId };
  if (status === "cancelled") filter.isCancelled = true;
  if (status === "delivered") filter.isDelivered = true;
  if (status === "pending") {
    filter.isCancelled = false;
    filter.isDelivered = false;
  }

  const orders = await Order.find(filter)
    .populate("sellerId", "shopName ownerName email phone")
    .populate("productId", "name description price category")
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const totalOrders = await Order.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        orders,
        totalOrders,
        totalPages: Math.ceil(totalOrders / limit),
        currentPage: page,
      },
      "Buyer orders fetched successfully"
    )
  );
});

const getOrdersBySeller = asyncHandler(async (req, res) => {
  const id = req.user._id;
  const { page = 1, limit = 10, status } = req.query;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid seller ID");
  }

  if (req.user.role !== "SELLER") {
    throw new ApiError(403, "Only sellers can view their orders");
  }

  const filter = { sellerId: id };
  if (status === "cancelled") filter.isCancelled = true;
  if (status === "delivered") filter.isDelivered = true;
  if (status === "pending") {
    filter.isCancelled = false;
    filter.isDelivered = false;
  }

  const orders = await Order.find(filter)
    .populate("buyerId", "fullName email phone")
    .populate("productId", "name description price category")
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const totalOrders = await Order.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        orders,
        totalOrders,
        totalPages: Math.ceil(totalOrders / limit),
        currentPage: page,
      },
      "Seller orders fetched successfully"
    )
  );
});

const getOrderStats = asyncHandler(async (req, res) => {
  const totalOrders = await Order.countDocuments();
  const deliveredOrders = await Order.countDocuments({ isDelivered: true });
  const cancelledOrders = await Order.countDocuments({ isCancelled: true });
  const pendingOrders = await Order.countDocuments({
    isDelivered: false,
    isCancelled: false,
  });

  const stats = {
    totalOrders,
    deliveredOrders,
    cancelledOrders,
    pendingOrders,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, stats, "Order statistics fetched successfully"));
});

export {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  markOrderAsDelivered,
  getOrdersByBuyer,
  getOrdersBySeller,
  getOrderStats,
};
