const { Parser } = require('htmlparser2');

module.exports = function removeHtmlTags(htmlString) {
    let result = '';

    const parser = new Parser({
        ontext: (text) => {
            result += text;
        },
    }, { decodeEntities: true });

    parser.write(htmlString);
    parser.end();

    return result.trim();
}