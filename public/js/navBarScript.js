function setActiveNav() {
    const path = window.location.pathname;
    document.querySelectorAll('.nav-links a').forEach(link => {
        // Remove any existing 'active' class
        link.classList.remove('active');

        // Add 'active' class if href matches the current path
        if (path.startsWith(link.getAttribute('href'))) {
            link.classList.add('active');
        }
    });
}

// Run automatically when the DOM is ready
document.addEventListener('DOMContentLoaded', setActiveNav);
