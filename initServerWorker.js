// 如果 window object 下沒有 Promise 的話，就將第三方所提供的 Promise 直接加入
if (!window.Promise) {
    window.Promise = Promise
}

// local 端使用
let registerUrl = '/sw.js'
let option = {}

// 如果不是 local 端，要加上 github page repository 的 url
if (!window.location.host.includes('127.0.0.1')) {
    registerUrl = '/try_pwa_html/sw.js'
    option = { scope: '/try_pwa_html/' }
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register(registerUrl, option)
        .then((reg) => console.log('完成 SW 設定!', reg))
        .catch((err) => console.log('Error!', err))
}

console.log('Server Worker 註冊完成')
