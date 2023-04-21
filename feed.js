var sharedMomentsArea = document.querySelector('#shared-moments')
function createCard() {
    var cardWrapper = document.createElement('div')
    cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp'
    var cardTitle = document.createElement('div')
    cardTitle.className = 'mdl-card__title'
    cardTitle.style.backgroundImage = 'url("/src/images/sf-boat.jpg")'
    cardTitle.style.backgroundSize = 'cover'
    cardTitle.style.height = '180px'
    cardWrapper.appendChild(cardTitle)
    var cardTitleTextElement = document.createElement('h2')
    cardTitleTextElement.className = 'mdl-card__title-text'
    cardTitleTextElement.textContent = '台北板橋一日遊'
    cardTitle.appendChild(cardTitleTextElement)
    var cardSupportingText = document.createElement('div')
    cardSupportingText.className = 'mdl-card__supporting-text'
    cardSupportingText.textContent = '在台北板橋'
    cardSupportingText.style.textAlign = 'center'
    cardWrapper.appendChild(cardSupportingText)
    componentHandler.upgradeElement(cardWrapper)
    sharedMomentsArea.appendChild(cardWrapper)
}

// 「https://httpbin.org/get」這段之後會改成我們的 server
fetch('https://httpbin.org/get')
    .then(function (res) {
        return res.json()
    })
    .then(function (data) {
        createCard()
    })
    .catch((error) => {
        console.log(error)
    })
