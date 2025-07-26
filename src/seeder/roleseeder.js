import mongoose from "mongoose";
import roleModel from "../models/roles.model.js";
import { connectDB } from "../db/index.js";
import { Roles } from "../enums/role-enums.js";

const seedRoles = async () => {
  console.log("Seeding roles...");
  try {
    // Connect to database first
    await connectDB();
    console.log("Database connected successfully");

    // Start session after connection is established
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      console.log("Clearing existing roles");
      await roleModel.deleteMany({}, { session });

      for (const role in Roles) {
        // Since we cleared all roles, we can directly create new ones
        const newRole = new roleModel({
          name: role,
        });
        await newRole.save({ session });
        console.log(`Role ${role} added `);
      }

      await session.commitTransaction();
      console.log("Transaction committed successfully");
    } catch (error) {
      await session.abortTransaction();
      console.log(`Error during seeding:`, error);
      throw error;
    } finally {
      session.endSession();
      console.log("Session ended");
    }
  } catch (error) {
    console.error("Error seeding roles:", error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
};

seedRoles().catch((error) =>
  console.error("Error running seed script:", error)
);
