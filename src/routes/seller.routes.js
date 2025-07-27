import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getSellerById,
  updateSeller,
} from "../controllers/seller.controller.js";
import { getProductsBySeller } from "../controllers/product.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/profile/:sellerId").get(getSellerById);
router.route("/update/:sellerId").put(updateSeller);
router.route("/products/:sellerId").get(getProductsBySeller);

export default router;
