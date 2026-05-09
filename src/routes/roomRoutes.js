const express =require('express')
const { ROOM_ROUTES } = require('../constants/routes')
const { verifyToken } = require('../middlewares/authMiddleware')
const { createRoom, getRoom, getMyRooms, joinRoom, getJoinedRooms, leaveRoom } = require('../controllers/roomController')
const { verify } = require('jsonwebtoken')

const router=express.Router()

router.post(ROOM_ROUTES.CREATE,verifyToken,createRoom)
router.get(`${ROOM_ROUTES.GET}`,verifyToken,getRoom)
router.get(`${ROOM_ROUTES.CREATED}`, verifyToken, getMyRooms)
router.post(`${ROOM_ROUTES.JOIN}`, verifyToken, joinRoom)
router.get(`${ROOM_ROUTES.JOINED}`,verifyToken,getJoinedRooms)
router.post(`${ROOM_ROUTES.LEAVE}`,verifyToken,leaveRoom)


module.exports = router