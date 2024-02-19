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
    const duolingoStatusEl = document.querySelector('.dashboard #loggin');

    // Change element style based on status
    switch (state) {
        case login.LOADING:
            duolingoStatusEl.classList.add('bg-amber-300')
            duolingoStatusEl.classList.remove('bg-green-300', 'bg-red-300')
            duolingoStatusEl.innerText = 'Loading'
            break;
        case login.SUCCESS:
            duolingoStatusEl.classList.add('bg-green-300')
            duolingoStatusEl.classList.remove('bg-amber-300', 'bg-red-300')
            duolingoStatusEl.innerText = 'Logged In'
            break;
        case login.FAIL:
            duolingoStatusEl.classList.add('bg-red-300')
            duolingoStatusEl.classList.remove('bg-amber-300', 'bg-green-300')
            duolingoStatusEl.innerText = 'Not Logged In'
            break;
        default:
            console.error('Invalid display state:', state);
    }
}