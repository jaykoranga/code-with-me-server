const formatRoomResponse = (room) => {
  return {
    id: room._id,
    name: room.name,
    inviteCode: room.inviteCode,
    numberOfUsers: room.numberOfUsers,
    numberOfQuestions: room.numberOfQuestions,
    status: room.status,
    createdBy: room.createdBy,
    participants: room.participants,
    maxParticipants: room.maxParticipants,
    difficulty: room.difficulty,
    timestamp: room.timestamp,
    matchID: room.matchID,
  };
};
module.exports=formatRoomResponse