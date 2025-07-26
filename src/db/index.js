import mongoose from "mongoose";
import DB_NAME from "../constant.js";
import dotenv from "dotenv";

dotenv.config({
  path: "./.env",
});
const connectDB = async () => {
  console.log("DB_NAME", DB_NAME);
  console.log("MONGODB_URI", process.env.MONGODB_URI);
  try {
    const connectionInstance = await mongoose.connect(
      process.env.MONGODB_URI + "/" + DB_NAME
    );
    console.log(
      `Successfully connected to db ${DB_NAME} at host ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("Error in connecting to DB", error);
    process.exit(1); // 1 is a generic error code
    // 0 is a success code
  }
};
export { connectDB };
