import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createSeller,
  getAllSellers,
  getSellerById,
  updateSeller,
  deleteSeller,
  searchSellers,
  updateSellerReviewCount,
  getSellerStats,
} from "../controllers/seller.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getAllSellers).post(createSeller);
router.route("/search").get(searchSellers);
router.route("/:sellerId").get(getSellerById).put(updateSeller).delete(deleteSeller);
router.route("/:sellerId/reviews").put(updateSellerReviewCount);
router.route("/:sellerId/stats").get(getSellerStats);

export default router;
