/**
 * Return a promise of a fetch request to Wiktionary
 * We request a specific word from Wiktionary, 
 * and only return data for the matching language code
 * @param {string} ISO language code
 * @param {string} word word to search up
 */

module.exports = async function getWiktionary(ISO, word) {

    const email = process.env.email
    const url = `https://en.wiktionary.org/api/rest_v1/page/definition/${word}&redirect=false`
    const options = {
        method: 'GET',
        headers: {
            'User-Agent': `dictionary/${email}`,
        }
    }

    return fetch(url, options)
        .then(res => {
            if (!res.ok) {
                throw new Error(res.statusText)
            }

            return res.json()
        })
        .then(json => json[ISO])
        .catch(err => err)
}