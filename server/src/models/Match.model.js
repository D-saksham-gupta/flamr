import mongoose from "mongoose";

const matchSchema = new mongoose.Schema(
  {
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    lastMessageAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true }, // false if one user unmatches
  },
  { timestamps: true },
);

matchSchema.index({ users: 1 });
matchSchema.index({ lastMessageAt: -1 });

const Match = mongoose.model("Match", matchSchema);
export default Match;
