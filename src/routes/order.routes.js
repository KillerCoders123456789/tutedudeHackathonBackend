import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  cancelOrder,
  createOrder,
  markOrderAsDelivered,
} from "../controllers/order.controller.js";
const router = Router();

router.use(verifyJWT);

//created by user
router.route("/createorder").post(createOrder);
//needed by both user and buyer
// router.route("/list").get();
//needed by both user and buyer
// router.route("/details/:id/").get();
//needed by both user(if it want to cancel) and buyer(if it want to finalize)
router.route("/update/delivered/:id").put(markOrderAsDelivered);
router.route("/cancel/:id").delete(cancelOrder);

export default router;
