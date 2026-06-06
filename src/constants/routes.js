
const ROUTE_PREFIX = {
  API: "/api/v1",
  USERS: "/users",
  ROOM: '/room',
  MATCH: '/match',
  SUBMISSION: '/submission'
};

const USER_ROUTES = {
  SIGNUP: "/signup",
  LOGIN: "/login",
  PROFILE: "/profile",
  LOGOUT: "/logout"
};

//example room routes /api/v1/room/create
const ROOM_ROUTES = {
  CREATE:'/',
  JOIN:'/join/:inviteCode',
  GET: '/get/:roomId',
  LEAVE: '/leave/:roomId',
  DELETE: '/delete/:roomId',
  CREATED: '/created',
  JOINED: '/joined',
  IS_PARTICIPANT: '/is-participant/:roomId'
}

const MATCH_ROUTES = {
  INITIATE: '/initiate',
  GET: '/:matchId',
  FORFEIT: '/:matchId/forfeit',
}

module.exports = {
  ROUTE_PREFIX,
  USER_ROUTES,
  ROOM_ROUTES,
  MATCH_ROUTES
};
