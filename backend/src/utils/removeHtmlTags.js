const { Parser } = require('htmlparser2');

/**
 * Removes HTML tags from the provided HTML string and returns the plain text.
 *
 * @param {string} htmlString - The HTML string containing tags to be removed.
 * @returns {string} - The plain text without HTML tags.
 */
module.exports = function removeHtmlTags(htmlString) {
    let result = '';

    const parser = new Parser({
        ontext: (text) => {
            result += text;
        }
    });

    parser.write(htmlString);
    parser.end();

    return result.trim();
}