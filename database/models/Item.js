import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
    title: String,
    description: String,
    category: String, // lost / found
    location: String,
    date: Date,
    image: String,
    status: { type: String, default: "pending" }, // admin approve
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

export default mongoose.model("Item", itemSchema);
