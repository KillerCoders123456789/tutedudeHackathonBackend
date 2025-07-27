import Router from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();
import {
  getSellerById,
  updateSeller,
  getAllSellers,
} from "../controllers/seller.controller.js";

import {
  getOrdersBySeller,
} from "../controllers/order.controller.js";

router.route("/listitem").get(getAllSellers);

router.use(verifyJWT);

// router.route("/create").post(createSeller);
router.route("/profile/:id").get(getSellerById);
router.route("/update/:id").put(updateSeller);
router.route("/sellerorders").get(getOrdersBySeller); // Assuming this is to get orders for a specific seller

export default router;
