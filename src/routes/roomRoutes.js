const express =require('express')
const { ROOM_ROUTES } = require('../constants/routes')
const { verifyToken } = require('../middlewares/authMiddleware')
const { createRoom } = require('../controllers/roomController')

const router=express.Router()

router.post(ROOM_ROUTES.CREATE,verifyToken,createRoom)
router.get(`/${ROOM_ROUTES.GET}`,()=>{})

module.exports = router