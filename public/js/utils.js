/*****************************************************************
 * Edit Reminder Modal Functions
 ****************************************************************/
function initEditReminderModal(listSelector) {
    // Close modal handlers
    $('#closeEditReminderModal, #cancelEditReminder').on('click', function() {
        $('#editReminderModal').removeClass('show');
    });

    // Open modal handler
    $(listSelector).on('click', '.cd-edit-reminder-btn', function(e) {
        e.preventDefault();
        const reminderData = { id:$(this).data('id'), note: $(this).data('note'), date: $(this).data('date')};
        editReminder(reminderData);
    });
}

// Global function for onclick
function editReminder(data) {
    if (!data) {
        alert('Reminder data not found');
        return;
    }
    // Convert date to local date string (YYYY-MM-DD)
    const date = new Date(data.date);
    const pad = n => n.toString().padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1); // months are 0-indexed
    const day = pad(date.getDate());
    const dateLocal = `${year}-${month}-${day}`;

    $('#editReminderId').val(data.id);
    $('#editReminderDate').val(dateLocal);
    $('#editReminderNote').val(data.note);
    $('#editReminderImportant').val(data.important);
    $('#editReminderModal').addClass('show');
}

function saveReminderEdit(onSuccess, onError) {
    const reminderId = $('#editReminderId').val();
    const date = $('#editReminderDate').val();
    const note = $('#editReminderNote').val();
    const important = $('#editReminderImportant').is(":checked");

    $.ajax({
        url: `/reminders/${reminderId}/edit`,
        method: 'POST',
        data: JSON.stringify({
            date: date,
            note: note, 
            important: important
        }),
        contentType: 'application/json',
        success: function(res) {
            if (onSuccess) onSuccess(res); // call the page-specific callback
        },
        error: function(err) {
            if (onError) onError(err);
        },
    });
}

/*****************************************************************
 * Interaction Icons & Classes
 ****************************************************************/
function getInteractionIconClass(method) {
    const classes = {
        'call': 'call',
        'email': 'email',
        'text': 'text',
        'ignored': 'ignored'
    };
    return classes[method] || 'call';
}

function getInteractionEmoji(method) {
    const emojis = {
        'call': '📞',
        'email': '✉️',
        'text': '💬',
        'ignored': '⊘'
    };
    return emojis[method] || '📞';
}

function getInteractionOutcomeClass(outcome) {
    if (outcome === 'booked') return 'success';
    if (outcome === 'followup') return 'followup';
    if (outcome === 'no_answer' || outcome === 'waiting') return 'missed';
    if (outcome === 'declined') return 'declined';
    return 'success';
}

function getInteractionOutcomeIcon(method, outcome) {
    if (outcome === 'booked') return '✓';
    if (outcome === 'followup') return '↻';
    if (method === "ignored") return '⊘';
    if (outcome === 'no_answer' || outcome === 'waiting') return '○';
    if (outcome === 'declined') return '✕';
    return '✓';
}

function getInteractionNote(interaction) {
    const method = interaction.method;
    const outcome = interaction.outcome;
    
    // Handle ignore type
    if (method === 'ignored') {
        return 'Reminder ignored';
    }
    
    // Handle call type
    if (method === 'call') {
        if (outcome === 'booked') {
            return 'Appointment booked';
        } else if (outcome === 'followup') {
            return 'Requested followup';
        } else if (outcome === 'no_answer' || outcome === 'waiting') {
            return 'No answer';
        } else if (outcome === 'declined') {
            return 'Declined appointment';
        }
    }
    
    // Handle text or email type
    if (method === 'text' || method === 'email') {
        if (outcome === 'waiting' || outcome === 'no_answer') {
            return 'Sent - awaiting response';
        } else if (outcome === 'booked') {
            return 'Replied - Appointment booked';
        } else if (outcome === 'declined') {
            return 'Replied - Declined appointment';
        } else if (outcome === 'followup') {
            return 'Replied - Requested followup';
        }
    }
    
    return interaction.notes || 'No details';
}

/*****************************************************************
 * Helpers
 ****************************************************************/
function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}