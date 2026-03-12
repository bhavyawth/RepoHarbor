import mongoose from "mongoose";
import Repo from "../models/repoModel";
import Chunk from "../models/chunkModel";

const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI!;
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected successfully");
    //startup cleanup: reset any repos that were stuck in "running" state and delete orphaned pending chunks
    const stuck = await Repo.updateMany(
      { indexStatus: "running" },
      { $set: { indexStatus: "failed", indexError: "Server restarted during indexing" } }
    );
    if (stuck.modifiedCount > 0) {
      console.warn(`[startup] Reset ${stuck.modifiedCount} stuck repo(s) to "failed"`);
    }
    const orphaned = await Chunk.deleteMany({ status: "pending" });
    if (orphaned.deletedCount > 0) {
      console.warn(`[startup] Deleted ${orphaned.deletedCount} orphaned pending chunk(s)`);
    }
  } catch (error: any) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;