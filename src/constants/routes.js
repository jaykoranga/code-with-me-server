
const ROUTE_PREFIX = {
  API: "/api/v1",
  USERS: "/users",
};

const USER_ROUTES = {
  SIGNUP: "/signup",
  LOGIN: "/login",
  PROFILE: "/profile",
};

const ROOM_ROUTES = {
  CREATE:'createRoom',
  JOIN:'joinRoom',
  GET:'getRoom',
  LEAVE:'leaveRoom',
  DELETE:'deleteRoom'
}

module.exports = {
  ROUTE_PREFIX,
  USER_ROUTES,
};
