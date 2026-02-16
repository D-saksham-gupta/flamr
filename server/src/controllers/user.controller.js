import User from "../models/User.model.js";
import { uploadPhoto, deletePhoto } from "../services/upload.service.js";
import { sendSuccess, sendError } from "../utils/response.utils.js";
import { haversineDistance } from "../utils/distance.utils.js";

// ─────────────────────────────────────────────────────────
// @desc    Complete onboarding / create profile
// @route   PUT /api/users/onboarding
// @access  Private
// ─────────────────────────────────────────────────────────
export const completeOnboarding = async (req, res) => {
  try {
    const {
      name,
      age,
      gender,
      sexualPreference,
      bio,
      extraInfo,
      location,
      height,
      interests,
      religion,
      education,
      jobTitle,
      drinking,
      smoking,
    } = req.body;

    // Validate required fields
    if (!name || !age || !gender || !sexualPreference) {
      return sendError(
        res,
        400,
        "Name, age, gender, and sexual preference are required",
      );
    }
    if (age < 18) {
      return sendError(res, 400, "You must be at least 18 years old");
    }

    const updateData = {
      name: name.trim(),
      age: parseInt(age),
      gender,
      sexualPreference,
      bio: bio?.trim() || "",
      extraInfo: extraInfo?.trim() || "",
      ...(height && { height: parseInt(height) }),
      ...(interests && { interests }),
      ...(religion && { religion }),
      ...(education && { education }),
      ...(jobTitle && { jobTitle }),
      ...(drinking && { drinking }),
      ...(smoking && { smoking }),
    };

    // Parse location if provided
    if (location) {
      const parsed =
        typeof location === "string" ? JSON.parse(location) : location;
      updateData.location = {
        type: "Point",
        coordinates: [
          parseFloat(parsed.longitude || parsed.coordinates?.[0] || 0),
          parseFloat(parsed.latitude || parsed.coordinates?.[1] || 0),
        ],
        city: parsed.city || "",
        country: parsed.country || "",
      };
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true },
    );

    // Mark profile complete if they have at least 1 photo
    if (user.photos.length > 0 && !user.profileComplete) {
      user.profileComplete = true;
      await user.save();
    }

    return sendSuccess(res, 200, "Profile updated successfully", { user });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// ─────────────────────────────────────────────────────────
// @desc    Upload photos
// @route   POST /api/users/photos
// @access  Private
// ─────────────────────────────────────────────────────────
export const uploadPhotos = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!req.files || req.files.length === 0) {
      return sendError(res, 400, "No photos provided");
    }
    if (user.photos.length + req.files.length > 5) {
      return sendError(
        res,
        400,
        `You can only have 5 photos. You have ${user.photos.length} already`,
      );
    }

    const uploadPromises = req.files.map((file) => uploadPhoto(file.buffer));
    const uploaded = await Promise.all(uploadPromises);

    const newPhotos = uploaded.map((photo, i) => ({
      url: photo.url,
      publicId: photo.publicId,
      order: user.photos.length + i,
    }));

    user.photos.push(...newPhotos);

    // Mark profile complete if all required fields are present
    if (
      user.photos.length > 0 &&
      user.name &&
      user.age &&
      user.gender &&
      user.sexualPreference
    ) {
      user.profileComplete = true;
    }

    await user.save();

    return sendSuccess(res, 200, "Photos uploaded successfully", {
      photos: user.photos,
      profileComplete: user.profileComplete,
    });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// ─────────────────────────────────────────────────────────
// @desc    Delete a photo
// @route   DELETE /api/users/photos/:publicId
// @access  Private
// ─────────────────────────────────────────────────────────
export const deleteUserPhoto = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { publicId } = req.params;

    // publicId from URL has / encoded as %2F
    const decodedPublicId = decodeURIComponent(publicId);
    const photoIndex = user.photos.findIndex(
      (p) => p.publicId === decodedPublicId,
    );

    if (photoIndex === -1) {
      return sendError(res, 404, "Photo not found");
    }

    // Delete from Cloudinary
    await deletePhoto(decodedPublicId);

    // Remove from array and re-order
    user.photos.splice(photoIndex, 1);
    user.photos = user.photos.map((p, i) => ({ ...p.toObject(), order: i }));

    // If no photos left, mark profile incomplete
    if (user.photos.length === 0) {
      user.profileComplete = false;
    }

    await user.save();

    return sendSuccess(res, 200, "Photo deleted", { photos: user.photos });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// ─────────────────────────────────────────────────────────
// @desc    Reorder photos
// @route   PUT /api/users/photos/reorder
// @access  Private
// ─────────────────────────────────────────────────────────
export const reorderPhotos = async (req, res) => {
  try {
    const { orderedPublicIds } = req.body; // array of publicIds in new order
    const user = await User.findById(req.user._id);

    if (!Array.isArray(orderedPublicIds)) {
      return sendError(res, 400, "orderedPublicIds must be an array");
    }

    const reordered = orderedPublicIds.map((publicId, index) => {
      const photo = user.photos.find((p) => p.publicId === publicId);
      if (!photo) throw new Error(`Photo not found: ${publicId}`);
      return { ...photo.toObject(), order: index };
    });

    user.photos = reordered;
    await user.save();

    return sendSuccess(res, 200, "Photos reordered", { photos: user.photos });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// ─────────────────────────────────────────────────────────
// @desc    Get own profile
// @route   GET /api/users/me
// @access  Private
// ─────────────────────────────────────────────────────────
export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    return sendSuccess(res, 200, "Profile fetched", { user });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// ─────────────────────────────────────────────────────────
// @desc    Update own profile
// @route   PUT /api/users/me
// @access  Private
// ─────────────────────────────────────────────────────────
export const updateMyProfile = async (req, res) => {
  try {
    const ALLOWED_FIELDS = [
      "name",
      "bio",
      "extraInfo",
      "height",
      "interests",
      "religion",
      "education",
      "jobTitle",
      "drinking",
      "smoking",
    ];

    const updates = {};
    ALLOWED_FIELDS.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Age update — re-validate
    if (req.body.age) {
      if (parseInt(req.body.age) < 18) {
        return sendError(res, 400, "Age must be at least 18");
      }
      updates.age = parseInt(req.body.age);
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true },
    );

    return sendSuccess(res, 200, "Profile updated", { user });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// ─────────────────────────────────────────────────────────
// @desc    Update discovery settings
// @route   PUT /api/users/discovery-settings
// @access  Private
// ─────────────────────────────────────────────────────────
export const updateDiscoverySettings = async (req, res) => {
  try {
    const { ageMin, ageMax, distance, showMe } = req.body;

    const settings = {};
    if (ageMin !== undefined)
      settings["discoverySettings.ageMin"] = parseInt(ageMin);
    if (ageMax !== undefined)
      settings["discoverySettings.ageMax"] = parseInt(ageMax);
    if (distance !== undefined)
      settings["discoverySettings.distance"] = parseInt(distance);
    if (showMe !== undefined) settings["discoverySettings.showMe"] = showMe;

    if (
      settings["discoverySettings.ageMin"] >=
      settings["discoverySettings.ageMax"]
    ) {
      return sendError(res, 400, "ageMin must be less than ageMax");
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: settings },
      { new: true },
    );

    return sendSuccess(res, 200, "Discovery settings updated", {
      discoverySettings: user.discoverySettings,
    });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// ─────────────────────────────────────────────────────────
// @desc    Update location
// @route   PUT /api/users/location
// @access  Private
// ─────────────────────────────────────────────────────────
export const updateLocation = async (req, res) => {
  try {
    const { latitude, longitude, city, country } = req.body;

    if (!latitude || !longitude) {
      return sendError(res, 400, "Latitude and longitude are required");
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          location: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
            city: city || "",
            country: country || "",
          },
        },
      },
      { new: true },
    );

    return sendSuccess(res, 200, "Location updated", {
      location: user.location,
    });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// ─────────────────────────────────────────────────────────
// @desc    View another user's profile
// @route   GET /api/users/:id
// @access  Private
// ─────────────────────────────────────────────────────────
export const getUserProfile = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const targetUser = await User.findById(req.params.id).select(
      "name age gender bio extraInfo photos interests height religion education jobTitle drinking smoking location",
    );

    if (!targetUser) return sendError(res, 404, "User not found");
    if (targetUser.isBanned || !targetUser.isActive) {
      return sendError(res, 404, "User not found");
    }

    // Check if blocked
    if (currentUser.blockedUsers.includes(targetUser._id)) {
      return sendError(res, 403, "You have blocked this user");
    }

    // Calculate distance
    let distance = null;
    const [tLng, tLat] = targetUser.location?.coordinates || [0, 0];
    const [cLng, cLat] = currentUser.location?.coordinates || [0, 0];

    if (tLat && tLng && cLat && cLng) {
      distance = haversineDistance([cLng, cLat], [tLng, tLat]);
    }

    return sendSuccess(res, 200, "User profile fetched", {
      user: targetUser,
      distance,
    });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// ─────────────────────────────────────────────────────────
// @desc    Get discovery feed (users to swipe on)
// @route   GET /api/users/discover
// @access  Private
// ─────────────────────────────────────────────────────────
export const getDiscoverFeed = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);

    if (!currentUser.profileComplete) {
      return sendError(res, 403, "Complete your profile first");
    }

    const {
      ageMin,
      ageMax,
      distance,
      showMe,
      // Advanced filters
      height,
      religion,
      education,
      drinking,
      smoking,
      interests,
    } = req.query;

    // Use discovery settings as defaults, allow query overrides
    const settings = currentUser.discoverySettings;
    const finalAgeMin = parseInt(ageMin) || settings.ageMin;
    const finalAgeMax = parseInt(ageMax) || settings.ageMax;
    const finalDistance = parseInt(distance) || settings.distance;
    const finalShowMe = showMe || settings.showMe;

    const [cLng, cLat] = currentUser.location?.coordinates || [0, 0];

    // Build query
    const query = {
      _id: {
        $ne: currentUser._id,
        $nin: currentUser.blockedUsers,
      },
      isActive: true,
      isBanned: false,
      profileComplete: true,
      age: { $gte: finalAgeMin, $lte: finalAgeMax },
    };

    // Gender filter
    if (finalShowMe !== "everyone") {
      const genderMap = { men: "man", women: "woman" };
      query.gender = genderMap[finalShowMe] || finalShowMe;
    }

    // Advanced filters
    if (religion) query.religion = religion;
    if (education) query.education = education;
    if (drinking) query.drinking = drinking;
    if (smoking) query.smoking = smoking;
    if (height)
      query.height = { $gte: parseInt(height) - 5, $lte: parseInt(height) + 5 };
    if (interests) {
      const interestArray = interests.split(",");
      query.interests = { $in: interestArray };
    }

    // Location-based query (only if user has location)
    if (cLat && cLng && finalDistance) {
      query.location = {
        $geoWithin: {
          $centerSphere: [
            [cLng, cLat],
            finalDistance / 6371, // convert km to radians
          ],
        },
      };
    }

    // Get already-swiped user IDs to exclude
    const { default: Swipe } = await import("../models/Swipe.model.js");
    const swipedUsers = await Swipe.find({ swiper: currentUser._id }).select(
      "swiped",
    );
    const swipedIds = swipedUsers.map((s) => s.swiped);

    query._id.$nin = [...currentUser.blockedUsers, ...swipedIds];

    const users = await User.find(query)
      .select(
        "name age gender bio photos interests height religion education jobTitle drinking smoking location",
      )
      .limit(20)
      .lean();

    // Append distance to each user
    const usersWithDistance = users.map((user) => {
      const [uLng, uLat] = user.location?.coordinates || [0, 0];
      const dist =
        uLat && uLng && cLat && cLng
          ? haversineDistance([cLng, cLat], [uLng, uLat])
          : null;
      return { ...user, distance: dist };
    });

    return sendSuccess(res, 200, "Discovery feed fetched", {
      users: usersWithDistance,
      count: usersWithDistance.length,
    });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};
