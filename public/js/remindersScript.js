/*****************************************************************
 * Reminders Page
 ****************************************************************/
// Selected client data
let currentClientData = {id:"", email:"", phone:""};

// For interaction modal
let currentReminderId = 0;
let currentReminderCount = 0;

// Default tab
let currentTab = "dateRange";

// List limits
const REMINDERS_LIST_LIMIT = 10;
const REMINDERS_INTERACTION_LIMIT = 8;

// Time between reminders constants
const FOLLOW_UP_PERIOD_DAYS = 2;
const CYCLE_PERIOD_DAYS = 365;

// Pagination
let currentOffset = 0;
let totalReminders = 0;
let hasMoreReminders = false;

// Reminder count filter
let selectedReminderCount = 'all';
const MAX_REMINDER_COUNT = 10;

// Date range filter
let activeDateFilter = 'any';   // 'today' | 'thisMonth' | 'specificMonth' | 'dateRange' | 'any'
let dateRangeFrom = null;
let dateRangeTo   = null;

let showImportantOnly = false;

$(document).ready(function() {
    // Tab triggers
    $(".tab:not(.filter-dropdown-trigger, .important-toggle-tab)").on('click', function() {
        changeTab($(this));
    });

    $('#importantToggle').on('click', (e) => {
        showImportantOnly = !showImportantOnly;
        $(e.currentTarget).toggleClass('active', showImportantOnly);
        queryListData(currentTab);
    });

    $('#reminderForm').on('submit', function(e) {
        e.preventDefault();
        saveReminderEdit(function(res) {
            $('#reminderModal').removeClass('show');
            currentOffset = 0; // Reset offset after edit
            queryListData(currentTab); // reload the list on this page
        }, function(err) {
            alert(err.responseJSON?.error ?? 'Error saving reminder');
        });
    });

    // Initialize features
    initClientPanel();
    initInteractionModal();
    initLoadMoreButton();
    initDropdowns();

    initEditReminderModal('#tableBody');
    initDeleteModal();

    queryListData(currentTab);
});

/*****************************************************************
 * AJAX Functions
 ****************************************************************/
// AJAX Retrieve data for selected reminder list
function queryListData(filter, offset=0) {
    $.ajax({
        url: "/api/reminders",
        method: "GET",
        data: { 
            filterData: {
                tab: currentTab, 
                dateFilterType: activeDateFilter, 
                dateFrom: dateRangeFrom, 
                dateTo: dateRangeTo, 
                important: showImportantOnly,
                reminderCount: selectedReminderCount
            }, 
            limit: REMINDERS_LIST_LIMIT, 
            offset: offset
        },
        success: function(res) {
            // Update pagination state
            if (offset === 0) {
                totalReminders = res.pageTotal || 0;
                currentOffset = 0;
            }

            loadList(res.counts, res.data, offset);
            updatePaginationUI(offset, res.data.length);
        },
        error: function(xhr, status, error) {
            alert(xhr.responseJSON?.error ?? 'Failed fetching list');
        }
  });
}

// Loads full client details
async function fetchClientDetails(id) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `/api/clients/${id}`,
            method: "GET",
            success: function(res) {
                const data = typeof res === 'string' ? JSON.parse(res) : res;
                resolve(data.client);
            },
            error: function(xhr, status, error) {
                reject(xhr.responseJSON?.error ?? 'Error');
            }
        });
    });
}

// Loads client interactions details
async function fetchClientInteractions(id) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `/api/clients/${id}/interactions`,
            method: "GET",
            data: { limit: REMINDERS_INTERACTION_LIMIT },
            success: function(res) {
                const data = typeof res === 'string' ? JSON.parse(res) : res;
                resolve(data.interactions || []);
            },
            error: function(xhr, status, error) {
                reject(xhr.responseJSON?.error ?? 'Error');
            }
        });
    })
}


/*****************************************************************
 * List functions
 ****************************************************************/
// Loads data into reminders table
function loadList(counts, reminders, offset=0) {
    let $table = $('#tableBody');

    // Add list counts if > 0
    const overdueCount = counts.overdue;
    const todayCount = counts.today;
    const thisMonthCount = counts.thisMonth;
    const initialCount = counts.initial;
    const followUpCount = counts.followUp;

    const overdueCountText = overdueCount ? '(' + overdueCount + ')' : '';
    const todayCountText = todayCount ? '(' + todayCount + ')' : '';
    const thisMonthCountText = thisMonthCount ? '(' + thisMonthCount + ')' : '';
    const initialCountText = initialCount ? '(' + initialCount + ')' : '';
    const followUpCountText = followUpCount ? '(' + followUpCount + ')' : '';

    $("#overdueCount").text(overdueCountText);
    $("#todayCount").text(todayCountText);
    $("#thisMonthCount").text(thisMonthCountText);
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
            $row.find('.reminder-count-cell').text(reminder.reminderCount);

            $row.find('.client-name').text(reminder.name);
            $row.find('.client-company').text(reminder.company);
            $row.find('.reminder-note').text(reminder.note); 

            // Attach reminder
            $row.find('.cd-edit-reminder-btn').data('id', reminder.id).data('note', reminder.note).data('date', reminder.date).data('important', reminder.important);

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
                    // Success callback
                    function(response) {
                        queryListData(currentTab);
                    },
                    // Error callback
                    function(xhr, status, error) {
                        alert(xhr.responseJSON?.error ?? 'Failed to delete reminder. Please try again.');
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
        
        $btn.prop('disabled', true).text('Loading...');
        
        currentOffset += REMINDERS_LIST_LIMIT;
        
        $.ajax({
            url: "api/reminders/",
            method: "GET",
            data: { filter: currentTab, limit: REMINDERS_LIST_LIMIT, offset: currentOffset },
            success: function(res) {
                loadList(res.counts, res.data, currentOffset);
                updatePaginationUI(currentOffset, res.data.length);
                
                $btn.prop('disabled', false).text(originalText);
            },
            error: function(xhr, status, error) {
                $btn.prop('disabled', false).text(originalText);
                alert(xhr.responseJSON?.error ?? 'Failed to load more reminders. Please try again.');
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

function resetFilters() {
    // Reminder count
    selectedReminderCount = 'all';
    $('#countFilterLabel').text('Attempt #');
    $('#countFilterMenu .filter-dropdown-item').removeClass('selected');
    $('#countFilterMenu .filter-dropdown-item[data-count="all"]').addClass('selected');

    // Date range
    if (currentTab !== 'dateRange') {
        activeDateFilter = 'any';
        dateRangeFrom = dateRangeTo = null;
        $('#dateRangeMenu .filter-dropdown-item').removeClass('selected');
        $('#dateRangeMenu .filter-dropdown-item[data-date-filter="any"]').addClass('selected');
        $('#dateRangeLabel').text('Any Date');
    }

    // Important
    showImportantOnly = false;
}

function changeTab($tab) {
    currentTab = $tab.data("filter");
    currentOffset = 0;
    $('.tab').removeClass('active');
    
    resetFilters();
    $tab.addClass('active');
    queryListData(currentTab);
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
    let client;
    let interactions;

    try {
        client = await fetchClientDetails(clientId);
        interactions = await fetchClientInteractions(clientId);
    } catch (errorMsg) {
        alert(errorMsg);
        return;
    }

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
            $('#reminderOptionsGroup, #newReminderFields').hide();
            $('#submitInteraction').prop('disabled', true);
        } else {
            $('#outcomeGroup').hide();
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
            reminderCount: currentReminderCount,
            clientId: currentClientData.id,
            method: selectedMethod,
            outcome: selectedOutcome,
            important: $('#reminderIsImportant').prop('checked'),
            createNewReminder: $('#createNewReminder').prop('checked'),
            moveToNextCycle: $('#moveToNextCycle').prop('checked'),
            newReminderDate: $('#newReminderDate').val(),
            newReminderNote: $('#newReminderNote').val()
        };
        $.ajax({
            url: `/api/reminders/${currentReminderId}/complete`,
            method: "POST",
            data: JSON.stringify(formData),
            contentType: "application/json",
            success: function(res) {
                queryListData(currentTab);
            },
            error: function(xhr, status, error) {
                // Handle AJAX error
                alert('Record interaction failed');
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
            let numDays;
            numDays =  $('#createNewReminder').prop('checked') ? FOLLOW_UP_PERIOD_DAYS : CYCLE_PERIOD_DAYS;

            const defaultDate = new Date();
            defaultDate.setDate(defaultDate.getDate() + numDays);

            // Format date to yyyy-mm-dd for html
            const year = defaultDate.getFullYear();
            const month = String(defaultDate.getMonth() + 1).padStart(2, '0'); // months are 0-based
            const day = String(defaultDate.getDate()).padStart(2, '0');

            const dateTimeStr = `${year}-${month}-${day}`;
            $dateInput.val(dateTimeStr);
        } else {
            $fields.hide();
            $('#reminderIsImportant').prop('checked', false);
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
                $('#reminderIsImportant').prop('checked', true);
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
        $('#reminderIsImportant').prop('checked', false);
        $('#reminderDescription').hide();
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
                    no_answer: "Follow-up after missed outbound call"
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
        $('#outcomeGroup, #reminderOptionsGroup, #newReminderFields').hide();
        $('#newReminderWrapper, #nextCycleWrapper, #reminderDescription').hide();
        resetReminderCheckboxes();
        $('#submitInteraction').prop('disabled', true);
    }
}

/*****************************************************************
 * Dropdown filters
 ****************************************************************/
function initDropdowns() {
    const $overlay = $('#dropdownOverlay');

    $overlay.on('click', closeAllDropdowns);

    $(document).on('keydown', function(e) {
        if (e.key === 'Escape' && $overlay.hasClass('show')) {
            closeAllDropdowns();
        }
    });

    initCountFilterDropdown();
    initDateRangeFilterDropdown();
}

function closeAllDropdowns() {
    $('#countFilterTrigger').removeClass('open');
    $('#countFilterMenu').removeClass('show');

    $('#dateRangeTrigger').removeClass('open');
    $('#dateRangeMenu').removeClass('show');

    $('#dropdownOverlay').removeClass('show');
}

/*****************************************************************
 * Reminder Count Filter Dropdown
 ****************************************************************/
function initCountFilterDropdown() {
    const $trigger = $('#countFilterTrigger');
    const $menu = $('#countFilterMenu');
    const $overlay = $('#dropdownOverlay');
    
    $trigger.on('click', function(e) {
        e.stopPropagation();
        const isOpen = $trigger.hasClass('open');
        
        if (isOpen) {
            closeAllDropdowns();
        } else {
            openCountDropdown();
        }
    });
    
    $menu.on('click', '.filter-dropdown-item', function(e) {
        e.stopPropagation();
        const count = $(this).data('count');
        
        $('#countFilterMenu .filter-dropdown-item').removeClass('selected');
        $(this).addClass('selected');
        
        selectedReminderCount = count;
        
        if (count === 'all') {
            $('#countFilterLabel').text('Attempt #');
            $trigger.removeClass('active');
        } else {
            $('#countFilterLabel').text(`Attempt #${count}`);
            $trigger.addClass('active');
        }
        
        closeAllDropdowns();
        
        queryListData(currentTab);
    });
    
    function openCountDropdown() {
        $trigger.addClass('open');
        $menu.addClass('show');
        $overlay.addClass('show');
    }

    populateCountFilterOptions();
}

function populateCountFilterOptions() {
    const $container = $('#countOptionsContainer');
    $container.empty();
    
    for (let i = 0; i < MAX_REMINDER_COUNT; i++) {
        const $item = $(`
            <button class="filter-dropdown-item" data-count="${i}">
                <span class="filter-check">✓</span>
                ${i} Attempt${i !== 1 ? 's' : ''}
            </button>
        `);
        
        $container.append($item);
    }
    
    $('.filter-dropdown-item[data-count="all"]').addClass('selected');
}

/*****************************************************************
 * Date Range Filter
 ****************************************************************/
function initDateRangeFilterDropdown() {
    const $trigger = $('#dateRangeTrigger');
    const $menu = $('#dateRangeMenu');
    const $label = $('#dateRangeLabel');
    const $overlay = $('#dropdownOverlay');

    const DATE_FILTER_LABELS = {
        today:         'Today',
        thisMonth:     'This Month',
        specificMonth: (val) => {
            val = val.split("-").reverse().join("-");
            return `${val.replaceAll('-', '/')}`;
        },
        dateRange:     (f, t) => {
            f = f.split("-").reverse().join("-");
            t = t.split("-").reverse().join("-");
            return `${f.replaceAll('-', '/')} - ${t.replaceAll('-', '/')}`;
        },
        any:           'Any Date',
    };
    setDateFilterLabel('any');

    $trigger.on('click', () => {
        const isOpen = $menu.hasClass('show');
        if (!isOpen) {
            $menu.addClass('show');
            $trigger.addClass('open');
            $overlay.addClass('show');
        } else {
            closeAllDropdowns();
        }
    });

    // Quick-pick items
    $menu.on('click', '.filter-dropdown-item', function(e) {
        e.stopPropagation();
        const type = $(this).data('date-filter');

        // Show/hide sub-inputs
        $('#monthPickerInputs').css('display', type === 'specificMonth' ? 'block' : 'none');
        $('#dateRangeInputs').css('display', type === 'dateRange' ? 'block' : 'none');

        markDateFilterSelected($(this));
        if (type === 'specificMonth' || type === 'dateRange') return; // wait for Apply

        submitDateRange(type, null, null);
    });

    // Apply month picker
    $('#applyMonthBtn').on('click', () => {
        const val = $('#specificMonthInput').val();
        if (!val) return;

        submitDateRange('specificMonth', val, null);
    });

    // Apply date range
    $('#applyDateRangeBtn').on('click', () => {
        const from = $('#dateRangeFrom').val();
        const to   = $('#dateRangeTo').val();
        if (!from || !to) return;

        submitDateRange('dateRange', from, to);
    });

    function submitDateRange(type, f, t) {
        activeDateFilter = type;
        dateRangeFrom = f;
        dateRangeTo = t;

        setDateFilterLabel(type, f, t);
        closeAllDropdowns();
        changeTab($trigger);
    }

    function markDateFilterSelected($activeBtn) {
        $menu.find('[data-date-filter]').removeClass('selected');
        if ($activeBtn) $activeBtn.addClass('selected');
    }

    function setDateFilterLabel(type, extra1, extra2) {
        const lbl = typeof DATE_FILTER_LABELS[type] === 'function'
            ? DATE_FILTER_LABELS[type](extra1, extra2)
            : DATE_FILTER_LABELS[type];
        $label.text(lbl);
    }
}