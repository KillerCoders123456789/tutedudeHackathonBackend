import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  searchProducts,
} from "../controllers/product.controller.js";

const router = Router();

// Public routes
router.route("/").get(getAllProducts);
router.route("/search").get(searchProducts);
router.route("/:productId").get(getProductById);

// Protected routes
router.use(verifyJWT);
router.route("/").post(createProduct);
router.route("/:productId").put(updateProduct);
router.route("/:productId").delete(deleteProduct);

export default router;
