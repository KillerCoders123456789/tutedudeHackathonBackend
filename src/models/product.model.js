import mongoose from "mongoose";
import { Schema } from "mongoose";
import productCategory from "../enums/product-enum.js";

export const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: [Number],
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "sellerModel",
      required: true,
    },
    category: {
      type: String,
      enum: Object.values(productCategory),
      default: productCategory.MISC,
      required: true,
    },
    amountLeft: {
      type: Number,
      default: 0,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const productModel = mongoose.model("productModel", productSchema);

export default productModel;
