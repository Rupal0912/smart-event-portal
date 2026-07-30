// ===== Auth Helpers & Navbar Rendering =====

/**
 * Get the current user from localStorage
 */
function getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

/**
 * Check if current user is logged in
 */
function isLoggedIn() {
    return !!localStorage.getItem('token');
}

/**
 * Check if current user is admin
 */
function isAdmin() {
    const user = getUser();
    return user && user.role === 'admin';
}

/**
 * Save user data and token after login/register
 */
function saveAuth(data) {
    localStorage.setItem('token', data.token);
    localStorage.setItem(
        'user',
        JSON.stringify({
            _id: data._id,
            name: data.name,
            email: data.email,
            role: data.role,
        })
    );
}

/**
 * Logout — clear storage and redirect
 */
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

/**
 * Render the navigation bar based on auth state.
 * Call this on every page load.
 */
function renderNavbar() {
    const nav = document.getElementById('navbar-links');
    if (!nav) return;

    const user = getUser();
    const loggedIn = isLoggedIn();

    let links = `<a href="index.html">Events</a>`;

    if (loggedIn) {
        links += `<a href="bookings.html">My Bookings</a>`;
        if (user && user.role === 'admin') {
            links += `<a href="admin.html">Admin Panel</a>`;
        }
        links += `
      <span style="color: var(--text-muted); font-size: 0.8rem; padding: 0 0.5rem;">
        Hi, ${user ? user.name : 'User'}
      </span>
      <a href="#" class="btn-sm btn-logout" onclick="logout(); return false;">Logout</a>
    `;
    } else {
        links += `
      <a href="login.html">Login</a>
      <a href="register.html" class="btn-sm">Sign Up</a>
    `;
    }

    nav.innerHTML = links;
}

/**
 * Require authentication — redirect to login if not logged in
 */
function requireAuth() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

/**
 * Require admin role — redirect if not admin
 */
function requireAdmin() {
    if (!requireAuth()) return false;
    if (!isAdmin()) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// Render navbar on DOMContentLoaded
document.addEventListener('DOMContentLoaded', renderNavbar);
