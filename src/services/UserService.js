const User = require("../models/UserModel")
const bcrypt = require("bcryptjs")
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const {genneralAccessToken, genneralRefreshToken} = require("./JwtService")

const createUser = (newUser) => {
    return new Promise(async (resolve, reject) =>{
        const { name , email, password,confirmPassword , phone } = newUser
        try{
            const checkUser = await User.findOne({
                email: email
            })
            if(checkUser !== null){
                resolve({
                    status: 'ERR',
                    message: 'The email is already exist'
                })
            }
            const hash = bcrypt.hashSync(password, 10)
            const createdUser = await User.create({
                name , 
                email, 
                password: hash, 
                phone
            })
            if(createdUser){
                resolve({
                    status: 'OK',
                    message: 'SUCCESS',
                    data: createdUser
                })
            }
        }catch (e){
            reject(e)
        }
    })
}

const createGoogleUser = (googleUser) => {
    return new Promise(async (resolve, reject) => {
        const { name, email, picture} = googleUser;   
        try { 
            let user = await User.findOne({ email: email });
            if (!user) { 
                user = await User.create({
                    name,
                    email,
                    avatar: picture,  
                    password: 'defaultpassword',  
                });
            }
 
            if (user.isLocked) {
                return resolve({
                    status: 'ERR',
                    message: 'This account is locked',
                });
            }

            const access_token = await genneralAccessToken({
                id: user.id,
                isAdmin: user.isAdmin
            });

            const refresh_token = await genneralRefreshToken({
                id: user.id,
                isAdmin: user.isAdmin
            });

            resolve({
                status: 'OK',
                message: user ? 'Google login success' : 'Account created via Google',
                data: user,
                access_token,
                refresh_token
            });
        } catch (e) {
            reject(e);  
        }
    });
};

const loginUser = (userLogin) => {
    return new Promise(async (resolve, reject) =>{
        const { email, password} = userLogin
        try{
            const checkUser = await User.findOne({
                email: email
            })
            if(checkUser === null){
                resolve({
                    status: 'ERR',
                    message: 'The user is not defined'
                })
            }

            if (checkUser.isLocked) {
                resolve({
                    status: 'ERR',
                    message: 'This account is locked'
                });
            }

            const comparePassword = bcrypt.compareSync(password, checkUser.password)

            if(!comparePassword){
                resolve({
                    status: 'ERR',
                    message: 'The password or email incorrect'
                })
            }
            const access_token = await genneralAccessToken({
                id: checkUser.id,
                isAdmin: checkUser.isAdmin
            })

            const refresh_token = await genneralRefreshToken({
                id: checkUser.id,
                isAdmin: checkUser.isAdmin
            })

            resolve({
                status: 'OK',
                message: 'SUCCESS',
                access_token,
                refresh_token
            })
        }catch (e){
            reject(e)
        }
    })
}

const updateUser = (id , data) => {
    return new Promise(async (resolve, reject) =>{
        try{
            const checkUser = await User.findOne({
                _id : id
            })
            if(checkUser === null){
                resolve({
                    status: 'OK',
                    message: 'The user is not defined'
                })
            }
            const updatedUser = await User.findByIdAndUpdate(id, data, {new: true})

            resolve({
                status: 'OK',
                message: 'SUCCESS',
                data: updatedUser
            })
        }catch (e){
            reject(e)
        }
    })
}

const deleteUser = (id) => {
    return new Promise(async (resolve, reject) =>{
        try{
            const checkUser = await User.findOne({
                _id : id
            })
            if(checkUser === null){
                resolve({
                    status: 'OK',
                    message: 'The user is not defined'
                })
            }
            await User.findByIdAndDelete(id)

            resolve({
                status: 'OK',
                message: 'Delete user SUCCESS',
            })
        }catch (e){
            reject(e)
        }
    })
}

const getAllUser = () => {
    return new Promise(async (resolve, reject) =>{
        try{
            const allUser = await User.find()
            resolve({
                status: 'OK',
                message: 'SUCCESS',
                data: allUser
            })
        }catch (e){
            reject(e)
        }
    })
}

const getDetailsUser = (id) => {
    return new Promise(async (resolve, reject) =>{
        try{
            const user = await User.findOne({
                _id : id
            })
            if(user === null){
                resolve({
                    status: 'OK',
                    message: 'The user is not defined'
                })
            }

            resolve({
                status: 'OK',
                message: 'SUCCESS',
                data: user
            })
        }catch (e){
            reject(e)
        }
    })
}

const deleteManyUser = (ids) => {
    return new Promise(async (resolve, reject) => {
        try {

            await User.deleteMany({ _id: ids })
            resolve({
                status: 'OK',
                message: 'Delete user success',
            })
        } catch (e) {
            reject(e)
        }
    })
}



const generateResetToken = (email) => {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                resolve({
                    status: 'ERR',
                    message: 'User not found'
                });
            }
            const resetToken = crypto.randomBytes(32).toString("hex");
            const hashedToken = bcrypt.hashSync(resetToken, 10);
            user.resetPasswordToken = hashedToken;
            user.resetPasswordExpires = Date.now() + 3600000;  
            await user.save();
            resolve({
                status: 'OK',
                message: 'Reset token generated',
                resetToken
            });
        } catch (e) {
            reject(e);
        }
    });
}

const resetPassword = (token, newPassword) => {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await User.findOne({
                resetPasswordToken: { $exists: true },
                resetPasswordExpires: { $gt: Date.now() }
            });
            if (!user || !bcrypt.compareSync(token, user.resetPasswordToken)) {
                resolve({
                    status: 'ERR',
                    message: 'Invalid or expired token'
                });
            }
            const hashedPassword = bcrypt.hashSync(newPassword, 10);
            user.password = hashedPassword;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();
            resolve({
                status: 'OK',
                message: 'Password reset successful'
            });
        } catch (e) {
            reject(e);
        }
    });
}

const findUserByEmail = async (email) => {
    try {
        const user = await User.findOne({ email });
        return user;  
    } catch (error) {
        throw new Error(error.message);
    }
}

const lockUserAccount = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await User.findById(id);
            if (!user) {
                resolve({
                    status: 'ERR',
                    message: 'User not found'
                });
            }
            user.isLocked = true;
            await user.save();
            resolve({
                status: 'OK',
                message: 'User account locked successfully',
                data: user
            });
        } catch (e) {
            reject(e);
        }
    });
};

const unlockUserAccount = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await User.findById(id);
            if (!user) {
                resolve({
                    status: 'ERR',
                    message: 'User not found'
                });
            }
            user.isLocked = false;
            await user.save();
            resolve({
                status: 'OK',
                message: 'User account unlocked successfully',
                data: user
            });
        } catch (e) {
            reject(e);
        }
    });
};

const getUserNotifications = async (userId) => {
    try {
        if (!userId) {
            throw new Error('User ID is required');
        }

        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
 
        const notifications = user.notifications.slice(-10).reverse();  
        return notifications;
    } catch (error) {
        throw error;
    }
};

const markNotificationsAsRead = async (userId) => {
    try {
        if (!userId) {
            throw new Error('User ID is required');
        }

        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
 
        user.notifications.forEach(notification => {
            notification.read = true;
        });

        await user.save();
        return user.notifications;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    createUser,
    loginUser,
    updateUser,
    deleteUser,
    getAllUser,
    getDetailsUser,
    deleteManyUser,
    generateResetToken,
    resetPassword,
    findUserByEmail,
    lockUserAccount,
    unlockUserAccount,
    createGoogleUser,
    getUserNotifications,
    markNotificationsAsRead
};

