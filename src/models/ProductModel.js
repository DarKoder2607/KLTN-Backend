const mongoose = require('mongoose')

// REVIEW MODEL
const   reviewSchema = new mongoose.Schema(
    {
      name: {
        type: String,
        required: [true, "name is require"],
      },
      rating: {
        type: Number,
        default: 0,
      },
      comment: {
        type: String,
      }, 
      isHidden: {
        type: Boolean,
        default: false, 
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "User is required"],
      },
    },
    { timestamps: true }
  );
  
// Nested Schemas 
const phoneSchema = new mongoose.Schema({
  screen: { type: String },
  os: { type: String },
  camera: { type: String },
  cameraFront: { type: String },
  cpu: { type: String },
  ram: { type: String },
  rom: { type: String },
  microUSB: { type: String },
  battery: { type: String },
});

const watchSchema = new mongoose.Schema({
  screen: { type: String },
  os: { type: String },
  battery: { type: String },
  bluetooth: { type: String },
  sensors: { type: String },
  size: {type: String},
  feature: {type: String},
  strap: {type: String},
  material:{type: String}
});

const laptopSchema = new mongoose.Schema({
  screen: { type: String },
  os: { type: String },
  cpu: { type: String },
  ram: { type: String },
  rom: { type: String },
  battery: { type: String },
  ports: { type: String },
  chipCard: {type: String},
  sound: {type: String},
  design: {type: String},
  feature: {type: String}
});

const tabletSchema = new mongoose.Schema({
  screen: { type: String },
  os: { type: String },
  camera: { type: String },
  cpu: { type: String },
  ram: { type: String },
  rom: { type: String },
  battery: { type: String },
  processorGraphics: {type: String},
  design: {type: String},
  ports: {type: String},
  feature: {type: String}

});

const audioSchema = new mongoose.Schema({
  bluetooth: { type: String },
  battery: { type: String },
  length: {type:String},
  noiseCancellation: { type: String},
  ports: {type: String},
  scope: {type:String} ,
  material: {type: String},
  design: {type: String},
  feature: {type: String}
});

const loudspeakerSchema = new mongoose.Schema({
  bluetooth: { type: String },
  battery: { type: String },
  waterproof: { type: String },
  design: {type: String},
  connectControl: {type: String},
  audio: {type: String}


});

const productSchema = new mongoose.Schema(
    {
        name: {type: String, required: true, unique: true},
        image: {type: String, required: true},
        type: {type: String, required: true},//brand của sản phẩm
        price: {type: Number, required: true},
        countInStock: {type: Number, required: true},
        //rating: {type: Number, required: true},
        deviceType: { type: String, required: true ,
          enum: ['phone', 'watch', 'laptop', 'tablet', 'audio', 'loudspeaker']
        }, // loại thiết bị 
        //thông số ki thuật
        phoneSpecs: phoneSchema,
        watchSpecs: watchSchema,
        laptopSpecs: laptopSchema,
        tabletSpecs: tabletSchema,
        audioSpecs: audioSchema,
        loudspeakerSpecs: loudspeakerSchema,
        
        relatedImages: { type: [String], validate: [arrayLimit, '{PATH} exceeds the limit of 6'] },
        discount: {type: Number},
        selled: {type: Number},
        reviews: [reviewSchema],
        rating: {
            type: Number,
            default: 0,
        },
        numReviews: {
            type: Number,
            default: 0,
        },
        isInEvent: { 
          type: Boolean, 
          default: false 
        },
        eventNames: {
          type: [String], 
          default: [],
        },
        eventIds: {
            type: [mongoose.Schema.Types.ObjectId],  
            ref: 'Event',
            default: [],
        },
        originPrice: {type: Number, default: 0},
        originDiscount: {type: Number, default: 0}
    },
    {
        timestamps: true,
    }
);

function arrayLimit(val) {
    return val.length <= 6;
}

const Product = mongoose.model('Product', productSchema)
module.exports = Product;