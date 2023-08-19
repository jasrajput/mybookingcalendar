import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      trim: true,
      required: [true, "Message is required"],
    },
    supportID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Support",
    },
    replyBy: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const chatModel = mongoose.model("Chat", chatSchema);

export default chatModel;
