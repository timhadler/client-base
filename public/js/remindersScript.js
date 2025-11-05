// Test clients
let testClients = [
    {
        id: 1,
        name: "Alice Johnson",
        phone: "021 154 2211",
        email: "alice.johnson@acme.com",
        position: "Manager",
        priority: "high",
        notes: "Is a complete legend.",
        totalReminders: "5",
        lastContact: "Oct 10, 2025",
        day: "23",
        month: "Oct",
        dateTime: "10:00 AM",
        fullDate: "Oct 23, 2025",
        status: "Pending",
        company: "Acme Corp",
        note: "Follow up about new contract",
        interactions: [
            { date: "Oct 1, 2025", type: "call", notes: "Requested follow-up next week", outcome: "followup" },
            { date: "Oct 3, 2025", type: "email", notes: "Sent contract for review", outcome: "booked" },
            { date: "Oct 5, 2025", type: "text", notes: "Left voicemail", outcome: null },
            { date: "Oct 7, 2025", type: "call", notes: "Confirmed meeting", outcome: "no_answer" },
            { date: "Oct 8, 2025", type: "email", notes: "Sent updated proposal", outcome: null }
        ]
    },
    {
        id: 2,
        name: "Bob Smith",
        phone: "022 334 5566",
        email: "bob.smith@globex.com",
        position: "Director",
        priority: "medium",
        notes: "Prefers email contact.",
        totalReminders: "3",
        lastContact: "Oct 15, 2025",
        day: "24",
        month: "Oct",
        dateTime: "11:00 AM",
        fullDate: "Oct 24, 2025",
        status: "Pending",
        company: "Globex Corp",
        note: "Send proposal follow-up",
        interactions: [
            { date: "Oct 2, 2025", type: "call", notes: "Initial discussion", outcome: "declined" },
            { date: "Oct 4, 2025", type: "email", notes: "Sent proposal", outcome: "followup" },
            { date: "Oct 6, 2025", type: "text", notes: "Left message about proposal", outcome: null }
        ]
    },
    {
        id: 3,
        name: "Charlie Davis",
        phone: "021 998 8877",
        email: "charlie.davis@initech.com",
        position: "Team Lead",
        priority: "low",
        notes: "Prefers phone calls in morning.",
        totalReminders: "2",
        lastContact: "Oct 12, 2025",
        day: "25",
        month: "Oct",
        dateTime: "9:30 AM",
        fullDate: "Oct 25, 2025",
        status: "Pending",
        company: "Initech",
        note: "Check project updates",
        interactions: [
            { date: "Oct 1, 2025", type: "email", notes: "Sent project plan", outcome: "booked" },
            { date: "Oct 2, 2025", type: "call", notes: "Client requested clarification", outcome: "followup" },
            { date: "Oct 3, 2025", type: "text", notes: "Left reminder about deadline", outcome: null },
            { date: "Oct 5, 2025", type: "call", notes: "Confirmed changes", outcome: "booked" }
        ]
    },
    {
        id: 4,
        name: "Diana Evans",
        phone: "027 445 3322",
        email: "diana.evans@umbrella.com",
        position: "CEO",
        priority: "high",
        notes: "Important client, high priority.",
        totalReminders: "7",
        lastContact: "Oct 8, 2025",
        day: "26",
        month: "Oct",
        dateTime: "2:00 PM",
        fullDate: "Oct 26, 2025",
        status: "Pending",
        company: "Umbrella Corp",
        note: "Schedule strategy meeting",
        interactions: [
            { date: "Oct 1, 2025", type: "call", notes: "Initial discussion", outcome: "followup" },
            { date: "Oct 2, 2025", type: "email", notes: "Sent strategy document", outcome: "booked" },
            { date: "Oct 3, 2025", type: "text", notes: "Follow-up on approval", outcome: "followup" },
            { date: "Oct 4, 2025", type: "call", notes: "Confirmed meeting", outcome: "booked" },
            { date: "Oct 5, 2025", type: "email", notes: "Sent meeting agenda", outcome: "followup" },
            { date: "Oct 6, 2025", type: "text", notes: "Reminder about meeting", outcome: null },
            { date: "Oct 7, 2025", type: "call", notes: "Final confirmation", outcome: "booked" }
        ]
    },
    {
        id: 5,
        name: "Ethan Brown",
        phone: "029 776 5544",
        email: "ethan.brown@stark.com",
        position: "Engineer",
        priority: "medium",
        notes: "Loves tech updates.",
        totalReminders: "4",
        lastContact: "Oct 20, 2025",
        day: "27",
        month: "Oct",
        dateTime: "3:00 PM",
        fullDate: "Oct 27, 2025",
        status: "Pending",
        company: "Stark Industries",
        note: "Follow up on new specs",
        interactions: [
            { date: "Oct 10, 2025", type: "ignored", notes: "Sent new specs", outcome: null },
            { date: "Oct 11, 2025", type: "call", notes: "Discussed adjustments", outcome: "followup" },
            { date: "Oct 12, 2025", type: "text", notes: "Left voicemail", outcome: null },
            { date: "Oct 13, 2025", type: "call", notes: "Followed up on issues", outcome: "declined" },
            { date: "Oct 14, 2025", type: "email", notes: "Sent updated specs", outcome: "booked" }
        ]
    }
];


/*****************************************************************
 * Document Ready
 ****************************************************************/
// Selected client data for the panel and interaction modal
let currentClientData = {};

$(document).ready(function() {
    $(".tab").on('click', function() { 
        $('.tab').removeClass('active');
        this.classList.add('active');

        // Load reminder table
        queryListData($(this).data("filter")) 
    });

    // REVISIT
    // Mark as complete
    document.querySelectorAll('.btn-icon.complete').forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            const badge = row.querySelector('.status-badge');
            badge.className = 'status-badge completed';
            badge.textContent = 'Completed';
            row.dataset.status = 'completed';
        });
    });

    // Delete confirmation
    document.querySelectorAll('.btn-icon.delete').forEach(btn => {
        btn.addEventListener('click', function() {
            if (confirm('Are you sure you want to delete this reminder?')) {
                this.closest('tr').remove();
            }
        });
    });

    // Initialize features
    initClientPanel();
    initInteractionModal();

    //loadList(0, testClients);
    queryListData("all"); 
});

/*****************************************************************
 * AJAX Functions
 ****************************************************************/
const LIMIT = 10;
// AJAX Retrieve data for selected reminder list
function queryListData(filter, offset=0) {
    $.ajax({
        url: "reminders/load-reminder-list",
        method: "GET",
        data: { filter:filter, limit:LIMIT, offset:offset },
        success: function(res) {
            const data = JSON.parse(res);
            loadList(data.listCounts, data.listData, offset);
        },
        error: function(xhr, status, error) {
            // Handle AJAX error
            console.log('AJAX Error while fetching list with filter: ' +  filter +  ' reminder list:', error, xhr, status);
        }
  });
}

// Loads data into reminders table
function loadList(counts, clients, offset=0) {
    let $table = $('#tableBody');

    // Add list counts if > 0
    let overdueCount = counts.overdue;
    let todayCount = counts.today;
    
    overdueCount ? $("#overdueCount").text('(' + overdueCount + ')') : '';
    todayCount ? $("#todayCount").text('(' + todayCount + ')') : '';

    if (offset === 0) {
        $table.empty(); // Clear the list only for the initial load
    }

    //Data reminders[x]: clients.id, name, mobile, rDate, flag, reminders.id AS rId, reminders.status
    $.get("html/reminderTableRow.html", function(template) {
        clients.forEach(function(client) {
            // Create jQuery object from the template string
            let $row = $(template);

            // Convert date to local time
            const localDate = new Date(client.date);

            // --- Create formatted parts ---
            const day = localDate.getDate(); // e.g., 23
            const month = localDate.toLocaleString('en-US', { month: 'short' }); // e.g., "Oct"
            const fullDate = localDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }); // e.g., "Oct 23, 2025"

            // Fill in the data
            $row.find('.date-day').text(day);   //23
            $row.find('.date-month').text(month); //Oct
            $row.find('.date-full').text(fullDate); //Oct 23, 2025
            $row.find('.status-badge').text(client.status);

            $row.find('.client-name').text(client.name);
            $row.find('.client-company').text(client.company);
            $row.find('.reminder-note').text(client.note);  // Keep this, reason for the reminder

            // Attach client ID
            $row.attr('data-client-id', client.id);

            // Attach click listener
            $row.on('click', function() {
                currentClientData = client;
                openClientPanel(currentClientData);
            });

            // Append to the table
            $table.append($row);
        });
    });
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

function openClientPanel(data) {
    // LOAD large data (client notes, interaction history) on panel open
    // Update panel content
    document.getElementById('panelClientName').textContent = data.name;
    document.getElementById('panelClientCompany').textContent = data.company;
    document.getElementById('panelEmail').textContent = data.email;
    document.getElementById('panelEmail').href = `mailto:${data.email}`;
    document.getElementById('panelPhone').textContent = data.phone;
    document.getElementById('panelPhone').href = `tel:${data.phone}`;
    document.getElementById('panelPosition').textContent = data.position;
    document.getElementById('panelNotes').textContent = data.notes;
    
    // Update quick action links
    document.getElementById('callBtn').href = `tel:${data.phone}`;
    document.getElementById('emailBtn').href = `mailto:${data.email}`;
    document.getElementById('viewFullBtn').href = `/clients/${data.id}`;

    // Interaction history HTML
    const interactions = Array.isArray(data.interactions) ? data.interactions : [];
    const interactionHistoryHtml = interactions.map(interaction => {
        const iconClass = getInteractionIconClass(interaction.method);
        const outcomeClass = getInteractionOutcomeClass(interaction.outcome);
        const outcomeIcon = getInteractionOutcomeIcon(interaction.method, interaction.outcome);
        
        return `
            <div class="interaction-item">
                <div class="interaction-icon ${iconClass}">${getInteractionEmoji(interaction.method)}</div>
                <div class="interaction-content">
                    <div class="interaction-header">
                        <span class="interaction-type">${capitalizeFirst(interaction.method)}</span>
                        <span class="interaction-date">${interaction.date}</span>
                    </div>
                    <div class="interaction-outcome ${outcomeClass}">${outcomeIcon} ${getInteractionNote(interaction)}</div>
                </div>
            </div>
        `;
    }).join('');
            
    document.getElementById('panelInteractionHistory').innerHTML = interactionHistoryHtml || '<p style="color: var(--gray-500); font-size: 14px; text-align: center; padding: 20px;">No interaction history yet</p>';
    
    // Update badges
    let badgesHtml = ``;
    if (data.clientStatus & data.priority) {
        badgesHtml = `
            <span class="status-badge ${data.clientStatus.toLowerCase()}"> ${data.clientStatus.charAt(0).toUpperCase() + data.clientStatus.slice(1).toLowerCase()} </span>
            ${data.priority ? `
                <span class="priority-badge ${data.priority.toLowerCase()}"> ${getPriorityIcon(data.priority)} ${data.priority.charAt(0).toUpperCase() + data.priority.slice(1).toLowerCase()} Priority </span>
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

// Mark complete button in panel
// document.getElementById('markCompleteBtn').addEventListener('click', function() {
//     if (confirm('Mark this reminder as complete?')) {
//         // Find the active row and mark it complete
//         const activeRow = document.querySelector(`[data-client-id="${currentClientData.id}"]`);
//         if (activeRow) {
//             const badge = activeRow.querySelector('.status-badge');
//             badge.className = 'status-badge completed';
//             badge.textContent = 'Completed';
//             activeRow.dataset.status = 'completed';
//         }
//         closeClientPanel();
//     }
// });

/*****************************************************************
 * Interaction modal
 ****************************************************************/
function initInteractionModal() {
    let selectedMethod = null;
    let selectedOutcome = null;

    // --- Open Modal ---
    $('#markCompleteBtn').on('click', function() {
        $('#interactionReminderId').val(currentClientData.id);
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
            $('#summaryGroup, #newReminderGroup, #newReminderFields').hide();
            $('#submitInteraction').prop('disabled', true);
        } else {
            $('#outcomeGroup').hide();
            generateSummary();
            $('#summaryGroup').show();
            $('#newReminderGroup, #newReminderFields').hide();
            if (['text', 'email', 'ignored'].includes(selectedMethod)) {
                $('#newReminderGroup').show();
                if (selectedMethod !== 'ignored') {
                    $('#createNewReminder').prop('checked', true);
                    setDefaultReminderNote(selectedMethod);
                    showNewReminder(true);
                }
            } else {
                $('#newReminderGroup, #newReminderFields').hide();
                $('#createNewReminder').prop('checked', false);
            }
            $('#submitInteraction').prop('disabled', false);
        }
    });

    // --- Outcome Selection ---
    $('.option-btn[data-outcome]').on('click', function() {
        $('.option-btn[data-outcome]').removeClass('selected');
        $(this).addClass('selected');

        selectedOutcome = $(this).data('outcome');
        $('#outcome').val(selectedOutcome);

        generateSummary();
        setDefaultReminderNote(selectedOutcome);
        $('#summaryGroup').show();

        if (['booked', 'followup', 'declined', 'noanswer'].includes(selectedOutcome)) {
            $('#newReminderGroup').show();
            if (selectedOutcome === 'followup') {
                $('#createNewReminder').prop('checked', true);
                showNewReminder(true);
            }
        } else {
            $('#newReminderGroup, #newReminderFields').hide();
            $('#createNewReminder').prop('checked', false);
        }

        $('#submitInteraction').prop('disabled', false);
    });

    // --- New Reminder Toggle ---
    $('#createNewReminder').on('change', function() {
        showNewReminder(this.checked);
    });

    // --- Form Submission ---
    $('#interactionForm').on('submit', function(e) {
        e.preventDefault();

        const formData = {
            reminderId: $('#interactionReminderId').val(),
            clientName: currentClientName,
            contactMethod: selectedMethod,
            outcome: selectedOutcome,
            interactionSummary: $('#interactionSummary').text(),
            createNewReminder: $('#createNewReminder').prop('checked'),
            newReminderDate: $('#newReminderDate').val(),
            newReminderNote: $('#newReminderNote').val()
        };

        console.log('Interaction recorded:', formData);
        alert(
            'Interaction saved!\n\nClient: ' + currentClientName +
            '\nMethod: ' + selectedMethod +
            '\nOutcome: ' + (selectedOutcome || 'N/A') +
            '\n\nCheck console for full data.'
        );

        closeModal();
        closePanel();
    });

    // --- Helper Functions (scoped inside for access to selected variables) ---

    function showNewReminder(show) {
        const $fields = $('#newReminderFields');
        const $dateInput = $('#newReminderDate');

        if (show) {
            $fields.show();

            // Default to tomorrow 9AM
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(9, 0, 0, 0);
            const dateTimeStr = tomorrow.toISOString().slice(0, 16);
            $dateInput.val(dateTimeStr);
        } else {
            $fields.hide();
        }
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
            else if (selectedOutcome === 'noanswer') summary = `Called client on ${dateStr} - No answer`;
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

    function setDefaultReminderNote(reason) {
        let defaultNote;

        switch (reason) {
            // From selected outcome
            case 'booked':
                defaultNote = 'Requested appointment reminder';
                break;
            case 'followup': 
                defaultNote = 'Requested a follow-up';
                break;
            case 'declined': 
                defaultNote = 'Follow up after decline';
                break;
            case 'noanswer':
                defaultNote = 'Follow up after missed call';
                break
            
            // From selected method
            case 'text':
                defaultNote = 'Follow up after text';
                break;
            case 'email':
                defaultNote = 'Follow up after email';
                break;
            default:
                defaultNote = '';
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
        $('#outcomeGroup, #summaryGroup, #newReminderGroup, #newReminderFields').hide();
        $('#submitInteraction').prop('disabled', true);
    }
}