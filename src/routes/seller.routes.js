import Router from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js";
const router = Router();

router.use(verifyJWT);

router.route("/profile/:id").get();
router.route("/update/:id").put();
router.route("/listitem").get();

export default router;
