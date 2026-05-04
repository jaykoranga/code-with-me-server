const Room = require("../models/rooms.model");
const { STATUS_CODES } = require("../constants/statusCodes");
const { generateUniqueRoomName } = require("../utils/generateUniqueName");

const ROOM_MESSAGES = {
  DIFFICULTY_REQUIRED: "Please select a difficulty",
  DIFFICULTY_INVALID: "Difficulty must be one of: easy, medium, hard",
  MAX_PARTICIPANTS_INVALID: "Please select a number between 2 and 5",
  USER_REQUIRED: "Unauthorized: user context missing",
  ROOM_CREATED: "Room created successfully",
  ROOM_CREATION_FAILED: "Room could not be created",
  INTERNAL_ERROR: "Internal server error",
};

const ROOM_DIFFICULTIES = new Set(["easy", "medium", "hard"]);
const MIN_PARTICIPANTS = 2;
const MAX_PARTICIPANTS = 5;

const createId = (prefix) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
const createInviteCode = () =>
  Math.random().toString(36).slice(2, 8).toUpperCase();

const createRoom = async (req, res) => {
  try {
    const { difficulty, maxParticipants } = req.body || {};
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({
        message: ROOM_MESSAGES.USER_REQUIRED,
      });
    }

    if (!difficulty) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: ROOM_MESSAGES.DIFFICULTY_REQUIRED,
      });
    }

    const normalizedDifficulty = String(difficulty).trim().toLowerCase();
    if (!ROOM_DIFFICULTIES.has(normalizedDifficulty)) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: ROOM_MESSAGES.DIFFICULTY_INVALID,
      });
    }

    const parsedMaxParticipants = Number(maxParticipants);
    const isMaxParticipantsInvalid =
      !Number.isInteger(parsedMaxParticipants) ||
      parsedMaxParticipants < MIN_PARTICIPANTS ||
      parsedMaxParticipants > MAX_PARTICIPANTS;

    if (isMaxParticipantsInvalid) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: ROOM_MESSAGES.MAX_PARTICIPANTS_INVALID,
      });
    }

    const roomPayload = {
      id: createId("room"),
      name: generateUniqueRoomName(),
      inviteCode: createInviteCode(),
      createdBy: userId,
      participants: [userId],
      numberOfUsers: 1,
      maxParticipants: parsedMaxParticipants,
      difficulty: normalizedDifficulty,
    };

    const room = await Room.create(roomPayload);

    if (!room) {
      return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        message: ROOM_MESSAGES.ROOM_CREATION_FAILED,
      });
    }

    return res.status(STATUS_CODES.CREATED).json({
      message: ROOM_MESSAGES.ROOM_CREATED,
      room,
    });
  } catch (error) {
    console.error("Error while creating room:", error);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      message: ROOM_MESSAGES.INTERNAL_ERROR,
    });
  }
};

module.exports = {
  createRoom,
};
