import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/register").get();
router.route("/login").get();
router.route("/logout").get();
router.route("/refreshToken").get();
router.route("/accesstoken").get();
router.route("/profile").get();
router.route("/update").put();

export default router;
