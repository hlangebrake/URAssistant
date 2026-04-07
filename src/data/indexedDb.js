window.Unterrichtsassistent = window.Unterrichtsassistent || {};
window.Unterrichtsassistent.data = window.Unterrichtsassistent.data || {};

const DB_NAME = "unterrichtsassistent";
const DB_VERSION = 1;
const STORE_NAMES = ["appState"];

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;
      STORE_NAMES.forEach((storeName) => {
        if (!database.objectStoreNames.contains(storeName)) {
          database.createObjectStore(storeName);
        }
      });
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore(mode, callback) {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAMES, mode);
    const store = transaction.objectStore("appState");
    const result = callback(store);

    transaction.oncomplete = () => {
      database.close();
      resolve(result);
    };

    transaction.onerror = () => {
      database.close();
      reject(transaction.error);
    };
  });
}

async function readState(key) {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAMES, "readonly");
    const store = transaction.objectStore("appState");
    const request = store.get(key);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => database.close();
  });
}

async function writeState(key, value) {
  return withStore("readwrite", (store) => {
    store.put(value, key);
  });
}

async function writeStates(entries) {
  return withStore("readwrite", (store) => {
    Object.keys(entries || {}).forEach((key) => {
      store.put(entries[key], key);
    });
  });
}

function deleteDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);

    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error("Die Datenbank konnte nicht geloescht werden, weil sie noch verwendet wird."));
  });
}

window.Unterrichtsassistent.data.readState = readState;
window.Unterrichtsassistent.data.writeState = writeState;
window.Unterrichtsassistent.data.writeStates = writeStates;
window.Unterrichtsassistent.data.deleteDatabase = deleteDatabase;
