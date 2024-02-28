export default function handleGameRedirect() {
    // Game redirect
    const gameBtn = document.querySelector('.game-btn')
    gameBtn.addEventListener('click', function () {
        window.open('../game/index.html', '_blank');
    })
}