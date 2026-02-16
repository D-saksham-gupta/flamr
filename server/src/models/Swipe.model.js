import mongoose from "mongoose";

const swipeSchema = new mongoose.Schema(
  {
    swiper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    swiped: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      enum: ["like", "pass"],
      required: true,
    },
  },
  { timestamps: true },
);

// Prevent duplicate swipes
swipeSchema.index({ swiper: 1, swiped: 1 }, { unique: true });
swipeSchema.index({ swiped: 1, action: 1 }); // fast match lookup

const Swipe = mongoose.model("Swipe", swipeSchema);
export default Swipe;
