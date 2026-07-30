const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint (for Kubernetes probes)
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));

// Start server only if not in test mode
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
    connectDB().then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    });
}

module.exports = app;
