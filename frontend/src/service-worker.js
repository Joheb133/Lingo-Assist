import { API_KEY } from "../config.js";
import { convertBytes } from "./utils/convertBytes.js";

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
                        console.error("Error storing data", error)
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
        const combinedISO = message.ISO
        chrome.storage.local.get(combinedISO).then((res) => {
            if (Object.entries(res).length === 0) return

            const wordsArrObjs = res[combinedISO]
            // const untranslatedWords = (() => {
            //     const filteredWords = Object.fromEntries(
            //         Object.entries(wordsArrObjs)
            //             .filter(([_, values]) => values.filter(value => value.translation === ''))
            //     );
            //     return { [combinedISO]: filteredWords };
            // })();
            // const translatedWords = (() => {
            //     const filteredWords = Object.fromEntries(
            //         Object.entries(wordsArrObjs)
            //             .filter(([_, values]) => values.filter(value => value.translation.length > 0))
            //     );
            //     return { [combinedISO]: filteredWords };
            // })();
            const untranslatedWords = {}
            const translatedWords = {}

            Object.entries(wordsArrObjs).forEach(([word, dataArr]) => {
                dataArr.forEach(data => {
                    if (data.translation === '') {
                        if (!untranslatedWords[word]) untranslatedWords[word] = []

                        untranslatedWords[word].push(data)
                    } else {
                        if (!translatedWords[word]) translatedWords[word] = []

                        translatedWords[word].push(data)
                    }
                })
            })

            const url = 'http://localhost:7071/api/dictionary'
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ [combinedISO]: untranslatedWords })
            }

            fetch(url, options)
                .then(res => {
                    if (!res.ok) {
                        throw new Error(res.statusText)
                    }

                    return res.json()
                })
                .then(data => {
                    chrome.storage.local.set({ [combinedISO]: translatedWords })
                        .then(() => {
                            storeData(data)
                                .then(res => sendRes(res))
                                .catch(err => {
                                    console.error("Error storing translations", err)
                                    sendRes({ error: err })
                                })
                        })
                })
                .catch(err => {
                    console.error(err)
                    sendRes({ error: err })
                })

            return true;
        })
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

        // Object of words
        const vocabObj = {}
        vocabOverview.forEach(element => {
            // apply logic to each element and return new array
            const word = element.word_string;
            const formattedWord = word.replace(/\s+/g, "_");

            const data = {
                infinitive: element.infinitive,
                pos: element.pos,
                translation: "",
                duolingo_id: element.id
            }

            if (vocabObj[formattedWord] === undefined) { // key doesnt exist
                // push an object (the data)
                vocabObj[formattedWord] = [data]
            } else {
                vocabObj[formattedWord].push(data)
            }
        });

        storeData({ [combinedISO]: vocabObj })
            .then(res => resolve(res))
            .catch(err => reject(err))
    })
}

// Store data in local storage
// , write JSDoc later
// data
/* {
    "es_en": {
        "adiós": [
            {
                "infinitive": null,
                "pos": "Interjection",
                "translation": ""
            },
            {
                "infinitive": null,
                "pos": "Noun",
                "translation": ""
            }
        ]
    }
} */
function storeData(data) {
    return new Promise((res, rej) => {
        // Store data under combined ISO
        const [combinedISO, words] = Object.entries(data)[0]
        chrome.storage.local.get(combinedISO).then((storage) => {
            try {
                // Create new object if no data
                const localWords = storage[combinedISO] || {}
                let wordsAdded = 0;

                Object.entries(words).forEach(([word, data]) => {
                    // data itself is an array of objects
                    // we need to check if this exists in local storage
                    const localWord = localWords[word]
                    if (!localWord) { // If word doesn't exist
                        localWords[word] = [...data] // create key and add data
                        wordsAdded += data.length
                    } else { // word DOES exist
                        // need to compare each Duolingo element data with local data
                        data.forEach((element) => {
                            const hasMatchingId = localWord.some(localElement => localElement['duolingo_id'] === element['duolingo_id']);

                            if (!hasMatchingId) {
                                // If there is no matching id, push the element to local storage
                                localWord.push(element);
                                wordsAdded += 1
                            }
                        })
                    }
                })

                console.log(wordsAdded + " words loaded")

                // Set the updated object to storage
                chrome.storage.local.set({ [combinedISO]: localWords }).then(() => {
                    // Log total data used
                    chrome.storage.local.getBytesInUse([combinedISO], (dataUsed) => {
                        console.log(`${convertBytes(dataUsed)} used`);
                        res(combinedISO)
                    });
                });
            } catch (error) {
                console.error(error)
                rej(error);
            }
        });
    })
}