/*****************************************************************
 * Clients Page JavaScript
 * Uses jQuery and AJAX to fetch and display client data
 ****************************************************************/

const LIMIT = 10; // Clients per page
let currentPage = 1;
let totalClients = 0;
let currentFilters = {
    search: '',
    status: '',
    priority: ''
};

/*****************************************************************
 * Document Ready
 ****************************************************************/
$(document).ready(function() {
    // Initialize page
    loadClients();
    initDeleteModal();  // utils.js
    
    // Search functionality with debounce
    let searchTimeout;
    $('#searchInput').on('input', function() {
        clearTimeout(searchTimeout);
        const searchTerm = $(this).val();
        
        searchTimeout = setTimeout(() => {
            currentFilters.search = searchTerm;
            currentPage = 1;
            loadClients();
        }, 300);
    });
    
    // Filter functionality
    $('#statusFilter').on('change', function() {
        currentFilters.status = $(this).val();
        currentPage = 1;
        loadClients();
    });
    
    $('#priorityFilter').on('change', function() {
        currentFilters.priority = $(this).val();
        currentPage = 1;
        loadClients();
    });
    
    // Delete button event delegation
    $(document).on('click', '.btn-icon.delete', function(e) {
        e.preventDefault();
        handleDeleteClient($(this));
    });
});

/*****************************************************************
 * AJAX Function to Load Clients
 ****************************************************************/
function loadClients() {
    const offset = (currentPage - 1) * LIMIT;
    
    $.ajax({
        url: '/clients/load-client-list',
        method: 'GET',
        data: {
            limit: LIMIT,
            offset: offset,
            search: currentFilters.search,
            status: currentFilters.status,
            priority: currentFilters.priority
        },
        beforeSend: function() {
            // Show loading state
            $('#clientsTableBody').html(`
                <tr>
                    <td colspan="7" style="text-align: center; padding: 40px; color: var(--gray-500);">
                        Loading clients...
                    </td>
                </tr>
            `);
        },
        success: function(res) {
            // Parse response if it's a string
            const data = typeof res === 'string' ? JSON.parse(res) : res;
            
            totalClients = data.nClients || 0;
            renderClientsTable(data.clientList || []);
            renderPagination();
        },
        error: function(xhr, status, error) {
            $('#clientsTableBody').html(`
                <tr>
                    <td colspan="7" style="text-align: center; padding: 40px; color: var(--accent-red);">
                        Error loading clients. Please try again.
                    </td>
                </tr>
            `);
        }
    });
}

/*****************************************************************
 * Render Clients Table
 ****************************************************************/
function renderClientsTable(clients) {
    const $tbody = $('#clientsTableBody');
    $tbody.empty();
    
    if (clients.length === 0) {
        $tbody.html(`
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px;">
                    <div class="empty-state">
                        <div class="empty-state-icon">👥</div>
                        <h3>No clients found</h3>
                        <p>Try adjusting your search or filters</p>
                    </div>
                </td>
            </tr>
        `);
        return;
    }
    
    clients.forEach(function(client) {
        const row = createClientRow(client);
        $tbody.append(row);
    });
}

/*****************************************************************
 * Create Client Row HTML
 ****************************************************************/
function createClientRow(client) {
    const statusClass = client.status ? client.status.toLowerCase() : '';
    const priorityClass = client.priority ? client.priority.toLowerCase() : '';
    const priorityIcon = getPriorityIcon(priorityClass);
    
    return `
        <tr data-client-id="${client.id}">
            <td>
                <div class="client-name">${escapeHtml(client.name)}</div>
                <div class="client-email">${escapeHtml(client.email)}</div>
            </td>
            <td>${escapeHtml(client.company || '-')}</td>
            <td>
                <span class="status-badge ${statusClass}">
                    ${capitalizeFirst(client.status || '-')}
                </span>
            </td>
            <td>
                <span class="priority-badge ${priorityClass}">
                    ${priorityIcon} ${capitalizeFirst(client.priority || '-')}
                </span>
            </td>
            <td>${formatDate(client.lastContact)}</td>
            <td>${formatDate(client.nextFollowup)}</td>
            <td>
                <div class="action-buttons">
                    <a href="/clients/${client.id}" class="btn-icon view" title="View">👁️</a>
                    <a href="/clients/${client.id}/edit" class="btn-icon edit" title="Edit">✏️</a>
                    <button class="btn-icon delete" data-client-id="${client.id}" title="Delete">🗑️</button>
                </div>
            </td>
        </tr>
    `;
}

/*****************************************************************
 * Render Pagination
 ****************************************************************/
function renderPagination() {
    const totalPages = Math.ceil(totalClients / LIMIT);
    const start = totalClients === 0 ? 0 : (currentPage - 1) * LIMIT + 1;
    const end = Math.min(currentPage * LIMIT, totalClients);
    
    // Update info text
    $('#paginationInfo').text(`Showing ${start} to ${end} of ${totalClients} clients`);
    
    // Generate pagination buttons
    const $buttons = $('#paginationButtons');
    $buttons.empty();
    
    // Previous button
    const prevDisabled = currentPage === 1 ? 'disabled' : '';
    $buttons.append(`
        <button class="pagination-btn" ${prevDisabled} data-page="${currentPage - 1}">
            Previous
        </button>
    `);
    
    // Page number buttons
    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);
    
    // Adjust start if we're near the end
    if (endPage - startPage < maxButtons - 1) {
        startPage = Math.max(1, endPage - maxButtons + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const activeClass = i === currentPage ? 'active' : '';
        $buttons.append(`
            <button class="pagination-btn ${activeClass}" data-page="${i}">
                ${i}
            </button>
        `);
    }
    
    // Next button
    const nextDisabled = currentPage === totalPages || totalPages === 0 ? 'disabled' : '';
    $buttons.append(`
        <button class="pagination-btn" ${nextDisabled} data-page="${currentPage + 1}">
            Next
        </button>
    `);
    
    // Add click handlers
    $('.pagination-btn:not(:disabled)').on('click', function() {
        const page = parseInt($(this).data('page'));
        if (page !== currentPage && page > 0 && page <= totalPages) {
            currentPage = page;
            loadClients();
        }
    });
}

/*****************************************************************
 * Delete Client Handler
 ****************************************************************/
function handleDeleteClient($button) {
    const clientId = $button.data('client-id');
    const $row = $button.closest('tr');
    const clientName = $row.find('.client-name').text();

    // Show delete modal with success and error callbacks
    showDeleteModal(
        'client', 
        clientId, 
        clientName,
        // Success callback - reload reminders list
        function(response) {
            window.location.href = '/clients';
        },
        // Error callback - handle deletion error
        function(xhr, status, error) {
            alert(xhr.responseJSON?.error ?? 'Error');
        }
    );
}

/*****************************************************************
 * Helper Functions
 ****************************************************************/
function getPriorityIcon(priority) {
    const icons = {
        high: '🔴',
        medium: '🟡',
        low: '🟢'
    };
    return icons[priority] || '';
}

function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function formatDate(dateStr) {
    if (!dateStr || dateStr === '-') return '-';
    
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '-';
    
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}