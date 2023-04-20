// let mainUrl = '/try_pwa_html'
let filesToCache = [
    '/', 
    '/src/main.css', 
    '/src/assets/img/checklist.png', 
    '/src/assets/img/plus.png', 
    '/src/assets/img/check.png', 
    '/src/assets/img/circle-outline.png', 
    '/src/assets/img/close.png', 
    '/index.html'
]
if (location?.host && !location?.host.includes('127.0.0.1')) {
    filesToCache = filesToCache.map((item) => {
        console.log('/try_pwa_html' + item)
        return '/try_pwa_html' + item
    })
} else {
    console.log('location?.host', location?.host )
}
// '/{repository}/',   
// const filesToCache = [
//     '/', 
//     '/src/main.css', 
//     '/src/assets/img/checklist.png', 
//     '/src/assets/img/plus.png', 
//     '/src/assets/img/check.png', 
//     '/src/assets/img/circle-outline.png', 
//     '/src/assets/img/close.png', 
//     '/index.html'
// ]
// const filesToCache = [
//     `${mainUrl}/`, 
//     `${mainUrl}/src/main.css`, 
//     `${mainUrl}/src/assets/img/checklist.png`, 
//     `${mainUrl}/src/assets/img/plus.png`, 
//     `${mainUrl}/src/assets/img/check.png`, 
//     `${mainUrl}/src/assets/img/circle-outline.png`, 
//     `${mainUrl}/src/assets/img/close.png`, 
//     `${mainUrl}/index.html`
// ]
const cacheName = 'todolist-v1'

console.log('sw.js')

// install
// 在 install 裡面要透過 Cache Storage（非同步）把所有靜態檔案 Cache 到瀏覽器中
self.addEventListener('install', (event) => {
    console.log('installing…')
    event.waitUntil(
        // 使用 CacheStorage(caches) 的 open 方法來取得 cache 物件，如果瀏覽器內原本就有儲存，則會取得原本的，如果沒有則會建立一個新的 cache 物件並取得。
        caches.open(cacheName).then((cache) => {
            console.log('Caching app ok, cache:', cache)

            // Cache 物件的 addAll 方法，會傳入 request URL 的陣列並返回一個 Promise 物件。
            // cache.addAll 會去取得所有 URL 的 response object 並儲存到該 cache 中，把 URL 當作 key，response object 當作 value。
            return cache.addAll(filesToCache)
        })
    )
})

// activate
// 為了避免 Fetch 到的資料會一直被 Cache 住，不會自動更新，所以我們必須清除舊的 Cache。
self.addEventListener('activate', (event) => {
    console.log('now ready to handle fetches!')
    event.waitUntil(
        // caches.keys() 是 caches 的 API，負責的工作是把所有的 cacheName 取出來，回傳的 cacheNames 是個 Array，是一個 Array、裡面的元素是 String。
        caches.keys().then(function (cacheNames) {
            // cacheNames.map 產生 Array，map 出來的 item 去判斷是不是等於 cacheName，如果不等於就刪除 cached 檔案。
            const promiseArr = cacheNames.map(function (item) {
                if (item !== cacheName) {
                    return caches.delete(item) // Delete that cached file
                }
            })
            return Promise.all(promiseArr)
        })
    )
})
// 在使用 service worker 時，activate event 會在以下幾種情況下被觸發：
// 1. 新版本的 service worker 安裝完成後，之前的 service worker 就會進入到 activate 狀態。這樣可以確保新的 service worker 確實取代了舊的 service worker。
// 2. 在瀏覽器關閉再重新啟動時，瀏覽器會重新啟動 service worker。這樣可以確保 service worker 在重新啟動後能夠運行。
// 3. 在 service worker 的檔案內容有任何更動時，例如改變 cache 名稱、更新 cache 內容等等，都會觸發 activate event。
// 在 activate event 中，可以進行一些資源釋放、cache 清理等等操作，以確保新的 service worker 正確運行。例如，可以清除舊的 cache，避免佔用過多的磁碟空間，同時也可以加載新的 cache，以保證在下次網頁請求時緩存資源正確地更新。

// fetch
// 第一次進入網站，因為 Service Worker 還沒有被註冊，而我們的 request 會在 Service Worker 註冊完成進入到 activate 狀態之前就發送，所以通常第一次進入網站不會攔截到任何的 fetch 事件。
self.addEventListener('fetch', (event) => {
    // console.log('now fetch!')
    // console.log('event.request:', event.request)
    // console.log('[ServiceWorker] Fetch', event.request.url)

    // const dataUrl = 'http://localhost:3000'
    event.respondWith(
        caches.match(event.request).then(function (response) {
            // 如果存在 cached 過的 response 資料，則將其回傳
            // 否則，使用 fetch 把 HTTP request 真的送出，在收到 response 後存到 cache，再回傳
            return (
                response ||
                fetch(event.request).then((res) =>
                    // 存 caches 之前，要先打開 caches.open(dataCacheName)
                    caches.open(cacheName).then(function (cache) {
                        console.log('fetch event.request', event.request)
                        // cache.put(key, value) 下一次 caches.match 會對應到 event.request
                        cache.put(event.request, res.clone())
                        return res
                    })
                )
            )
        })
    )
})
