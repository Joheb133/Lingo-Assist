import duolingoSync from "./duolingoSync.js";

// When the sync duolingo button is pressed
export default function handleSyncDuolingo() {
    duolingoSync();
    const duolingoSyncBtn = document.querySelector('.duolingo-sync-btn');
    duolingoSyncBtn.addEventListener('click', async function () {
        duolingoSync()
    });
}
