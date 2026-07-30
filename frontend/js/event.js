// ===== Event Detail Page — Fetch event + booking =====

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('event-detail');
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('id');

    if (!eventId) {
        container.innerHTML = '<div class="alert alert-error">No event ID provided.</div>';
        return;
    }

    try {
        const event = await api(`/api/events/${eventId}`);

        document.title = `${event.title} — Smart Event Portal`;

        container.innerHTML = `
      <div class="event-detail-header">
        ${event.image
                ? `<img src="${event.image}" alt="${event.title}" class="event-detail-image" />`
                : `<div class="event-detail-image-placeholder">🎉</div>`
            }
      </div>
      <div class="event-detail-body">
        <h1>${event.title}</h1>
        <p class="description">${event.description}</p>
        <div class="event-info-grid">
          <div class="event-info-item">
            <div class="label">Date & Time</div>
            <div class="value">📅 ${formatDate(event.date)}</div>
          </div>
          <div class="event-info-item">
            <div class="label">Location</div>
            <div class="value">📍 ${event.location}</div>
          </div>
          <div class="event-info-item">
            <div class="label">Price</div>
            <div class="value price-tag ${event.price === 0 ? 'price-free' : ''}">${formatPrice(event.price)}</div>
          </div>
          <div class="event-info-item">
            <div class="label">Availability</div>
            <div class="value">
              <span class="badge ${event.availableSeats > 0 ? 'badge-success' : 'badge-danger'}">
                ${event.availableSeats > 0 ? `${event.availableSeats} / ${event.capacity} seats` : 'Sold Out'}
              </span>
            </div>
          </div>
        </div>

        ${event.availableSeats > 0 ? `
          <div class="booking-section" id="booking-section">
            <div class="ticket-selector">
              <label for="ticket-count">Tickets:</label>
              <input type="number" id="ticket-count" value="1" min="1" max="${event.availableSeats}" />
              <span style="color: var(--text-muted); font-size: 0.85rem;" id="total-price">
                Total: ${formatPrice(event.price)}
              </span>
            </div>
            <button class="btn btn-primary" id="book-btn" onclick="bookTickets('${event._id}', ${event.price})">
              Book Now
            </button>
          </div>
        ` : `
          <div class="booking-section">
            <span class="badge badge-danger" style="font-size: 0.9rem; padding: 0.5rem 1rem;">
              This event is sold out
            </span>
          </div>
        `}
      </div>
    `;

        // Update total price when ticket count changes
        const ticketInput = document.getElementById('ticket-count');
        if (ticketInput) {
            ticketInput.addEventListener('input', () => {
                const count = parseInt(ticketInput.value) || 1;
                document.getElementById('total-price').textContent = `Total: ${formatPrice(event.price * count)}`;
            });
        }
    } catch (err) {
        container.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
    }
});

async function bookTickets(eventId, price) {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    const btn = document.getElementById('book-btn');
    const tickets = parseInt(document.getElementById('ticket-count').value) || 1;

    btn.disabled = true;
    btn.textContent = 'Booking...';

    try {
        await api('/api/bookings', {
            method: 'POST',
            body: JSON.stringify({ eventId, tickets }),
        });

        showAlert('alert-container', 'Booking confirmed! 🎉 Redirecting to your bookings...', 'success');

        setTimeout(() => {
            window.location.href = 'bookings.html';
        }, 1500);
    } catch (err) {
        showAlert('alert-container', err.message);
        btn.disabled = false;
        btn.textContent = 'Book Now';
    }
}
