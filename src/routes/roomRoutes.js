const express =require('express')
const { ROOM_ROUTES } = require('../constants/routes')
const { verifyToken } = require('../middlewares/authMiddleware')
const { createRoom, getRoom, getMyRooms, joinRoom } = require('../controllers/roomController')

const router=express.Router()

router.post(ROOM_ROUTES.CREATE,verifyToken,createRoom)
router.get(`${ROOM_ROUTES.GET}`,verifyToken,getRoom)
router.get(`${ROOM_ROUTES.CREATED}`, verifyToken, getMyRooms)
router.post(`${ROOM_ROUTES.JOIN}`, verifyToken, joinRoom)


module.exports = router