// ===== Home Page — Fetch & Render Event Cards =====

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('events-container');

    try {
        const events = await api('/api/events');

        if (events.length === 0) {
            container.innerHTML = `
        <div class="empty-state">
          <div class="icon">📅</div>
          <h3>No upcoming events</h3>
          <p>Check back later for new events!</p>
        </div>
      `;
            return;
        }

        container.innerHTML = events.map(event => `
      <a href="event.html?id=${event._id}" class="card" style="text-decoration:none; color:inherit;">
        ${event.image
                ? `<img src="${event.image}" alt="${event.title}" class="card-image" />`
                : `<div class="card-image-placeholder">🎉</div>`
            }
        <div class="card-body">
          <h3 class="card-title">${event.title}</h3>
          <p class="card-text">${event.description.substring(0, 100)}${event.description.length > 100 ? '...' : ''}</p>
          <div class="card-meta">
            <span>📍 ${event.location}</span>
            <span>📅 ${formatDate(event.date)}</span>
          </div>
        </div>
        <div class="card-footer">
          <span class="price-tag ${event.price === 0 ? 'price-free' : ''}">${formatPrice(event.price)}</span>
          <span class="badge ${event.availableSeats > 0 ? 'badge-success' : 'badge-danger'}">
            ${event.availableSeats > 0 ? `${event.availableSeats} seats left` : 'Sold Out'}
          </span>
        </div>
      </a>
    `).join('');
    } catch (err) {
        container.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
    }
});
