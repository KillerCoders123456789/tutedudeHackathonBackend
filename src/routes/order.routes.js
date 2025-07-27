import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} from "../controllers/order.controller.js";

const router = Router();

router.use(verifyJWT);

//created by user
router.route("/").post(createOrder);
//needed by both user and buyer
router.route("/").get(getAllOrders);
//needed by both user and buyer
router.route("/:orderId").get(getOrderById);
//needed by both user(if it want to cancel) and buyer(if it want to finalize)
router.route("/:orderId").put(updateOrderStatus);

export default router;
