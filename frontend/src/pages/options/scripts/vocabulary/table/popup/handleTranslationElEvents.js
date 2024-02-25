import returnNewLi from "./returnNewLi.js";

// Handle the logic that occurs when the translation element of the popup is clicked
export default function handleTransEvents(event) {
    const clickedLi = event.target.closest('li')

    if (clickedLi) {
        let li = clickedLi;
        if (clickedLi.classList.contains('add-trans-wrap')) { // Add new translation
            const transUl = document.querySelector('.options-popup .translations-wrap ul')
            const newLi = returnNewLi('')
            transUl.insertBefore(newLi, clickedLi)
            li = newLi
        }

        // Enable span to be a textbox
        const spanEl = li.querySelector('span')
        spanEl.role = 'textbox'
        spanEl.contentEditable = true;
        spanEl.focus();

        // Move cursor to the end
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(spanEl);
        range.collapse(false); // Collapse to the end
        selection.removeAllRanges();
        selection.addRange(range);

        spanEl.addEventListener('blur', handleLiBlur)

        // Handle clicking off li
        function handleLiBlur() {
            spanEl.contentEditable = 'false'; // Turn off span editing
            spanEl.role = null;

            spanEl.innerText = spanEl.innerText.trim();

            // Ensure span is valid else remove the li
            spanEl.removeAttribute('role');
            if (spanEl.innerText === '') {
                li.remove();
            }
            spanEl.removeEventListener('blur', handleLiBlur);
        }
    }
}