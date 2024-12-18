const mongoose = require('mongoose')
const userSchema = new mongoose.Schema(
    {
        name: {type: String},
        email: {type: String, required: true, unique: true},
        password: {type: String, required: true},
        //confirmPassword: {type: String, required: true},
        isAdmin: {type: Boolean, default: false, required: true},
        phone: {type: String},
        address: {type: String},
        avatar: {type: String},
        city: {type: String},
        // access_token: {type: String, required: true},
        // refresh_token: {type: String, required: true},
        rewardPoints: { type: Number, default: 0 },
        resetPasswordToken: {type: String},
        resetPasswordExpires: {type: Date},
        isLocked: { type: Boolean, default: false },
        notifications: [
            {
                title: { type: String, required: true },
                content: { type: String, required: true },
                read: { type: Boolean, default: false },
                createdAt: { type: Date, default: Date.now }
            }
        ],
        shippingAddress: {
            nameship: { type: String},
            addressShip: {type: String},
            wardShip: {type: String},
            districtShip: {type: String},
            cityShip: {type: String},
            phoneShip: { type: String},
        },
    },
    {
        timestamps: true
    }
);
const User = mongoose.model("User", userSchema);
module.exports = User;