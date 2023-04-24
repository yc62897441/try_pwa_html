window.addEventListener('online', function () {
    console.log('now online')
    show()
})

window.addEventListener('offline', function () {
    console.log('now offline')
    show()
})

// window.addEventListener('onhashchange', function () {
//     console.log('now onhashchange')
//     show()
// })

// window.addEventListener('locationchange', function () {
//     console.log('now locationchange')
//     show()
// })

function clear() {
    const offlines = document.querySelectorAll('.offline')
    offlines.forEach((item) => item.remove())
}

// FIXME: devtool network 選 offline，在切換頁面時 navigator.onLine 仍然會是 true
function show() {
    if (!navigator.onLine) {
        clear()

        const body = document.querySelector('body')
        const offline = document.createElement('div')
        offline.classList.add('offline')
        offline.innerHTML = `
            <span>無網路連線</span>
            <span>「離線使用中」</span>
        `
        body.appendChild(offline)
    } else {
        clear()
    }
}
show()
setTimeout(() => {
    console.log('setTime out')
    show()
}, 1000)
