import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsBySeller,
  searchProducts,
  updateProductStock,
} from "../controllers/product.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getAllProducts).post(createProduct);
router.route("/search").get(searchProducts);
router.route("/:productId").get(getProductById).put(updateProduct).delete(deleteProduct);
router.route("/:productId/stock").put(updateProductStock);
router.route("/seller/:sellerId").get(getProductsBySeller);

export default router;
