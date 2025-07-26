import mongoose, { Schema } from "mongoose";
import { Roles } from "../enums/role-enums.js";

export const roleSchema = new Schema({
  name: {
    type: String,
    enum: Object.values(Roles),
    required: true,
    unique: true,
  },
});
const Role = mongoose.model("Role", roleSchema);

export default Role;
