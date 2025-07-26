import { isCancel } from "axios";
import mongoose, { Schema } from "mongoose";

export const orderSchema = new Schema(
  {
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: "userModel",
      required: true,
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "sellerModel",
      required: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "productModel",
      required: true,
    },
    isCancelled: {
      type: Boolean,
      default: false,
    },
    isDelivered: {
      type: Boolean,
      default: false,
    },
    createdAt: { type: Date, default: null },
    updatedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

const orderModel = mongoose.model("orderModel", orderSchema);

export default orderModel;
