
export function hideEndgamePopup() {
    const popupWindow = document.querySelector('.popup-window')
    // Show setting popup elements
    const settingsContainer = popupWindow.querySelector('.game-settings-container ')
    const settingsBtn = popupWindow.querySelector('.save-btn')
    const settingsPara = popupWindow.querySelector('.settings-title')
    settingsContainer.classList.remove('hidden')
    settingsContainer.classList.add('block')
    settingsBtn.classList.remove('hidden')
    settingsPara.classList.remove('hidden')

    // Hide endgame popup elements
    const endgameContainer = popupWindow.querySelector('.endgame-container')
    const endgameBtn = popupWindow.querySelector('.restart-btn')
    const endgamePara = popupWindow.querySelector('.endgame-title')
    endgameContainer.classList.add('hidden')
    endgameBtn.classList.add('hidden')
    endgamePara.classList.add('hidden')
}

export function hideSettingsPopup() {
    const popupWindow = document.querySelector('.popup-window')
    // Show endgame popupt elements
    const settingsContainer = popupWindow.querySelector('.game-settings-container ')
    const settingsBtn = popupWindow.querySelector('.save-btn')
    const settingsPara = popupWindow.querySelector('.settings-title')
    settingsContainer.classList.add('hidden')
    settingsContainer.classList.remove('block')
    settingsBtn.classList.add('hidden')
    settingsPara.classList.add('hidden')

    // Hide setting popup elements
    const endgameContainer = popupWindow.querySelector('.endgame-container')
    const endgameBtn = popupWindow.querySelector('.restart-btn')
    const endgamePara = popupWindow.querySelector('.endgame-title')
    endgameContainer.classList.remove('hidden')
    endgameBtn.classList.remove('hidden')
    endgamePara.classList.remove('hidden')
}