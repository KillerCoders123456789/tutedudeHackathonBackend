import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Router } from "express";
import {getBuyerProfile,getBuyerOrders,getBuyerReviews} from "../controllers/buyer.controller.js";
import {updateAccountDetails} from "../controllers/user.controller.js";
const router = Router();


router.use(verifyJWT);
router.route("/profile/:id").get(getBuyerProfile);
router.route("/update/:id").put(updateAccountDetails);
router.route("/buyerorders/:id").get(getBuyerOrders);
router.route("/buyerreviews/:id").get(getBuyerReviews);
export default router;
