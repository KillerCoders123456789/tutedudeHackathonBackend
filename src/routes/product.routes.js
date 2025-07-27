import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";
const router = Router();

router.route("/listitem").get(getAllProducts);
router.route("/profile/:id").get(getProductById);

router.use(verifyJWT);

router.route("/update/:id").put(updateProduct);
router.route("/createproduct").post(createProduct);
router.route("/deleteproduct/:id").delete(deleteProduct);

export default router;
