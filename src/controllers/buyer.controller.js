import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import Review from "../models/review.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const getBuyerProfile = asyncHandler(async (req, res) => {
  const { buyerId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(buyerId)) {
    throw new ApiError(400, "Invalid buyer ID");
  }

  const buyer = await User.findById(buyerId).select("-password -refreshToken");

  if (!buyer) {
    throw new ApiError(404, "Buyer not found");
  }

  // Get buyer statistics
  const totalOrders = await Order.countDocuments({ buyerId });
  const deliveredOrders = await Order.countDocuments({ 
    buyerId, 
    isDelivered: true 
  });
  const cancelledOrders = await Order.countDocuments({ 
    buyerId, 
    isCancelled: true 
  });
  const totalReviews = await Review.countDocuments({ buyerId });

  const buyerProfile = {
    ...buyer.toObject(),
    stats: {
      totalOrders,
      deliveredOrders,
      cancelledOrders,
      totalReviews,
    },
  };

  return res
    .status(200)
    .json(new ApiResponse(200, buyerProfile, "Buyer profile fetched successfully"));
});

const getBuyerOrders = asyncHandler(async (req, res) => {
  const { buyerId } = req.params;
  const { 
    page = 1, 
    limit = 10, 
    status, 
    sortBy = "createdAt", 
    sortOrder = "desc" 
  } = req.query;

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

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

  const orders = await Order.find(filter)
    .populate("sellerId", "shopName ownerName email phone address")
    .populate("productId", "name description price category")
    .sort(sortOptions)
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

const getBuyerReviews = asyncHandler(async (req, res) => {
  const { buyerId } = req.params;
  const { 
    page = 1, 
    limit = 10, 
    sortBy = "createdAt", 
    sortOrder = "desc" 
  } = req.query;

  if (!mongoose.Types.ObjectId.isValid(buyerId)) {
    throw new ApiError(400, "Invalid buyer ID");
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

  const reviews = await Review.find({ buyerId })
    .populate("productId", "name description price")
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

const getBuyerWishlist = asyncHandler(async (req, res) => {
  const { buyerId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!mongoose.Types.ObjectId.isValid(buyerId)) {
    throw new ApiError(400, "Invalid buyer ID");
  }

  const buyer = await User.findById(buyerId).select("wishlist");

  if (!buyer) {
    throw new ApiError(404, "Buyer not found");
  }

  // Note: This assumes you have a wishlist field in User model
  // If not implemented, you can modify this based on your wishlist implementation
  const wishlistProducts = await Product.find({
    _id: { $in: buyer.wishlist || [] }
  })
    .populate("sellerId", "shopName ownerName")
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const totalWishlistItems = buyer.wishlist ? buyer.wishlist.length : 0;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        products: wishlistProducts,
        totalItems: totalWishlistItems,
        totalPages: Math.ceil(totalWishlistItems / limit),
        currentPage: page,
      },
      "Buyer wishlist fetched successfully"
    )
  );
});

const addToWishlist = asyncHandler(async (req, res) => {
  const { buyerId } = req.params;
  const { productId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(buyerId) || 
      !mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid buyer ID or product ID");
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const buyer = await User.findByIdAndUpdate(
    buyerId,
    { $addToSet: { wishlist: productId } },
    { new: true }
  ).select("wishlist");

  if (!buyer) {
    throw new ApiError(404, "Buyer not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, buyer, "Product added to wishlist successfully"));
});

const removeFromWishlist = asyncHandler(async (req, res) => {
  const { buyerId, productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(buyerId) || 
      !mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid buyer ID or product ID");
  }

  const buyer = await User.findByIdAndUpdate(
    buyerId,
    { $pull: { wishlist: productId } },
    { new: true }
  ).select("wishlist");

  if (!buyer) {
    throw new ApiError(404, "Buyer not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, buyer, "Product removed from wishlist successfully"));
});

const getBuyerOrderHistory = asyncHandler(async (req, res) => {
  const { buyerId } = req.params;
  const { 
    page = 1, 
    limit = 10, 
    startDate, 
    endDate,
    minAmount,
    maxAmount 
  } = req.query;

  if (!mongoose.Types.ObjectId.isValid(buyerId)) {
    throw new ApiError(400, "Invalid buyer ID");
  }

  const filter = { buyerId };

  // Date range filter
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const orders = await Order.aggregate([
    { $match: filter },
    {
      $lookup: {
        from: "products",
        localField: "productId",
        foreignField: "_id",
        as: "product"
      }
    },
    {
      $lookup: {
        from: "sellers",
        localField: "sellerId",
        foreignField: "_id",
        as: "seller"
      }
    },
    { $unwind: "$product" },
    { $unwind: "$seller" },
    {
      $match: {
        ...(minAmount && { "product.price": { $gte: Number(minAmount) } }),
        ...(maxAmount && { "product.price": { $lte: Number(maxAmount) } })
      }
    },
    { $sort: { createdAt: -1 } },
    { $skip: (page - 1) * limit },
    { $limit: Number(limit) },
    {
      $project: {
        _id: 1,
        isCancelled: 1,
        isDelivered: 1,
        createdAt: 1,
        updatedAt: 1,
        "product.name": 1,
        "product.description": 1,
        "product.price": 1,
        "product.category": 1,
        "seller.shopName": 1,
        "seller.ownerName": 1
      }
    }
  ]);

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
      "Buyer order history fetched successfully"
    )
  );
});

const getBuyerStats = asyncHandler(async (req, res) => {
  const { buyerId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(buyerId)) {
    throw new ApiError(400, "Invalid buyer ID");
  }

  const buyer = await User.findById(buyerId);
  if (!buyer) {
    throw new ApiError(404, "Buyer not found");
  }

  // Aggregate buyer statistics
  const stats = await Order.aggregate([
    { $match: { buyerId: new mongoose.Types.ObjectId(buyerId) } },
    {
      $lookup: {
        from: "products",
        localField: "productId",
        foreignField: "_id",
        as: "product"
      }
    },
    { $unwind: "$product" },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: "$product.price" },
        deliveredOrders: {
          $sum: { $cond: [{ $eq: ["$isDelivered", true] }, 1, 0] }
        },
        cancelledOrders: {
          $sum: { $cond: [{ $eq: ["$isCancelled", true] }, 1, 0] }
        },
        pendingOrders: {
          $sum: { 
            $cond: [
              { 
                $and: [
                  { $eq: ["$isDelivered", false] },
                  { $eq: ["$isCancelled", false] }
                ]
              }, 
              1, 
              0
            ]
          }
        }
      }
    }
  ]);

  const reviewStats = await Review.aggregate([
    { $match: { buyerId: new mongoose.Types.ObjectId(buyerId) } },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRatingGiven: { $avg: "$rating" }
      }
    }
  ]);

  const buyerStats = {
    totalOrders: stats[0]?.totalOrders || 0,
    totalSpent: stats[0]?.totalSpent || 0,
    deliveredOrders: stats[0]?.deliveredOrders || 0,
    cancelledOrders: stats[0]?.cancelledOrders || 0,
    pendingOrders: stats[0]?.pendingOrders || 0,
    totalReviews: reviewStats[0]?.totalReviews || 0,
    averageRatingGiven: reviewStats[0]?.averageRatingGiven || 0,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, buyerStats, "Buyer statistics fetched successfully"));
});

const getBuyerRecommendations = asyncHandler(async (req, res) => {
  const { buyerId } = req.params;
  const { limit = 10 } = req.query;

  if (!mongoose.Types.ObjectId.isValid(buyerId)) {
    throw new ApiError(400, "Invalid buyer ID");
  }

  // Get buyer's order history to understand preferences
  const buyerOrders = await Order.find({ buyerId })
    .populate("productId", "category")
    .limit(50); // Get recent orders for analysis

  const preferredCategories = buyerOrders.reduce((acc, order) => {
    const category = order.productId?.category;
    if (category) {
      acc[category] = (acc[category] || 0) + 1;
    }
    return acc;
  }, {});

  // Get top preferred categories
  const topCategories = Object.entries(preferredCategories)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([category]) => category);

  // Get recommended products based on preferred categories
  const recommendations = await Product.find({
    category: { $in: topCategories },
    amountLeft: { $gt: 0 }
  })
    .populate("sellerId", "shopName ownerName")
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        recommendations,
        basedOnCategories: topCategories,
        totalRecommendations: recommendations.length,
      },
      "Product recommendations fetched successfully"
    )
  );
});

const searchBuyerOrders = asyncHandler(async (req, res) => {
  const { buyerId } = req.params;
  const { 
    query, 
    page = 1, 
    limit = 10, 
    status 
  } = req.query;

  if (!mongoose.Types.ObjectId.isValid(buyerId)) {
    throw new ApiError(400, "Invalid buyer ID");
  }

  if (!query) {
    throw new ApiError(400, "Search query is required");
  }

  const filter = { buyerId };
  if (status === "cancelled") filter.isCancelled = true;
  if (status === "delivered") filter.isDelivered = true;
  if (status === "pending") {
    filter.isCancelled = false;
    filter.isDelivered = false;
  }

  const orders = await Order.aggregate([
    { $match: filter },
    {
      $lookup: {
        from: "products",
        localField: "productId",
        foreignField: "_id",
        as: "product"
      }
    },
    {
      $lookup: {
        from: "sellers",
        localField: "sellerId",
        foreignField: "_id",
        as: "seller"
      }
    },
    { $unwind: "$product" },
    { $unwind: "$seller" },
    {
      $match: {
        $or: [
          { "product.name": { $regex: query, $options: "i" } },
          { "product.description": { $regex: query, $options: "i" } },
          { "seller.shopName": { $regex: query, $options: "i" } }
        ]
      }
    },
    { $sort: { createdAt: -1 } },
    { $skip: (page - 1) * limit },
    { $limit: Number(limit) }
  ]);

  const totalOrders = await Order.aggregate([
    { $match: filter },
    {
      $lookup: {
        from: "products",
        localField: "productId",
        foreignField: "_id",
        as: "product"
      }
    },
    {
      $lookup: {
        from: "sellers",
        localField: "sellerId",
        foreignField: "_id",
        as: "seller"
      }
    },
    { $unwind: "$product" },
    { $unwind: "$seller" },
    {
      $match: {
        $or: [
          { "product.name": { $regex: query, $options: "i" } },
          { "product.description": { $regex: query, $options: "i" } },
          { "seller.shopName": { $regex: query, $options: "i" } }
        ]
      }
    },
    { $count: "total" }
  ]);

  const total = totalOrders[0]?.total || 0;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        orders,
        totalOrders: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
      "Buyer orders search completed successfully"
    )
  );
});

export {
  getBuyerProfile,
  getBuyerOrders,
  getBuyerReviews,
  getBuyerWishlist,
  addToWishlist,
  removeFromWishlist,
  getBuyerOrderHistory,
  getBuyerStats,
  getBuyerRecommendations,
  searchBuyerOrders,
};
