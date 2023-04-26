// 監聽表單
const form = document.querySelector('#background-sync-form')
form.addEventListener('submit', function (event) {
    event.preventDefault()
    const account = event.target[0].value
    const password = event.target[1].value
    const postData = {}

    // 例外處理，避免表單欄位為空白
    if (account.trim() === '' || password.trim() === '') {
        window.alert('請輸入帳號、密碼')
        return
    }

    postData.account = account
    postData.password = password

    post(postData)
})

// 處理 post request
function post(postData) {
    // 如果支援 serviceWorker 與 SyncManager，則先把 post request 的資訊存到 indexed DB。
    // 接著使用 ServiceWorkerRegistration interface 的 sync 屬性會返回引用 SyncManager interface 的接口，然後使用 SyncManager.register() 註冊一個 synchronization event，該事件在網路可連線時會在 service worker 觸發一個 sync event。
    // 之後在 sw.js 監聽 sync 事件 self.addEventListener('sync', ...)，此時如果正處於連線狀態、或從離線切換到連線狀態時，就會觸發事件的 cb function 會把 indexed DB 中的資訊取出來發送 post
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready.then((sw) => {
            const randomKey = Math.floor(Math.random() * 10000)
            writeData('sync-posts', { key: randomKey, postData: postData }).then(function () {
                // ServiceWorkerRegistration interface 的 sync 屬性會返回引用 SyncManager interface 的接口，然後使用 SyncManager.register() 註冊一個 synchronization event，該事件在網路可連線時會在 service worker 觸發一個 sync event。
                // The sync property of the ServiceWorkerRegistration interface returns a reference to the SyncManager interface, which manages background synchronization processes.
                // The SyncManager.register method of the SyncManager interface registers a synchronization event, triggering a sync event inside the associated service worker as soon as network connectivity is available.
                return sw.sync.register('sync-new-post')
            })
        })
    } else {
        // 如果不支援 serviceWorker 與 SyncManager，則直接發送 post request
        fetch('https://trip-diary-f56de.firebaseio.com/posts.json', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify(postData),
        })
    }
}
