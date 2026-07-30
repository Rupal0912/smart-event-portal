const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Event title is required'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Event description is required'],
        },
        date: {
            type: Date,
            required: [true, 'Event date is required'],
        },
        location: {
            type: String,
            required: [true, 'Event location is required'],
        },
        capacity: {
            type: Number,
            required: [true, 'Capacity is required'],
            min: 1,
        },
        availableSeats: {
            type: Number,
            required: true,
            min: 0,
        },
        price: {
            type: Number,
            required: true,
            default: 0,
        },
        image: {
            type: String,
            default: '',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
