import mongoose, { Schema } from "mongoose";

export const reviewSchema = new Schema({
  buyerId: {
    type: Schema.Types.ObjectId,
    ref: "userModel",
    required: true,
  },
  productId: {
    type: Schema.Types.ObjectId,
    ref: "productModel",
    required: true,
  },
  sellerId: {
    type: Schema.Types.ObjectId,
    ref: "sellerModel",
    required: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
});
