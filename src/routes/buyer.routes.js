import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Router } from "express";
import {
  getBuyerProfile,
  getBuyerOrders,
  getBuyerWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../controllers/buyer.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/profile/:buyerId").get(getBuyerProfile);
router.route("/orders/:buyerId").get(getBuyerOrders);
router.route("/wishlist/:buyerId").get(getBuyerWishlist);
router.route("/wishlist/:buyerId").post(addToWishlist);
router.route("/wishlist/:buyerId/:productId").delete(removeFromWishlist);

export default router;
