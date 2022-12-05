const url = window.location.href;

if (url.includes(".com/clients") || url.includes("3000/clients")) {
    console.log("here");
    document.getElementById("navCallList").classList.remove("highlightNav");
    document.getElementById("navClients").classList.add("highlightNav");
} else if (url.includes(".com/") || url.includes("3000/")) {
    document.getElementById("navClients").classList.remove("highlightNav");
    document.getElementById("navCallList").classList.add("highlightNav");
};
