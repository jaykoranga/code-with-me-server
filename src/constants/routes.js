
const ROUTE_PREFIX = {
  API: "/api/v1",
  USERS: "/users",
  ROOM:'/room'
};

const USER_ROUTES = {
  SIGNUP: "/signup",
  LOGIN: "/login",
  PROFILE: "/profile",
};

const ROOM_ROUTES = {
  CREATE:'/create',
  JOIN:'/join',
  GET:'/get',
  LEAVE:'/leave',
  DELETE:'/delete'
}

module.exports = {
  ROUTE_PREFIX,
  USER_ROUTES,
  ROOM_ROUTES
};
