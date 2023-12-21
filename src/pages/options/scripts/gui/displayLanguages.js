import { ISO_to_words } from '../../../../utils/ISO.js'

/**
 * Display native and learning language on page
 * @param {string} combinedISO - learningISO_nativeISO
*/

export default function displayLanguages(combinedISO) {
    const learningEl = document.getElementById('learning-language')
    const nativeEl = document.getElementById('native-language')

    const learningISO = combinedISO.split('_')[0]
    const nativeISO = combinedISO.split('_')[1]

    learningEl.innerText = ISO_to_words[learningISO]
    nativeEl.innerText = ISO_to_words[nativeISO]
}