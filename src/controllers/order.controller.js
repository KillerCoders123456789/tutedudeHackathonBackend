import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const createOrder = asyncHandler(async (req, res) => {
  const { buyerId, sellerId, productId } = req.body;

  if (!buyerId || !sellerId || !productId) {
    throw new ApiError(400, "Buyer ID, Seller ID, and Product ID are required");
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

  if (product.amountLeft <= 0) {
    throw new ApiError(400, "Product is out of stock");
  }

  const order = await Order.create({
    buyerId,
    sellerId,
    productId,
  });

  if (!order) {
    throw new ApiError(500, "Something went wrong while creating the order");
  }

  // Decrease product stock
  await Product.findByIdAndUpdate(
    productId,
    { $inc: { amountLeft: -1 } },
    { new: true }
  );

  const createdOrder = await Order.findById(order._id)
    .populate("buyerId", "fullName email phone")
    .populate("sellerId", "shopName ownerName email phone")
    .populate("productId", "name description price category");

  return res
    .status(201)
    .json(new ApiResponse(201, createdOrder, "Order created successfully"));
});

const getAllOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = req.query;

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
  const { orderId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(400, "Invalid order ID");
  }

  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.isCancelled) {
    throw new ApiError(400, "Order is already cancelled");
  }

  if (order.isDelivered) {
    throw new ApiError(400, "Cannot cancel a delivered order");
  }

  const updatedOrder = await Order.findByIdAndUpdate(
    orderId,
    { $set: { isCancelled: true } },
    { new: true }
  )
    .populate("buyerId", "fullName email phone")
    .populate("sellerId", "shopName ownerName email phone")
    .populate("productId", "name description price category");

  // Increase product stock back
  await Product.findByIdAndUpdate(
    order.productId,
    { $inc: { amountLeft: 1 } },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedOrder, "Order cancelled successfully"));
});

const markOrderAsDelivered = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(400, "Invalid order ID");
  }

  const order = await Order.findById(orderId);

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
    orderId,
    { $set: { isDelivered: true } },
    { new: true }
  )
    .populate("buyerId", "fullName email phone")
    .populate("sellerId", "shopName ownerName email phone")
    .populate("productId", "name description price category");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedOrder, "Order marked as delivered successfully"));
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
  const { sellerId } = req.params;
  const { page = 1, limit = 10, status } = req.query;

  if (!mongoose.Types.ObjectId.isValid(sellerId)) {
    throw new ApiError(400, "Invalid seller ID");
  }

  const filter = { sellerId };
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
