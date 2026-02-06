/*****************************************************************
 * Client Details Page
 ****************************************************************/
// Set limits (constant for now, maybe scroll later)
const CLIENT_REMINDERS_LIMIT = 5;
const CLIENT_INTERACTION_LIMIT = 8;

// Client data
let clientId;
let clientData = null;

// Recording reminder responses
let selectedOutcome = null;
let currentReminderId = null;

$(document).ready(function() {
    clientId = document.getElementById('client-data').dataset.clientId;

    // Load all data
    loadClientData();
    loadReminders();
    loadActivityHistory();
    //loadEngagementStats();

    // Edit reminder form submit
    $('#reminderForm').on('submit', function(e) {
        const mode = $('#reminderModal').attr('data-mode');
        e.preventDefault();

        if (mode === 'edit') {
            saveReminderEdit(function(res) {
                $('#reminderModal').removeClass('show');
                loadReminders();
            }, function(err) {
                alert(err.responseJSON?.error ?? 'Failed to save reminder');
            });
        } else if (mode === 'add') {
            saveNewReminder(function(res) {
                $('#reminderModal').removeClass('show');
                loadReminders();
            }, function(err) {
                alert(err.responseJSON?.error ?? "Failed to create new reminder");
            });
        }
    });

    // Delete client button listener
    $('#confirmDeleteClientBtn').on('click', function(e) {
        const clientName = $(this).closest('tr').find('.client-name').text();

        showDeleteModal(
            'client', 
            clientId, 
            clientData.name,
            // Success callback - reload reminders list
            function(response) {
                console.log('Client deleted successfully');
                window.location.href = '/clients';
            },
            // Error callback - handle deletion error
            function(xhr, status, error) {
                alert(xhr.responseJSON?.error ?? 'Error deleting reminder');
            }
        );
    });

    // Modal handlers
    initEditReminderModal('#remindersList');    // utils.js
    initDeleteModal();  // utils.js
    initRecordResponseModal();
});

/*****************************************************************
 * Load Main Client Data
 ****************************************************************/
function loadClientData() {
    $.ajax({
        url: `/clients/${clientId}/data`,
        method: 'GET',
        success: function(response) {
            const data = typeof response === 'string' ? JSON.parse(response) : response;
            clientData = data.client;
            renderClientHeader(clientData);
            renderClientInfo(clientData);
            renderAddress(clientData);
        },
        error: function(xhr, status, error) {
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
    $('#clientCompany').text(client.company || '');
    
    // Build meta items
    let metaHtml = '';
    if (client.email) {
        metaHtml = `
            <div class="cd-meta-item">
                📧 <strong>${escapeHtml(client.email)}</strong>
            </div>
        `;
    }
    
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
    $('#addReminderBtn').on('click', function() {
        addReminder(clientData);
    })
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
            <div class="cd-info-value ${client.phone ? '' : 'cd-not-provided'}">
                ${client.email ? `<a href="mailto:${escapeHtml(client.email)}">${escapeHtml(client.email)}</a>` : 'Not provided' }
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

    const line1 = client.line1;
    const line2 = client.line2;
    const city = client.city;
    const state = client.state;
    const country = client.country;
    const postcode = client.postcode;
    
    // Check if address exists
    const hasAddress = line1 || city || 
                       state || postcode || 
                       country;
    
    if (!hasAddress) {
        $display.html('<div class="cd-no-address">No address on file</div>');
        return;
    }

    // Build address lines
    let addressLines = [];
    if (line1) addressLines.push(line1);
    if (line2) addressLines.push(line2);
    if (city || client.state || postcode) {
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

// Copy Address to Clipboard
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
            limit: CLIENT_REMINDERS_LIMIT
        },
        success: function(response) {
            const data = typeof response === 'string' ? JSON.parse(response) : response;
            renderReminders(data.reminders || []);
        },
        error: function(xhr, status, error) {
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
    } else if (reminders.length === CLIENT_REMINDERS_LIMIT) {
        // Set display limit text
        $('#remindersLimitText').text(`(Showing the next ${CLIENT_REMINDERS_LIMIT} upcoming reminders)`);
    }
    
    $list.empty();
    
    reminders.forEach(function(reminder) {    
        const row = createReminderRow(reminder);
        
        // Attach delete listener for this row
        const $row = $(row);
        $row.find('.delete-reminder-btn').on('click', function(e) {
            e.stopPropagation(); // Prevent row click event
            const reminderId = $(this).closest('.cd-reminder-item').data('reminder-id');
            const clientName = $(this).closest('.cd-reminder-item').find('.cd-reminder-text').text();
            
            showDeleteModal(
                'reminder', 
                reminderId, 
                clientName,
                // Success callback - reload reminders list
                function(response) {
                    console.log('Reminder deleted successfully');
                    loadReminders();
                },
                // Error callback - handle deletion error
                function(xhr, status, error) {
                    alert(xhr.responseJSON?.error ?? 'Error deleting reminder');
                }
            );
        });
        $list.append($row);
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
                <button data-id="${reminder.id}" data-date="${reminder.date}" data-note="${reminder.note}" class="cd-btn-icon-sm cd-edit-reminder-btn" title="Edit">✏️</button>
                <button class="btn-icon delete delete-reminder-btn" title="Delete">🗑️</button>
            </div>
        </div>
    `;
}

/*****************************************************************
 * Initialize Record Response Modal
 ****************************************************************/
function initRecordResponseModal() {
    // Close modal handlers
    $('#closeResponseModal, #cancelRecordResponse').on('click', function() {
        closeResponseModal();
    });

    // Open modal handler - delegated event for dynamically added buttons
    $('#activityList').on('click', '.cd-record-response-btn', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const $item = $(this).closest('.interaction-item');
        const reminderId = $item.data('reminder-id');
        const method = $item.find('.interaction-type').text().trim().toLowerCase();
        const desc = $item.find('.interaction-content > div:last-child').text().trim();
        const date = $item.find('.interaction-date').text().trim();
        
        openResponseModal(reminderId, method, desc, date);
    });

    // Outcome button selection
    $('#recordResponseModal').on('click', '.cd-outcome-btn', function() {
        selectOutcome(this);
    });

    // Form submission
    $('#recordResponseForm').on('submit', function(e) {
        e.preventDefault();
        saveInteractionResponse();
    });
}

/*****************************************************************
 * Open Response Modal
 ****************************************************************/
function openResponseModal(reminderId, method, description, date) {
    currentReminderId = reminderId;
    
    const icons = { 
        email: '✉️', 
        text: '💬', 
        call: '📞' 
    };
    
    const icon = icons[method] || '📋';
    const methodCapitalized = capitalizeFirst(method);
    
    $('#responseModalIcon').text(icon);
    $('#responseModalIcon').removeClass('call email text').addClass(method);
    $('#responseModalType').text(methodCapitalized);
    $('#responseModalDesc').text(description);
    $('#responseModalDate').text(date);
    
    $('#recordResponseModal').addClass('show');
}

/*****************************************************************
 * Close Response Modal
 ****************************************************************/
function closeResponseModal() {
    $('#recordResponseModal').removeClass('show');
    
    setTimeout(() => {
        // Reset form
        $('.cd-outcome-btn').removeClass('cd-selected');
        $('#responseNotesGroup').hide();
        $('#responseNotes').val('');
        $('#saveResponseBtn').prop('disabled', true);
        selectedOutcome = null;
        currentReminderId = null;
    }, 300);
}

// Select Outcome
function selectOutcome(btn) {
    $('.cd-outcome-btn').removeClass('cd-selected');
    $(btn).addClass('cd-selected');
    selectedOutcome = $(btn).data('outcome');
    
    //$('#responseNotesGroup').show();              // Removing note feature for now, route code remains for possible future use
    $('#saveResponseBtn').prop('disabled', false);
}

/*****************************************************************
 * Save Interaction Response
 ****************************************************************/
function saveInteractionResponse() {
    if (!currentReminderId || !selectedOutcome) {
        alert('Please select an outcome');
        return;
    }
    
    const notes = $('#responseNotes').val().trim();
    
    $.ajax({
        url: `/interactions/${currentReminderId}`,
        method: 'PUT',
        data: JSON.stringify({
            outcome: selectedOutcome,
            clientId: clientId,
            notes: notes
        }),
        contentType: 'application/json',
        success: function(response) {
            // Close modal and reload activity history to show updated interaction
            closeResponseModal();
            loadActivityHistory();
        },
        error: function(xhr, status, error) {
            alert(xhr.responseJSON?.error ?? 'Failed to record response');
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
            limit: CLIENT_INTERACTION_LIMIT
        },
        success: function(response) {
            const data = typeof response === 'string' ? JSON.parse(response) : response;
            renderInteraction(data.interactions || []);
        },
        error: function(xhr, status, error) {
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
    } else if (interactions.length === CLIENT_INTERACTION_LIMIT) {
        // Set display limit text
        $('#interactionLimitText').text(`(Showing the ${CLIENT_INTERACTION_LIMIT} most recent interactions)`);
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
    let date = interaction.respondedDate ? new Date(interaction.respondedDate) : new Date(interaction.completedDate);
    date = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    const iconClass = getInteractionIconClass(interaction.method);
    const outcomeClass = getInteractionOutcomeClass(interaction.outcome);
    const outcomeIcon = getInteractionOutcomeIcon(interaction.method, interaction.outcome);
    
    // Determine if this interaction is pending a response
    const isPending = interaction.outcome === 'waiting' || interaction.outcome === 'no_answer';
    const pendingClass = isPending && (interaction.method == "text" || interaction.method == "email") ? 'cd-pending-response' : '';
    
    // Get description/note for the interaction
    const interactionDesc = getInteractionNote(interaction);
    
    // Build the record response button (only show for email/text that are pending)
    let recordButton = '';
    if (isPending && (interaction.method == "text" || interaction.method == "email")) {
        recordButton = `
            <button class="cd-record-response-btn" data-interaction-id="${interaction.id}">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Record Response
            </button>
        `;
    }

    return `
        <div class="interaction-item ${pendingClass}" data-reminder-id="${interaction.id}">
            <div class="interaction-icon ${iconClass}">${getInteractionEmoji(interaction.method)}</div>
            <div class="interaction-content">
                <div class="interaction-header">
                    <span class="interaction-type">${capitalizeFirst(interaction.method)}</span>
                    <span class="interaction-date">${date}</span>
                </div>
                ${interaction.outcome ? 
                    `<div class="interaction-outcome ${outcomeClass}">${outcomeIcon} ${interactionDesc}</div>` :
                    `<div style="font-size: 13px; color: var(--gray-600);">${interactionDesc}</div>`
                }
            </div>
            ${recordButton}
        </div>
    `;
}

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