import { API_KEY } from "../config.js";

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
                } else if (res.headers.get('Content-Type').includes('text/html')) {
                    // Duolingo redirects if Auth token invalid
                    throw new Error('Content-type unusable: text/html...Please login Duolingo')
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
            .catch(error => {
                sendRes({ error: error.message })
            });

        // Leave message open for async code
        return true;
    }

    // send back an object
    // object should contain info like the type of word it is (determined by duolingo)
    if (message.type === 'requestTranslations') {

    }

    if (message.type === 'getLocalVocab') {
        const combinedISO = message.ISO;
        chrome.storage.local.get(combinedISO).then((res) => {
            if (Object.entries(res).length === 0) { // No data
                sendRes({ error: `No data exists on ${combinedISO}` })
            } else {
                sendRes(res[combinedISO])
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

            return {
                [formattedWord]: {
                    infinitive: element.infinitive,
                    pos: element.pos,
                    translation: "",
                }
            };
        });

        // Store data under combined ISO
        chrome.storage.local.get(combinedISO).then((storage) => {
            try {
                // Create new object if no data
                storage[combinedISO] = storage[combinedISO] || {}
                let wordsAdded = 0;

                vocabList.forEach(element => {
                    const word = Object.keys(element)[0]
                    if (!storage[combinedISO].hasOwnProperty(word)) {
                        storage[combinedISO][word] = element[word];
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
                console.log(error)
                reject(error);
            }
        });
    })
}