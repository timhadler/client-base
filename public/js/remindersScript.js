// Test clients
let testClients = [
    {
        id: 1,
        name: "Alice Johnson",
        phone: "021 154 2211",
        email: "mrfake@doesntexist.com",
        position: "Manager",
        priority: "high",
        notes: "",
        totalReminders: "5",
        lastContact: "Oct 10, 2025",
        day: "23",
        month: "Oct",
        dateTime: "10:00 AM",
        fullDate: "Oct 23, 2025",
        status: "Pending",
        company: "Acme Corp",
        note: "Follow up about new contract" // need to add client note for panel
    },
    {
        id: 2,
        name: "Bob Smith",
        priority: "high",
        day: "10",
        month: "Nov",
        fullDate: "Nov 10, 2025",
        status: "Completed",
        company: "Beta LLC",
        note: "Send invoice and confirm payment"
    },
    {
        id: 3,
        name: "Charlie Davis",
        day: "01",
        email: "mrfake@doesntexist.com",
        priority: "high",
        month: "Dec",
        fullDate: "Dec 01, 2025",
        status: "Overdue",
        company: "Gamma Inc",
        note: "Call regarding overdue service"
    },
    {
        id: 4,
        name: "Diana Lee",
        day: "15",
        priority: "high",
        email: null,
        month: "Jan",
        fullDate: "Jan 15, 2026",
        status: "Pending",
        company: "Delta Co",
        note: "Schedule demo for new product"
    },
    {
        id: 5,
        name: "Ethan Brown",
        day: "20",
        priority: "high",
        email: "",
        month: "Feb",
        fullDate: "Feb 20, 2026",
        status: "Completed",
        company: "Epsilon Ltd",
        note: "Confirm meeting follow-up"
    }
];

/*****************************************************************
 * Document Ready
 ****************************************************************/
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

    // ** Panel **
    // Copy to clipboard buttons
    $("#copyEmailBtn").on('click', function(event) { copyToClipboard(event, "email") }),
    $("#copyPhoneBtn").on('click', function(event) { copyToClipboard(event, "phone") }),

    // Close panel events
    $("#panelClose").on("click", closeClientPanel);
    $("#panelOverlay").on("click", closeClientPanel);
    //document.getElementById('panelClose').addEventListener('click', closeClientPanel);
    //document.getElementById('panelOverlay').addEventListener('click', closeClientPanel);

    // Escape key to close
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeClientPanel();
        }
    });
    //loadList(0, testClients);
    queryListData("all"); 
});

/*****************************************************************
 * AJAX Functions
 ****************************************************************/
const LIMIT = 10;
// AJAX Load a reminder list
function queryListData(filter, offset=0) {
    $.ajax({
        url: "reminders/load-reminder-list",
        method: "GET",
        data: { list:"pendingList", limit:LIMIT, offset:offset },   // TESTING
        success: function(res) {
            const data = JSON.parse(res);
            loadList(data.listCount, data.listData, offset);
        },
        error: function(xhr, status, error) {
            // Handle AJAX error
            console.log('AJAX Error while fetching list with filter: ' +  filter +  ' reminder list:', error, xhr, status);
        }
  });
}

// Loads data into reminders table
// MODIFY: Probably retirve all list counts from ajax req
function loadList(n, clients, offset=0) {
    let $table = $('#tableBody');

    // if (l == "pendingList") {
    //     $('#pendingCount').html('(' + n + ')');
    // } else if (l == "followUpList") {
    //     $('#followUpCount').html('(' + n + ')');
    // } else if (l == "awaitingList") {
    //     $('#awaitingCount').html('(' + n + ')');
    // }

    // Add list counts if > 0
    let overdueCount = 0;   // Retrieve from db
    let todayCount = n;     // testing
    let upcomingCount = 1;
    overdueCount ? $("#overdueCount").text('(' + overdueCount + ')') : '';
    todayCount ? $("#todayCount").text('(' + todayCount + ')') : '';
    upcomingCount ? $("#upcomingCount").text('(' + upcomingCount + ')') : '';

    if (offset === 0) {
        $table.empty(); // Clear the list only for the initial load
    }

    //Data reminders[x]: clients.id, name, mobile, rDate, flag, reminders.id AS rId, reminders.status
    $.get("html/reminderTableRow.html", function(template) {
        clients.forEach(function(client) {
            // Create jQuery object from the template string
            let $row = $(template);

            // Fill in the data
            $row.find('.date-day').text(client.day);   //23
            $row.find('.date-month').text(client.month); //Oct
            $row.find('.date-full').text(client.fullDate); //Oct 23, 2025
            $row.find('.date-time').text(client.dateTime); //10:00 AM
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
 * Client Panel (reminders page)
 ****************************************************************/
// Client data for the panel
let currentClientData = {};

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
    document.getElementById('panelTotalReminders').textContent = data.totalReminders;
    document.getElementById('panelLastContact').textContent = data.lastContact;
    
    // Update quick action links
    document.getElementById('callBtn').href = `tel:${data.phone}`;
    document.getElementById('emailBtn').href = `mailto:${data.email}`;
    document.getElementById('viewFullBtn').href = `/clients/${data.id}`;
    
    // Update badges
    const badgesHtml = `
        <span class="status-badge ${data.status.toLowerCase()}"> ${data.status.charAt(0).toUpperCase() + data.status.slice(1).toLowerCase()} </span>
        ${data.priority ? `
            <span class="priority-badge ${data.priority.toLowerCase()}"> ${getPriorityIcon(data.priority)} ${data.priority.charAt(0).toUpperCase() + data.priority.slice(1).toLowerCase()} Priority </span>
        ` : ''}
    `;

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
document.getElementById('markCompleteBtn').addEventListener('click', function() {
    if (confirm('Mark this reminder as complete?')) {
        // Find the active row and mark it complete
        const activeRow = document.querySelector(`[data-client-id="${currentClientData.id}"]`);
        if (activeRow) {
            const badge = activeRow.querySelector('.status-badge');
            badge.className = 'status-badge completed';
            badge.textContent = 'Completed';
            activeRow.dataset.status = 'completed';
        }
        closeClientPanel();
    }
});