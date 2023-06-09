const enableNotificationButtons = document.querySelectorAll('.enable-notifications')

// 如果瀏覽器支援 Notification，則在畫面上顯示 Notification button 並掛載事件監聽。
if ('Notification' in window) {
    for (let i = 0; i < enableNotificationButtons.length; i++) {
        enableNotificationButtons[i].style.display = 'inline-block'
        enableNotificationButtons[i].addEventListener('click', askForNotificationPermission)
    }
}

function askForNotificationPermission() {
    Notification.requestPermission(async function (result) {
        // 這裡 result 只會有兩種結果：一個是用戶允許(granted)，另一個是用戶封鎖(denied)
        if (result === 'denied') {
            window.alert('No notification permission granted!')
        } else if (result === 'granted') {
            const configurePushSubResult = await configurePushSub()

            if (configurePushSubResult === true) {
                // 訂閱成功
                displayConfirmNotification()
            } else if (configurePushSubResult === false && 'serviceWorker' in navigator) {
                // 發送訂閱過程失敗
                displayConfirmNotification()
            } else if (configurePushSubResult === null) {
                // 不支援 serviceWorker
                displayConfirmNotification()
            }
        } else {
            window.alert(`result: ${result}`)
        }
    })
}

// 為用戶建立訂閱
async function configurePushSub() {
    if (!('serviceWorker' in navigator)) {
        return null
    }
    let reg = null
    return await navigator.serviceWorker.ready
        // 透過 service worker 來創建，所以要先取得已經註冊完成的service worker(這裡把它命名為swreg)
        .then(function (swreg) {
            reg = swreg
            return swreg.pushManager.getSubscription() // 取得訂閱資訊
        })
        .then(function (sub) {
            if (sub === null) {
                // Create a new subscription
                // 向瀏覽器供應商(Google、Mozilla)創建一個訂閱時，它會回傳一個API endpoint url，之後我的server(後端)會將要推播的貼文資訊傳送到這個API
                // 為了避免任何人知道這個url後，就可以向我的用戶推播垃圾訊息。將userVisibleOnly這個property設為true，代表從我的server發出推播訊息時，只有該用戶會看到。
                // 加入「公鑰」，確保是來已訂閱用戶所發出的訊息
                const vapidPublicKey =
                    'BDIOql6aKK-00AGzVKggeN9LSpjGd2golLzuiCvmUG0NAIa3wi-FmG17HElLHhXtzQBQQ9faZmJ2MWW87VI8bgg' // 公鑰。要使用正確的公鑰，不然會跳錯誤訊息 DOMException: Failed to execute 'subscribe' on 'PushManager': The provided applicationServerKey is not valid. // IT邦文章的教案主的公鑰
                const convertedVapidPublicKey = urlBase64ToUint8Array(vapidPublicKey)

                // 向瀏覽器供應商 push server 發送訂閱訊息，並取得回傳之 Endpoint 等資訊。
                return reg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: convertedVapidPublicKey,
                })
            } else {
                // We have a subscription
            }
        })
        .then(function (newSub) {
            // 將瀏覽器供應商 push server 回傳之資訊，儲存到 firebase。
            // const firebaseUrl = 'https://trip-diary-f56de.firebaseio.com/subscriptions.json' // IT邦文章的教案主的 firebase
            const firebaseUrl =
                'https://trypwafirebase-dc254-default-rtdb.firebaseio.com/trip/subscriptions.json'
            return fetch(firebaseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify(newSub),
            })
        })
        .then(function (res) {
            if (res.ok) {
                return true
            } else {
                return false
            }
        })
        .catch(function (err) {
            console.log(err)
            return false
        })
}

// 在一般的 js code 執行「顯示通知」的動作
// function displayConfirmNotification() {
//     const options = {
//         body: '您已成功訂閱我們的推播服務!',
//     }
//     new Notification('成功訂閱!!', options)
// }

// 透過 service worker 來去執行「顯示通知」的動作
function displayConfirmNotification() {
    if ('serviceWorker' in navigator) {
        // https://ithelp.ithome.com.tw/articles/10225598
        // 增加 showNotification options 的選項設定
        const options = {
            body: '您已成功訂閱我們的推播服務!',
            icon: './src/assets/img/apple-icon-128x128.png',
            image: './src/assets/img/pexels-stephan-seeber-1261728-640.jpg',
            dir: 'ltr',
            lang: 'zh-TW', // BCP 47
            vibrate: [100, 50, 200],
            badge: './src/assets/img/plus.png',
            tag: 'confirm-notification',
            renotify: true,
            actions: [
                // 這裡使用者選擇不同的 action，會在 sw.js 裡面做不同的處理
                { action: 'confirm', title: '收到', icon: './src/assets/img/circle-outline.png' },
                { action: 'cancel', title: '取消', icon: './src/assets/img/close.png' },
            ],
        }
        navigator.serviceWorker.ready.then((sw) => {
            // showNotification(title, options) The title that must be shown within the notification
            sw.showNotification('成功訂閱!! (from Service Worker)', options)
        })
    } else {
        window.alert('serviceWorker nottttttttttt in navigator')
    }
}

// Web-Push
// Public base64 to Uint
function urlBase64ToUint8Array(base64String) {
    var padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    var base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')

    var rawData = window.atob(base64)
    var outputArray = new Uint8Array(rawData.length)

    for (var i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
}
