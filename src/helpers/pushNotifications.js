const enableNotificationButtons = document.querySelectorAll('.enable-notifications')

// 如果瀏覽器支援 Notification，則在畫面上顯示 Notification button 並掛載事件監聽。
if ('Notification' in window) {
    for (let i = 0; i < enableNotificationButtons.length; i++) {
        enableNotificationButtons[i].style.display = 'inline-block'
        enableNotificationButtons[i].addEventListener('click', askForNotificationPermission)
    }
}

function askForNotificationPermission() {
    Notification.requestPermission(function (result) {
        // 這裡 result 只會有兩種結果：一個是用戶允許(granted)，另一個是用戶封鎖(denied)
        if (result === 'denied') {
            window.alert('No notification permission granted!')
        } else if (result === 'granted') {
            window.alert(`result: ${result}`)
            displayConfirmNotification()
        } else {
            window.alert(`result: ${result}`)
        }
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
            lang: 'zh-TW',   // BCP 47
            vibrate: [100, 50, 200],
            badge: './src/assets/img/plus.png',
            tag: 'confirm-notification',
            renotify: true,
            actions: [
                // 這裡使用者選擇不同的 action，會在 sw.js 裡面做不同的處理
                { action: 'confirm', title: '收到', icon: './src/assets/img/circle-outline.png' },
                { action: 'cancel', title: '取消', icon: './src/assets/img/close.png' }
            ]
        }
        navigator.serviceWorker.ready.then((sw) => {
            // showNotification(title, options) The title that must be shown within the notification
            sw.showNotification('成功訂閱!! (from Service Worker)', options)
        })
    } else {
        window.alert('serviceWorker nottttttttttt in navigator')
    }
}
