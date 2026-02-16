import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const photoSchema = new mongoose.Schema({
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  order: { type: Number, default: 0 },
});

const locationSchema = new mongoose.Schema({
  type: { type: String, enum: ["Point"], default: "Point" },
  coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
  city: { type: String, default: "" },
  country: { type: String, default: "" },
});

const userSchema = new mongoose.Schema(
  {
    // ── Auth ──────────────────────────────────────────────
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    password: { type: String, minlength: 6, select: false },

    isVerified: { type: Boolean, default: false },
    otp: { type: String, select: false },
    otpExpiry: { type: Date, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },

    // ── Basic Profile ─────────────────────────────────────
    name: { type: String, trim: true, maxlength: 50 },
    age: { type: Number, min: 18, max: 100 },
    gender: {
      type: String,
      enum: ["man", "woman", "non-binary", "other"],
    },
    sexualPreference: {
      type: String,
      enum: ["men", "women", "everyone"],
      default: "everyone",
    },
    bio: { type: String, maxlength: 500, default: "" },
    extraInfo: { type: String, maxlength: 300, default: "" },
    photos: { type: [photoSchema], default: [] },
    profileComplete: { type: Boolean, default: false },

    // ── Advanced Profile ──────────────────────────────────
    height: { type: Number }, // in cm
    interests: { type: [String], default: [] },
    religion: { type: String, default: "" },
    education: { type: String, default: "" },
    jobTitle: { type: String, default: "" },
    drinking: {
      type: String,
      enum: ["never", "sometimes", "often", ""],
      default: "",
    },
    smoking: {
      type: String,
      enum: ["never", "sometimes", "often", ""],
      default: "",
    },

    // ── Discovery Settings ────────────────────────────────
    discoverySettings: {
      ageMin: { type: Number, default: 18 },
      ageMax: { type: Number, default: 45 },
      distance: { type: Number, default: 50 }, // km
      showMe: {
        type: String,
        enum: ["men", "women", "everyone"],
        default: "everyone",
      },
    },

    // ── Location ──────────────────────────────────────────
    location: { type: locationSchema, default: () => ({}) },

    // ── Safety ────────────────────────────────────────────
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isActive: { type: Boolean, default: true },
    isBanned: { type: Boolean, default: false },
    lastActive: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

// ── Indexes ──────────────────────────────────────────────
userSchema.index({ location: "2dsphere" });
userSchema.index({ age: 1 });
userSchema.index({ gender: 1 });
userSchema.index({ isActive: 1, isBanned: 1 });

// ── Hash password before save ─────────────────────────────
// ── Hash password before save ─────────────────────────────
userSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// ── Compare password ──────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Never send password ───────────────────────────────────
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.otp;
  delete obj.otpExpiry;
  return obj;
};

const User = mongoose.model("User", userSchema);
export default User;
