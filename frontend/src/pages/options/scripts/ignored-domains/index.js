import { getData } from "../../../../messages.js"

// Handle functionality and gui stuff for ignored domains section
export default async function ignoredDomains() {
    const ignoredDomainArr = await getData('ignoredDomains')

    if (ignoredDomainArr === null) {
        chrome.storage.local.set({ 'ignoredDomains': [] })
    }

    const domainTextArea = document.querySelector('.ignore-domain-container textarea')
    const ignoreDomainSubmit = document.querySelector('.ignore-domain-container #submit-btn')
    const resetDomainSubmit = document.querySelector('.ignore-domain-container #reset-btn')

    // Display domains
    domainTextArea.value = ignoredDomainArr.length > 0 ? ignoredDomainArr.join('\n') : ''

    // Update domains
    ignoreDomainSubmit.addEventListener('click', () => {
        if (domainTextArea.value.length === 0) return
        const domainArr = domainTextArea.value.split('\n')
        chrome.storage.local.set({ 'ignoredDomains': domainArr })
    })

    resetDomainSubmit.addEventListener('click', () => {
        chrome.storage.local.set({ 'ignoredDomains': [] })
        domainTextArea.value = ''
    })
}