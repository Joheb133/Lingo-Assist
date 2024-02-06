console.log("content script activated...must destroy");

/**
 * @param {string} combinedISO - learningISO_nativeISO used as key to access storage
 * @return {Promise<Object|Error>} - {word: translation}
*/
async function getLocalVocab(combinedISO) {
    try {
        const res = await chrome.runtime.sendMessage({ type: 'getLocalVocab', ISO: combinedISO });
        if (res.error) {
            throw res.error;
        }
        return res;
    } catch (error) {
        console.error(`Error returning vocab on ${combinedISO}.`, error);
        return false
    }
}

// send a message
// also make sure to NOT include words with no translation in the map

// Function to reverse the structure
function reverseStructure(wordsObj) {
    const reversedData = {};
    const wordsArr = Object.entries(wordsObj)

    for (let i = 0; i < wordsArr.length; i++) {
        const word = wordsArr[i][0]
        const dataArr = wordsArr[i][1]

        for (let j = 0; j < dataArr.length; j++) {
            const dataEl = dataArr[j];
            // ignore verbs and infinitives for now
            if (dataEl.pos !== 'Verb' && dataEl.pos !== 'Infinitive') {
                // IF the key doesnt exist, add it to the object above
                if (!reversedData.hasOwnProperty(dataEl.translation)) {
                    reversedData[dataEl.translation] = [word]
                } else {
                    reversedData[dataEl.translation].push(word)
                }
            }
        }
    }

    return reversedData;
}

function returnTranslationMap() {
    const combinedISO = localStorage.getItem('combinedISO');
    //await getLocalVocab(combinedISO)
    const localData = {
        "adiós": [
            {
                "infinitive": null,
                "pos": "Interjection",
                "translation": "the"
            },
            {
                "infinitive": null,
                "pos": "Noun",
                "translation": "can"
            },
            {
                "infinitive": null,
                "pos": "Verb",
                "translation": "fly"
            }
        ],
        "bebe": [
            {
                "infinitive": null,
                "pos": "Infinitive",
                "translation": "run"
            },
            {
                "infinitive": null,
                "pos": "Verb",
                "translation": "talk"
            },
            {
                "infinitive": null,
                "pos": "Noun",
                "translation": "to"
            },
            {
                "infinitive": null,
                "pos": "Noun",
                "translation": "the"
            }
        ]
    }

    if (!localData) {
        console.error(`Error loading data on ISO = ${combinedISO}`)
        return false;
    }

    return reverseStructure(localData)
}

console.log(returnMap())