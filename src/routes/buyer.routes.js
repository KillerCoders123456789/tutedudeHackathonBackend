import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Router } from "express";
import {
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
} from "../controllers/buyer.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/:buyerId/profile").get(getBuyerProfile);
router.route("/:buyerId/orders").get(getBuyerOrders);
router.route("/:buyerId/orders/search").get(searchBuyerOrders);
router.route("/:buyerId/order-history").get(getBuyerOrderHistory);
router.route("/:buyerId/reviews").get(getBuyerReviews);
router.route("/:buyerId/wishlist").get(getBuyerWishlist);
router.route("/:buyerId/wishlist").post(addToWishlist);
router.route("/:buyerId/wishlist/:productId").delete(removeFromWishlist);
router.route("/:buyerId/stats").get(getBuyerStats);
router.route("/:buyerId/recommendations").get(getBuyerRecommendations);

export default router;
