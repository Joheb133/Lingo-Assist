// All functions send messages to background script

/**
 * @return {Promise<true|Error>}
*/
export async function syncDuolingo() {
    try {
        const combinedISO = await chrome.runtime.sendMessage({ type: 'syncDuolingo' });
        if (combinedISO.error) {
            throw new Error(combinedISO.error);
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
        if (!res.isData) {
            throw new Error(res.error);
        }
        return res.data;
    } catch (error) {
        console.error(`Error returning vocab on ${combinedISO}.`, error);
        return false
    }
}