import Match from "../models/Match.model.js";
import Swipe from "../models/Swipe.model.js";
import { sendSuccess, sendError } from "../utils/response.utils.js";

// ─────────────────────────────────────────────────────────
// @desc    Get all matches for current user
// @route   GET /api/matches
// @access  Private
// ─────────────────────────────────────────────────────────
export const getMyMatches = async (req, res) => {
  try {
    const matches = await Match.find({
      users: req.user._id,
      isActive: true,
    })
      .populate("users", "name age photos bio lastActive")
      .populate("lastMessage", "content createdAt sender status")
      .sort({ lastMessageAt: -1, createdAt: -1 });

    // Shape the response — return the "other" user for each match
    const shaped = matches.map((match) => {
      const otherUser = match.users.find(
        (u) => u._id.toString() !== req.user._id.toString(),
      );
      return {
        matchId: match._id,
        user: otherUser,
        lastMessage: match.lastMessage,
        lastMessageAt: match.lastMessageAt,
        createdAt: match.createdAt,
      };
    });

    return sendSuccess(res, 200, "Matches fetched", {
      matches: shaped,
      count: shaped.length,
    });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// ─────────────────────────────────────────────────────────
// @desc    Get a single match by ID
// @route   GET /api/matches/:matchId
// @access  Private
// ─────────────────────────────────────────────────────────
export const getMatchById = async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId)
      .populate("users", "name age photos bio lastActive")
      .populate("lastMessage", "content createdAt sender status");

    if (!match) return sendError(res, 404, "Match not found");

    // Ensure requesting user is part of this match
    const isMember = match.users.some(
      (u) => u._id.toString() === req.user._id.toString(),
    );
    if (!isMember) return sendError(res, 403, "Access denied");

    const otherUser = match.users.find(
      (u) => u._id.toString() !== req.user._id.toString(),
    );

    return sendSuccess(res, 200, "Match fetched", {
      matchId: match._id,
      user: otherUser,
      lastMessage: match.lastMessage,
      createdAt: match.createdAt,
    });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// ─────────────────────────────────────────────────────────
// @desc    Unmatch (delete match + disable chat)
// @route   DELETE /api/matches/:matchId
// @access  Private
// ─────────────────────────────────────────────────────────
export const unmatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId);

    if (!match) return sendError(res, 404, "Match not found");

    const isMember = match.users.some(
      (u) => u.toString() === req.user._id.toString(),
    );
    if (!isMember) return sendError(res, 403, "Access denied");

    match.isActive = false;
    await match.save();

    return sendSuccess(res, 200, "Unmatched successfully");
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// ─────────────────────────────────────────────────────────
// @desc    Check if two users are matched
// @route   GET /api/matches/check/:userId
// @access  Private
// ─────────────────────────────────────────────────────────
export const checkMatch = async (req, res) => {
  try {
    const match = await Match.findOne({
      users: { $all: [req.user._id, req.params.userId] },
      isActive: true,
    });

    return sendSuccess(res, 200, "Match status", {
      isMatched: !!match,
      matchId: match?._id || null,
    });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};
