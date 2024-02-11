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
 * @param {string} key - key we want to access
 * @return {Promise<Object|Error>} - 
*/
export async function getData(key) {
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

        return true;
    } catch (error) {
        console.error('Error translating', error)
        return false
    }
}

/**
 * @return {Promise<string>}
 */
export async function getCurrentTabDomain() {
    try {
        const res = await chrome.runtime.sendMessage({ type: 'getCurrentTabDomain' })
        return res
    } catch (error) {
        console.error(`Error getting current tab`, error);
    }
}