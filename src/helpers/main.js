;(function (window, document) {
    let todoList = []
    const todoListDOM = document.getElementById('todoList')
    const todoInputDOM = document.getElementById('todoInput')
    const addBtn = document.getElementById('add')

    // 把 Todo 資料渲染畫面
    function renderTodoList(todoList) {
        const html = todoList
            .map(
                (item, index) => `
                <div class="list-content" data-id="${item.id}">
                    <img class="button-img toggle-btn" src="${
                        item.isComplete
                            ? './src/assets/img/check.png'
                            : './src/assets/img/circle-outline.png'
                    }" alt="" data-id="${item.id}" />
                    <div class="${
                        item.isComplete ? 'content content-finish' : 'content content-unfinish'
                    }" data-id="${item.id}">${item.desc}</div>
                    <img class="button-img delete-btn" src="./src/assets/img/close.png" alt="" data-id="${
                        item.id
                    }" />
                </div>
            `
            )
            .join('')
        todoListDOM.innerHTML = html
    }

    // 使用 Cache then Network Strategies
    // 1.一開始我們直接用Javascript去存取cache中的資源，同時也透過service worker來攔截發出的fetch request。
    // 2.若cache中有該資源，則直接會傳給用戶。另外service worker也在有網路連線的情形下去向外部獲取資源。
    // 3.service worker成功地從網路獲取該資源。
    // 4.接著透過dynamic caching將該資源暫存到cache中，以便下次訪問該資源，能更快速地回覆給用戶。
    // 5.最後service worker將fetch回來的response回傳到頁面。
    let networkDataReceived = false
    // 取得待辦事項清單（GET）
    function getTodos() {
        // console.log('發送 API 抓取資料')
        fetch('http://localhost:3000/todolist')
            .then((res) => res.json())
            .then((json) => {
                networkDataReceived = true
                todoList = []
                todoList = todoList.concat(json)
                renderTodoList(todoList) // render todoList
                // console.log('成功抓取 API 資料')
            })
            .catch((err) => {
                console.log(err)
            })
    }
    getTodos()
    if ('caches' in window) {
        caches
            .match('http://localhost:3000/todolist')
            .then(function (response) {
                if (response) {
                    return response.json()
                }
            })
            .then(function (data) {
                if (!networkDataReceived) {
                    todoList = []
                    todoList = todoList.concat(data)
                    renderTodoList(todoList)
                }
            })
    }

    // TODO: 離線 post、put、delete 的 server worker
    // Post New Todo 事件
    function postNewTodo(value) {
        const postData = { desc: value, isComplete: false }
        fetch('http://localhost:3000/todolist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData),
        })
            .then((res) => res.json())
            .then((json) => {
                todoList.push(json)
                renderTodoList(todoList)
                todoInputDOM.value = '' // 清空輸入框
            })
    }
    todoInputDOM.addEventListener('keydown', (event) => {
        // 監聽 input 的 keydown(enter) 事件，觸發 postNewTodo()
        if (event.keyCode === 13 && event.target.value) {
            postNewTodo(event.target.value)
        }
    })
    addBtn.addEventListener('click', (event) => {
        // 監聽 add Btn 的 click 事件，觸發 postNewTodo()
        if (todoInputDOM.value) {
            postNewTodo(todoInputDOM.value)
        }
    })

    // Put Todo 事件 + DELETE Todo 事件
    // Put Todo 事件
    function putTodo(id) {
        let postData = {}
        todoList.forEach((item) => {
            if (Number(item.id) === Number(id)) {
                // 切換『已完成』和『未完成』狀態
                item.isComplete = !item.isComplete
                postData = item
            }
        })
        fetch(`http://localhost:3000/todolist/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData),
        })
            .then((res) => res.json())
            .then((json) => {
                renderTodoList(todoList)
            })
    }
    // DELETE Todo 事件
    function deleteTodo(id) {
        fetch(`http://localhost:3000/todolist/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((res) => res.json())
            .then((json) => {
                todoList = todoList.filter((item) => Number(item.id) !== Number(id))
                renderTodoList(todoList)
            })
    }
    todoListDOM.addEventListener('click', (event) => {
        // 監聽 toggle Btn 與 delete btn 的 click 事件，觸發 putTodo() 或 deleteTodo()
        if (event.target.classList.contains('toggle-btn')) {
            putTodo(parseInt(event.target.dataset.id))
        } else if (event.target.classList.contains('delete-btn')) {
            deleteTodo(parseInt(event.target.dataset.id))
        }
    })
})(window, document)
