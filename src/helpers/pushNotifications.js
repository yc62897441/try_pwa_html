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

// function displayConfirmNotification() {
//     const options = {
//         body: '您已成功訂閱我們的推播服務!',
//     }
//     new Notification('成功訂閱!!', options)
// }

function displayConfirmNotification() {
    if ('serviceWorker' in navigator) {
        window.alert('serviceWorker in navigator')
        const options = {
            body: '您已成功訂閱我們的推播服務!',
        }
        navigator.serviceWorker.ready.then(function (sw) {
            sw.showNotification('成功訂閱!! (from Service Worker)', options)
        })
    } else {
        window.alert('serviceWorker nottttttttttt in navigator')
    }
}
