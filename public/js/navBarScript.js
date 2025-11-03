// Call this function on each page
function setActiveNav() {
    const path = window.location.pathname;
    document.querySelectorAll('.nav-links a').forEach(link => {
        // Remove any existing 'active' class
        link.classList.remove('active');

        // Add 'active' class if href matches the current path
        if (link.getAttribute('href') === path) {
            link.classList.add('active');
        }
    });
}

// Run automatically when the DOM is ready
document.addEventListener('DOMContentLoaded', setActiveNav);
