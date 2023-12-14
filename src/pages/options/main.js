let currentISO;

async function syncDuolingo() {
    try {
        const res = await chrome.runtime.sendMessage({ type: 'syncDuolingo' });
        if (res.error) {
            console.error('Error syncing Duolingo', res.error);
            return false;
        } else {
            currentISO = res
            showLocalVocab();
            return true;
        }
    } catch (error) {
        console.error('Error syncing Duolingo', error);
        return false;
    }
}

async function isSignedIn() {
    const loadingSVG = document.querySelector("#loading-svg")
    const failSVG = document.querySelector("#cross-svg")
    const successSVG = document.querySelector("#check-svg")

    loadingSVG.classList.replace("hidden", "inline")

    if (await syncDuolingo()) {
        loadingSVG.classList.replace("inline", "hidden")
        successSVG.classList.replace("hidden", "inline")
    } else {
        loadingSVG.classList.replace("inline", "hidden")
        failSVG.classList.replace("hidden", "inline")
    }
}

isSignedIn()

const fetchBtn = document.querySelector('.fetch-btn');
fetchBtn.addEventListener('click', function () {
    syncDuolingo()
});

/* REMOVE from development */
// Clear stored data
const clearBtn = document.querySelector('.clear-btn');
clearBtn.addEventListener('click', function () {
    chrome.storage.local.clear(() => console.log('Local storage cleared'))
    clearTable()
})

// TODO: Add ability to manually choose languages
function showLocalVocab() {
    if (!currentISO) {
        console.log("No language selected...Please sign into Duolingo")
        return
    }

    chrome.runtime.sendMessage({ type: 'getLocalVocab', ISO: currentISO }).then((res) => {
        if (!res.isData) return

        clearTable()

        const obj = res.data[currentISO];
        const table = document.querySelector("#vocab-table")

        // Populate table with vocab
        for (const [key, value] of Object.entries(obj)) {
            const row = document.createElement("tr")
            const word = document.createElement("td")
            word.innerText = formatText(key)

            const translation = document.createElement("td")
            translation.innerText = formatText(value)
            row.appendChild(word)
            row.appendChild(translation)
            table.appendChild(row)
        }
    })

    function formatText(string) {
        // replace underscore with space
        let formattedText = string.replace(/_/g, ' ')
        formattedText = formattedText.charAt(0).toUpperCase() + formattedText.slice(1)

        return formattedText
    }
}

function clearTable() {
    // Wipe table data
    const table = document.querySelector("#vocab-table")
    const headings = table.firstElementChild
    table.innerHTML = ''
    table.appendChild(headings)
}