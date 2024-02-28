// Clear the table and handle resource cleanup
export default function clearVocab() {
    // Wipe table data (keep header)
    const table = document.querySelector(".table-container table");
    const tbody = table.querySelector("tbody");
    if (tbody) {
        table.removeChild(tbody)
    }
}