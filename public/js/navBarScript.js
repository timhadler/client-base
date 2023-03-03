const url = window.location.href;

// Adds a higlight class to the nave abr elements to indicate current page
if (url.includes(".com/clients") || url.includes("3000/clients")) {
    document.getElementById("navCallList").classList.remove("highlightNav");
    document.getElementById("navReports").classList.remove("highlightNav");
    document.getElementById("navClients").classList.add("highlightNav");
} else if (url.includes(".com/clientOverview") || url.includes("3000/clientOverview")) {
    document.getElementById("navCallList").classList.remove("highlightNav");
    document.getElementById("navClients").classList.remove("highlightNav");
    document.getElementById("navReports").classList.add("highlightNav");
} else if ((url.includes(".com/") || url.includes("3000/")) && !url.includes("login")) {
    document.getElementById("navClients").classList.remove("highlightNav");
    document.getElementById("navReports").classList.remove("highlightNav");
    document.getElementById("navCallList").classList.add("highlightNav");
};
