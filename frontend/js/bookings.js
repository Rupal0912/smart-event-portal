// ===== My Bookings Page =====

document.addEventListener('DOMContentLoaded', async () => {
    if (!requireAuth()) return;

    const container = document.getElementById('bookings-container');

    try {
        const bookings = await api('/api/bookings/my');

        if (bookings.length === 0) {
            container.innerHTML = `
        <div class="empty-state">
          <div class="icon">🎫</div>
          <h3>No bookings yet</h3>
          <p>Browse events and book your first ticket!</p>
          <a href="index.html" class="btn btn-primary" style="margin-top: 1rem;">Browse Events</a>
        </div>
      `;
            return;
        }

        container.innerHTML = bookings.map(booking => `
      <div class="booking-card">
        <div class="booking-card-icon">🎫</div>
        <div class="booking-card-info">
          <h3>${booking.event ? booking.event.title : 'Event Unavailable'}</h3>
          <p>
            ${booking.event ? `📍 ${booking.event.location} &nbsp;•&nbsp; 📅 ${formatDate(booking.event.date)}` : ''}
          </p>
          <p style="margin-top: 0.25rem;">Booked on: ${formatDate(booking.bookedAt)}</p>
        </div>
        <div class="booking-card-meta">
          <div class="price">${formatPrice(booking.totalPrice)}</div>
          <div class="tickets">${booking.tickets} ticket${booking.tickets > 1 ? 's' : ''}</div>
        </div>
      </div>
    `).join('');
    } catch (err) {
        container.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
    }
});
