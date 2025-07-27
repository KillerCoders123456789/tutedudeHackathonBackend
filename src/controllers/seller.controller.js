import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import Seller from "../models/seller.model.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const createSeller = asyncHandler(async (req, res) => {
  const { shopName, ownerName, email, phone, address, role, adhar } = req.body;

  if (
    !shopName ||
    !ownerName ||
    !email ||
    !phone ||
    !address ||
    !role ||
    !adhar
  ) {
    throw new ApiError(400, "All fields are required");
  }

  if (role !== "SELLER") {
    throw new ApiError(400, "Invalid role");
  }

  if (!mongoose.Types.ObjectId.isValid(role)) {
    throw new ApiError(400, "Invalid role ID");
  }

  const existingSeller = await Seller.findOne({
    $or: [{ email }, { phone }],
  });

  if (existingSeller) {
    throw new ApiError(409, "Seller with this email or phone already exists");
  }

  const seller = await Seller.create({
    shopName,
    ownerName,
    email,
    phone,
    address,
    role,
  });

  const createdSeller = await Seller.findById(seller._id).populate(
    "role",
    "name"
  );

  if (!createdSeller) {
    throw new ApiError(500, "Something went wrong while creating the seller");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdSeller, "Seller created successfully"));
});

const getAllSellers = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

  const sellers = await User.find({ role: "SELLER" })
    .populate("role", "name")
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .select("-password -refreshToken");

  

  const totalSellers = await User.countDocuments({role:"SELLER"});

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        sellers,
        totalSellers,
        totalPages: Math.ceil(totalSellers / limit),
        currentPage: page,
      },
      "Sellers fetched successfully"
    )
  );
});

const getSellerById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid seller ID");
  }
  // console.log("Seller ID:", id);
  const seller = await User.findById(id).populate("role", "name");

  if (!seller) {
    throw new ApiError(404, "Seller not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, seller, "Seller fetched successfully"));
});

const updateSeller = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { shopname, fullName, email, phone, address } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid seller ID");
  }

  const updateFields = {};
  if (shopname) updateFields.shopname = shopname;
  if (fullName) updateFields.fullName = fullName;
  if (email) updateFields.email = email;
  if (phone) updateFields.phone = phone;
  if (address) updateFields.address = address;

  // Check if email or phone already exists for other sellers
  if (email || phone) {
    const existingSeller = await User.findOne({
      _id: { $ne: id },
      $or: [...(email ? [{ email }] : []), ...(phone ? [{ phone }] : [])],
    });

    if (existingSeller) {
      throw new ApiError(409, "Seller with this email or phone already exists");
    }
  }

  const seller = await User.findByIdAndUpdate(
    id,
    { $set: updateFields },
    { new: true, runValidators: true }
  ).populate("role", "name");

  if (!seller) {
    throw new ApiError(404, "Seller not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, seller, "Seller updated successfully"));
});

const deleteSeller = asyncHandler(async (req, res) => {
  const { sellerId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(sellerId)) {
    throw new ApiError(400, "Invalid seller ID");
  }

  const seller = await Seller.findByIdAndDelete(sellerId);

  if (!seller) {
    throw new ApiError(404, "Seller not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Seller deleted successfully"));
});

const searchSellers = asyncHandler(async (req, res) => {
  const { query, page = 1, limit = 10 } = req.query;

  if (!query) {
    throw new ApiError(400, "Search query is required");
  }

  const filter = {
    $or: [
      { shopname: { $regex: query, $options: "i" } },
      { fullName: { $regex: query, $options: "i" } },
      { email: { $regex: query, $options: "i" } },
    ],
  };

  const sellers = await Seller.find(filter)
    .populate("role", "name")
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const totalSellers = await Seller.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        sellers,
        totalSellers,
        totalPages: Math.ceil(totalSellers / limit),
        currentPage: page,
      },
      "Sellers search completed successfully"
    )
  );
});

const updateSellerReviewCount = asyncHandler(async (req, res) => {
  const { sellerId } = req.params;
  const { reviewcount } = req.body;

  if (!mongoose.Types.ObjectId.isValid(sellerId)) {
    throw new ApiError(400, "Invalid seller ID");
  }

  if (reviewcount === undefined || reviewcount < 0) {
    throw new ApiError(400, "Valid review count is required");
  }

  const seller = await Seller.findByIdAndUpdate(
    sellerId,
    { $set: { reviewcount } },
    { new: true, runValidators: true }
  ).populate("role", "name");

  if (!seller) {
    throw new ApiError(404, "Seller not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, seller, "Seller review count updated successfully")
    );
});

const getSellerStats = asyncHandler(async (req, res) => {
  const { sellerId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(sellerId)) {
    throw new ApiError(400, "Invalid seller ID");
  }

  const seller = await Seller.findById(sellerId).populate("role", "name");

  if (!seller) {
    throw new ApiError(404, "Seller not found");
  }

  // You can add more aggregation logic here to get product count, order count, etc.
  const stats = {
    seller,
    reviewCount: seller.reviewcount,
    // Add more stats as needed
  };

  return res
    .status(200)
    .json(new ApiResponse(200, stats, "Seller stats fetched successfully"));
});

export {
  createSeller,
  getAllSellers,
  getSellerById,
  updateSeller,
  deleteSeller,
  searchSellers,
  updateSellerReviewCount,
  getSellerStats,
};
