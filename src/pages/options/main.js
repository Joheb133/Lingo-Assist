// Fetch data from duolingo
const fetchBtn = document.querySelector('.fetch-btn');
fetchBtn.addEventListener('click', function () {
    chrome.runtime.sendMessage({ type: 'getDuolingo' }).then((res) => {
        if (res.error) {
            console.error('Error syncing Duolingo', res.error)
        } else {
            showLocalVocab()
        }
    })
});

// Set current language
const currentISO = 'es_en';

// Clear stored data
const clearBtn = document.querySelector('.clear-btn');
clearBtn.addEventListener('click', function () {
    chrome.storage.local.clear(() => console.log('Local storage cleared'))
    clearTable()
})

function showLocalVocab() {
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

showLocalVocab()