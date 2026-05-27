const MATCH_MESSAGES = {
  ROOM_ID_REQUIRED: "Room ID is required to initiate matchmaking",
  USER_REQUIRED: "Unauthorized: User context missing",
  ROOM_NOT_FOUND: "Room not found",
  NOT_CREATOR: "Only the creator of the room is allowed to start the match",
  NOT_ENOUGH_PLAYERS: "A match requires at least 2 players to start",
  MATCH_INITIATED: "Match initiated successfully",
  MATCH_NOT_FOUND: "Match not found",
  PLAYER_NOT_IN_MATCH: "You are not a participant in this match",
  MATCH_NOT_ACTIVE: "This match is not active or has already ended",
  SUBMISSION_REQUIRED: "Submission code and language are required",
  SUBMISSION_ACCEPTED: "Submission accepted! All test cases passed.",
  SUBMISSION_FAILED: "Submission failed. Some test cases did not pass.",
  FORFEITED: "You have forfeited the match",
  INTERNAL_ERROR: "Internal server error",
  INVALID_LANGUAGE: "Selected programming language is not supported",
};

module.exports = {
  MATCH_MESSAGES
};
