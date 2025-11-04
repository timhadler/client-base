// ***** Interaction Icons & Classes *****
function getInteractionIconClass(type) {
    const classes = {
        'call': 'call',
        'email': 'email',
        'text': 'text',
        'ignored': 'ignored'
    };
    return classes[type] || 'call';
}

function getInteractionEmoji(type) {
    const emojis = {
        'call': '📞',
        'email': '✉️',
        'text': '💬',
        'ignored': '⊘'
    };
    return emojis[type] || '📞';
}

function getInteractionOutcomeClass(outcome) {
    if (outcome === 'booked') return 'success';
    if (outcome === 'followup') return 'followup';
    if (outcome === 'no_answer' || !outcome) return 'missed';
    if (outcome === 'declined') return 'declined';
    return 'success';
}

function getInteractionOutcomeIcon(type, outcome) {
    if (outcome === 'booked') return '✓';
    if (outcome === 'followup') return '↻';
    if (type === "ignored") return '⊘';
    if (outcome === 'no_answer' || !outcome) return '○';
    if (outcome === 'declined') return '✕';
    return '✓';
}

function getInteractionNote(interaction) {
    const type = interaction.type;
    const outcome = interaction.outcome;
    
    // Handle ignore type
    if (type === 'ignored') {
        return 'Ignored reminder';
    }
    
    // Handle call type
    if (type === 'call') {
        if (outcome === 'booked') {
            return 'Appointment booked';
        } else if (outcome === 'followup') {
            return 'Requested followup';
        } else if (outcome === 'no_answer') {
            return 'No answer';
        } else if (outcome === 'declined') {
            return 'Declined appointment';
        }
    }
    
    // Handle text or email type
    if (type === 'text' || type === 'email') {
        if (!outcome) {
            return 'Sent, awaiting response';
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