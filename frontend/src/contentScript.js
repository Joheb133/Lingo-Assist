/**
 * @param {string} key - key we want to access
 * @return {Promise<Object|Error>} - 
*/
async function getData(key) {
    try {
        const res = await chrome.runtime.sendMessage({ type: 'getData', key });
        if (res === null) {
            console.error(`No data found on ${key}.`);
            return null
        }
        return res;
    } catch (error) {
        console.error(`Error returning vocab on ${key}.`, error);
        return false
    }
}

async function getCurrentTabDomain() {
    try {
        const res = await chrome.runtime.sendMessage({ type: 'getCurrentTabDomain' })
        return res
    } catch (error) {
        console.error(`Error getting current tab`, error);
    }
}

/**
 * Snake snake_case to Latin script
 * @param {string} string 
 * @param {boolean} capitalizeFirstChar 
 * @returns {string}
 */
function convertSnakeCase(string, capitalizeFirstChar = false) {
    // replace underscore with space
    let formattedText = string.replace(/_/g, ' ')
    formattedText = capitalizeFirstChar ? formattedText.charAt(0).toUpperCase() + formattedText.slice(1) : formattedText;

    return formattedText
}

// Function to reverse the structure
function reverseStructure(wordsObj) {
    const reversedData = {};

    for (const [word, dataArr] of Object.entries(wordsObj)) {
        for (const dataEl of dataArr) {
            // Ignore verbs and infinitives for now
            if (dataEl.pos !== 'Verb' && dataEl.pos !== 'Infinitive') {
                // If the key doesn't exist, add it to the object above
                for (const translationEl of dataEl.translation) {
                    if (!reversedData.hasOwnProperty(translationEl)) {
                        reversedData[`${translationEl.toLowerCase()}`] = [];
                    }

                    let newWord = convertSnakeCase(word)
                    reversedData[`${translationEl.toLowerCase()}`].push(newWord)
                }
            }
        }
    }

    return reversedData;
}

async function returnTranslationMap() {
    const combinedISO = await getData('combinedISO');
    const localData = await getData(combinedISO)

    if (!localData) {
        console.error(`Error loading data on ISO = ${combinedISO}`)
        return false;
    }

    return reverseStructure(localData)
}

// Callback function when the observed element enters or exits the viewport
function intersectionCallback(entries, wordMap, excludedTags, observer) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Element is currently in the viewport
            replaceWordsInElement(entry.target, wordMap, excludedTags, observer);
        }
    });
};

function replaceWordsInElement(element, wordMap, excludedTags, observer) {
    const wordCounter = {};
    for (const childNode of element.childNodes) {
        if (childNode.nodeType === Node.TEXT_NODE) {
            const originalText = childNode.textContent;

            // Replace specific words based on the wordMap
            const newText = originalText.replace(/\b(\w+)\b/g, (word) => {
                const lowerWord = word.toLowerCase()
                const replacement = wordMap[lowerWord];
                if (replacement) {
                    // Decide whether to replace word or not
                    const randomNum = Math.floor(Math.random() * 2); // 50/50
                    if (randomNum === 0) { // Outcome = 0 || 1
                        return word;
                    }

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
            replaceWordsInElement(childNode, wordMap, excludedTags, observer);
        }
    }

    // Remove intersection observer
    observer.unobserve(element)
};

async function main() {
    const currentDomain = await getCurrentTabDomain()
    const tempIgnoredDomains = await getData('ignoredDomains')
    const ignoredDomains = tempIgnoredDomains === null ? [] : tempIgnoredDomains;
    const applyContentScript = await getData('applyContentScript')
    if (applyContentScript === 'false' || ignoredDomains.includes(currentDomain)) {
        return
    }

    console.log("Lingo Assist content script activated");

    const wordMap = await returnTranslationMap();
    console.log(wordMap)

    // Options for the Intersection Observer
    const intersectionOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5, // Trigger when at least 50% of the element is visible
    };

    // Exlcuded elements
    const excludedTags = ['a', 'span']

    // Create an Intersection Observer
    const intersectionObserver = new IntersectionObserver((entries) => intersectionCallback(entries, wordMap, excludedTags, intersectionObserver), intersectionOptions);

    // Find and observe target elements (e.g., all paragraphs)
    const targetElements = document.querySelectorAll('p');
    targetElements.forEach(element => intersectionObserver.observe(element));
}

main()