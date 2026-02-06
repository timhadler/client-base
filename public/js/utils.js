/*****************************************************************
 * Edit Reminder Modal Functions
 ****************************************************************/
function initEditReminderModal(listSelector) {
    // Close modal handlers
    $('#closeReminderModal, #cancelReminder').on('click', function() {
        $('#reminderModal').removeClass('show');
    });

    // Open modal handler
    $(listSelector).on('click', '.cd-edit-reminder-btn', function(e) {
        e.preventDefault();
        const reminderData = { id:$(this).data('id'), note: $(this).data('note'), date: $(this).data('date')};
        editReminder(reminderData);
    });
}

// Global function for onclick
function addReminder(data) {
    if (!data) {
        alert('Client data not found');
        return;
    }

    // Set title and mode
    $('#reminderModalTitle').text('Add Reminder for ' + data.name);
    $('#reminderModal').attr('data-mode', 'add'); 

    $('#editReminderNote').val('Initial contact attempt');
    $('#rModalClientId').val(data.id);
    $('#reminderModal').addClass('show');
}

// Global function for onclick
function editReminder(data) {
    if (!data) {
        alert('Reminder data not found');
        return;
    }

    // Set title and mode
    $('#reminderModalTitle').text('Edit Reminder');
    $('#reminderModal').attr('data-mode', 'edit'); 

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
    $('#reminderModal').addClass('show');
}

// Reminder modal functions
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

function saveNewReminder(onSuccess, onError) {
    const date = $('#editReminderDate').val();
    const note = $('#editReminderNote').val();
    const important = $('#editReminderImportant').is(":checked");
    const clientId = $('#rModalClientId').val();

    $.ajax({
        url: `/reminders/add`,
        method: 'POST',
        data: JSON.stringify({
            date: date,
            note: note, 
            important: important, 
            clientId: clientId
        }),
        contentType: 'application/json',
        success: function(res) {
            if (onSuccess) onSuccess(res);
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
 * Delete Modal Functions
 ****************************************************************/
let deleteModalData = {
    type: null,      // 'reminder' or 'client'
    id: null,
    name: null,
    successCallback: null,
    errorCallback: null
};

function initDeleteModal() {
    // Close modal events
    $('#deleteCancelBtn, #successDoneBtn').on('click', closeDeleteModal);
    
    // Overlay click to close
    $('#deleteModal').on('click', function(e) {
        if (e.target.id === 'deleteModal') {
            closeDeleteModal();
        }
    });
    
    // Escape key to close
    $(document).on('keydown', function(e) {
        if (e.key === 'Escape' && $('#deleteModal').hasClass('show')) {
            closeDeleteModal();
        }
    });
    
    // Confirm delete button
    $('#confirmDeleteBtn').on('click', confirmDelete);
}

function showDeleteModal(type, id, name, successCallback, errorCallback) {
    deleteModalData = { 
        type, 
        id, 
        name,
        successCallback: successCallback || null,
        errorCallback: errorCallback || null
    };
    
    const $modal = $('#deleteModal');
    const $icon = $('#modalIcon');
    const $title = $('#deleteTitle');
    const $message = $('#deleteMessage');
    const $warning = $('#deleteWarning');
    const $confirmBtnText = $('#confirmBtnText');
    
    // Reset to delete content
    $('#deleteContent').show();
    $('#deleteSuccess').removeClass('show');
    $('#confirmDeleteBtn').prop('disabled', false);
    
    if (type === 'reminder') {
        $icon.text('📅');
        $title.text('Delete Reminder?');
        $message.html('Are you sure you want to delete this reminder? <strong>This action cannot be undone.</strong>');
        $warning.hide();
        $confirmBtnText.text('Delete Reminder');
    } else if (type === 'client') {
        $icon.text('👤');
        $title.text('Delete Client?');
        $message.html(`Are you sure you want to delete <strong>${name}</strong>? <strong>This action cannot be undone.</strong>`);
        $warning.show();
        $confirmBtnText.text('Delete Client');
    }
    
    $modal.addClass('show');
}

function closeDeleteModal() {
    $('#deleteModal').removeClass('show');
    deleteModalData = { 
        type: null, 
        id: null, 
        name: null,
        successCallback: null,
        errorCallback: null
    };
}

// Confirm delete and make AJAX request
function confirmDelete() {
    const $confirmBtn = $('#confirmDeleteBtn');
    const $confirmBtnIcon = $('#confirmBtnIcon');
    const $confirmBtnText = $('#confirmBtnText');
    
    $confirmBtn.prop('disabled', true);
    $confirmBtnIcon.text('⏳');
    $confirmBtnText.text('Deleting...');

    // Determine the delete endpoint
    let deleteUrl = '';
    if (deleteModalData.type === 'reminder') {
        deleteUrl = `/reminders/${deleteModalData.id}`;
    } else if (deleteModalData.type === 'client') {
        deleteUrl = `/clients/${deleteModalData.id}`;
    }

    $.ajax({
        url: deleteUrl,
        method: 'DELETE',
        success: function(response) {
            showSuccessMessage();
            
            // Call the success callback after showing success message
            const callback = deleteModalData.successCallback;
            setTimeout(() => {
                if (callback && typeof callback === 'function') {
                    callback(response);
                }
            }, 2000);
        },
        error: function(xhr, status, error) {    
            // Call the error callback if provided
            if (deleteModalData.errorCallback && typeof deleteModalData.errorCallback === 'function') {
                deleteModalData.errorCallback(xhr, status, error);
            } else {
                // Default error handling
                alert(xhr.responseJSON?.error ?? 'Failed to delete reminder');
            }
            
            // Reset button state
            $confirmBtn.prop('disabled', false);
            $confirmBtnIcon.text('🗑️');
            $confirmBtnText.text(deleteModalData.type === 'reminder' ? 'Delete Reminder' : 'Delete Client');
        }
    });
}

// Show success message
function showSuccessMessage() {
    const $successMessage = $('#successMessage');
    
    if (deleteModalData.type === 'reminder') {
        $successMessage.text('The reminder has been permanently deleted.');
    } else if (deleteModalData.type === 'client') {
        $successMessage.text('The client and all associated reminders have been permanently deleted.');
    }
    
    $('#deleteContent').hide();
    $('#deleteSuccess').addClass('show');
    
    // Auto-close after 2 seconds
    setTimeout(() => {
        closeDeleteModal();
    }, 2000);
}

/*****************************************************************
 * Helpers
 ****************************************************************/
function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}