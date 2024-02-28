export default function handleShowTable() {
    // Hide/Show vocab table
    const tableBtn = document.querySelector('.table-btn')
    const tableContainer = document.querySelector('.table-container')
    tableBtn.addEventListener('click', function () {
        if (tableContainer.style.maxHeight) {
            tableContainer.style.maxHeight = '';
        } else {
            tableContainer.style.maxHeight = `${tableContainer.scrollHeight}px`;
        }
    })
}
