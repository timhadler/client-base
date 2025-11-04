// ***** Interaction Icons & Classes *****
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

// ***** Helpers *****
function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}