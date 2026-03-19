/* ================================================================================== */
/* >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>    DATASTORE.JS    <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< */
/* ================================================================================== */

/* >>>---> datastore.js >-----------------------------------------------------------> */
export class DataStore {
  static get Local() {
    return this.#getStoreSafely(localStorage);
  }
  static get Session() {
    return this.#getStoreSafely(sessionStorage);
  }
  static #getStoreSafely(store) {
    return this.#testStore(store) ? store : null;
  }
  static #testStore(store) {
    try {
      const testKey = `__test_${Date.now().valueOf()}`;
      store.setItem(testKey, "1");
      store.removeItem(testKey);
      return true;
    } catch (e) {
      console.warn("Requested data store is not available:", e);
      return false;
    }
  }
}
/* <-----------------------------------------------------------< datastore.js <---<<< */

/* >>>---> stored_collection.js >---------------------------------------------------> */
export class StoredCollection {
  #key;
  #data;
  #store;
  #sortKey;
  #sortDesc;
  #comparer;
  #listeners = new Set();
  constructor(key, store, options = {}) {
    if (!store) throw new Error("Provided store is null!");
    if (!key || typeof key !== "string") throw new Error("Invalid key type!");

	  this.#key = key;
	  this.#data = [];
    this.#store = store;
    this.#sortKey = options.sortKey ?? "date";
    this.#sortDesc = options.sortDesc ?? true;
	  const defaultComparer = (a, b) =>
	    (new Date(b[this.#sortKey]) - new Date(a[this.#sortKey])) * (this.#sortDesc ? -1 : 1);
    this.#comparer = options.comparer ?? defaultComparer;

    this.#load();
  }

  [Symbol.iterator]() {
    return this.#data[Symbol.iterator]();
  }
  forEach(fn) {
    this.#data.forEach(fn);
  }
  getAll() {
    return [ ...this.#data ];
  }
  get(id) {
    return this.#data.find(i => i.id === id) ?? null;
  }
  add(item) {
    this.#data.push(item);
    this.#sort();
    this.#save();
  }
  addRange(items) {
    this.#data.push(...items);
    this.#sort();
    this.#save();
  }
  update(id, updater) {
    const index = this.#data.findIndex(i => i.id === id);
    if (index === -1) return false;

    const current = this.#data[index];
    this.#data[index] = {
      ...current,
      ...(typeof updater === "function" ? updater(current) : updater)
    };
    this.#sort();
    this.#save();
    return true;
  }
  withBatch(fn) {
    fn(this.#data);
    this.#sort();
    this.#save();
  }
  remove(id) {
    this.#data = this.#data.filter(i => i.id !== id);
    this.#save();
  }
  clear() {
    this.#data = [];
    this.#save();
  }

  #sort() {
    this.#data.sort(this.#comparer);
  }
  #load() {
    const raw = this.#store.getItem(this.#key);
    if (raw === null) {
      this.#save();
      return;
    }
    try {
      this.#data = JSON.parse(raw) ?? [];
    } catch {
      this.#data = [];
      this.#save();
    }
  }
  #save() {
    this.#store.setItem(this.#key, JSON.stringify(this.#data));
	  this.#emit();
  }
  #emit() {
    for (const fn of this.#listeners) fn(this.#data);
  }
}
/* <---------------------------------------------------< stored_collection.js <---<<< */

export default StoredCollection;

/* ================================================================================== */
/* >>>>>>>>>>>>>>>>>>>>>>>>>>>>   END OF: DATASTORE.JS   <<<<<<<<<<<<<<<<<<<<<<<<<<<< */
/* ================================================================================== */
