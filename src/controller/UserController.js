const UserService = require('../services/UserService')
const JwtService = require('../services/JwtService')
const EmailService = require("../services/EmailService")

const createUser = async(req, res ) => {
    try{
        const {name , email, password, confirmPassword, phone} = req.body
        const reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
        const isCheckEmail = reg.test(email)
        if(!name || !email || !password || !confirmPassword || !phone){
            return res.status(200).json({
                status: 'ERR',
                message: 'The input is required'
            })
        }else if(!isCheckEmail){
            return res.status(200).json({
                status: 'ERR',
                message: 'The input is email'
            })
        }else if(password !== confirmPassword){
            return res.status(200).json({
                status: 'ERR',
                message: 'The password is equal confirmPassword'
            })
        }
        const response = await UserService.createUser(req.body)
        return res.status(200).json(response)
    }catch(e){
        return res.status(404).json({
            message: e
        })
    }
}

const createGoogleUser = async (req, res) => {
    try {
        const { name, email, picture } = req.body;

        if (!name || !email || !picture) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Google user data is incomplete'
            });
        }

        const googleUser = { name, email, picture};
        const response = await UserService.createGoogleUser(googleUser);

        // Đặt cookie refresh token
        const { refresh_token, ...newResponse } = response;
        res.cookie('refresh_token', refresh_token, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict'
        });

        return res.status(200).json(newResponse);
    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
            message: e.message
        });
    }
};


const loginUser = async(req, res ) => {
    try{
        const {email, password} = req.body
        const reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
        const isCheckEmail = reg.test(email)
        if( !email || !password ){
            return res.status(200).json({
                status: 'ERR',
                message: 'The input is required'
            })
        }else if(!isCheckEmail){
            return res.status(200).json({
                status: 'ERR',
                message: 'The input is email'
            })
        }  
        const response = await UserService.loginUser(req.body)
        const { refresh_token, ...newRespone} =  response
        // console.log('response', response)
        res.cookie('refresh_token', refresh_token, {
            httpOnly: true,
            secure: false,
            samesime: 'strict'
            
        })
        return res.status(200).json(newRespone)
    }catch(e){
        return res.status(404).json({
            message: e
        })
    }
}

const updateUser = async(req, res ) => {
    try{
        const userId = req.params.id
        const data = req.body
        if(!userId){
            return res.status(200).json({
                status: 'ERR',
                message: 'The userId is required'
            })
        }
        const response = await UserService.updateUser(userId, data)
        return res.status(200).json(response)
    }catch(e){
        return res.status(404).json({
            message: e
        })
    }
}

const deleteUser = async(req, res ) => {
    try{
        const userId = req.params.id
        if(!userId){
            return res.status(200).json({
                status: 'ERR',
                message: 'The userId is required'
            })
        }
        const response = await UserService.deleteUser(userId)
        return res.status(200).json(response)
    }catch(e){
        return res.status(404).json({
            message: e
        })
    }
}

const getAllUser = async(req, res ) => {
    try{
        const response = await UserService.getAllUser()
        return res.status(200).json(response)
    }catch(e){
        return res.status(404).json({
            message: e
        })
    }
}
const getDetailsUser = async(req, res ) => {
    try{
        const userId = req.params.id
        if(!userId){
            return res.status(200).json({
                status: 'ERR',
                message: 'The userId is required'
            })
        }
        const response = await UserService.getDetailsUser(userId)
        return res.status(200).json(response)
    }catch(e){
        return res.status(404).json({
            message: e
        })
    }
}

const refreshToken = async(req, res ) => {
   
    try{
        const token = req.cookies.refresh_token
        if(!token){
            return res.status(200).json({
                status: 'ERR',
                message: 'The token is required'
            })
        }
        const response = await JwtService.refreshTokenJwtService(token)
        return res.status(200).json(response)
    }catch(e){
        return res.status(404).json({
            message: e
        })
    }
}

const logoutUser = async(req, res ) => {
     
    try{
        res.clearCookie('refresh_token')
        return res.status(200).json({
            stats : 'OK',
            message : 'Logout Sucessfully'
        })
    }catch(e){
        return res.status(404).json({
            message: e
        })
    }
}

const deleteMany = async (req, res) => {
    try {
        const ids = req.body.ids
        if (!ids) {
            return res.status(200).json({
                status: 'ERR',
                message: 'The ids is required'
            })
        }
        const response = await UserService.deleteManyUser(ids)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Email is required'
            });
        }
        const user = await UserService.findUserByEmail(email);
        if (!user) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Email does not exist'
            });
        }
        const response = await UserService.generateResetToken(email);
        if (response.status === 'OK') {
            await EmailService.sendResetPasswordEmail(email, response.resetToken);
        }
        return res.status(200).json(response);
    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
            message: e.message
        });
    }
}

const resetPassword = async (req, res) => {
    try {
        const { token, newPassword, confirmPassword } = req.body;
        if (!token || !newPassword || !confirmPassword) {
            return res.status(400).json({
                status: 'ERR',
                message: 'All fields are required'
            });
        }
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Passwords do not match'
            });
        }
        const response = await UserService.resetPassword(token, newPassword);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
            message: e.message
        });
    }
}

module.exports = {
    createUser,
    loginUser,
    updateUser,
    deleteUser,
    getAllUser,
    getDetailsUser,
    refreshToken,
    logoutUser,
    deleteMany,
    forgotPassword,
    resetPassword,
    createGoogleUser

}