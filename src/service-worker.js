chrome.runtime.onMessage.addListener(function (message, sender, sendRes) {
    if (message.type === 'syncDuolingo') {
        // Users personal duolingo vocabulary list
        fetch('https://www.duolingo.com/vocabulary/overview', {
        })
            .then(res => {
                // Check HTTP request is 200-299
                if (!res.ok) {
                    console.log(res)
                    throw new Error(res.statusText)
                }
                return res.json()
            })
            .then(res => {
                if (res.error) {
                    throw Error(res.error)
                }

                storeDuolingoData(res)
                    .then(res => {
                        sendRes(res)
                    })
                    .catch(error => {
                        console.log("Error storing data", error)
                        sendRes({ error })
                    })
            })
            .catch(error => { sendRes({ error }) }); // Send an error response

        // Leave message open for async code
        return true;
    }

    if (message.type === 'getLocalVocab') {
        const combinedISO = message.ISO;
        chrome.storage.local.get(combinedISO).then((res) => {
            if (Object.entries(res).length === 0) { // No data
                sendRes({ isData: false })
            } else {
                sendRes({ isData: true, data: res[combinedISO] })
            }
        })
        return true
    }
});


// TODO: Some duolingo ISO values aren't standard. Need to create a map to fix this
// Restructure JSON in this extensions local storage if I want to add metadata
function storeDuolingoData(res) {
    return new Promise((resolve, reject) => {
        // Format response object
        const learningLanguage = res.learning_language;
        const nativeLanguage = res.from_language;
        const combinedISO = `${learningLanguage}_${nativeLanguage}`; // ISO codes e.g => es_en
        const vocabOverview = res.vocab_overview; // Type: Aray<object>

        // Set combinedISO
        chrome.storage.local.set({ 'combinedISO': combinedISO })

        // List of words
        const vocabList = vocabOverview.map(element => {
            // apply logic to each element and return new array
            const word = element.word_string;
            const formattedWord = word.replace(/\s+/g, "_");
            return formattedWord;
        });

        // Store data under combined ISO
        chrome.storage.local.get(combinedISO).then((storage) => {
            try {
                // Create new object if no data
                storage[combinedISO] = storage[combinedISO] || {}
                let wordsAdded = 0;

                vocabList.forEach(word => {
                    if (!storage[combinedISO].hasOwnProperty(word)) {
                        storage[combinedISO][word] = "";
                        wordsAdded++;
                    }
                });

                console.log(wordsAdded + " words loaded")

                // Set the updated object to storage
                chrome.storage.local.set({ [combinedISO]: storage[combinedISO] }).then(() => {
                    // Log total data used
                    chrome.storage.local.getBytesInUse([combinedISO], (dataUsed) => {
                        console.log(`${dataUsed} bytes used`);
                        resolve(combinedISO)
                    });
                });
            } catch (error) {
                reject(error);
            }
        });
    })
}