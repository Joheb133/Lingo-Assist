/**
 * @param {string} key - key we want to access
 * @return {Promise<Object|Error>} - 
 */
async function getData(key) {
    try {
        const res = await chrome.runtime.sendMessage({ type: 'getData', key });
        if (res === null) {
            console.error(`No data found on ${key}.`);
            return null;
        }
        return res;
    } catch (error) {
        console.error(`Error returning vocab on ${key}.`, error);
        return false;
    }
}

async function getCurrentTabDomain() {
    try {
        const res = await chrome.runtime.sendMessage({ type: 'getCurrentTabDomain' });
        return res;
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
    let formattedText = string.replace(/_/g, ' ');
    formattedText = capitalizeFirstChar ? formattedText.charAt(0).toUpperCase() + formattedText.slice(1) : formattedText;

    return formattedText;
}

// Function to reverse the structure
function reverseStructure(wordsObj) {
    const reversedData = {};

    for (const [word, dataArr] of Object.entries(wordsObj)) {
        for (const dataEl of dataArr) {
            // Ignore verbs and infinitives for now & don't transform words with a strength higher than 3
            if (dataEl.pos !== 'Verb' && dataEl.pos !== 'Infinitive' && dataEl.strength < 3) {
                // If the key doesn't exist, add it to the object above
                for (const translation of dataEl.translations) {
                    if (!reversedData.hasOwnProperty(translation)) {
                        reversedData[`${translation.toLowerCase()}`] = [];
                    }

                    let newWord = convertSnakeCase(word);
                    reversedData[`${translation.toLowerCase()}`].push(newWord);
                }
            }
        }
    }

    return reversedData;
}

async function returnTranslationMap() {
    const combinedISO = await getData('combinedISO');
    const localData = await getData(combinedISO);

    if (!localData) {
        console.error(`Error loading data on ISO = ${combinedISO}`);
        return false;
    }

    return reverseStructure(localData);
}

function replaceWordsInElement(element, wordMap, excludedTags) {
    const wordCounter = {};
    const childNodes = element.childNodes;

    for (let i = 0; i < childNodes.length; i++) {
        const childNode = childNodes[i];

        if (childNode.nodeType === Node.TEXT_NODE) {
            const originalText = childNode.textContent;

            // Replace specific words based on the wordMap
            const newText = originalText.replace(/\b(\w+)\b/g, (word) => {
                const lowerWord = word.toLowerCase();
                const replacement = wordMap[lowerWord];

                if (replacement) {
                    if (wordCounter[lowerWord] > 5) { // Limit transforms to less than 5
                        return word
                    }

                    // Div container for elements
                    const container = document.createElement('div');
                    container.classList.add('lingo-assist-container');

                    // Create a span element for the replaced word
                    const translationSpan = document.createElement('span');
                    translationSpan.classList.add('lingo-assist-span');

                    // Use different translations
                    wordCounter[lowerWord] !== undefined ? wordCounter[lowerWord]++ : wordCounter[lowerWord] = 1;
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
}

async function transformPageInChunks(wordMap, excludedTags, chunkSize, timeout) {
    const allParagraphs = document.querySelectorAll('p');
    const paragraphsCount = allParagraphs.length;

    let currentIndex = 0;

    function processNextChunk() {
        const endIndex = Math.min(currentIndex + chunkSize, paragraphsCount);

        for (let i = currentIndex; i < endIndex; i++) {
            replaceWordsInElement(allParagraphs[i], wordMap, excludedTags);
        }

        currentIndex = endIndex;

        if (currentIndex < paragraphsCount) {
            setTimeout(processNextChunk, timeout);
        }
    }

    processNextChunk();
}

async function main() {
    const currentDomain = await getCurrentTabDomain();
    const tempIgnoredDomains = await getData('ignoredDomains');
    const ignoredDomains = tempIgnoredDomains === null ? [] : tempIgnoredDomains;
    const applyContentScript = await getData('applyContentScript');

    if (applyContentScript === 'false' || ignoredDomains.includes(currentDomain)) {
        return;
    }

    console.log("Lingo Assist content script activated");

    const wordMap = await returnTranslationMap();
    const excludedTags = ['a', 'span']; // Tags to not transform
    const chunkSize = 20;
    const timeout = 2000;

    transformPageInChunks(wordMap, excludedTags, chunkSize, timeout);
}

main();
