const express = require('express')
const { ROOM_ROUTES } = require('../constants/routes')
const { verifyToken } = require('../middlewares/authMiddleware')
const { createRoom, getRoom, getMyRooms, joinRoom, getJoinedRooms, leaveRoom, deleteRoom, isParticipant } = require('../modules/room/controller/roomController')


const router = express.Router()

router.post(ROOM_ROUTES.CREATE, verifyToken, createRoom)
router.get(`${ROOM_ROUTES.GET}`, verifyToken, getRoom)
router.get(`${ROOM_ROUTES.CREATED}`, verifyToken, getMyRooms)
router.post(`${ROOM_ROUTES.JOIN}`, verifyToken, joinRoom)
router.get(`${ROOM_ROUTES.JOINED}`, verifyToken, getJoinedRooms)
router.post(`${ROOM_ROUTES.LEAVE}`, verifyToken, leaveRoom)
router.delete(`${ROOM_ROUTES.DELETE}`, verifyToken, deleteRoom)
router.get(`${ROOM_ROUTES.IS_PARTICIPANT}`, verifyToken, isParticipant)


module.exports = router