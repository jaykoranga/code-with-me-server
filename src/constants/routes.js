
const ROUTE_PREFIX = {
  API: "/api/v1",
  USERS: "/users",
  ROOM:'/room'
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
  JOIN:'/join/:roomId',
  GET:'/get/:roomId',
  LEAVE:'/leave/:roomId',
  DELETE:'/delete/:roomId',
  CREATED:'/created',
  JOINED:'/joined',
}

module.exports = {
  ROUTE_PREFIX,
  USER_ROUTES,
  ROOM_ROUTES
};
