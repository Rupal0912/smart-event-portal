const Event = require('../models/Event');

// @desc    Get all events (upcoming)
// @route   GET /api/events
const getEvents = async (req, res) => {
    try {
        const events = await Event.find({ date: { $gte: new Date() } })
            .sort({ date: 1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
const getEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new event (admin only)
// @route   POST /api/events
const createEvent = async (req, res) => {
    try {
        const { title, description, date, location, capacity, price, image } = req.body;

        const event = await Event.create({
            title,
            description,
            date,
            location,
            capacity,
            availableSeats: capacity, // initially all seats available
            price: price || 0,
            image: image || '',
        });

        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update an event (admin only)
// @route   PUT /api/events/:id
const updateEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Update fields
        const fields = ['title', 'description', 'date', 'location', 'capacity', 'price', 'image'];
        fields.forEach((field) => {
            if (req.body[field] !== undefined) {
                event[field] = req.body[field];
            }
        });

        // If capacity changed, adjust available seats proportionally
        if (req.body.capacity !== undefined) {
            const bookedSeats = event.capacity - event.availableSeats;
            event.availableSeats = Math.max(0, req.body.capacity - bookedSeats);
            event.capacity = req.body.capacity;
        }

        const updatedEvent = await event.save();
        res.json(updatedEvent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete an event (admin only)
// @route   DELETE /api/events/:id
const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        await event.deleteOne();
        res.json({ message: 'Event removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getEvents, getEvent, createEvent, updateEvent, deleteEvent };
