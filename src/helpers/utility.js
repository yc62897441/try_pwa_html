// [Day15] 使用indexedDB暫存Dynamic Data(Part2) https://ithelp.ithome.com.tw/articles/10222545
// 寫法有略為更新，請參閱 https://github.com/jakearchibald/idb#idbtransaction-enhancements

// 建立 DB
// 建立一個資料庫 1. 資料庫名稱、2. 資料庫版本[可以隨喜好設定，但不能相同]、3. callback function
const dbPromise = idb.openDB('post-store', 1, {
    upgrade(db) {
        if (!db.objectStoreNames.contains('posts')) {
            // 在 post-store 資料庫中新增一個「名為 posts 的 object store」
            // 第二個參數是要去設定在這個object store中，我們要以哪個欄位做為key值。
            db.createObjectStore('posts', { keyPath: 'id' })
        }
    },
})

// 寫入 indexed DB
function writeData(objectStore, data) {
    return dbPromise.then(function (db) {
        const tx = db.transaction(objectStore, 'readwrite') // first step 開啟資料庫和交易(transaction)
        const store = tx.objectStore(objectStore) // second step 建立物件存檔(object store)
        store.put(data) // third step 發出資料庫操作請求，例如新增(put)或取得(get)資料
        return tx.done
    })
}
