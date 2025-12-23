/*
 * Simple IndexedDB key-value wrapper for caching large items.
 */
const DB_NAME = 'ag_cache_db'
const STORE_NAME = 'kv'
const DB_VERSION = 1

function openDB() {
    return new Promise((resolve, reject) => {
        const req = window.indexedDB.open(DB_NAME, DB_VERSION)
        req.onupgradeneeded = () => {
            const db = req.result
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME)
            }
        }
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error)
    })
}

async function get(key) {
    try {
        const db = await openDB()
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readonly')
            const store = tx.objectStore(STORE_NAME)
            const req = store.get(key)
            req.onsuccess = () => resolve(req.result)
            req.onerror = () => reject(req.error)
        })
    } catch (e) {
        console.error('indexedCache.get error', e)
        return null
    }
}

async function set(key, value) {
    try {
        const db = await openDB()
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite')
            const store = tx.objectStore(STORE_NAME)
            const req = store.put(value, key)
            req.onsuccess = () => resolve(true)
            req.onerror = () => reject(req.error)
        })
    } catch (e) {
        console.error('indexedCache.set error', e)
        return false
    }
}

async function remove(key) {
    try {
        const db = await openDB()
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite')
            const store = tx.objectStore(STORE_NAME)
            const req = store.delete(key)
            req.onsuccess = () => resolve(true)
            req.onerror = () => reject(req.error)
        })
    } catch (e) {
        console.error('indexedCache.remove error', e)
        return false
    }
}

async function clearAll() {
    try {
        const db = await openDB()
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite')
            const store = tx.objectStore(STORE_NAME)
            const req = store.clear()
            req.onsuccess = () => resolve(true)
            req.onerror = () => reject(req.error)
        })
    } catch (e) {
        console.error('indexedCache.clearAll error', e)
        return false
    }
}

export const indexedCache = {
    get,
    set,
    remove,
    clearAll
}

export default indexedCache
