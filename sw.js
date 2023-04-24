const cacheName = 'todolist-v20'
const cacheDynamicName = 'dynamic-v20' // 動態資源是指「不是固定」且「不斷變動」的資源，有可能是當用戶訪問時才會去獲取的。

// 初次進入頁面 or 進入首頁時，需要存到 server worker 的 files 清單
const globalFilesToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/src/main.css',
    '/src/assets/img/checklist.png',
    '/src/helpers/offline.js',
    '/src/helpers/main.js',
    '/src/helpers/createHeader.js',
    '/src/helpers/initServerWorker.js',
    '/src/pages/offline.html',
]
const homepageFilesToCache = [
    '/src/assets/img/check.png',
    '/src/assets/img/circle-outline.png',
    '/src/assets/img/close.png',
    '/src/assets/img/plus.png',
]
const filesToCache = globalFilesToCache.concat(homepageFilesToCache)

// 使用 Cache then Network Strategies 策略進行快取，資源清單
const CacheThenNetworkFiles = ['https://httpbin.org/get', 'http://localhost:3000/todolist']

// 如果不是 local 端，要加上 github page repository 的 url
if (location?.host && !location?.host.includes('127.0.0.1')) {
    filesToCache = filesToCache.map((item) => {
        return '/try_pwa_html' + item
    })
}

// install
// 在 install 裡面要透過 Cache Storage（非同步）把所有靜態檔案 Cache 到瀏覽器中
self.addEventListener('install', (event) => {
    console.log('installing…')
    event.waitUntil(
        // 使用 CacheStorage(caches) 的 open 方法來取得 cache 物件，如果瀏覽器內原本就有儲存，則會取得原本的，如果沒有則會建立一個新的 cache 物件並取得。
        caches.open(cacheName).then((cache) => {
            // console.log('Caching app ok, cache:', cache)

            // Cache 物件的 addAll 方法，會傳入 request URL 的陣列並返回一個 Promise 物件。
            // cache.addAll 會去取得所有 URL 的 response object 並儲存到該 cache 中，把 URL 當作 key，response object 當作 value。
            return cache.addAll(filesToCache)
        })
    )
})

// activate
// 為了避免 Fetch 到的資料會一直被 Cache 住，不會自動更新，所以我們必須清除舊的 Cache。
// 在 service worker 的 activate 階段，只有當在用戶關閉所有頁面，並打開新的應用程式後才會執行此操作，所以在這裡更新 cache 才是安全的。
self.addEventListener('activate', (event) => {
    console.log('activate...')
    event.waitUntil(
        // caches.keys() 是 caches 的 API，負責的工作是把所有的 cacheName 取出來，回傳的 cacheNames 是個 Array，是一個 Array、裡面的元素是 String。
        // caches.keys() 會回傳一個「sub-cache 名稱所形成的字串陣列」，之後我將移除的部分寫在 Promise.all() 裡面，確保全部執行完清除 cache 的邏輯後才會回傳。
        caches.keys().then(function (cacheNames) {
            // cacheNames.map 產生 Array，map 出來的 item 去判斷是不是等於 cacheName，如果不等於就刪除 cached 檔案。
            const promiseArr = cacheNames.map(function (item) {
                if (item !== cacheName && item !== cacheDynamicName) {
                    return caches.delete(item) // Delete that cached file
                }
            })
            return Promise.all(promiseArr)
        })
    )
    return self.clients.claim()
})
// 在使用 service worker 時，activate event 會在以下幾種情況下被觸發：
// 1. 新版本的 service worker 安裝完成後，之前的 service worker 就會進入到 activate 狀態。這樣可以確保新的 service worker 確實取代了舊的 service worker。
// 2. 在瀏覽器關閉再重新啟動時，瀏覽器會重新啟動 service worker。這樣可以確保 service worker 在重新啟動後能夠運行。
// 3. 在 service worker 的檔案內容有任何更動時，例如改變 cache 名稱、更新 cache 內容等等，都會觸發 activate event。
// 在 activate event 中，可以進行一些資源釋放、cache 清理等等操作，以確保新的 service worker 正確運行。例如，可以清除舊的 cache，避免佔用過多的磁碟空間，同時也可以加載新的 cache，以保證在下次網頁請求時緩存資源正確地更新。

// fetch
// 第一次進入網站，因為 Service Worker 還沒有被註冊，而我們的 request 會在 Service Worker 註冊完成進入到 activate 狀態之前就發送，所以通常第一次進入網站不會攔截到任何的 fetch 事件。
self.addEventListener('fetch', function (event) {
    // 依據 request 的 url，決定使用不同的 cache 策略
    if (CacheThenNetworkFiles.indexOf(event.request.url) > -1) {
        // Cache then Network Strategies
        // 1.一開始我們直接用Javascript去存取cache中的資源，同時也透過service worker來攔截發出的fetch request。
        // 2.若cache中有該資源，則直接會傳給用戶。另外service worker也在有網路連線的情形下去向外部獲取資源。
        // 3.service worker成功地從網路獲取該資源。
        // 4.接著透過dynamic caching將該資源暫存到cache中，以便下次訪問該資源，能更快速地回覆給用戶。
        // 5.最後service worker將fetch回來的response回傳到頁面。
        event.respondWith(
            caches.open(cacheDynamicName).then(function (cache) {
                return fetch(event.request).then(function (res) {
                    cache.put(event.request, res.clone())
                    return res
                })
            })
        )
    } else {
        // Cache with Network Fallback Strategies
        // 缺點：這個策略會將所有存取到的資源添加到 cache 中，這其實對於「會經常更新的資源」是不太適合的。因為我們預設的情形下不會有網路連線的，「經常更新的資源」可能會由於來不及更新 cache 而導致還是返回舊版本 cache 中的資源。
        event.respondWith(
            caches.match(event.request).then(function (response) {
                // 如果存在 cached 過的 response 資料，則將其回傳
                // 否則，使用 fetch 把 HTTP request 真的送出，在收到 response 後存到 cache，再回傳
                if (response) {
                    return response
                } else {
                    return fetch(event.request)
                        .then(function (res) {
                            return caches.open(cacheDynamicName).then(function (cache) {
                                // 在 put 方法的第二個參數，我不直接使用 res 而是 res.clone() 的原因是 response object 只能被使用一次，也就是說我如果在 cache.put 使用 res 的話，下一行要 return res 時，是回傳一個空值。
                                cache.put(event.request.url, res.clone())
                                return res
                            })
                        })
                        .catch(function (err) {
                            return caches.open(cacheName).then(function (cache) {
                                return cache.match('/src/pages/offline.html')
                            })
                        })
                }
            })
        )
    }
})

// add 方法會自動會發出 request(也就是我們帶進去的參數)，並將 response 加入 cache 中。而 put 方法則是只負責將我們輸入的兩個參數(也就是 request 和 response)加入到 cache 中，它並不會真正地對外發出 request。
