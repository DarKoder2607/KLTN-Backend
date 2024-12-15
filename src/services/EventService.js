const Event = require('../models/EventModel');
const Product = require('../models/ProductModel');
const User = require('../models/UserModel');

const formatDate = (date) => {
    const d = new Date(date);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
};


const createNotificationForUsers = async (title, content) => {
    try { 
        await User.updateMany({}, {
            $push: {
                notifications: {
                    title,
                    content,
                    read: false,
                    createdAt: new Date()
                }
            }
        });
    } catch (error) {
        console.error('Error sending notifications to users:', error);
        throw new Error('Error sending notifications to users');
    }
};

const createEvent = async (eventData) => {
    try {
        const { name, discountType, discountValue, startDate, endDate, applyType } = eventData;
        let appliedCriteria = null;
        let appliedProducts = [];

        if (applyType === 'brand') {
            appliedCriteria = eventData.appliedCriteria;
            appliedProducts = await Product.find({ type: appliedCriteria });
        } else if (applyType === 'all') {
            appliedProducts = await Product.find();
        } else if (applyType === 'inventory') {
            appliedProducts = await Product.find({ selled: { $lte: 3 } });
        } else {
            throw new Error('Invalid applyType');
        }

        const countdown = calculateCountdown(new Date(startDate), new Date(endDate));
        const newEvent = await Event.create({
            name,
            discountType,
            discountValue,
            startDate,
            endDate,
            applyType,
            appliedCriteria,
            appliedProducts: appliedProducts.map(product => product._id),
            countdown,
        });

        await Product.updateMany(
            { _id: { $in: appliedProducts.map(product => product._id) } },
            { 
                $set: { isInEvent: true }, 
                $push: { eventNames: name, eventIds: newEvent._id } 
            }
        );

        const title = `Sự kiện mới: ${name}`;
        const content = `Giảm giá ${discountType === 'amount' ? `số tiền ${discountValue} VND` : `${discountValue}%`} cho loại sản phẩm ${applyType} ${appliedCriteria ? `(${appliedCriteria})` : ''}. Thời gian: từ ${formatDate(startDate)} đến ${formatDate(endDate)}.`;
        await createNotificationForUsers(title, content);

        return { status: 'OK', message: 'Event created successfully', data: newEvent };
    } catch (e) {
        throw new Error('Error creating event: ' + e.message);
    }
};

const calculateCountdown = (startDate, endDate) => {
    const diff = endDate - startDate;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${days}:${hours}:${minutes}:${seconds}`;
};


const updateEvent = async (eventId, discountType, discountValue, appliedProducts, name, endDate, applyType,appliedCriteria) => {
    try {

        
        console.log("Updating event with ID:", eventId);
      

        if (!appliedProducts && applyType === "brand") {
            const products = await Product.find({ type: appliedCriteria }).select("_id");
            appliedProducts = products.map((product) => product._id);
        }
        if (!appliedProducts && applyType === 'all') {
            const products = await Product.find().select("_id");
            appliedProducts = products.map((product) => product._id);
        }
        if (!appliedProducts && applyType === 'inventory') {
            const products = await Product.find({ selled: { $lte: 3 } }).select("_id");
            appliedProducts = products.map((product) => product._id);
        }

        if (!appliedProducts || appliedProducts.length === 0) {
            return resolve({
                status: 'ERR',
                message: 'No applied products found for the event',
            });
        }

        console.log("Applied Products:", appliedProducts);

        const event = await Event.findById(eventId);

        if (!event) {
            throw new Error('Event not found');
        }

        if (event.endDate < new Date() && new Date(endDate) > new Date()) {
            event.status = true;
        }

        if (endDate && event.endDate.toISOString() !== endDate) {
            event.endDate = new Date(endDate);
            event.countdown = calculateCountdown(new Date(event.startDate), new Date(event.endDate));
        }

        for (const productId of event.appliedProducts) {
            const product = await Product.findById(productId);
            if (product) {
                product.price = product.originPrice;
                product.discount = product.originDiscount;

                product.isInEvent = false;
                product.eventNames = product.eventNames.filter(eventName => eventName !== event.name);
                product.eventIds = product.eventIds.filter(eventId => !eventId.equals(event._id));

                await product.save();
            }
        }

        let newAppliedProducts = [];
        if (appliedProducts && appliedProducts.length > 0) {
            newAppliedProducts = await Product.find({ _id: { $in: appliedProducts } });
            for (const product of newAppliedProducts) {
                if (product) {
                    if (discountType === 'amount') {
                        product.originPrice = product.price;
                        product.originDiscount = product.discount;
                        product.price = product.price - discountValue;
                        product.discount = 0;
                    } else if (discountType === 'percentage') {
                        product.originPrice = product.price;
                        product.originDiscount = product.discount;
                        product.discount = discountValue;
                    }

                    product.isInEvent = true;
                    product.eventNames.push(name);
                    product.eventIds.push(event._id);
                    await product.save();
                }
            }
        }

        event.discountType = discountType;
        event.discountValue = discountValue;
        event.appliedProducts = newAppliedProducts.map(product => product._id);
        event.name = name;
        event.appliedCriteria = appliedCriteria;
        event.applyType = applyType;
        event.appliedProducts = appliedProducts;

        await event.save();

        const title = `Sự kiện được cập nhật: ${name}`;
        const content = `Cập nhật giảm giá ${discountType === 'amount' ? `số tiền ${discountValue} VND` : `${discountValue}%`} cho loại sản phẩm ${applyType} ${appliedCriteria ? `(${appliedCriteria})` : ''}. Thời gian: từ ${formatDate(event.startDate)} đến ${formatDate(endDate)}.`;
        await createNotificationForUsers(title, content);


        return { status: 'OK', message: 'Event updated successfully', data: event };
    } catch (e) {
        throw new Error('Error updating event: ' + e.message);
    }
};



const deleteEvent = async (eventId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const event = await Event.findById(eventId);

            if (!event) {
                return resolve({
                    status: 'ERR',
                    message: 'Event not found',
                });
            }

            await Event.findByIdAndDelete(eventId);

            resolve({
                status: 'OK',
                message: 'Event deleted successfully',
            });
        } catch (e) {
            reject({
                status: 'ERR',
                message: 'Failed to delete event',
                error: e,
            });
        }
    });
};

const getAllEvents = async (limit, page, sort, filter) => {
    return new Promise(async (resolve, reject) => {
        try {
            const totalEvent = await Event.countDocuments()
            if(filter ){                
                label = filter[0]
                const allObjectFilter = await Event.find({[label]: {'$regex': filter[1]}}).limit(limit).skip(page * limit)
                resolve({
                    status: 'OK',
                    message: 'SUCCESS',
                    data: allObjectFilter,
                    total: totalEvent,
                    pageCurrent: Number(page+ 1),
                    totalPage: Math.ceil(totalEvent/ limit)
                })  
            }
            if(sort){                
                const objectSort = {}
                objectSort[sort[1]] = sort[0]
                const allEventSort = await Event.find().limit(limit).skip(page * limit).sort(objectSort)
                resolve({
                    status: 'OK',
                    message: 'SUCCESS',
                    data: allEventSort,
                    total: totalEvent,
                    pageCurrent: Number(page+ 1),
                    totalPage: Math.ceil(totalEvent/ limit)
                })      
                
            }
            const allEvent = await Event.find().limit(limit).skip(page * limit)
            resolve({
                status: 'OK',
                message: 'SUCCESS',
                data: allEvent,
                total: totalEvent,
                pageCurrent: Number(page+ 1),
                totalPage: Math.ceil(totalEvent/ limit)
            })
        } catch (e) {
            reject({
                status: 'ERR',
                message: 'Failed to retrieve events',
                error: e,
            });
        }
    });
};

const getDetailsEvent = async (eventId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const event = await Event.findById(eventId).populate('appliedProducts');

            if (!event) {
                return resolve({
                    status: 'ERR',
                    message: 'Event not found',
                });
            }

            resolve({
                status: 'OK',
                message: 'Event details fetched successfully',
                data: event,
            });
        } catch (e) {
            reject({
                status: 'ERR',
                message: 'Failed to retrieve event details',
                error: e,
            });
        }
    });
};

const updateEventStatusByStartDate = async () => {
    const currentDate = new Date();
 
    const eventsToUpdate = await Event.find({
        startDate: { $lte: currentDate },
        endDate: { $gte: currentDate },       
        status: false,                      
    });

    for (const event of eventsToUpdate) {
        for (const productId of event.appliedProducts) {
            const product = await Product.findById(productId);
            
            if (product) {
                if (event.discountType === 'amount') {
                    product.originPrice = product.price;
                    product.originDiscount = product.discount;
                    product.price = product.price - event.discountValue;
                    product.discount = 0;
                } else if (event.discountType === 'percentage') {
                    product.originPrice = product.price;
                    product.originDiscount = product.discount;
                    product.discount = event.discountValue;
                }

                product.isInEvent = true;
                product.eventNames.push(event.name);
                product.eventIds.push(event._id);
                await product.save();
            }
        }

        event.status = true;  
        await event.save();
    }
};

const updateEventAndProductStatusByEndDate = async () => {
    const currentDate = new Date();
 
    const eventsToUpdate = await Event.find({
        endDate: { $lt: currentDate },   
        status: true,                   
    });

    for (const event of eventsToUpdate) {
      
        event.status = false;
        await event.save();

       
        for (const productId of event.appliedProducts) {
            const product = await Product.findById(productId);
            
            if (product) {
                product.price = product.originPrice;
                product.discount = product.originDiscount;
 
                product.isInEvent = false;
                product.eventNames = product.eventNames.filter(eventName => eventName !== event.name);
                product.eventIds = product.eventIds.filter(eventId => !eventId.equals(event._id));

                await product.save();
            }
        }
    }
};



module.exports = {
    createEvent,
    deleteEvent,
    updateEvent,
    getAllEvents,
    getDetailsEvent, 
    updateEventAndProductStatusByEndDate,
    updateEventStatusByStartDate
};
