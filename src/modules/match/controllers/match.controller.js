const Room = require("../../../models/rooms.model");
const Match = require("../../../models/match.model");
const { Question } = require("../../../models/question.model");
const { STATUS_CODES } = require("../../../constants/statusCodes");
const { MATCH_MESSAGES } = require("../constants/match.constants");
const { MATCH_STATUS, ROOM_STATUS } = require("../../../constants/enums");


// initiate matchmaking controller 
const initiateMatchmaking = async (req, res) => {
    try {
        const { roomId } = req.body;
        const userId = req.user?.userId || "";

        if (!roomId) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({ message: MATCH_MESSAGES.ROOM_ID_REQUIRED });
        }
        if (!userId) {
            return res.status(STATUS_CODES.UNAUTHORIZED).json({ message: MATCH_MESSAGES.USER_REQUIRED });
        }

        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(STATUS_CODES.NOT_FOUND).json({ message: MATCH_MESSAGES.ROOM_NOT_FOUND });
        }

        if (String(room.createdBy) !== userId) {
            return res.status(STATUS_CODES.FORBIDDEN).json({ message: MATCH_MESSAGES.NOT_CREATOR });
        }

        if (room.status !== ROOM_STATUS.WAITING) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({ message: "Room is not in waiting state" });
        }

        if (room.participants.length < 1) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({ message: MATCH_MESSAGES.NOT_ENOUGH_PLAYERS });
        }

        // Select random questions matching the room's difficulty
        const questions = await Question.aggregate([
            { $match: { difficulty: room.difficulty } },
            { $sample: { size: room.numberOfQuestions || 1 } }
        ]);

        if (questions.length === 0) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({
                message: `No questions found for difficulty: ${room.difficulty}`
            });
        }

        // Create the Match document
        const match = await Match.create({
            status: MATCH_STATUS.ACTIVE,
            Room: room._id,
            players: room.participants,
            maxPlayers: room.maxParticipants,
            questionsSnapshots: questions,
            creator: room.createdBy,
            startedAt: new Date(),
            expiresAt: new Date(Date.now() + (room.matchDuration || 20) * 60 * 1000)
        });

        // Update the room state to active and link the match
        room.status = ROOM_STATUS.ACTIVE;
        room.matchID = match._id.toString();
        await room.save();

        return res.status(STATUS_CODES.CREATED).json({
            message: MATCH_MESSAGES.MATCH_INITIATED,
            match: {
                id: match._id,
                status: match.status,
                players: match.players,
                questions: match.questionsSnapshots.map(q => ({
                    id: q._id,
                    name: q.name,
                    description: q.description,
                    difficulty: q.difficulty,
                    category: q.category,
                    constraints: q.constraints,
                    examples: q.examples,
                    testCases: q.testCases,
                    boilerPlate: q.boilerPlate
                })),
                startedAt: match.startedAt,
                expiresAt: match.expiresAt
            }
        });

    } catch (error) {
        console.error("Error during match initiation:", error);
        return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            message: MATCH_MESSAGES.INTERNAL_ERROR
        });
    }
};

//get match details controller
const getMatchDetails = async (req, res) => {
    try {
        const { matchId } = req.params;
        const userId = req.user?.userId;

        if (!matchId) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({ message: MATCH_MESSAGES.MATCH_ID_REQUIRED });
        }
        if (!userId) {
            return res.status(STATUS_CODES.UNAUTHORIZED).json({ message: MATCH_MESSAGES.USER_REQUIRED });
        }

        const match = await Match.findById(matchId);
        if (!match) {
            return res.status(STATUS_CODES.NOT_FOUND).json({ message: MATCH_MESSAGES.MATCH_NOT_FOUND });
        }

        if (!match.players.includes(userId)) {
            return res.status(STATUS_CODES.FORBIDDEN).json({ message: MATCH_MESSAGES.NOT_A_PARTICIPANT });
        }

        return res.status(STATUS_CODES.OK).json({
            message: MATCH_MESSAGES.MATCH_FOUND,
            match: {
                id: match._id,
                status: match.status,
                players: match.players,
                questions: match.questionsSnapshots.map(q => ({
                    id: q._id,
                    name: q.name,
                    description: q.description,
                    difficulty: q.difficulty,
                    category: q.category,
                    constraints: q.constraints,
                    examples: q.examples,
                    testCases: q.testCases,
                    boilerPlate: q.boilerPlate
                })),
                startedAt: match.startedAt,
                expiresAt: match.expiresAt
            }
        });
    } catch (error) {
        console.error("Error during match retrieval:", error);
        return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            message: MATCH_MESSAGES.INTERNAL_ERROR
        });
    }
};


// forfeit match controller
const forfeitMatch = async (req, res) => {
    try {
        const { matchId } = req.params;
        const userId = req.user?.userId;

        if (!matchId) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({ message: "Match ID is required" });
        }
        if (!userId) {
            return res.status(STATUS_CODES.UNAUTHORIZED).json({ message: MATCH_MESSAGES.USER_REQUIRED });
        }

        const match = await Match.findById(matchId);
        if (!match) {
            return res.status(STATUS_CODES.NOT_FOUND).json({ message: MATCH_MESSAGES.MATCH_NOT_FOUND });
        }

        if (match.status !== MATCH_STATUS.ACTIVE) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({ message: MATCH_MESSAGES.MATCH_NOT_ACTIVE });
        }

        // Verify player is in the match
        const isPlayerInMatch = match.players.map(p => String(p)).includes(userId);
        if (!isPlayerInMatch) {
            return res.status(STATUS_CODES.FORBIDDEN).json({ message: MATCH_MESSAGES.PLAYER_NOT_IN_MATCH });
        }

        // Remove the forfeiting player from the active match players list
        match.players = match.players.filter(playerId => String(playerId) !== userId);

        // Remove the forfeiting player from the room participants
        const room = await Room.findById(match.Room);
        if (room) {
            room.participants = room.participants.filter(p => String(p) !== userId);
            room.numberOfUsers = room.participants.length;

            // If no players are left in the room, cancel the match and the room
            if (room.participants.length === 0) {
                room.status = ROOM_STATUS.CANCELLED;
                match.status = MATCH_STATUS.CANCELLED;
            }
            await room.save();
        }

        await match.save();

        return res.status(STATUS_CODES.OK).json({
            message: MATCH_MESSAGES.FORFEITED,
            matchEnded: match.status !== MATCH_STATUS.ACTIVE,
            match
        });
    } catch (error) {
        console.error("Error during match forfeit:", error);
        return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            message: MATCH_MESSAGES.INTERNAL_ERROR
        });
    }
};



module.exports = {
    initiateMatchmaking,
    getMatchDetails,
    forfeitMatch
};
