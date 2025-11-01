// ------------------
// Tab filtering
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        
        const filter = this.dataset.filter;
        const rows = document.querySelectorAll('tbody tr');
        
        rows.forEach(row => {
            if (filter === 'all' || row.dataset.status === filter) {
                row.style.display = '';
            } else {
                //row.style.display = 'none';
            }
        });
    });
});

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
// -----------------------
// Test clients
let testClients = [
    {
        id: 1,
        name: "Alice Johnson",
        mobile: "021 154 2211",
        email: "mrfake@doesntexist.com",
        day: "23",
        month: "Oct",
        dateTime: "10:00 AM",
        fullDate: "Oct 23, 2025",
        status: "Pending",
        company: "Acme Corp",
        note: "Follow up about new contract"
    },
    {
        id: 2,
        name: "Bob Smith",
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
        email: "",
        month: "Feb",
        fullDate: "Feb 20, 2026",
        status: "Completed",
        company: "Epsilon Ltd",
        note: "Confirm meeting follow-up"
    }
];

$(document).ready(function() {
    loadList(0, testClients);
});


// Loads data into reminders table
function loadList(n, clients, offset=0) {
    let $table = $('#tableBody');

    // if (l == "pendingList") {
    //     $('#pendingCount').html('(' + n + ')');
    // } else if (l == "followUpList") {
    //     $('#followUpCount').html('(' + n + ')');
    // } else if (l == "awaitingList") {
    //     $('#awaitingCount').html('(' + n + ')');
    // }

    // if (offset === 0) {
    //     list.empty(); // Clear the list only for the initial load
    // }

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

            // Append to the table
            $table.append($row);
        });
    });

    // Hide load more button
    // if (list.find('li').length == n) {
    //     $('.load-more[data-list="' + l + '"]').hide();
    // }
}