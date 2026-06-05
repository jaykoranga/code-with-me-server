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

        if (room.participants.length < 2) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({ message: MATCH_MESSAGES.NOT_ENOUGH_PLAYERS });
        }

        // Select a random question matching the room's difficulty
        const questions = await Question.aggregate([
            { $match: { difficulty: room.difficulty } },
            { $sample: { size: 1 } }
        ]);

        if (questions.length === 0) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({
                message: `No questions found for difficulty: ${room.difficulty}`
            });
        }

        const selectedQuestion = questions[0];

        // Create the Match document
        const match = await Match.create({
            status: MATCH_STATUS.ACTIVE,
            Room: room._id,
            players: room.participants,
            maxPlayers: room.maxParticipants,
            questionsSnapshots: [selectedQuestion],
            creator: room.createdBy,
            startedAt: new Date()
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
                    boilerPlate: q.boilerPlate.filter(b => b.language === "javascript") // JS only for now
                })),
                startedAt: match.startedAt
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
                    boilerPlate: q.boilerPlate.filter(b => b.language === "javascript") // JS only for now
                })),
                startedAt: match.startedAt
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

        // Increment forfeiting player's loss immediately
        await User.findByIdAndUpdate(userId, { $inc: { losses: 1, totalMatchesPlayed: 1 } });

        const remainingPlayers = match.players.filter(playerId => String(playerId) !== userId);

        if (remainingPlayers.length === 1) {
            // 1v1 match forfeit - declare remaining player the winner and end match
            const winnerId = remainingPlayers[0];

            match.status = MATCH_STATUS.COMPLETED;
            match.winner = winnerId;
            match.resultType = "player_win";
            await match.save();

            // Increment winner stats
            await User.findByIdAndUpdate(winnerId, { $inc: { wins: 1, totalMatchesPlayed: 1 } });

            // Put the Room back in waiting state
            const room = await Room.findById(match.Room);
            if (room) {
                room.status = ROOM_STATUS.WAITING;
                room.matchID = "";
                await room.save();
            }

            return res.status(STATUS_CODES.OK).json({
                message: MATCH_MESSAGES.FORFEITED,
                matchEnded: true,
                winner: winnerId,
                match
            });
        } else if (remainingPlayers.length > 1) {
            // Multiplayer match forfeit - remove current user from match active players and continue
            match.players = remainingPlayers;
            await match.save();

            return res.status(STATUS_CODES.OK).json({
                message: MATCH_MESSAGES.FORFEITED,
                matchEnded: false,
                match
            });
        } else {
            // Edge case: no players left
            match.status = MATCH_STATUS.CANCELLED;
            await match.save();

            const room = await Room.findById(match.Room);
            if (room) {
                room.status = ROOM_STATUS.WAITING;
                room.matchID = "";
                await room.save();
            }

            return res.status(STATUS_CODES.OK).json({
                message: MATCH_MESSAGES.FORFEITED,
                matchEnded: true,
                match
            });
        }
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
