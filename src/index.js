const express = require("express");
const dotenv = require('dotenv');
const mongoose = require("mongoose");
const routes = require("./routes");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors= require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');

dotenv.config()

const app = express()
const port = process.env.PORT || 3001

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 60 * 60 * 1000  
    },
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_DB,  
        ttl: 14 * 24 * 60 * 60  
    })
}));

routes(app);


mongoose.connect(`${process.env.MONGO_DB}`)
    .then(()=> {
        console.log("Connect Db success!")
    })
    .catch((err)=> {
        console.log(err)
    })



app.listen(port, ()=> {
    console.log('Server is running in port: ', +port )
})