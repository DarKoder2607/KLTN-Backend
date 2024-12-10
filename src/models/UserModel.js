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
        resetPasswordExpires: {type: Date}
    },
    {
        timestamps: true
    }
);
const User = mongoose.model("User", userSchema);
module.exports = User;