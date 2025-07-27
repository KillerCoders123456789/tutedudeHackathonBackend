import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  markOrderAsDelivered,
  getOrdersByBuyer,
  getOrdersBySeller,
  getOrderStats,
} from "../controllers/order.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getAllOrders).post(createOrder);
router.route("/stats").get(getOrderStats);
router.route("/:orderId").get(getOrderById).put(updateOrderStatus);
router.route("/:orderId/cancel").put(cancelOrder);
router.route("/:orderId/deliver").put(markOrderAsDelivered);
router.route("/buyer/:buyerId").get(getOrdersByBuyer);
router.route("/seller/:sellerId").get(getOrdersBySeller);

export default router;
