import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import Review from "../models/review.model.js";
import Seller from "../models/seller.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const createReview = asyncHandler(async (req, res) => {
  const { buyerId, productId, sellerId, rating, comment } = req.body;

  if (!buyerId || !productId || !sellerId || !rating || !comment) {
    throw new ApiError(400, "All fields are required");
  }

  if (
    !mongoose.Types.ObjectId.isValid(buyerId) ||
    !mongoose.Types.ObjectId.isValid(productId) ||
    !mongoose.Types.ObjectId.isValid(sellerId)
  ) {
    throw new ApiError(400, "Invalid ID format");
  }

  if (rating < 1 || rating > 5) {
    throw new ApiError(400, "Rating must be between 1 and 5");
  }

  // Check if user has already reviewed this product
  const existingReview = await Review.findOne({
    buyerId,
    productId,
    sellerId,
  });

  if (existingReview) {
    throw new ApiError(409, "You have already reviewed this product");
  }

  const review = await Review.create({
    buyerId,
    productId,
    sellerId,
    rating,
    comment,
  });

  if (!review) {
    throw new ApiError(500, "Something went wrong while creating the review");
  }

  // Update seller's review count
  await Seller.findByIdAndUpdate(
    sellerId,
    { $inc: { reviewcount: 1 } },
    { new: true }
  );

  const createdReview = await Review.findById(review._id)
    .populate("buyerId", "fullName email")
    .populate("productId", "name description")
    .populate("sellerId", "shopName ownerName");

  return res
    .status(201)
    .json(new ApiResponse(201, createdReview, "Review created successfully"));
});

const getAllReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = req.query;

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

  const reviews = await Review.find()
    .populate("buyerId", "fullName email")
    .populate("productId", "name description")
    .populate("sellerId", "shopName ownerName")
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const totalReviews = await Review.countDocuments();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        reviews,
        totalReviews,
        totalPages: Math.ceil(totalReviews / limit),
        currentPage: page,
      },
      "Reviews fetched successfully"
    )
  );
});

const getReviewById = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    throw new ApiError(400, "Invalid review ID");
  }

  const review = await Review.findById(reviewId)
    .populate("buyerId", "fullName email")
    .populate("productId", "name description")
    .populate("sellerId", "shopName ownerName");

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, review, "Review fetched successfully"));
});

const updateReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const { rating, comment } = req.body;

  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    throw new ApiError(400, "Invalid review ID");
  }

  const updateFields = {};
  if (rating !== undefined) {
    if (rating < 1 || rating > 5) {
      throw new ApiError(400, "Rating must be between 1 and 5");
    }
    updateFields.rating = rating;
  }
  if (comment) updateFields.comment = comment;

  const review = await Review.findByIdAndUpdate(
    reviewId,
    { $set: updateFields },
    { new: true, runValidators: true }
  )
    .populate("buyerId", "fullName email")
    .populate("productId", "name description")
    .populate("sellerId", "shopName ownerName");

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, review, "Review updated successfully"));
});

const deleteReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    throw new ApiError(400, "Invalid review ID");
  }

  const review = await Review.findById(reviewId);

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  await Review.findByIdAndDelete(reviewId);

  // Decrease seller's review count
  await Seller.findByIdAndUpdate(
    review.sellerId,
    { $inc: { reviewcount: -1 } },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Review deleted successfully"));
});

const getReviewsByProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = req.query;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product ID");
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

  const reviews = await Review.find({ productId })
    .populate("buyerId", "fullName email")
    .populate("sellerId", "shopName ownerName")
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const totalReviews = await Review.countDocuments({ productId });

  // Calculate average rating
  const ratingStats = await Review.aggregate([
    { $match: { productId: new mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  const averageRating = ratingStats.length > 0 ? ratingStats[0].averageRating : 0;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        reviews,
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        totalPages: Math.ceil(totalReviews / limit),
        currentPage: page,
      },
      "Product reviews fetched successfully"
    )
  );
});

const getReviewsBySeller = asyncHandler(async (req, res) => {
  const { sellerId } = req.params;
  const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = req.query;

  if (!mongoose.Types.ObjectId.isValid(sellerId)) {
    throw new ApiError(400, "Invalid seller ID");
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

  const reviews = await Review.find({ sellerId })
    .populate("buyerId", "fullName email")
    .populate("productId", "name description")
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const totalReviews = await Review.countDocuments({ sellerId });

  // Calculate average rating for seller
  const ratingStats = await Review.aggregate([
    { $match: { sellerId: new mongoose.Types.ObjectId(sellerId) } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  const averageRating = ratingStats.length > 0 ? ratingStats[0].averageRating : 0;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        reviews,
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        totalPages: Math.ceil(totalReviews / limit),
        currentPage: page,
      },
      "Seller reviews fetched successfully"
    )
  );
});

const getReviewsByBuyer = asyncHandler(async (req, res) => {
  const { buyerId } = req.params;
  const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = req.query;

  if (!mongoose.Types.ObjectId.isValid(buyerId)) {
    throw new ApiError(400, "Invalid buyer ID");
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

  const reviews = await Review.find({ buyerId })
    .populate("productId", "name description")
    .populate("sellerId", "shopName ownerName")
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const totalReviews = await Review.countDocuments({ buyerId });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        reviews,
        totalReviews,
        totalPages: Math.ceil(totalReviews / limit),
        currentPage: page,
      },
      "Buyer reviews fetched successfully"
    )
  );
});

const getReviewStats = asyncHandler(async (req, res) => {
  const totalReviews = await Review.countDocuments();

  const ratingDistribution = await Review.aggregate([
    {
      $group: {
        _id: "$rating",
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const averageRating = await Review.aggregate([
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
      },
    },
  ]);

  const stats = {
    totalReviews,
    averageRating: averageRating.length > 0 ? Math.round(averageRating[0].averageRating * 10) / 10 : 0,
    ratingDistribution,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, stats, "Review statistics fetched successfully"));
});

export {
  createReview,
  getAllReviews,
  getReviewById,
  updateReview,
  deleteReview,
  getReviewsByProduct,
  getReviewsBySeller,
  getReviewsByBuyer,
  getReviewStats,
};
