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

// Function to reverse the structure
function reverseStructure(wordsObj) {
    const reversedData = {};

    for (const [word, dataArr] of Object.entries(wordsObj)) {
        for (const dataEl of dataArr) {
            // Ignore verbs and infinitives for now
            if (dataEl.pos !== 'Verb' && dataEl.pos !== 'Infinitive') {
                // If the key doesn't exist, add it to the object above
                if (!reversedData.hasOwnProperty(dataEl.translation)) {
                    reversedData[dataEl.translation] = [];
                }

                reversedData[dataEl.translation].push(word);
            }
        }
    }

    return reversedData;
}

function returnTranslationMap() {
    const combinedISO = localStorage.getItem('combinedISO');
    console.log(combinedISO)
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

// Callback function when the observed element enters or exits the viewport
function intersectionCallback(entries, wordMap, excludedTags) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Element is currently in the viewport
            replaceWordsInElement(entry.target, wordMap, excludedTags);
        }
    });
};

function replaceWordsInElement(element, wordMap, excludedTags) {
    const wordCounter = {};
    for (const childNode of element.childNodes) {
        if (childNode.nodeType === Node.TEXT_NODE) {
            const originalText = childNode.textContent;

            // Replace specific words based on the wordMap
            const newText = originalText.replace(/\b(\w+)\b/g, (word) => {
                const lowerWord = word.toLowerCase()
                const replacement = wordMap[lowerWord];
                if (replacement) {
                    // Div container for elements
                    const container = document.createElement('div');
                    container.classList.add('lingo-assist-container');

                    // Create a span element for the replaced word
                    const translationSpan = document.createElement('span');
                    translationSpan.classList.add('lingo-assist-span');

                    // Use different translations
                    wordCounter[lowerWord] !== undefined ? wordCounter[lowerWord]++ : wordCounter[lowerWord] = 0;
                    const index = wordCounter[lowerWord] % replacement.length;
                    translationSpan.textContent = replacement[index];

                    // Create tooltip
                    const tooltipSpan = document.createElement('span');
                    tooltipSpan.textContent = word;
                    tooltipSpan.classList.add('lingo-assist-tooltip');
                    translationSpan.append(tooltipSpan);

                    container.append(translationSpan);

                    return container.outerHTML;
                }
                return word;
            });

            // Create a temporary element to hold the HTML structure
            const tempElement = document.createElement('template');
            tempElement.innerHTML = newText;

            // Replace the text node with the modified HTML structure
            element.replaceChild(tempElement.content, childNode);
        } else if (childNode.nodeType === Node.ELEMENT_NODE && !excludedTags.includes(childNode.tagName.toLowerCase())) {
            // Recursively handle child elements
            replaceWordsInElement(childNode, wordMap, excludedTags);
        }
    }
};

function main() {
    const applyContentScript = localStorage.getItem('applyContentScript')
    console.log(applyContentScript)
    if (applyContentScript === 'false') {
        return
    }

    console.log("content script activated");

    const wordMap = returnTranslationMap();

    // Options for the Intersection Observer
    const intersectionOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5, // Trigger when at least 50% of the element is visible
    };

    // Exlcuded elements
    const excludedTags = ['a', 'span']

    // Create an Intersection Observer
    const intersectionObserver = new IntersectionObserver((entries) => intersectionCallback(entries, wordMap, excludedTags), intersectionOptions);

    // Find and observe target elements (e.g., all paragraphs)
    const targetElements = document.querySelectorAll('p');
    targetElements.forEach(element => intersectionObserver.observe(element));
}

main()