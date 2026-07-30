// ===== API Configuration & Fetch Wrapper =====

const API_BASE = 'http://localhost:5000';

/**
 * Centralized fetch wrapper that auto-attaches JWT token
 * and handles JSON parsing / error responses.
 */
async function api(endpoint, options = {}) {
    const token = localStorage.getItem('token');

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
    }

    return data;
}

/**
 * Show an alert message in a container element
 */
function showAlert(containerId, message, type = 'error') {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    // Auto-clear after 5 seconds
    setTimeout(() => {
        container.innerHTML = '';
    }, 5000);
}

/**
 * Format a date string into a readable format
 */
function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Format price
 */
function formatPrice(price) {
    if (price === 0) return 'Free';
    return `₹${price.toLocaleString()}`;
}
