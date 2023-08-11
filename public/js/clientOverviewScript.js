const overlay = document.getElementById("overlay");
const clientOverviewForm = document.getElementById("clientOverviewForm");
const filterForm = document.getElementById("ovFilterPopup");

// Add reminder date buttons
const addReminderSubmitButt = document.getElementById("addReminderSubmit").addEventListener('click', function() { addReminder() });
const addReminderPopupButt = document.getElementById("addReminderButton").addEventListener('click', function() { addReminderPopup() });
const addReminderCloseButt = document.getElementById("addReminderCloseButton").addEventListener('click', function() { addReminderClose() });

// Delete button
document.getElementById("ovDeleteButton").addEventListener('click', function() { deleteClients() });

// Filter buttons
document.getElementById("filterButton").addEventListener('click', function() { filterPopup() });
document.getElementById("filterCloseButton").addEventListener('click', function() { filterClose() });

// Add reminder
function addReminder() {
    clientOverviewForm.action = "/clientOverview/addReminderDate";
    clientOverviewForm.method = "POST";
    clientOverviewForm.submit();
}

function addReminderPopup() {
    document.getElementById("addReminderPopup").style.display = "block";
    overlay.style.visibility = "visible";
}

function addReminderClose() {
    document.getElementById("addReminderPopup").style.display = "none";
    overlay.style.visibility = "hidden";
}

// Delete
function deleteClients() {
    clientOverviewForm.action = "/clientOverview/delete?_method=DELETE";
    clientOverviewForm.method = "POST";

    // Confirm delete
    let confirmed = confirm("Are you sure? Delete all these clients and all related data?");
    if (confirmed) {
        clientOverviewForm.submit();
    }
}

// Filter popup
function filterPopup() {
    filterForm.style.display = "block";
    overlay.style.visibility = "visible";
}

function filterClose() {
    filterForm.style.display = "none";
    overlay.style.visibility = "hidden";
}