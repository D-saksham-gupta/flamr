import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

// Install streamifier first:
// npm install streamifier

const uploadToCloudinary = (buffer, folder = "flamr/photos") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        transformation: [
          { width: 800, height: 1000, crop: "fill", gravity: "face" },
          { quality: "auto", fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

export const uploadPhoto = async (buffer) => {
  const result = await uploadToCloudinary(buffer, "flamr/photos");
  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
};

export const deletePhoto = async (publicId) => {
  await cloudinary.uploader.destroy(publicId);
};
