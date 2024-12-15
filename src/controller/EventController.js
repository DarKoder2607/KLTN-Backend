const EventService = require('../services/EventService');

const createEvent = async (req, res) => {
    try {
        const { name, discountType, discountValue, startDate, endDate, applyType } = req.body;

        // Validate required fields
        if (!name || !discountType || !discountValue || !startDate || !endDate || !applyType) {
            return res.status(400).json({
                status: 'ERR',
                message: 'All required fields must be provided',
            });
        }

        const currentTime = new Date();

        // Validate date range
        if (new Date(startDate) <= currentTime) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Start date must be greater than the current time',
            });
        }

        if (new Date(startDate) >= new Date(endDate)) {
            return res.status(400).json({
                status: 'ERR',
                message: 'End date must be greater than start date',
            });
        }

        const response = await EventService.createEvent(req.body);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
            message: 'Internal Server Error',
            error: e.message,
        });
    }
};

const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Event ID is required',
            });
        }

        const response = await EventService.deleteEvent(id);
        if (response.status === 'OK') {
            return res.status(200).json(response);
        } else {
            return res.status(400).json(response);
        }
    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
            message: 'Internal Server Error',
            error: e.message,
        });
    }
};

const updateEvent = async (req, res) => {
    const { eventId } = req.params;
    console.log("eventId in controller:", eventId);  
    const { discountType, discountValue, appliedProducts, name, endDate , applyType, appliedCriteria} = req.body;

    try {
        const updatedEvent = await EventService.updateEvent(eventId, discountType, discountValue, appliedProducts, name, endDate, applyType, appliedCriteria);
        res.status(200).json({ message: 'Event updated successfully', event: updatedEvent });
    } catch (error) {
        console.error('Error updating event:', error.message);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};


const getAllEvents = async (req, res) => {
    try {
        const { limit, page, sort, filter }= req.query
        
        const response = await EventService.getAllEvents(Number(limit) , Number(page), sort , filter);
        if (response.status === 'OK') {
            return res.status(200).json(response);
        } else {
            return res.status(400).json(response);
        }
    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
            message: 'Internal Server Error',
            error: e.message,
        });
    }
};

const getDetailsEvent = async (req, res) => {
    try {
        const { id } = req.params;

        console.log('ID received:', id);

        if (!id) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Event ID is required',
            });
        }

        const response = await EventService.getDetailsEvent(id);
        if (response.status === 'OK') {
            return res.status(200).json(response);
        } else {
            return res.status(400).json(response);
        }
    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
            message: 'Internal Server Error',
            error: e.message,
        });
    }
};

const updateEventStatuses = async (req, res) => {
    try {
        await EventService.updateEventStatusByEndDate();
        return res.status(200).json({
            status: 'OK',
            message: 'Event statuses updated successfully',
        });
    } catch (error) {
        return res.status(500).json({
            status: 'ERR',
            message: 'Failed to update event statuses',
            error: error.message,
        });
    }
};
  



module.exports = { 
    deleteEvent,
    createEvent, 
    updateEvent, 
    getAllEvents, 
    getDetailsEvent,
    updateEventStatuses

};  
