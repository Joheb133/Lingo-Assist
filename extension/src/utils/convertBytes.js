/**
 * convert bytes to KB or MB
 * @param {number} bytes
 * @returns {string}
 */

export function convertBytes(bytes) {
    let value, symbol
    if (bytes > 1048576) {
        value = 1048576
        symbol = 'MB'
    } else if (bytes > 1024) {
        value = 1024
        symbol = 'KB'
    } else {
        value = 1
        symbol = 'bytes'
    }

    const convertedBytes = Math.round(((bytes / value) * 10)) / 10

    return convertedBytes + ' ' + symbol
}