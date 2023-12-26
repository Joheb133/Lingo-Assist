/**
 * Display login status using loading, success and fail SVGs
 * Use syncDuolingo(messages.js) response
 * @param {string} state - select below states to reveal/hide elements
*/

export const login = {
    LOADING: 'loading',
    SUCCESS: 'success',
    FAIL: 'fail'
}

export default function displayLoginStatus(state) {
    const loadingSVG = document.querySelector("#loading-svg");
    const failSVG = document.querySelector("#cross-svg");
    const successSVG = document.querySelector("#check-svg");

    // Hide all SVGs by default
    loadingSVG.classList.add("hidden");
    failSVG.classList.add("hidden");
    successSVG.classList.add("hidden");

    // Toggle visibility based on the state
    switch (state) {
        case login.LOADING:
            loadingSVG.classList.remove("hidden");
            break;
        case login.SUCCESS:
            successSVG.classList.remove("hidden");
            break;
        case login.FAIL:
            failSVG.classList.remove("hidden");
            break;
        default:
            console.error('Invalid display state:', state);
    }
}