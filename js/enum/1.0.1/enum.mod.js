import Progression from 'https://boughpohpue.github.io/artifactory/js/just/1.0.2/just.mod.js';

export class Enum {
  static _items = null;
  static _valuesType = undefined;

  static get items() {
    return this._items ?? new Map(
        Object.entries(this)
        .filter(([name, inst]) =>
          inst instanceof this));
  }

  static get valuesType() {
    return this._valuesType;
  }
  static set valuesType(vt) {
    if (this._valuesType) return;
    this._valuesType = vt;
    Object.freeze(this._valuesType);
  }

  static get names() { return Array.from(this.items.keys()).map((k) => k); }
  static get values() { return Array.from(this.items.values()).map((v) => v.value); }

  #value = undefined;
  get #_ctor() { return this.constructor; }
  get name() { return this.#_ctor.getName(this); }
  get value() { return this.#value; }

  constructor(value = undefined) {
    if (this.#_ctor._sealed)
      throw new Error("An Enum instance must be created inside the enum class!");
    const values = this.#_ctor.values;
    if (value === null || value === undefined)
      value = values.length === 0 ? 0 : values[values.length - 1] + 1;
    if (values.includes(value))
      throw new Error("An Enum instance with the same value already exists!");
    if (this.#_ctor.valuesType && this.#_ctor.valuesType !== typeof value)
      throw new Error("An Enum value type must be consistent across the enum class!");
    this.#value = value;
    this.#_ctor.valuesType = typeof value;
    Object.freeze(this);
  }

  static getName(e) {
    if (!(e instanceof this)) return;
    for (const [name, instance] of this.items)
      if (instance === e) return name;
  }
  static getValue(e, fallback = undefined) {
    const ensured = this.ensure(e) ?? this.ensure(fallback);
    return ensured instanceof this
      ? ensured.value
      : ensured;
  }
  static ensure(e) {
    if (e === null || e === undefined) return;
    if (e instanceof this) return e;
    return this.parse(e);
  }
  static parse(e) {
    if (e === null || e === undefined) return;
    const upper = typeof e === "string" ? e.toUpperCase() : undefined;
    for (const [name, instance] of this.items) {
      if (name.toUpperCase() === upper) return instance;
      if (instance.value === e) return instance;
    }
    if (this.valuesType === typeof e) return e;
  }
  static seal() {
    this._sealed = true;
    this._items = this.items;
    Object.freeze(this);
    Object.freeze(this.prototype);
  }
}

export class ProgressiveEnum {
  static _items = null;
  static _valuesType = undefined;

  static get items() {
    return this._items ?? new Map(
        Object.entries(this)
        .filter(([name, inst]) =>
          inst instanceof this));
  }

  static get valuesType() {
    return this._valuesType;
  }
  static set valuesType(vt) {
    if (this._valuesType) return;
    this._valuesType = vt;
    Object.freeze(this._valuesType);
  }

  static get names() { return Array.from(this.items.keys()).map((k) => k); }
  static get values() { return Array.from(this.items.values()).map((v) => v.value); }

  #value = undefined;
  get #_ctor() { return this.constructor; }
  get name() { return this.#_ctor.getName(this); }
  get value() { return this.#value; }

  constructor(value = undefined) {
    if (this.#_ctor._sealed)
      throw new Error("An Enum instance can be created only inside the enum class!");
    if (value === null || value === undefined) {
      if (!this.#_ctor.valuesType) value = 0;
      else if (this.#_ctor.valuesType === "number") {
        const values = this.#_ctor.values;
        if (values.length === 1) value = values[0] + 1;
        else if (values.length === 2) value = values[1] + (values[1] - values[0]);
        else value = new Progression(values).next;
      }
      else throw new Error("Unable to calculate next instance value!");
    }
    if (value !== null && value !== undefined) {
      if (this.#_ctor.values.includes(value))
        throw new Error("An Enum instance with the same value already exists!");
      if (this.#_ctor.valuesType && this.#_ctor.valuesType !== typeof value)
        throw new Error("An Enum value type must be consistent across the enum class!");
      this.#value = value;
      this.#_ctor.valuesType = typeof value;
    }
    Object.freeze(this);
  }

  static getName(e) {
    if (!(e instanceof this)) return;
    for (const [name, instance] of this.items)
      if (instance === e) return name;
  }
  static getValue(e, fallback = undefined) {
    const ensured = this.ensure(e) ?? this.ensure(fallback);
    return ensured instanceof this
      ? ensured.value
      : ensured;
  }
  static ensure(e) {
    if (e === null || e === undefined) return;
    if (e instanceof this) return e;
    return this.parse(e);
  }
  static parse(e) {
    if (e === null || e === undefined) return;
    const upper = typeof e === "string" ? e.toUpperCase() : undefined;
    for (const [name, instance] of this.items) {
      if (name.toUpperCase() === upper) return instance;
      if (instance.value === e) return instance;
    }
    if (this.valuesType === typeof e) return e;
  }
  static seal() {
    this._sealed = true;
    this._items = this.items;
    Object.freeze(this);
    Object.freeze(this.prototype);
  }
}

export default Enum;
