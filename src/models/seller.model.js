import mongoose, { Schema } from "mongoose";

const sellerSchema = new Schema(
  {
    shopName: {
      type: String,
      required: true,
      trim: true,
    },
    ownerName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    adhar: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["SELLER", "BUYER"],
      required: true,
    },
    reviewcount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Seller = mongoose.model("Seller", sellerSchema);

export default Seller;
