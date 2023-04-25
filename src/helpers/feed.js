var sharedMomentsArea = document.querySelector('#shared-moments')
function createCard() {
    var cardWrapper = document.createElement('div')
    cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp'
    var cardTitle = document.createElement('div')
    cardTitle.className = 'mdl-card__title'
    // cardTitle.style.backgroundImage = 'url("./src/assets/img/sf-boat.jpg")'
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
function clearCards() {
    while (sharedMomentsArea.hasChildNodes()) {
        sharedMomentsArea.removeChild(sharedMomentsArea.lastChild)
    }
}

// Cache then Network Strategies
// 1.一開始我們直接用Javascript去存取cache中的資源，同時也透過service worker來攔截發出的fetch request。
// 2.若cache中有該資源，則直接會傳給用戶。另外service worker也在有網路連線的情形下去向外部獲取資源。
// 3.service worker成功地從網路獲取該資源。
// 4.接著透過dynamic caching將該資源暫存到cache中，以便下次訪問該資源，能更快速地回覆給用戶。
// 5.最後service worker將fetch回來的response回傳到頁面。
const url = 'https://httpbin.org/get' // 我們就是要從該外部 server 的 API 獲取資源
let networkDataReceived = false // 這邊為了避免我同時成功地從「cache」和「網路上」獲取該資源，重複執行了createCards()，我使用 networkDataReceived 這個布林變數來去做判斷。當fetch API先回傳我們要的資源，我們只需要針對這個回傳的資料來建立我們的card(貼文)。就算cache裡存在我們要的資源也不必再建立一個card。
fetch(url)
    .then(function (res) {
        return res.json()
    })
    .then(function (data) {
        networkDataReceived = true
        // console.log('From Web', data)
        clearCards()
        createCard()
    })

if ('caches' in window) {
    caches
        .match(url)
        .then(function (response) {
            if (response) {
                return response.json()
            }
        })
        .then(function (data) {
            // console.log('From Cache', data)
            if (!networkDataReceived) {
                clearCards()
                createCard()
            }
        })
}

// 使用 Cache then Network Strategies
// 抓取資料，這個 event.request.url 取得的資料會被存到 indexed DB
// 1. 一開始去 indexed DB 存取資源，同時也透過 service worker 來攔截發出的 fetch request。
// 2. 若 indexed DB 中有該資源，則直接會傳給用戶。另外 service worker 也在有網路連線的情形下去向外部獲取資源。
// 3. service worker 成功地從網路獲取該資源。
// 4. 接著將該資源暫存到 indexed DB 中，以便下次訪問該資源，能更快速地回覆給用戶。
// 5. 最後 service worker 將 fetch 回來的 response 回傳到頁面。
let tripDiaryNetworkDataReceived = false
fetch('https://trip-diary-f56de.firebaseio.com/posts.json')
    .then((res) => res.json())
    .then((json) => {
        tripDiaryNetworkDataReceived = true
        // render 畫面
        // ...
        return json
    })
    .catch((err) => {
        console.log(err)
    })
if ('indexedDB' in window) {
    readAllData('posts').then(function (data) {
        if (!tripDiaryNetworkDataReceived) {
            // console.log('From IndexedDB', data)
            // render 畫面
            // ...
        }
    })
}
