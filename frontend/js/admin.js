// ===== Admin Panel — Event CRUD =====

document.addEventListener('DOMContentLoaded', () => {
    if (!requireAdmin()) return;
    loadEvents();
});

// Load all events into the table
async function loadEvents() {
    const tbody = document.getElementById('events-tbody');

    try {
        const events = await api('/api/events');

        if (events.length === 0) {
            tbody.innerHTML = `
        <tr><td colspan="6">
          <div class="empty-state" style="padding: 2rem;">
            <p>No events found. Create your first event!</p>
          </div>
        </td></tr>
      `;
            return;
        }

        tbody.innerHTML = events.map(event => `
      <tr>
        <td><strong>${event.title}</strong></td>
        <td>${formatDate(event.date)}</td>
        <td>${event.location}</td>
        <td>${formatPrice(event.price)}</td>
        <td>${event.availableSeats} / ${event.capacity}</td>
        <td>
          <div class="admin-actions">
            <button class="btn btn-secondary btn-sm" onclick="editEvent('${event._id}')">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deleteEvent('${event._id}')">Delete</button>
          </div>
        </td>
      </tr>
    `).join('');
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="6"><div class="alert alert-error">${err.message}</div></td></tr>`;
    }
}

// Open modal for adding new event
function openModal() {
    document.getElementById('modal-title').textContent = 'Add Event';
    document.getElementById('submit-btn').textContent = 'Create Event';
    document.getElementById('event-form').reset();
    document.getElementById('event-id').value = '';
    document.getElementById('event-modal').style.display = 'flex';
}

// Close modal
function closeModal() {
    document.getElementById('event-modal').style.display = 'none';
}

// Open modal for editing an existing event
async function editEvent(id) {
    try {
        const event = await api(`/api/events/${id}`);

        document.getElementById('modal-title').textContent = 'Edit Event';
        document.getElementById('submit-btn').textContent = 'Update Event';
        document.getElementById('event-id').value = event._id;
        document.getElementById('title').value = event.title;
        document.getElementById('description').value = event.description;
        document.getElementById('location').value = event.location;
        document.getElementById('capacity').value = event.capacity;
        document.getElementById('price').value = event.price;
        document.getElementById('image').value = event.image || '';

        // Format date for datetime-local input
        const d = new Date(event.date);
        const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        document.getElementById('date').value = iso;

        document.getElementById('event-modal').style.display = 'flex';
    } catch (err) {
        showAlert('alert-container', err.message);
    }
}

// Delete event
async function deleteEvent(id) {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
        await api(`/api/events/${id}`, { method: 'DELETE' });
        showAlert('alert-container', 'Event deleted successfully', 'success');
        loadEvents();
    } catch (err) {
        showAlert('alert-container', err.message);
    }
}

// Form submission — create or update
document.getElementById('event-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('submit-btn');
    const id = document.getElementById('event-id').value;
    const isEdit = !!id;

    btn.disabled = true;
    btn.textContent = isEdit ? 'Updating...' : 'Creating...';

    const body = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        date: document.getElementById('date').value,
        location: document.getElementById('location').value,
        capacity: parseInt(document.getElementById('capacity').value),
        price: parseInt(document.getElementById('price').value),
        image: document.getElementById('image').value,
    };

    try {
        if (isEdit) {
            await api(`/api/events/${id}`, { method: 'PUT', body: JSON.stringify(body) });
            showAlert('alert-container', 'Event updated successfully', 'success');
        } else {
            await api('/api/events', { method: 'POST', body: JSON.stringify(body) });
            showAlert('alert-container', 'Event created successfully', 'success');
        }
        closeModal();
        loadEvents();
    } catch (err) {
        showAlert('alert-container', err.message);
    } finally {
        btn.disabled = false;
        btn.textContent = isEdit ? 'Update Event' : 'Create Event';
    }
});

// Close modal on overlay click
document.getElementById('event-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
});
