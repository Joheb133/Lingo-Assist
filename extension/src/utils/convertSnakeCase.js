/**
 * Snake snake_case to Latin script
 * @param {string} string 
 * @param {boolean} capitalizeFirstChar 
 * @returns {string}
 */
export default function convertSnakeCase(string, capitalizeFirstChar = false) {
    // replace underscore with space
    let formattedText = string.replace(/_/g, ' ')
    formattedText = capitalizeFirstChar ? formattedText.charAt(0).toUpperCase() + formattedText.slice(1) : formattedText;

    return formattedText
}
