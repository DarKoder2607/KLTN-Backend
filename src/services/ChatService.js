const ChatModel = require("../models/ChatModel");
const ProductModel = require("../models/ProductModel"); 

const trainChatbot = (trainingData) => {
    return new Promise(async (resolve, reject) => {
        try { 
            const newTrainingData = await ChatModel.create(trainingData);
            resolve(newTrainingData);
        } catch (e) {
            reject(e);
        }
    });
};
const extractKeys = (message, trainingData) => {
  const detectedIntents = [];
  console.log("message", message);
  const priceRange = extractPriceRange(message);  
  const words = message.toLowerCase();   
  trainingData.forEach((data) => {
    const matchedKeys = data.key.filter((keyword) => { 
      return words.includes(keyword.toLowerCase());
    });

    if (matchedKeys.length > 0) {
      detectedIntents.push({
        intent: data.intent,
        priority: data.priority,
        responses: data.responses,
        matchedKeys, 
        priceRange
      });
    }
  });

  return detectedIntents;
};

const extractPriceRange = (message) => {
  let low = 0;
  let high = Number.MAX_SAFE_INTEGER;  
 
  const units = {
    triệu: 1000000,
    m: 1000000,  
    ngàn: 1000,
    k: 1000   
  };
 
  const underKeywords = ["dưới", "ít", "bé", "nhỏ", "chỉ còn", "tận", "khoảng"];
  const overKeywords = ["trên", "nhiều hơn", "hơn"];
  const rangeKeywords = ["từ", "đến", "->", "khoảng", "trong phạm vi", "-"];
 
  const lowerCaseMessage = message.toLowerCase();
 
  if (underKeywords.some(keyword => lowerCaseMessage.includes(keyword))) {
    if (/(\d+)\s*(triệu|m|ngàn|k)/i.test(message)) {
      const match = message.match(/(\d+)\s*(triệu|m|ngàn|k)/i);
      const n = parseFloat(match[1]);
      const unit = match[2].toLowerCase();
      low = 0;
      high = n * units[unit];  
    }
    return { low, high };
  }
 
  else if (overKeywords.some(keyword => lowerCaseMessage.includes(keyword))) {
    if (/(\d+)\s*(triệu|m|ngàn|k)/i.test(message)) {
      const match = message.match(/(\d+)\s*(triệu|m|ngàn|k)/i);
      const n = parseFloat(match[1]);
      const unit = match[2].toLowerCase();
      low = n * units[unit];  
      high = Number.MAX_SAFE_INTEGER; 
    }
    return { low, high };
  }
  
  else if (rangeKeywords.some(keyword => lowerCaseMessage.includes(keyword))) {
    
    const rangeMatch = message.match(/(\d+)\s*(triệu|m|ngàn|k)?\s*(->|-)\s*(\d+)\s*(triệu|m|ngàn|k)?/i);
    if (rangeMatch) {
      const lowValue = parseFloat(rangeMatch[1]);
      const lowUnit = rangeMatch[2] ? rangeMatch[2].toLowerCase() : "k";  
      const highValue = parseFloat(rangeMatch[4]);
      const highUnit = rangeMatch[5] ? rangeMatch[5].toLowerCase() : "k";  
      
      low = lowValue * units[lowUnit];
      high = highValue * units[highUnit];
    }
    return { low, high };
  }

  return null;
};


const findCheapestProducts = async (limit = 3) => {
  try {
    
    const cheapestProducts = await ProductModel.find()
      .sort({ price: 1 })  
      .limit(limit);  

    if (cheapestProducts.length === 0) {
      return "Hiện tại không có sản phẩm trong cơ sở dữ liệu.";
    }

     
    const productDetails = cheapestProducts
      .map(
        (product, index) =>
          `${index + 1}. ${product.name} giá chỉ ${product.price}đ`
      )
      .join("\n");

    return productDetails;
  } catch (error) {
    console.error("Error in findCheapestProducts:", error);
    throw new Error("Lỗi trong quá trình tìm kiếm sản phẩm giá thấp nhất.");
  }
};

const findProductHotTrending = async (limit = 3) => {
  try {

    const cheapestProducts = await ProductModel.find()
      .sort({ selled: 1 }) 
      .limit(limit); 

    if (cheapestProducts.length === 0) {
      return "Hiện tại không có sản phẩm trong cơ sở dữ liệu.";
    }

   
    const productDetails = cheapestProducts
      .map(
        (product, index) =>
          `${index + 1}. ${product.name} giá chỉ ${product.price}đ`
      )
      .join("\n");

    return productDetails;
  } catch (error) {
    console.error("Error in findCheapestProducts:", error);
    throw new Error("Lỗi trong quá trình tìm kiếm sản phẩm.");
  }
}

const brandMapping = {
  samsung: "Samsung",
  iphone: "Apple",
  apple: "Apple",
  oppo: "Oppo",
  xiaomi: "Xiaomi",
  nokia: "Nokia",
};
const getNormalizedKey = (input) => {
  const lowerInput = input.toLowerCase();  
  for (const [key, value] of Object.entries(brandMapping)) {
    if (lowerInput.includes(key)) {
      return value;  
    }
  }
  return null;  
};

const generateChatResponse = async (message) => {
  try { 
    const trainingData = await ChatModel.find();
    if (!trainingData || trainingData.length === 0) {
      return { role: "bot", text: "Hiện tại tôi chưa có đủ dữ liệu để trả lời." };
    } 
    const detectedIntents = extractKeys(message, trainingData);
    console.log("detectedIntents", detectedIntents);
    if (detectedIntents.length === 0) {
      return { role: "bot", text: "Xin lỗi, tôi không tìm thấy thông tin phù hợp." };
    }
     
    const responseParts = await Promise.all(
      detectedIntents.map(async (intentData) => {
        
        const randomResponse =
          intentData.responses[Math.floor(Math.random() * intentData.responses.length)];
 
        if (randomResponse.includes("${key}")) { 
          const matchedKey = intentData.matchedKeys?.[0];

          const normalizedKey = getNormalizedKey(matchedKey);
          if (normalizedKey) {
            const keyword = normalizedKey.charAt(0).toUpperCase() + normalizedKey.slice(1).toLowerCase();
 
            const products = await ProductModel.find({ type: keyword }).limit(3);
 
            const productDetails = products
              .map(
                (product, index) =>
                  `${index + 1}.Sản phẩm ${product.name} giá chỉ ${product.price}đ`
              )
              .join("\n");

            const response = randomResponse.replace("${key}", keyword);
            return `${response}\n${productDetails.trim()}`;
          }
        }

        if (intentData.intent === "Price") {
          if(intentData.priceRange){
            const { low, high } = intentData.priceRange;
            const products = await ProductModel.find({
              price: { $gte: low, $lte: high }
            }).limit(3);
            
            const productsRespones = randomResponse.replace("${low}" , low).replace("${high}", high);
            const productDetails = products
              .map((product, index) => `${index + 1}.Sản phẩm ${product.name} giá chỉ ${product.price}đ`)
              .join("\n");
              return `${productsRespones}\nDưới đây là các sản phẩm trong khoảng giá của bạn:\n${productDetails}`;
          }
          else{
            const cheapestProducts = await findCheapestProducts(3);  
            return `${randomResponse}\n Dưới đây là các sản phẩm có giá rẻ nhất:\n${cheapestProducts}`;
          }
        }

        if(intentData.intent === "Trend") {
          const trendProducts = await findProductHotTrending(3); 
          return `${randomResponse}: \n${trendProducts}`;
        }
        return randomResponse;  
      })
    );

    return { role: "bot", text: responseParts.join(" ") };
  } catch (error) {
    console.error("Error generating response:", error);
    return { role: "bot", text: "Đã xảy ra lỗi trong quá trình xử lý. Vui lòng thử lại sau." };
  }
};

  

const getAllTrainingData = () => {
    return new Promise(async (resolve, reject) => {
        try { 
            const trainingData = await ChatModel.find();
            resolve(trainingData);  
        } catch (e) {
            reject(e);  
        }
    });
};


const deleteTrainingData = (id) => {
    return new Promise(async (resolve, reject) => {
        try { 
            const result = await ChatModel.findByIdAndDelete(id);

            if (!result) {
                reject(new Error("Training data not found."));
            } else {
                resolve({ message: "Training data deleted successfully.", result });
            }
        } catch (e) {
            reject(e); 
        }
    });
};

module.exports = {
    trainChatbot,
    generateChatResponse,
    getAllTrainingData, 
    deleteTrainingData,
};
