const ChatbotService = require("../services/ChatService");

const chatbotTraining = async (req, res) => {
    try {
      const { key, intent, priority, responses } = req.body;
  
      if (!key || !intent || !responses) {
        return res.status(400).json({
          status: "ERR",
          message: "Key, intent, and responses are required.",
        });
      }
   
      const result = await ChatbotService.trainChatbot({
        key,
        intent,
        priority,
        responses,
      });
  
      return res.status(200).json({
        status: "OK",
        message: "Training data saved successfully!",
        data: result,
      });
    } catch (e) {
      return res.status(500).json({
        status: "ERR",
        message: e.message,
      });
    }
  };

const chatbotResponse = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                status: "ERR",
                message: "Message is required",
            });
        }

        // Gọi service để xử lý tìm câu trả lời
        const response = await ChatbotService.generateChatResponse(message);

        return res.status(200).json({
            status: "OK",
            data: response,
        });
    } catch (e) {
        return res.status(500).json({
            status: "ERR",
            message: e.message,
        });
    }
};

const getAllTraining = async (req, res) => {
    try { 
        const trainingData = await ChatbotService.getAllTrainingData();

        return res.status(200).json({
            status: "OK",
            data: trainingData,
        });
    } catch (e) {
        return res.status(500).json({
            status: "ERR",
            message: e.message,
        });
    }
};

const deleteTraining = async (req, res) => {
    try {
        const { id } = req.params; // Lấy ID từ URL params

        if (!id) {
            return res.status(400).json({
                status: "ERR",
                message: "Training ID is required.",
            });
        }

        // Gọi service để xóa dữ liệu
        const response = await ChatbotService.deleteTrainingData(id);

        return res.status(200).json({
            status: "OK",
            message: response.message,
        });
    } catch (e) {
        return res.status(500).json({
            status: "ERR",
            message: e.message,
        });
    }
};



module.exports = {
    chatbotTraining,
    chatbotResponse,
    getAllTraining,
    deleteTraining
};
