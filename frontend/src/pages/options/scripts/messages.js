// All functions send messages to background script

/**
 * @return {Promise<true|Error>}
*/
export async function syncDuolingo() {
    try {
        const combinedISO = await chrome.runtime.sendMessage({ type: 'syncDuolingo' });
        if (combinedISO.error) {
            throw combinedISO.error;
        }
        localStorage.setItem('combinedISO', combinedISO)
        return true;
    } catch (error) {
        console.error('Error syncing Duolingo.', error);
        return false
    }
}


/**
 * @param {string} combinedISO - learningISO_nativeISO used as key to access storage
 * @return {Promise<Object|Error>} - {word: translation}
*/
export async function getLocalVocab(combinedISO) {
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

/**
 * @param {string} combinedISO
 * @return {Promise<true|Error>}
 */
export async function requestTranslations(combinedISO) {
    try {
        const res = await chrome.runtime.sendMessage({ type: 'requestTranslations', ISO: combinedISO })
        if (res.error) {
            throw res.error
        }
        return res;
    } catch (error) {
        console.error('Error translating', error)
        return false
    }
}