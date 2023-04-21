// <!-- 建立 header nav 連結。 -->
// 如果不是 local 端，要加上 github page repository 的 url
let mainUrl = '/'
if (location?.host && !location?.host.includes('127.0.0.1')) {
    mainUrl = '/try_pwa_html/'
}
const header = document.querySelector('.header')

header.innerHTML += `
    <div>
        <a href="${mainUrl}">Home</a>
        <a href="${mainUrl}help.html">Help</a>
    </div>`
