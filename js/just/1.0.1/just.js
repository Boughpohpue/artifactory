/* ================================================================================== */
/* >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>        JUST.JS       <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< */
/* ================================================================================== */

/* >>>---> nameof.js >--------------------------------------------------------------> */
/* Just a nameof */
export class Name {
  static of(o) {
    if (o === undefined || o === null) {
      return o;
    }
    let name = undefined;
    try {
      if (typeof o === "object") {
        name = o.name;
        if (name === undefined) {
          let cn = o.constructor.name;
          if (cn !== "Object") {
            name = cn;
          }
        }
        if (name === undefined) {
          for (let prop in o) {
            if (o.hasOwnProperty(prop)) {
              name = prop;
              break;
            }
          }
        }
      } else if (typeof o === "function") {
        name = Name.of(o.prototype);
        if (name === undefined) {
          let body = o.toString();
          let head = body.substr(0, Math.min(body.indexOf("("), body.indexOf("{"))).trim();
          let parts = head.split(" ");
          name = parts[parts.length - 1];
        }
      }
    } catch (e) {}
    return name;
  }
}
export function nameof(o) {
  return Name.of(o);
}
/* <--------------------------------------------------------------< nameof.js <---<<< */

/* >>>---> isthis.js >--------------------------------------------------------------> */
/* Just is this */
export class Is {
  static thisTrue(q) {
    return q === true;
  }
  static thisFalse(q) {
    return q === false;
  }
  static thisNull(q) {
    return q === null;
  }
  static thisUndefined(q) {
    return typeof q === "undefined";
  }
  static thisBoolean(q) {
    return typeof q === "boolean";
  }
  static thisNumber(q) {
    return typeof q === "number";
  }
  static thisBigInt(q) {
    return typeof q === "bigint";
  }
  static thisString(q) {
    return typeof q === "string";
  }
  static thisSymbol(q) {
    return typeof q === "symbol";
  }
  static thisObject(q) {
    return typeof q === "object";
  }
  static thisFunction(q) {
    return typeof q === "function";
  }
  static thisNothing(q) {
    return Is.thisNull(q) || Is.thisUndefined(q);
  }
  static thisSomething(q) {
    return !Is.thisNothing(q);
  }
  static thisAnything(q) {
    return !Is.thisNothing(q);
  }
  static thisDefined(q) {
    return !Is.thisUndefined(q);
  }
  static thisArray(q) {
    return Array.isArray(q);
  }
  static thisEmpty(q) {
    return Is.thisNothing(q) || ((Is.thisString(q) || Is.thisArray(q)) && q.length == 0);
  }
  static thisEmptyArray(q) {
    return Is.thisArray(q) && q.length == 0;
  }
  static thisClass(q) {
    return Is.thisFunction(q) && q.toString().startsWith("class ");
  }
  static thisGetter(q, propertyName) {
    try {
      return !!Object.getOwnPropertyDescriptor(q, propertyName)["get"];
    } catch (e) {
      return false;
    }
  }
  static thisSetter(q, propertyName) {
    try {
      return !!Object.getOwnPropertyDescriptor(q, propertyName)["set"];
    } catch (e) {
      return false;
    }
  }
}
/* <--------------------------------------------------------------< isthis.js <---<<< */

/* >>>---> gimme.js >---------------------------------------------------------------> */
/* Just a getter */
export class Gimme {
  static get currentTime() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  }
  static get currentDate() {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, "0");
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const yyyy = String(now.getFullYear());
    return `${dd}.${mm}.${yyyy}`;
  }
  static get currentDateTime() {
    return `${Gimme.currentDate()} ${Gimme.currentTime()}`;
  }
  static get randomUuid() {
    var s = new Array(36);
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
      s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4";
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
    s[8] = s[13] = s[18] = s[23] = "-";
    var uuid = s.join("");
    return uuid;
  }
}
/* <---------------------------------------------------------------< gimme.js <---<<< */

/* >>>---> otis.js >----------------------------------------------------------------> */
/* Just a scribe */
export class Otis {
  static log(content, source = "") {
    const src = source == "" ? "" : ` [${source}]`;
    console.log(`${Gimme.currentTime}${src}: ${content}`);
  }
  static error(content, source = "") {
    const src = source == "" ? "" : ` [${source}]`;
    console.error(`${Gimme.currentTime}${src}: ${content}`);
  }
}
/* <----------------------------------------------------------------< otis.js <---<<< */

/* >>>---> bitwiser.js >------------------------------------------------------------> */
/* Just a bit wiser */
export class Bitwiser {
  static contains(current, expected) {
    return (current & expected) > 0;
  }
  static merge(values) {
    if (!Is.thisArray(values)) {
      return null;
    }
    let val = undefined;
    for (let v of values) {
      if (!Is.thisBigInt(v)) {
        continue;
      }
      if (Is.thisUndefined(val)) {
        val = v;
      } else {
        val = val | v;
      }
    }
    return val;
  }
  static extract(value) {
    if (!Is.thisBigInt(value)) {
      return null;
    }
    let items = [];
    let current = 1n;
    while (current <= value) {
      if ((value & current) !== 0n) {
        items.push(current);
      }
      current <<= 1n;
    }
    return items;
  }
  static extractFrom(val, values) {
    if (!Is.thisBigInt(val)) {
      return null;
    }
    if (!Is.thisArray(values)) {
      return null;
    }
    if (values.some((b) => !Is.thisBigInt(b))) {
      return null;
    }
    return values.filter((b) => (val & b) !== 0n);
  }
}
/* <------------------------------------------------------------< bitwiser.js <---<<< */

/* >>>---> matcher.js >-------------------------------------------------------------> */
/* Prerequisites */
import extendObjectPrototype from 'https://boughpohpue.github.io/artifactory/js/jxtensions/1.0.1/jxtensions.js';
extendObjectPrototype();
/* Just a bit wild */
export class Wild {
  static Surely = "+";
  static Perhaps = "?";
  static Whatever = "*";
}
/* Just a matcher */
export class Matcher {
  static get #tagRex() {
    return /\[%\s*([A-Za-z_$][\w.$]*)\s*%\]/g;
  }
  static isMatching(text, expr) {
    if (!Is.thisString(text) || !Is.thisString(expr)) return false;
    if (text === expr) return true;

    const parts = expr.split(Wild.Whatever);
    const start = parts.first;
    const end = parts.last;

    return text.startsWith(start) && text.endsWith(end) && parts.filter((p) => !text.includes(p)).length == 0;
  }
  static entag(toTag) {
    if (this.tagged(toTag)) {
      return toTag;
    }
    return Is.thisNothing(toTag) ? toTag : `[%${toTag}%]`;
  }
  static tagged(text) {
    return text != text.replace(this.#tagRex, "");
  }
  static detag(text, source) {
    if (Is.thisNothing(source) || !Is.thisString(text) || !this.tagged(text)) {
      return text;
    }
    return text.replace(this.#tagRex, (m, p) => {
      const val = source.resolveProperty(p);
      return val != null ? String(val) : m;
    });
  }
}
/* <-------------------------------------------------------------< matcher.js <---<<< */

/* >>>---> reflector.js >-----------------------------------------------------------> */
/* Just a reflector */
export class Reflector {
  static getMethods = (i) => this.#filterDescriptors(i, desc => this.#isMethod(desc));
  static getGetters = (i) => this.#filterDescriptors(i, desc => this.#isGetter(desc));
  static getSetters = (i) => this.#filterDescriptors(i, desc => this.#isSetter(desc));
  static getProperties = (i) => this.#filterDescriptors(i, desc => this.#isProperty(desc), false);
  static reflect(target) {
    if (target == null) throw new Error("Cannot reflect null.");
    const instance = this.#getInstance(target);
    const ctor = this.#getConstructor(target);
    return {
      typeName: ctor?.name ?? null,
      instanceProperties: this.getProperties(instance),
      instanceMethods: this.getMethods(instance),
      instanceGetters: this.getGetters(instance),
      instanceSetters: this.getSetters(instance),
      staticProperties: this.getProperties(ctor),
      staticMethods: this.getMethods(ctor),
      staticGetters: this.getGetters(ctor),
      staticSetters: this.getSetters(ctor)
    };
  }

  static #isFunction = (i) => typeof i === "function";
  static #isInstance = (i) => i && typeof i === "object";
  static #getInstance = (i) => this.#isInstance(i) ? i : null;
  static #getConstructor = (i) => this.#isFunction(i) ? i : i.constructor;
  static #isGetter = (d) => !!d.get;
  static #isSetter = (d) => !!d.set;
  static #isMethod = (d) => this.#isFunction(d.value);
  static #isProperty = (d) => !(this.#isMethod(d) || this.#isGetter(d) || this.#isSetter(d));
  static #isInternalKey = (k) => ["constructor", "prototype", "length", "name", "arguments", "caller"].includes(k);
  static #filterDescriptors(item, predicate, forMethods = true) {
    if (!item) return [];
    const source = this.#isInstance(item) && forMethods
      ? this.#getConstructor(item).prototype
      : item;
    const descriptors = Object.getOwnPropertyDescriptors(source);
    return Reflect.ownKeys(descriptors)
      .filter((key) => !this.#isInternalKey(key) && predicate(descriptors[key]))
      .map((key) => typeof key === "symbol" ? key.toString() : key);
  }
}
/* <-----------------------------------------------------------< reflector.js <---<<< */

/* >>>---> enum.js >----------------------------------------------------------------> */
/* Just an enum */
export class Enum {
  #value = undefined;
  get value() { return this.#value; }
  get valueType() { return typeof this.#value; }
  get name() { return this.constructor.getName(this); }

  constructor(value = undefined) {
    const _ctor = this.constructor;
    if (_ctor._sealed)
      throw new Error("An Enum instance can be created only inside the enum class!");
    if (value === null || value === undefined) return;
    for (const [name, instance] of Object.entries(_ctor)) {
      if (!(instance instanceof _ctor)) continue;
      if (instance.value === value)
        throw new Error("An Enum instance with the same value already exists!");
      if (instance.valueType && instance.valueType !== typeof value)
        throw new Error("An Enum value type must be consistent across the enum class!");
    }
    this.#value = value;
    Object.freeze(this);
  }

  static parse(e) {
    if (e === undefined || e === null) return;
    let valuesType = undefined;
    const upper = typeof e === "string" ? e.toUpperCase() : undefined;
    for (const [name, instance] of Object.entries(this)) {
      if (!(instance instanceof this)) continue;
      if (upper === name.toUpperCase()) return instance;
      if (instance.value === e) return instance;
      if (!valuesType && instance.valueType) valuesType = instance.valueType;
    }
    if (valuesType === typeof e) return e;
  }
  static ensure(e) {
    if (e === undefined || e === null) return;
    if (e instanceof this) return e;
    return this.parse(e);
  }
  static getValue(e, fallback = undefined) {
    const ensured = this.ensure(e) ?? this.ensure(fallback);
    return ensured instanceof this
      ? ensured.value
      : ensured;
  }
  static getName(e) {
    if (!(e instanceof this)) return;
    for (const [name, instance] of Object.entries(this))
      if (instance instanceof this && instance === e) return name;
  }
  static seal() {
    this._sealed = true;
    Object.freeze(this);
    Object.freeze(this.prototype);
  }
}
/* <----------------------------------------------------------------< enum.js <---<<< */

export default nameof;

/* ================================================================================== */
/* >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>   END OF: JUST.JS    <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< */
/* ================================================================================== */
