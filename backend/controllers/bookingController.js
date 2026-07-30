const Booking = require('../models/Booking');
const Event = require('../models/Event');

// @desc    Book tickets for an event
// @route   POST /api/bookings
const createBooking = async (req, res) => {
    try {
        const { eventId, tickets } = req.body;
        const ticketCount = tickets || 1;

        // Find the event
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check seat availability
        if (event.availableSeats < ticketCount) {
            return res.status(400).json({ message: 'Not enough seats available' });
        }

        // Create booking
        const booking = await Booking.create({
            user: req.user._id,
            event: event._id,
            tickets: ticketCount,
            totalPrice: event.price * ticketCount,
        });

        // Decrement available seats
        event.availableSeats -= ticketCount;
        await event.save();

        // Populate event details before returning
        await booking.populate('event', 'title date location');

        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get logged-in user's bookings
// @route   GET /api/bookings/my
const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate('event', 'title date location price image')
            .sort({ bookedAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createBooking, getMyBookings };
