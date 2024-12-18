const UserRouter = require('./UserRouter')
const ProductRouter = require('./ProductRouter')
const OrderRouter = require('./OrderRouter')
const PaymentRouter = require('./PaymentRouter')
const CartRouter = require('./CartRouter')
const ChatRouter = require('./ChatRouter')
const EventRouter= require('./EventRouter')


const routes = (app) => {
    app.use('/api/user', UserRouter)
    app.use('/api/product', ProductRouter)
    app.use('/api/order', OrderRouter)
    app.use('/api/payment', PaymentRouter)
    app.use('/api/cart', CartRouter)
    app.use('/api/chat', ChatRouter)
    app.use('/api/event', EventRouter)

}

module.exports = routes