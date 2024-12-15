const express = require("express");
const router = express.Router()
const EventController = require('../controller/EventController');
const { authMiddleware} = require("../middleware/authMiddleware");

router.post('/create', EventController.createEvent);
router.delete('/delete/:id',authMiddleware, EventController.deleteEvent);
router.put('/update/:eventId',authMiddleware, EventController.updateEvent);
router.get('/getAll', EventController.getAllEvents);
router.get('/getDetails/:id', EventController.getDetailsEvent);


module.exports = router