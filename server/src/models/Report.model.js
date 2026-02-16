import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reported: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      enum: [
        "inappropriate_photos",
        "harassment",
        "spam",
        "fake_profile",
        "underage",
        "other",
      ],
      required: true,
    },
    description: { type: String, maxlength: 500, default: "" },
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved", "dismissed"],
      default: "pending",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

reportSchema.index({ reported: 1, status: 1 });
reportSchema.index({ reporter: 1 });

const Report = mongoose.model("Report", reportSchema);
export default Report;
