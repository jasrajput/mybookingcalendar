import mongoose from "mongoose";

const supportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
    },
    topic: {
      type: String,
      required: [true, "Topic is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    status: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const supportModel = mongoose.model("Support", supportSchema);

export default supportModel;
