import mongoose from "mongoose";

const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI!;
  try {
    await mongoose.connect(MONGO_URI);
    console.log("🟢 MongoDB connected successfully");
  } catch (error: any) {
    console.error("🔴 MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;