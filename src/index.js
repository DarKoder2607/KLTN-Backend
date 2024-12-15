const express = require("express");
const dotenv = require('dotenv');
const mongoose = require("mongoose");
const routes = require("./routes");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors= require('cors');
const EventService = require('./services/EventService')

dotenv.config()

const app = express()
const port = process.env.PORT || 3001

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

routes(app);


mongoose.connect(`${process.env.MONGO_DB}`)
    .then(()=> {
        console.log("Connect Db success!")
    })
    .catch((err)=> {
        console.log(err)
    })

    setInterval(async () => {
        await EventService.updateEventStatusByStartDate();  
        await EventService.updateEventAndProductStatusByEndDate();
         
}, 1000);


app.listen(port, ()=> {
    console.log('Server is running in port: ', +port )
})