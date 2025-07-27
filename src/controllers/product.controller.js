import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import Product from "../models/product.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category, amountLeft } = req.body;

  const sellerId = req.user._id;
  if (!name || !description || !price || !category || !sellerId) {
    throw new ApiError(400, "All required fields must be provided");
  }
  if (req.user.role !== "SELLER") {
    throw new ApiError(403, "Only sellers can create products");
  }
  if (!Array.isArray(price) || price.length === 0) {
    throw new ApiError(400, "Price must be an array with at least one value");
  }

  if (amountLeft <= 20) {
    throw new ApiError(400, "Starting Amount  must be greater than 20");
  }

  const product = await Product.create({
    name,
    description,
    price,
    category,
    sellerId,
    amountLeft: amountLeft || 0,
  });

  if (!product) {
    throw new ApiError(500, "Something went wrong while creating the product");
  }

  await product.populate("sellerId", "shopName ownerName email address");

  return res
    .status(201)
    .json(new ApiResponse(201, product, "Product created successfully"));
});

const getAllProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    category,
    sellerId,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.body;

  const filter = {};
  if (category) filter.category = category;
  if (sellerId) {
    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      throw new ApiError(400, "Invalid seller ID");
    }
    filter.sellerId = sellerId;
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

  const products = await Product.find(filter)
    .populate("sellerId", "shopName ownerName email phone")
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const totalProducts = await Product.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        products,
        totalProducts,
        totalPages: Math.ceil(totalProducts / limit),
        currentPage: page,
      },
      "Products fetched successfully"
    )
  );
});

const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid product ID");
  }

  const product = await Product.findById(id).populate(
    "sellerId",
    "shopName ownerName email phone address"
  );

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product fetched successfully"));
});

const updateProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { name, description, price, category, amountLeft } = req.body;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product ID");
  }

  const updateFields = {};
  if (name) updateFields.name = name;
  if (description) updateFields.description = description;
  if (price) updateFields.price = price;
  if (category) updateFields.category = category;
  if (amountLeft !== undefined) updateFields.amountLeft = amountLeft;
  const check = await Product.findById(productId);

  if (
    !check ||
    req.user.role !== "SELLER" ||
    check.sellerId.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "Not authorized seller to update this product");
  }

  const product = await Product.findByIdAndUpdate(
    productId,
    { $set: updateFields },
    { new: true, runValidators: true }
  ).populate("sellerId", "shopName ownerName email phone");

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product updated successfully"));
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid product ID");
  }
  const check = await Product.findById(id);
  if (
    check.sellerId.toString() !== req.user._id.toString() ||
    req.user.role !== "SELLER"
  ) {
    throw new ApiError(403, "Not authorized seller to delete this product");
  }

  const product = await Product.findByIdAndDelete(id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Product deleted successfully"));
});

const getProductsBySeller = asyncHandler(async (req, res) => {
  const { sellerId } = req.params;
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  if (!mongoose.Types.ObjectId.isValid(sellerId)) {
    throw new ApiError(400, "Invalid seller ID");
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

  const products = await Product.find({ sellerId })
    .populate("sellerId", "shopName ownerName email phone")
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const totalProducts = await Product.countDocuments({ sellerId });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        products,
        totalProducts,
        totalPages: Math.ceil(totalProducts / limit),
        currentPage: page,
      },
      "Seller products fetched successfully"
    )
  );
});

const searchProducts = asyncHandler(async (req, res) => {
  const {
    query,
    page = 1,
    limit = 10,
    category,
    minPrice,
    maxPrice,
  } = req.query;

  if (!query) {
    throw new ApiError(400, "Search query is required");
  }

  const filter = {
    $or: [
      { name: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ],
  };

  if (category) filter.category = category;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const products = await Product.find(filter)
    .populate("sellerId", "shopName ownerName email phone")
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const totalProducts = await Product.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        products,
        totalProducts,
        totalPages: Math.ceil(totalProducts / limit),
        currentPage: page,
      },
      "Products search completed successfully"
    )
  );
});

const updateProductStock = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { amountLeft } = req.body;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product ID");
  }

  if (amountLeft === undefined || amountLeft < 0) {
    throw new ApiError(400, "Valid amount left is required");
  }

  const product = await Product.findByIdAndUpdate(
    productId,
    { $set: { amountLeft } },
    { new: true, runValidators: true }
  ).populate("sellerId", "shopName ownerName email phone");

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product stock updated successfully"));
});

export {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsBySeller,
  searchProducts,
  updateProductStock,
};
