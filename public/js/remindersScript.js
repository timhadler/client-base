/*****************************************************************
 * Document Ready
 ****************************************************************/
let currentClientData = {id:"", email:"", phone:""};    // Selected client email/phone data for the copy feature and interaction form submit
let currentReminderId = 0;      // For interaction modal
let currentReminderCount = 0;
let currentTab = "all";         // For default tab

const LIMIT = 10;
let currentOffset = 0;
let totalReminders = 0;
let hasMoreReminders = false;

$(document).ready(function() {
    $(".tab").on('click', function() { 
        $('.tab').removeClass('active');
        this.classList.add('active');

        // Load reminder table
        currentTab = $(this).data("filter");
        currentOffset = 0; // Reset offset when changing tabs
        queryListData(currentTab);
    });

    // Edit reminder form submit
    $('#reminderForm').on('submit', function(e) {
        e.preventDefault();
        saveReminderEdit(function(res) {
            $('#reminderModal').removeClass('show');
            currentOffset = 0; // Reset offset after edit
            queryListData("all"); // reload the list on this page
        }, function(err) {
            console.error('Error updating reminder:', err);
            alert('Failed to save reminder');
        });
    });

    // Initialize features
    initClientPanel();
    initInteractionModal();
    initLoadMoreButton();

    // In utils.js
    initEditReminderModal('#tableBody');
    initDeleteModal();

    // Retrieve the initial list
    queryListData(currentTab);
});

/*****************************************************************
 * AJAX Functions
 ****************************************************************/
// AJAX Retrieve data for selected reminder list
function queryListData(filter, offset=0) {
    $.ajax({
        url: "reminders/load-reminder-list",
        method: "GET",
        data: { filter:filter, limit:LIMIT, offset:offset },
        success: function(res) {
            const data = JSON.parse(res);

            // Update pagination state
            if (offset === 0) {
                totalReminders = data.total || 0; // Backend should return total count
                currentOffset = 0;
            }

            loadList(data.listCounts, data.listData, offset);
            updatePaginationUI(offset, data.listData.length);
        },
        error: function(xhr, status, error) {
            // Handle AJAX error
            console.log('AJAX Error while fetching list with filter: ' +  filter +  ' reminder list:', xhr, status);
        }
  });
}

// Loads full client details
async function fetchClientDetails(id) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `clients/${id}/data`,
            method: "GET",
            success: function(res) {
                const data = typeof res === 'string' ? JSON.parse(res) : res;
                resolve(data.client);
            },
            error: function(xhr, status, error) {
                // Handle AJAX error
                console.log('AJAX Error while client details for client ' +  id, xhr, status);
                reject(error);
            }
        });
    });
}

// Loads client interactions details
async function fetchClientInteractions(id) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `clients/${id}/activity`,
            method: "GET",
            data: { limit:LIMIT },
            success: function(res) {
                const data = typeof res === 'string' ? JSON.parse(res) : res;
                resolve(data.interactions || []);
            },
            error: function(xhr, status, error) {
                // Handle AJAX error
                console.log('AJAX Error while client interactions for client ' +  id, xhr, status);
                reject(error);
            }
        });
    })
}

// Loads data into reminders table
function loadList(counts, reminders, offset=0) {
    let $table = $('#tableBody');

    // Add list counts if > 0
    const overdueCount = counts.overdue;
    const todayCount = counts.today;
    const initialCount = counts.initial;
    const followUpCount = counts.followUp;

    const overdueCountText = overdueCount ? '(' + overdueCount + ')' : '';
    const todayCountText = todayCount ? '(' + todayCount + ')' : '';
    const initialCountText = initialCount ? '(' + initialCount + ')' : '';
    const followUpCountText = followUpCount ? '(' + followUpCount + ')' : '';

    $("#overdueCount").text(overdueCountText);
    $("#todayCount").text(todayCountText);
    $("#initialCount").text(initialCountText);
    $("#followUpCount").text(followUpCountText);


    if (offset === 0) {
        $table.empty(); // Clear the list only for the initial load
        currentOffset = 0; 
    }

    $.get("html/reminderTableRow.html", function(template) {
        reminders.forEach(function(reminder) {
            // Create jQuery object from the template string
            let $row = $(template);

            // Format dates
            const localDate = new Date(reminder.date);
            const day = localDate.getDate(); // e.g., 23
            const month = localDate.toLocaleString('en-US', { month: 'short' }); // e.g., "Oct"
            const fullDate = localDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }); // "Oct 23, 2025"

            // Fill in the data
            $row.find('.date-day').text(day);           //23
            $row.find('.date-month').text(month);       //Oct
            $row.find('.date-full').text(fullDate);     //Oct 23, 2025
            $row.find('.status-badge').text(reminder.status);

            $row.find('.client-name').text(reminder.name);
            $row.find('.client-company').text(reminder.company);
            $row.find('.reminder-note').text(reminder.note); 

            // Attach reminder
            $row.find('.cd-edit-reminder-btn').data('id', reminder.id).data('note', reminder.note).data('date', reminder.date);

            // Attach click listener for reminder row
            $row.on('click', function(e) {
                if (!$(e.target).closest('.cd-edit-reminder-btn').length) {     // Avoid edit reminder button
                    currentReminderId = reminder.id;
                    currentReminderCount = reminder.reminderCount;
                    openClientPanel(reminder.clientId);
                }
            });

            // Delete button listener
            $row.find('.delete-reminder-btn').on('click', function(e) {
                e.stopPropagation(); // Prevent row click event
                const reminderId = $(this).closest('tr').find('.cd-edit-reminder-btn').data('id');
                const clientName = $(this).closest('tr').find('.client-name').text();
                
                // Show delete modal with success and error callbacks
                showDeleteModal(
                    'reminder', 
                    reminderId, 
                    clientName,
                    // Success callback - reload reminders list
                    function(response) {
                        console.log('Reminder deleted successfully');
                        queryListData(currentTab);
                    },
                    // Error callback - handle deletion error
                    function(xhr, status, error) {
                        console.error('Failed to delete reminder:', error);
                        alert('Failed to delete reminder. Please try again.');
                    }
                );
            });

            // Append to the table
            $table.append($row);
        });
    });
}

// Initialize load more button
function initLoadMoreButton() {
    $('#loadMoreBtn').on('click', function() {
        const $btn = $(this);
        const originalText = $btn.text();
        
        // Disable button and show loading state
        $btn.prop('disabled', true).text('Loading...');
        
        // Increment offset and load more
        currentOffset += LIMIT;
        
        $.ajax({
            url: "reminders/load-reminder-list",
            method: "GET",
            data: { filter: currentTab, limit: LIMIT, offset: currentOffset },
            success: function(res) {
                const data = JSON.parse(res);
                loadList(data.listCounts, data.listData, currentOffset);
                updatePaginationUI(currentOffset, data.listData.length);
                
                // Re-enable button
                $btn.prop('disabled', false).text(originalText);
            },
            error: function(xhr, status, error) {
                console.log('AJAX Error while loading more reminders:', xhr, status);
                $btn.prop('disabled', false).text(originalText);
                alert('Failed to load more reminders. Please try again.');
            }
        });
    });
}

// Update pagination UI
function updatePaginationUI(offset, loadedCount) {
    const currentlyShowing = offset + loadedCount;
    
    // Update showing count
    $('#showingCount').text(currentlyShowing);
    $('#totalCount').text(totalReminders);
    
    // Show/hide Load More button
    if (currentlyShowing < totalReminders) {
        $('#loadMoreBtn').show();
        hasMoreReminders = true;
    } else {
        $('#loadMoreBtn').hide();
        hasMoreReminders = false;
    }
}

/*****************************************************************
 * Client Panel
 ****************************************************************/
function initClientPanel() {
    // Copy to clipboard buttons
    $("#copyEmailBtn").on('click', function(event) { copyToClipboard(event, "email") }),
    $("#copyPhoneBtn").on('click', function(event) { copyToClipboard(event, "phone") }),

    // Close panel events
    $("#panelClose").on("click", closeClientPanel);
    $("#panelOverlay").on("click", closeClientPanel);

    // Escape key to close
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeClientPanel();
        }
    });
};

// Opens client panel when reminder is clicked
// Lads large client details on panel open
async function openClientPanel(clientId) {
    const client = await fetchClientDetails(clientId);
    const interactions = await fetchClientInteractions(clientId);

    // Update data for email/number copy feature
    currentClientData = {id:clientId, email:client.email, phone:client.phone};

    // Update panel content
    document.getElementById('panelClientName').textContent = client.name;
    document.getElementById('panelClientCompany').textContent = client.company;
    document.getElementById('panelEmail').textContent = client.email;
    document.getElementById('panelEmail').href = `mailto:${client.email}`;
    document.getElementById('panelPhone').textContent = client.phone;
    document.getElementById('panelPhone').href = `tel:${client.phone}`;
    document.getElementById('panelPosition').textContent = client.position;
    document.getElementById('panelNotes').textContent = client.notes;
    
    // Update quick action links
    document.getElementById('callBtn').href = `tel:${client.phone}`;
    document.getElementById('emailBtn').href = `mailto:${client.email}`;
    document.getElementById('viewFullBtn').href = `/clients/${client.id}`;

    // Interaction history HTML
    const interactionHistoryHtml = interactions.map(interaction => {
        const iconClass = getInteractionIconClass(interaction.method);
        const outcomeClass = getInteractionOutcomeClass(interaction.outcome);
        const outcomeIcon = getInteractionOutcomeIcon(interaction.method, interaction.outcome);

        // Format date
        let date = new Date(interaction.date);
        date = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
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
    }).join('');
            
    document.getElementById('panelInteractionHistory').innerHTML = interactionHistoryHtml || '<p style="color: var(--gray-500); font-size: 14px; text-align: center; padding: 20px;">No interaction history yet</p>';

    // Update badges
    let badgesHtml = ``;
    if (client.status && client.priority) {
        badgesHtml = `
            <span class="status-badge ${client.status.toLowerCase()}"> ${client.status.charAt(0).toUpperCase() + client.status.slice(1).toLowerCase()} </span>
            ${client.priority ? `
                <span class="priority-badge ${client.priority.toLowerCase()}"> ${getPriorityIcon(client.priority)} ${client.priority.charAt(0).toUpperCase() + client.priority.slice(1).toLowerCase()} Priority </span>
            ` : ''}
        `;
    }

    document.getElementById('panelBadges').innerHTML = badgesHtml;
    
    // Show panel and overlay
    document.getElementById('clientPanel').classList.add('open');
    document.getElementById('panelOverlay').classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeClientPanel() {
    document.getElementById('clientPanel').classList.remove('open');
    document.getElementById('panelOverlay').classList.remove('show');
    document.body.style.overflow = '';
}

function getPriorityIcon(priority) {
    const icons = {
        high: '🔴',
        medium: '🟡',
        low: '🟢'
    };
    return icons[priority] || '';
}

// Copy to clipboard function
function copyToClipboard(event, type) {
    let text = '';
    let button = event.target;
    
    if (type === 'email') {
        text = currentClientData.email;
    } else if (type === 'phone') {
        text = currentClientData.phone;
    }
    
    navigator.clipboard.writeText(text).then(() => {
        button.textContent = '✓ Copied';
        button.classList.add('copied');
        
        setTimeout(() => {
            button.textContent = 'Copy';
            button.classList.remove('copied');
        }, 2000);
    });
}

/*****************************************************************
 * Interaction modal
 ****************************************************************/
function initInteractionModal() {
    let selectedMethod = null;
    let selectedOutcome = null;

    const newReminderText = "Schedule a follow-up reminder";
    const nextCycleText = "End this follow-up cycle and schedule a reminder for their next appointment";

    // --- Open Modal ---
    $('#markCompleteBtn').on('click', function() {
        $('#interactionReminderId').val(currentReminderId);
        resetInteractionForm();
        $('#interactionModal').addClass('show');
    });

    // --- Close Modal ---
    $('#closeInteractionModal, #cancelInteraction').on('click', closeModal);

    // --- Contact Method Selection ---
    $('.option-btn[data-method]').on('click', function() {
        $('.option-btn[data-method]').removeClass('selected');
        $(this).addClass('selected');

        selectedMethod = $(this).data('method');
        $('#contactMethod').val(selectedMethod);

        // Reset outcome
        selectedOutcome = null;
        $('#outcome').val('');
        $('.option-btn[data-outcome]').removeClass('selected');

        if (selectedMethod === 'call') {
            $('#outcomeGroup').show();
            $('#summaryGroup, #reminderOptionsGroup, #newReminderFields').hide();
            $('#submitInteraction').prop('disabled', true);
        } else {
            $('#outcomeGroup').hide();
            generateSummary();
            $('#summaryGroup').show();
            
            showReminderOptions(selectedMethod, null);
            $('#submitInteraction').prop('disabled', false);
        }
    });

    // --- Outcome Selection ---
    $('.option-btn[data-outcome]').on('click', function() {
        $('.option-btn[data-outcome]').removeClass('selected');
        $(this).addClass('selected');

        selectedOutcome = $(this).data('outcome');
        $('#outcome').val(selectedOutcome);

        generateSummary();  // Remove this later

        $('#summaryGroup').show();

        showReminderOptions(selectedMethod, selectedOutcome);

        $('#submitInteraction').prop('disabled', false);
    });

    // --- Checkbox Changes (Mutually Exclusive) ---
    $('#createNewReminder').on('change', function() {
        if (this.checked) {
            $('#moveToNextCycle').prop('checked', false);
            $('#reminderDescription').text(newReminderText);
            $('#reminderDescription').show();
            showNewReminder(true);
        } else {
            $('#reminderDescription').hide();
            showNewReminder(false);
        }
    });

    $('#moveToNextCycle').on('change', function() {
        if (this.checked) {
            $('#createNewReminder').prop('checked', false);
            $('#reminderDescription').text(nextCycleText);
            $('#reminderDescription').show();
            showNewReminder(true);
        } else {
            $('#reminderDescription').hide();
            showNewReminder(false);
        }
    });

    // --- Form Submission ---
    $('#interactionForm').on('submit', function(e) {
        e.preventDefault();

        const formData = {  
            reminderId: currentReminderId,
            reminderCount: currentReminderCount,
            clientId: currentClientData.id,
            method: selectedMethod,
            outcome: selectedOutcome,
            //interactionSummary: $('#interactionSummary').text(),
            createNewReminder: $('#createNewReminder').prop('checked'),
            moveToNextCycle: $('#moveToNextCycle').prop('checked'),
            newReminderDate: $('#newReminderDate').val(),
            newReminderNote: $('#newReminderNote').val()
        };
        $.ajax({
            url: "/interactions",
            method: "POST",
            data: formData,
            success: function(res) {
                queryListData(currentTab);
            },
            error: function(xhr, status, error) {
                // Handle AJAX error
                console.log('AJAX Error while creating interaction', xhr, status);
            }
        })

        closeModal();
        closeClientPanel();
    });

    // --- Helper Functions ---

    function showNewReminder(show) {
        const $fields = $('#newReminderFields');
        const $dateInput = $('#newReminderDate');

        if (show) {
            $fields.show();

            // Set default note
            setDefaultReminderNote();

            // Set default date
            // Default to 3 days from today - will set based on user settings later
            const defaultDate = new Date();
            defaultDate.setDate(defaultDate.getDate() + 3);

            // Format date to yyyy-mm-dd for html
            const year = defaultDate.getFullYear();
            const month = String(defaultDate.getMonth() + 1).padStart(2, '0'); // months are 0-based
            const day = String(defaultDate.getDate()).padStart(2, '0');

            const dateTimeStr = `${year}-${month}-${day}`;
            $dateInput.val(dateTimeStr);
        } else {
            $fields.hide();
        }
    }

    function showReminderOptions(method, outcome) {
        // Hide everything first
        $('#reminderOptionsGroup').hide();
        $('#newReminderWrapper').hide();
        $('#nextCycleWrapper').hide();
        $('#reminderDescription').hide();
        $('#newReminderFields').hide();
        resetReminderCheckboxes();

        // For call outcomes
        if (method === 'call' && outcome) {
            $('#reminderOptionsGroup').show();
            
            if (outcome === 'booked' || outcome === 'declined') {
                // Only show "Move to Next Cycle"
                $('#nextCycleWrapper').show();
                $('#moveToNextCycle').prop('checked', true);
                $('#reminderDescription').text(nextCycleText);
                $('#reminderDescription').show();
                showNewReminder(true);
            } else if (outcome === 'followup') {
                // Only show "Create New Reminder"
                $('#newReminderWrapper').show();
                $('#createNewReminder').prop('checked', true);
                $('#reminderDescription').text(newReminderText);
                $('#reminderDescription').show();
                showNewReminder(true);
            } else if (outcome === 'no_answer') {
                // Show both options
                $('#newReminderWrapper').show();
                $('#nextCycleWrapper').show();
                $('#createNewReminder').prop('checked', true);
                $('#reminderDescription').text(newReminderText);
                $('#reminderDescription').show();
                showNewReminder(true);
            }
        }
        // For text, email
        else if (['text', 'email'].includes(method)) {
            $('#reminderOptionsGroup').show();
            $('#newReminderWrapper').show();
            $('#nextCycleWrapper').show();
            
            $('#createNewReminder').prop('checked', true);
            $('#reminderDescription').text(newReminderText);
            $('#reminderDescription').show();
            showNewReminder(true);
        
        // For ignored
        } else if (method === 'ignored') {
            $('#reminderOptionsGroup').show();
            $('#nextCycleWrapper').show();
        }
    }

    function resetReminderCheckboxes() {
        $('#createNewReminder').prop('checked', false);
        $('#moveToNextCycle').prop('checked', false);
        $('#reminderDescription').hide();
    }

    function generateSummary() {
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });

        let summary = '';

        if (selectedMethod === 'call') {
            if (selectedOutcome === 'booked') summary = `Called client on ${dateStr} - Appointment booked`;
            else if (selectedOutcome === 'followup') summary = `Called client on ${dateStr} - Requested a follow-up`;
            else if (selectedOutcome === 'no_answer') summary = `Called client on ${dateStr} - No answer`;
            else if (selectedOutcome === 'declined') summary = `Called client on ${dateStr} - Declined service`;
        } else if (selectedMethod === 'text') {
            summary = `Texted client on ${dateStr}`;
        } else if (selectedMethod === 'email') {
            summary = `Emailed client on ${dateStr}`;
        } else if (selectedMethod === 'ignore') {
            summary = `Reminder ignored on ${dateStr}`;
        }

        $('#interactionSummary').text(summary);
    }

    function setDefaultReminderNote() {
        const followUp = $('#createNewReminder').prop('checked');
        const moveToNextCylce = $('#moveToNextCycle').prop('checked');

        let defaultNote;

        if (moveToNextCylce) {
            defaultNote = "Initial appointment attempt";
        } else if (followUp) {
            const notes = {
                call: {
                    followup: "Requested a follow-up",
                    no_answer: "Follow-up after missed call"
                },
                email: "Follow-up after email",
                text: "Follow-up after text"
            };

            defaultNote =
                typeof notes[selectedMethod] === "string"
                    ? notes[selectedMethod]
                    : notes[selectedMethod]?.[selectedOutcome];
        }

        $('#newReminderNote').val(defaultNote);
    }

    function closeModal() {
        $('#interactionModal').removeClass('show');
        setTimeout(() => resetInteractionForm(), 300);
    }

    function resetInteractionForm() {
        selectedMethod = null;
        selectedOutcome = null;
        $('#interactionForm')[0].reset();
        $('.option-btn').removeClass('selected');
        $('#outcomeGroup, #summaryGroup, #reminderOptionsGroup, #newReminderFields').hide();
        $('#newReminderWrapper, #nextCycleWrapper, #reminderDescription').hide();
        resetReminderCheckboxes();
        $('#submitInteraction').prop('disabled', true);
    }
}