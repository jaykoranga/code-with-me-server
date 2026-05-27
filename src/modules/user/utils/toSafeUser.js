const toSafeUser = (userDoc) => ({
  id: userDoc._id,
  email: userDoc.email,
  userName: userDoc.userName ?? "",
  about: userDoc.about,
  profilePicture: userDoc.profilePicture,
  totalMatchesPlayed: userDoc.totalMatchesPlayed,
  wins: userDoc.wins,
  losses: userDoc.losses,
});

module.exports = toSafeUser;
