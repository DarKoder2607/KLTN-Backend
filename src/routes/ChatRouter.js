const express = require('express');
const router = express.Router();
const ChatbotController = require('../controller/ChatbotController')


router.post("/chatbot/train", ChatbotController.chatbotTraining);
router.post("/chatbot/chat", ChatbotController.chatbotResponse);
router.get("/chatbot/getAll", ChatbotController.getAllTraining);
router.delete("/chatbot/train/:id", ChatbotController.deleteTraining);

module.exports = router;