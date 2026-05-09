const Room = require("../models/rooms.model");
const { STATUS_CODES } = require("../constants/statusCodes");
const { generateUniqueRoomName } = require("../utils/generateUniqueName");
const roomsModel = require("../models/rooms.model");
const formatRoomResponse = require("../utils/room/formatRoomResponse");
const { get } = require("mongoose");

const User = require("../models/User.model");

const ROOM_MESSAGES = {
  DIFFICULTY_REQUIRED: "Please select a difficulty",
  DIFFICULTY_INVALID: "Difficulty must be one of: easy, medium, hard",
  MAX_PARTICIPANTS_INVALID: "Please select a number between 2 and 5",
  USER_REQUIRED: "Unauthorized: user context missing",
  ROOM_CREATED: "Room created successfully",
  ROOM_CREATION_FAILED: "Room could not be created",
  ROOM_ID_REQUIRED: "Room id is required to fetch the room",
  ROOM_NOT_FOUND: "Room not found",
  INTERNAL_ERROR: "Internal server error",
  ROOM_FULL: "Room is full",
  ROOM_NOT_JOINABLE: "Room is not open for joining",
  userAlreadyInRoom: "User is already in the room",
  INVALID_INVITE_CODE: "Invalid invite code",
};

const ROOM_DIFFICULTIES = new Set(["easy", "medium", "hard"]);
const MIN_PARTICIPANTS = 2;
const MAX_PARTICIPANTS = 5;

const createId = (prefix = "random-prefix") =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
const createInviteCode = () =>
  Math.random().toString(36).slice(2, 8).toUpperCase();

//create a room
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
      participants: [],
      numberOfUsers: 0,
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
      room: formatRoomResponse(room),
    });
  } catch (error) {
    console.error("Error while creating room:", error);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      message: ROOM_MESSAGES.INTERNAL_ERROR,
    });
  }
};

//get a room
const getRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    if (!roomId) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: ROOM_MESSAGES.ROOM_ID_REQUIRED,
      });
    }

    const user = req.user;
    if (!user) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({
        message: ROOM_MESSAGES.USER_REQUIRED,
      });
    }

    const room = await Room.findOne({ id: roomId });

    if (!room) {
      return res.status(404).json({
        message: ROOM_MESSAGES.ROOM_NOT_FOUND,
      });
    }

    return res.status(STATUS_CODES.OK).json({
      room: formatRoomResponse(room),
    });
  } catch (error) {
    console.error("Error while fetching room:", error);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      message: ROOM_MESSAGES.INTERNAL_ERROR,
    });
  }
};

//get my rooms
const getMyRooms = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({
        message: ROOM_MESSAGES.USER_REQUIRED,
      });
    }
    console.log("Fetching rooms for userId:", userId);
    const rooms = await Room.find({ createdBy: userId });
    if (!rooms) {
      return res.status(STATUS_CODES.OK).json({
        rooms: [],
      });
    }

    return res.status(STATUS_CODES.OK).json({
      rooms: rooms.map(formatRoomResponse),
    });
  } catch (error) {
    console.error("Error while fetching user's rooms:", error);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      message: ROOM_MESSAGES.INTERNAL_ERROR,
    });
  }
};

// join a room
const joinRoom = async (req, res) => {
  try {
    //check if room exists
    const { roomId } = req.params;

    const room = await Room.findOne({ id: roomId });
    if (!room) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        message: ROOM_MESSAGES.ROOM_NOT_FOUND,
      });
    }

    const userId = req.user.userId;
    
   
    //check if user is already in the room
    const alreadyJoined = room.participants.includes(userId);
    if (alreadyJoined) {
      return res.status(STATUS_CODES.OK).json({
        message: ROOM_MESSAGES.userAlreadyInRoom,
      });
    }

    //check room status
    if (room.status !== "waiting") {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: ROOM_MESSAGES.ROOM_NOT_JOINABLE,
      });
    }

    //check room number of participants
    if (room.numberOfUsers >= room.maxParticipants) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: ROOM_MESSAGES.ROOM_FULL,
      });
    }

    //check if the user is the creator
    const CreatorId = room.createdBy._id;
    if (CreatorId === userId) {
      room.participants.push(userId);
      room.numberOfUsers = room.participants.length;
      await room.save();
      return res.status(STATUS_CODES.OK).json({
        message: ROOM_MESSAGES.ROOM_JOINED,
        room: formatRoomResponse(room),
      });
    }

    //check the invite code , it can come from the body or query
    const  inviteCode  = req.body.inviteCode || req.query.inviteCode;
    console.log("Received invite code:", inviteCode);
    if (inviteCode !== room.inviteCode) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: ROOM_MESSAGES.INVALID_INVITE_CODE,
      });
    }
    //add user to the room
    room.participants.push(userId);
    room.numberOfUsers = room.participants.length;
    await room.save();
    return res.status(STATUS_CODES.OK).json({
      message: ROOM_MESSAGES.ROOM_JOINED,
      room: formatRoomResponse(room),
    });
  } catch (error) {
    console.error("Error while joining room:", error);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      message: ROOM_MESSAGES.INTERNAL_ERROR,
    });
  }
};

module.exports = {
  createRoom,
  getRoom,
  getMyRooms,
  joinRoom,
};
