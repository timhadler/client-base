/*****************************************************************
 * Nav Bar
 ****************************************************************/

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

/***********************************************************
 * User Menu functionality
 ***********************************************************/
function initUserMenu() {
    const userMenuTrigger = document.getElementById('userMenuTrigger');
    const userDropdown = document.getElementById('userDropdown');

    if (!userMenuTrigger || !userDropdown) return;

    // Toggle dropdown
    userMenuTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        userMenuTrigger.classList.toggle('active');
        userDropdown.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!userMenuTrigger.contains(e.target) && !userDropdown.contains(e.target)) {
            userMenuTrigger.classList.remove('active');
            userDropdown.classList.remove('show');
        }
    });

    // Close dropdown when clicking menu items
    document.querySelectorAll('.dropdown-item:not(.logout)').forEach(item => {
        item.addEventListener('click', () => {
            userMenuTrigger.classList.remove('active');
            userDropdown.classList.remove('show');
        });
    });
}

// Initialize user menu when DOM is ready
document.addEventListener('DOMContentLoaded', initUserMenu);
