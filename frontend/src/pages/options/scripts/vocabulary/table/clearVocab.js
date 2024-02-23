import editRowClicked from "./popup/handleRowClicked.js";
import handleTransEvents from "./popup/handleTranslationEvents.js";
import handleDataSave from "./popup/handleDataSave.js";

// Clear the table and handle resource cleanup
export default function clearVocab() {
    // Wipe table data (keep header)
    const table = document.querySelector(".table-container table");
    const tbody = table.querySelector("tbody");
    if (tbody) {
        tbody.removeEventListener('click', editRowClicked)
        table.removeChild(tbody)
    }

    const transUl = document.querySelector('.popup .translations-wrap ul')
    transUl.removeEventListener('click', handleTransEvents)

    const saveBtn = document.querySelector('.popup button')
    saveBtn.removeEventListener('click', handleDataSave)
}