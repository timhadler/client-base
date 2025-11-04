/*****************************************************************
 * Client Detail Page
 * Uses jQuery and AJAX to fetch and display all client data
 ****************************************************************/

//const clientId = window.clientId;
let clientId;
let clientData = null;
let reminderData = {}; // Store reminder data for editing

/*****************************************************************
 * Document Ready
 ****************************************************************/
$(document).ready(function() {
    clientId = document.getElementById('client-data').dataset.clientId;

    // Load all data
    loadClientData();
    loadReminders();
    loadActivityHistory();
    //loadEngagementStats();
    
    // Modal handlers
    initEditReminderModal();
});

/*****************************************************************
 * Load Main Client Data
 ****************************************************************/
function loadClientData() {
    $.ajax({
        url: `/clients/${clientId}/data`,
        //url: `/clients/load-client-data`,
        method: 'GET',
        success: function(response) {
            const data = typeof response === 'string' ? JSON.parse(response) : response;
            clientData = data.client;
            renderClientHeader(clientData);
            renderClientInfo(clientData);
            renderAddress(clientData);
        },
        error: function(xhr, status, error) {
            console.error('Error loading client data:', error);
            $('#clientName').text('Error loading client');
            alert('Failed to load client data. Please refresh the page.');
        }
    });
}

/*****************************************************************
 * Render Client Header
 ****************************************************************/
function renderClientHeader(client) {
    // Set avatar initials
    const initials = client.name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('')
        .substring(0, 2);
    $('#clientAvatar').text(initials);
    
    // Set name and breadcrumb
    $('#clientName').text(client.name);
    $('#breadcrumbName').text(client.name);
    
    // Set company
    $('#clientCompany').text(client.company || 'No company');
    
    // Build meta items
    let metaHtml = `
        <div class="cd-meta-item">
            📧 <strong>${escapeHtml(client.email)}</strong>
        </div>
    `;
    
    if (client.phone) {
        metaHtml += `
            <div class="cd-meta-item">
                📱 <strong>${escapeHtml(client.phone)}</strong>
            </div>
        `;
    }
    
    if (client.position) {
        metaHtml += `
            <div class="cd-meta-item">
                💼 ${escapeHtml(client.position)}
            </div>
        `;
    }
    
    $('#clientMeta').html(metaHtml);
    
    // Build badges
    const statusClass = (client.status || 'active').toLowerCase();
    let badgesHtml = `
        <span class="cd-status-badge ${statusClass}">
            ${capitalizeFirst(client.status || 'Active')}
        </span>
    `;
    
    if (client.priority) {
        const priorityClass = client.priority.toLowerCase();
        badgesHtml += `
            <span class="cd-priority-badge ${priorityClass}">
                ${capitalizeFirst(client.priority)} Priority
            </span>
        `;
    }
    
    $('#clientBadges').html(badgesHtml);
    
    // Update action buttons
    $('#editBtn').attr('href', `/clients/${client.id}/edit`);
    $('#addReminderBtn').attr('href', `/reminders/new?client=${client.id}`);
    $('#viewAllRemindersLink').attr('href', `/reminders?client=${client.id}`);
}

/*****************************************************************
 * Render Client Information
 ****************************************************************/
function renderClientInfo(client) {
    // Format dates
    const createdDate = new Date(client.createdAt);
    const clientSince = formatLongDate(createdDate);
    
    let lastContact = 'No contact recorded';
    let lastContactClass = 'cd-not-provided';
    if (client.lastContact) {
        const lastContactDate = new Date(client.lastContact);
        lastContact = formatLongDate(lastContactDate);
        lastContactClass = '';
    }
    
    const html = `
        <div class="cd-info-item">
            <div class="cd-info-label">Email</div>
            <div class="cd-info-value">
                <a href="mailto:${escapeHtml(client.email)}">${escapeHtml(client.email)}</a>
            </div>
        </div>
        
        <div class="cd-info-item">
            <div class="cd-info-label">Phone</div>
            <div class="cd-info-value ${client.phone ? '' : 'cd-not-provided'}">
                ${client.phone ? `<a href="tel:${escapeHtml(client.phone)}">${escapeHtml(client.phone)}</a>` : 'Not provided'}
            </div>
        </div>
        
        <div class="cd-info-item">
            <div class="cd-info-label">Company</div>
            <div class="cd-info-value ${client.company ? '' : 'cd-not-provided'}">
                ${escapeHtml(client.company || 'Not provided')}
            </div>
        </div>
        
        <div class="cd-info-item">
            <div class="cd-info-label">Position</div>
            <div class="cd-info-value ${client.position ? '' : 'cd-not-provided'}">
                ${escapeHtml(client.position || 'Not provided')}
            </div>
        </div>
        
        <div class="cd-info-item">
            <div class="cd-info-label">Client Since</div>
            <div class="cd-info-value">${clientSince}</div>
        </div>
        
        <div class="cd-info-item">
            <div class="cd-info-label">Last Contact</div>
            <div class="cd-info-value ${lastContactClass}">${lastContact}</div>
        </div>
        
        <div class="cd-info-item">
            <div class="cd-info-label">Source</div>
            <div class="cd-info-value ${client.source ? '' : 'cd-not-provided'}">
                ${escapeHtml(capitalizeFirst(client.source) || 'Not provided')}
            </div>
        </div>
    `;
    
    $('#clientInfo').html(html);
    
    // Render notes if they exist
    if (client.notes) {
        $('#notesText').text(client.notes);
        $('#notesSection').show();
    }
}

/*****************************************************************
 * Render Address
 ****************************************************************/
function renderAddress(client) {
    const $display = $('#addressDisplay');

    const street = client.street;
    const city = client.city;
    const state = client.state;
    const country = client.country;
    const postcode = client.postcode;
    
    // Check if address exists
    const hasAddress = street || city || 
                       state || postcode || 
                       country;
    
    if (!hasAddress) {
        $display.html('<div class="cd-no-address">No address on file</div>');
        return;
    }
    
    // Build address lines
    let addressLines = [];
    if (street) addressLines.push(street);
    if (city || client.addressState || postcode) {
        let line = [];
        if (city) line.push(city);
        if (state) line.push(state);
        if (postcode) line.push(postcode);
        addressLines.push(line.join(' '));
    }
    if (country) addressLines.push(country);
    
    // Build Google Maps query
    const mapQuery = encodeURIComponent(addressLines.join(', '));
    
    // Render address with actions
    const html = `
        <div class="cd-address-content" id="addressContent">
            ${addressLines.map(line => `<span class="cd-address-line">${escapeHtml(line)}</span>`).join('')}
        </div>
        <div class="cd-address-actions">
            <a href="https://maps.google.com/?q=${mapQuery}" 
               target="_blank" 
               class="cd-address-btn">
                🗺️ Open in Maps
            </a>
            <button class="cd-address-btn" id="copyAddressBtn">
                📋 Copy
            </button>
        </div>
    `;
    
    $display.html(html);
    
    // Add copy handler
    $('#copyAddressBtn').on('click', copyAddress);
}

/*****************************************************************
 * Copy Address to Clipboard
 ****************************************************************/
function copyAddress() {
    const addressText = $('#addressContent').text().trim();
    
    navigator.clipboard.writeText(addressText).then(() => {
        const $btn = $('#copyAddressBtn');
        const originalHtml = $btn.html();
        
        $btn.html('✓ Copied').addClass('cd-copied');
        
        setTimeout(() => {
            $btn.html(originalHtml).removeClass('cd-copied');
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy address:', err);
        alert('Failed to copy address');
    });
}

/*****************************************************************
 * Load Reminders
 ****************************************************************/
function loadReminders() {
    $.ajax({
        url: `/clients/${clientId}/reminders`,
        method: 'GET',
        data: {
            limit: 5
        },
        success: function(response) {
            const data = typeof response === 'string' ? JSON.parse(response) : response;
            renderReminders(data.reminders || []);
        },
        error: function(xhr, status, error) {
            console.error('Error loading reminders:', error);
            $('#remindersList').html(`
                <div class="cd-empty-reminders">
                    <div class="cd-empty-icon">📅</div>
                    <div class="cd-empty-text">Unable to load reminders</div>
                </div>
            `);
        }
    });
}

/*****************************************************************
 * Render Reminders
 ****************************************************************/
function renderReminders(reminders) {
    const $list = $('#remindersList');
    
    if (reminders.length === 0) {
        $list.html(`
            <div class="cd-empty-reminders">
                <div class="cd-empty-icon">📅</div>
                <div class="cd-empty-text">No upcoming reminders</div>
            </div>
        `);
        return;
    }
    
    $list.empty();
    
    reminders.forEach(function(reminder) {
        // Store reminder data for editing
        reminderData[reminder.id] = {
            date: reminder.date,
            note: reminder.note
        };
        
        const row = createReminderRow(reminder);
        $list.append(row);
    });
}

/*****************************************************************
 * Create Reminder Row HTML
 ****************************************************************/
function createReminderRow(reminder) {
    const date = new Date(reminder.date);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    
    // Determine status (overdue, today, upcoming)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reminderDate = new Date(reminder.date);
    reminderDate.setHours(0, 0, 0, 0);
    
    let statusClass, statusText;
    if (reminderDate < today) {
        statusClass = 'overdue';
        statusText = 'Overdue';
    } else if (reminderDate.getTime() === today.getTime()) {
        statusClass = 'today';
        statusText = 'Today';
    } else {
        statusClass = 'upcoming';
        const daysUntil = Math.ceil((reminderDate - today) / (1000 * 60 * 60 * 24));
        statusText = `${daysUntil} day${daysUntil !== 1 ? 's' : ''}`;
    }

    let importantText = '';
    if (reminder.important) {
        importantText = 'Urgent';
    }
    
    return `
        <div class="cd-reminder-item ${statusClass}" data-reminder-id="${reminder.id}">
            <div class="cd-reminder-date">
                <div class="cd-reminder-date-day">${day}</div>
                <div class="cd-reminder-date-month">${month}</div>
            </div>
            <div class="cd-reminder-content">
                <div class="cd-reminder-text">${escapeHtml(reminder.note || 'Reminder')}</div>
                <div class="cd-reminder-time" style="color: red;">${importantText}</div>
            </div>
            <div class="cd-reminder-actions-group">
                <div class="cd-reminder-status ${statusClass}">${statusText}</div>
                <button data-id="${reminder.id}" class="cd-btn-icon-sm cd-edit-reminder-btn" title="Edit">✏️</button>
            </div>
        </div>
    `;
}

/*****************************************************************
 * Edit Reminder Modal Functions
 ****************************************************************/
function initEditReminderModal() {
    // Close modal handlers
    $('#closeEditReminderModal, #cancelEditReminder').on('click', function() {
        $('#editReminderModal').removeClass('show');
    });

    // Open modal handler
    $('#remindersList').on('click', '.cd-edit-reminder-btn', function() {
        const reminderId = $(this).data('id');
        editReminder(reminderId);
    });

    // Form submission
    $('#editReminderForm').on('submit', function(e) {
        e.preventDefault();
        saveReminderEdit();
    });
}

// Global function for onclick
function editReminder(reminderId) {
    const data = reminderData[reminderId];
    if (!data) {
        alert('Reminder data not found');
        return;
    }

    // Convert date to local date string (YYYY-MM-DD)
    const dateObj = new Date(data.date);
    const pad = n => n.toString().padStart(2, '0');
    const year = dateObj.getFullYear();
    const month = pad(dateObj.getMonth() + 1); // months are 0-indexed
    const day = pad(dateObj.getDate());
    const dateLocal = `${year}-${month}-${day}`;

    $('#editReminderId').val(reminderId);
    $('#editReminderDate').val(dateLocal); // make sure input type="date"
    $('#editReminderNote').val(data.note);
    $('#editReminderModal').addClass('show');
}



function saveReminderEdit() {
    const reminderId = $('#editReminderId').val();
    const date = $('#editReminderDate').val();
    const note = $('#editReminderNote').val();
    
    $.ajax({
        url: `/reminders/${reminderId}/update`,
        method: 'POST',
        data: JSON.stringify({
            date: new Date(date).toISOString(),
            note: note
        }),
        contentType: 'application/json',
        success: function(response) {
            console.log('Reminder updated successfully');
            $('#editReminderModal').removeClass('show');
            
            // Reload reminders to show updated data
            loadReminders();
        },
        error: function(xhr, status, error) {
            console.error('Error updating reminder:', error);
            alert('Failed to update reminder. Please try again.');
        }
    });
}

/*****************************************************************
 * Load Activity/Interaction History
 ****************************************************************/
function loadActivityHistory() {
    $.ajax({
        url: `/clients/${clientId}/activity`,
        method: 'GET',
        data: {
            limit: 10
        },
        success: function(response) {
            const data = typeof response === 'string' ? JSON.parse(response) : response;
            renderInteraction(data.interactions || []);
        },
        error: function(xhr, status, error) {
            console.error('Error loading interaction:', error);
            $('#activityList').html(`
                <div class="cd-empty-activity">
                    <div class="cd-empty-icon">📋</div>
                    <div class="cd-empty-text">Unable to load interaction history</div>
                </div>
            `);
        }
    });
}

/*****************************************************************
 * Render Interaction History
 ****************************************************************/
function renderInteraction(interactions) {
    const $list = $('#activityList');
    
    if (interactions.length === 0) {
        $list.html(`
            <div class="cd-empty-activity">
                <div class="cd-empty-icon">📋</div>
                <div class="cd-empty-text">No interaction history yet</div>
            </div>
        `);
        return;
    }
    
    $list.empty();
    
    interactions.forEach(function(interaction) {
        const row = createInteractionRow(interaction); // Replace activity row
        $list.append(row);
    });
}

/*****************************************************************
 * Create Interaction Row HTML (replaces activity row)
 ****************************************************************/
function createInteractionRow(interaction) {
    let date = new Date(interaction.date);
    date = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    const iconClass = getInteractionIconClass(interaction.method);
    const outcomeClass = getInteractionOutcomeClass(interaction.outcome);
    const outcomeIcon = getInteractionOutcomeIcon(interaction.method, interaction.outcome);

    return `
        <div class="interaction-item">
            <div class="interaction-icon ${iconClass}">${getInteractionEmoji(interaction.method)}</div>
            <div class="interaction-content">
                <div class="interaction-header">
                    <span class="interaction-type">${capitalizeFirst(interaction.method)}</span>
                    <span class="interaction-date">${date}</span>
                </div>
                <div class="interaction-outcome ${outcomeClass}">${outcomeIcon} ${getInteractionNote(interaction)}</div>
            </div>
        </div>
    `;
}

/*****************************************************************
 * Create Activity Row HTML -- Keep in case i want to add activity history instead of just interaction history
 ****************************************************************/
// function createActivityRow(activity) {
//     const { icon, color } = getActivityIconAndColor(activity.type);
//     const timestamp = formatActivityTime(activity.createdAt);
    
//     return `
//         <div class="cd-activity-item">
//             <div class="cd-activity-icon ${color}">${icon}</div>
//             <div class="cd-activity-content">
//                 <div class="cd-activity-text">${escapeHtml(activity.description)}</div>
//                 <div class="cd-activity-time">${timestamp}</div>
//             </div>
//         </div>
//     `;
// }

/*****************************************************************
 * Get Activity Icon and Color
 ****************************************************************/
// function getActivityIconAndColor(type) {
//     const types = {
//         'reminder_completed': { icon: '✓', color: 'blue' },
//         'reminder_created': { icon: '📅', color: 'orange' },
//         'reminder_updated': { icon: '✏️', color: 'blue' },
//         'client_updated': { icon: '📝', color: 'teal' },
//         'client_created': { icon: '➕', color: 'teal' },
//         'note_added': { icon: '📝', color: 'blue' },
//         'status_changed': { icon: '🔄', color: 'teal' }
//     };
    
//     return types[type] || { icon: '•', color: 'blue' };
// }

/*****************************************************************
 * Load Engagement Stats
 ****************************************************************/
function loadEngagementStats() {
    $.ajax({
        url: `/clients/${clientId}/stats`,
        method: 'GET',
        success: function(response) {
            const data = typeof response === 'string' ? JSON.parse(response) : response;
            renderStats(data.stats || {});
        },
        error: function(xhr, status, error) {
            console.error('Error loading stats:', error);
            renderStats({});
        }
    });
}

/*****************************************************************
 * Render Engagement Stats
 ****************************************************************/
function renderStats(stats) {
    const html = `
        <div class="cd-info-item">
            <div class="cd-info-label">Total Reminders</div>
            <div class="cd-info-value" style="font-size: 24px; font-weight: 700; color: var(--primary-blue);">
                ${stats.totalReminders || 0}
            </div>
        </div>
        
        <div class="cd-info-item">
            <div class="cd-info-label">Completed</div>
            <div class="cd-info-value" style="font-size: 24px; font-weight: 700; color: var(--accent-green);">
                ${stats.completedReminders || 0}
            </div>
        </div>
        
        <div class="cd-info-item">
            <div class="cd-info-label">Upcoming</div>
            <div class="cd-info-value" style="font-size: 24px; font-weight: 700; color: var(--accent-teal);">
                ${stats.upcomingReminders || 0}
            </div>
        </div>
        
        <div class="cd-info-item">
            <div class="cd-info-label">Response Rate</div>
            <div class="cd-info-value" style="font-size: 24px; font-weight: 700; color: var(--accent-orange);">
                ${stats.responseRate || 0}%
            </div>
        </div>
    `;
    
    $('#statsGrid').html(html);
}

/*****************************************************************
 * Helper Functions
 ****************************************************************/
function formatLongDate(date) {
    if (!date || isNaN(date.getTime())) return 'N/A';
    
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function formatActivityTime(dateStr) {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    
    const options = { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    };
    
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