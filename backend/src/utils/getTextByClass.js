const { Parser, DomHandler } = require('htmlparser2');

/**
 * Parses the provided HTML, finds elements with a specific class,
 * and returns their combined inner text.
 *
 * @param {string} html - The HTML string to parse.
 * @param {string} className - The class name to search for in the HTML.
 * @returns {string} - The combined inner text of elements with the specified class.
 */
module.exports = function getTextByClass(html, className) {
    let elements;
    // Create a handler to handle the parsed elements
    const handler = new DomHandler((error, dom) => {
        if (error) {
            console.error('Error:', error);
        } else {
            // Traverse the DOM to find elements with a specific class
            elements = findElementsByClass(dom, className);
        }
    });

    // Create a parser with the handler
    const parser = new Parser(handler);

    // Parse the HTML
    parser.write(html);
    parser.end();

    const text = getNodeInnerText(elements)
    return text
}

/**
 * Finds elements by class in the provided DOM structure.
 *
 * @param {Array<Object>} dom - The DOM structure to search for elements.
 * @param {string} targetClass - The class name to search for in the elements.
 * @returns {Array<Object>} - An array of elements with the specified class.
 */
function findElementsByClass(dom, targetClass) {
    const elements = [];

    function traverse(node) {
        if (node.type === 'tag' && node.attribs && node.attribs.class && node.attribs.class.includes(targetClass)) {
            elements.push(node);
        }

        if (node.children) {
            for (const child of node.children) {
                traverse(child);
            }
        }
    }

    // Traverse the DOM
    for (const node of dom) {
        traverse(node);
    }

    return elements;
}

/**
 * Retrieves the combined inner text of the provided nodes.
 * 
 * @param {Array<Object>} nodes - An array of nodes to extract inner text from.
 * @returns {string} - The combined inner text of the provided nodes.
 */
function getNodeInnerText(nodes) {
    let string = ''

    function traverse(node) {
        if (node.data) {
            string += node.data;
        }

        if (node.children) {
            for (const child of node.children) {
                traverse(child)
            }
        }
    }

    if (nodes.length !== 0) {
        traverse(nodes[0])
    }

    return string.trim()
}