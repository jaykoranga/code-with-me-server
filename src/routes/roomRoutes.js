const express =require('express')
const { ROOM_ROUTES } = require('../constants/routes')
const { verifyToken } = require('../middlewares/authMiddleware')
const { createRoom, getRoom, getMyRooms } = require('../controllers/roomController')

const router=express.Router()

router.post(ROOM_ROUTES.CREATE,verifyToken,createRoom)
router.get(`${ROOM_ROUTES.GET}`,verifyToken,getRoom)
router.get(`${ROOM_ROUTES.CREATED}`, verifyToken, getMyRooms)


module.exports = router