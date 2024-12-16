const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config()

const authMiddleware = (req, res, next) =>{
    
    const token = req.headers.token.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN, function(err, user){
        if(err){
            return res.status(404).json({
                message: 'The authetication',
                status: 'ERROR'
            })
        }
        const { payload } = user
        if(user?.isAdmin){
            next()
        }else{
            return res.status(404).json({
                message: 'The authetication',
                status: 'ERROR'
            })
        }
    });
}

const authUserMiddleware = (req, res, next) =>{
    const token = req.headers.token.split(' ')[1]
    const userId = req.params.id
    jwt.verify(token, process.env.ACCESS_TOKEN, function(err, user){
        if(err){
            return res.status(404).json({
                message: 'The authetication',
                status: 'ERROR'
            })
        }
        const { payload } = user

        
        if(user?.isAdmin || user?.id === userId){
           
            next()
        }else{
            return res.status(404).json({
                message: 'The authetication',
                status: 'ERROR'
            })
        }
    });
}
const authCartMiddleware = (req, res, next) => {
    const token = req.headers.token?.split(' ')[1]; // Lấy token từ header
    if (!token) {
      return res.status(401).json({
        message: 'User not authenticated. Token missing.',
        status: 'ERROR'
      });
    }
  
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, user) {
      if (err) {
        return res.status(403).json({
          message: 'Token is invalid or expired.',
          status: 'ERROR'
        });
      }

      if (user.isAdmin) {
        return res.status(403).json({
            message: 'Quản trị viên không thể thực hiện thao tác này',
            status: 'ERROR'
        });
    }
  
      req.user = user;  
      next();
    });
  };
  
const authUserRMiddleware = (req, res, next) => {
    const tokenHeader = req.headers.token;
    if (!tokenHeader) {
        return res.status(401).json({
            message: "Token is missing",
            status: "ERROR",
        });
    }

    const token = tokenHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({
            message: "Token format is invalid",
            status: "ERROR",
        });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, user) {
        if (err) {
            return res.status(403).json({
                message: "Invalid or expired token",
                status: "ERROR",
            });
        }
        
        if (user.isAdmin) {
            return res.status(403).json({
                message: 'Admin cannot perform this actions.',
                status: 'ERROR'
            });
        }

        req.user = user;
        next();
       
    });
};

const authRMiddleware = (req, res, next) => {
    const token = req.headers.token.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, user) {
        if (err) {
            return res.status(404).json({
                message: 'Authentication failed',
                status: 'ERROR',
            });
        }
        if (user?.isAdmin) {
            req.user = user; // Gắn user vào request
            next();
        } else {
            return res.status(403).json({
                message: 'Forbidden: Admins only',
                status: 'ERROR',
            });
        }
    });
};

module.exports={
    authMiddleware,
    authUserMiddleware,
    authUserRMiddleware,
    authRMiddleware,
    authCartMiddleware
}