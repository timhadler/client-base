// Import clients
document.getElementById("clientImportFile").onchange = function() { uploadClientFile() };

function uploadClientFile() {
    document.getElementById("clientImportForm").submit();  
}