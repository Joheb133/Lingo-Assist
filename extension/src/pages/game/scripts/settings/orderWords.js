export function orderByAlphabet(vocabEntries, reverse = false) {
    return vocabEntries.slice().sort(([wordA], [wordB]) => {
        return reverse ? wordB.localeCompare(wordA) : wordA.localeCompare(wordB);
    });
}

export function orderByStrength(vocabEntries, reverse = false) {
    return vocabEntries.slice().sort((a, b) => {
        const strengthA = a[1][0].strength;
        const strengthB = b[1][0].strength;

        return reverse ? strengthA - strengthB : strengthB - strengthA;
    });
}

// Least strongest to most strongest
export function orderByLastPracticed(vocabEntries, reverse = false) {
    return vocabEntries.slice().sort((a, b) => {
        const strengthA = a[1][0]['last_practiced_ms'];
        const strengthB = b[1][0]['last_practiced_ms'];

        return reverse ? strengthA - strengthB : strengthB - strengthA;
    })
}