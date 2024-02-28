
export default function popupTogle() {
    // Turn the popup window on and off
    const popupWindow = document.querySelector('.popup-window');
    popupWindow.addEventListener('mousedown', (event) => {
        if (event.target === popupWindow || event.target.closest('.esc-btn')) {
            popupWindow.style.display = 'none'

            // Enable scrolling
            document.body.classList.toggle('overflow-hidden')
        }
    })
}
