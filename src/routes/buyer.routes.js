import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Router } from "express";

const router = Router();

router.use(verifyJWT);

router.route("/profile/:id").get();
router.route("/update/:id").put();
router.route("/listitem").get();
router.route("/createitem").post();

export default router;
