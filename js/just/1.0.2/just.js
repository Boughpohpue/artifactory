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
import extendObjectPrototype from 'https://boughpohpue.github.io/jxtensions/compiled/jxtensions-1.0.1.js';
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
/* <----------------------------------------------------------------< enum.js <---<<< */

/* >>>---> super.js >---------------------------------------------------------------> */
/* Just a super class */
export class Super {
    static abs = (n) => n < 0 ? -n : n;
    static power = (n, e) => e === 0 ? 1 : e === 1 ? n : n * Super.power(n, e - 1);
    static sqrt = (n, _x = -1.23) => _x < 1 ? Super.sqrt(n, n) : Super.abs(_x - (_x = (_x + n / _x) / 2)) >= 1e-12 ? Super.sqrt(n, _x) : _x;
    static digitalRoot = n => n < 10 ? n : Super.digitalRoot([...n.toString()].reduce((sum, c) => sum + (+c), 0));
    static dec2bin = d => d === 0 ? "0" : Super.dec2bin(Math.floor(d / 2)) + (d % 2);
    static bin2dec = b => b.length === 0 ? 0 : Super.power(2, b.length - 1) * (+b[0]) + Super.bin2dec(b.slice(1));
    static dec2hex = d => d === 0 ? "0" : Super.dec2hex(Math.floor(d / 16)) + (d % 16 < 10 ? String.fromCharCode(48 + (d % 16)) : String.fromCharCode(65 + (d % 16 - 10)));
    static hex2dec = h => h.length === 0 ? 0 : (h[0] < 'A' ? h.charCodeAt(0) - 48 : h.charCodeAt(0) - 55) * Super.power(16, h.length - 1) + Super.hex2dec(h.slice(1));
    static checkIfPrime = (n, _cur = 2) => n < 2 ? false : n === _cur ? true : n % _cur === 0 ? false : Super.checkIfPrime(n, _cur + 1);
    static primes = (max, _prms = [2], _cur = 3) => _cur > max ? _prms : (!_prms.some(p => _cur % p === 0) ? Super.primes(max, [..._prms, _cur], _cur + 2) : Super.primes(max, _prms, _cur + 2));
}
/* <---------------------------------------------------------------< super.js <---<<< */

/* >>>---> colorHelper.js >---------------------------------------------------------> */
/* Just a color helper */
export class ColorHelper {
	static channels2hex(channels) {
		if (!channels || !Array.isArray(channels)
		|| channels.length < 3 || channels.length > 4)
			throw new Error("Invalid argument format!");
		return `#${channels.map((ch) => Colors.#dec2hex(ch)).join("")}`;
	}
	static rgb2hex(r, g, b) {
		return Colors.channels2hex([r, g, b]);
	}
	static argb2hex(a, r, g, b) {
		return Colors.channels2hex([a, r, g, b]);
	}
	static rgba2hex(r, g, b, a) {
		return Colors.channels2hex([a * 255, r, g, b]);
	}
	static hex2argb(hex) {
		hex = hex.startsWith('#') ? hex.substring(1) : hex;
		let channels = [];
		if (hex.length == 6) channels.push(255);
		for (var x = 0; x <= hex.length - 1; x += 2)
			channels.push(parseInt(hex.substring(x, x + 2), 16));
		return channels;
	}
	static hex2rgba(hex) {
		hex = hex.startsWith('#') ? hex.substring(1) : hex;
		let alpha = 1.0;
		if (hex.length === 8) {
			alpha = parseInt(hex.substring(0, 2), 16) / 255;
			hex = hex.substring(2);
		}
		let channels = [];
		for (var x = 0; x <= hex.length - 1; x += 2)
			channels.push(parseInt(hex.substring(x, x + 2), 16));
		return (channels, alpha);
	}
	static hex2rgb(hex) {
		hex = hex.startsWith('#') ? hex.substring(1) : hex;
		hex = hex.length === 8 ? hex.substring(2) : hex;
		let channels = [];
		for (var x = 0; x <= hex.length - 1; x += 2)
			channels.push(parseInt(hex.substring(x, x + 2), 16));
		return channels;
	}
	static calculateColorRgb(hexFrom, hexTo, percent) {
		const rgbFrom = Colors.hex2rgb(hexFrom);
		const rgbTo = Colors.hex2rgb(hexTo);
		const colorRgb = [];
		colorRgb.push(Colors.calculateChannel(rgbFrom[0], rgbTo[0], percent));
		colorRgb.push(Colors.calculateChannel(rgbFrom[1], rgbTo[1], percent));
		colorRgb.push(Colors.calculateChannel(rgbFrom[2], rgbTo[2], percent));
		return colorRgb;
	}
	static calculateColorArgb(hexFrom, hexTo, percent) {
		const argbFrom = Colors.hex2argb(hexFrom);
		const argbTo = Colors.hex2argb(hexTo);
		const colorArgb = [];
		colorArgb.push(Colors.calculateChannel(argbFrom[0], argbTo[0], percent));
		colorArgb.push(Colors.calculateChannel(argbFrom[1], argbTo[1], percent));
		colorArgb.push(Colors.calculateChannel(argbFrom[2], argbTo[2], percent));
		colorArgb.push(Colors.calculateChannel(argbFrom[3], argbTo[3], percent));
		return colorArgb;
	}
	static calculateRgbHex(hexFrom, hexTo, percent) {
		return Colors.channels2hex(calculateColorRgb(hexFrom, hexTo, percent));
	}
	static calculateArgbHex(hexFrom, hexTo, percent) {
		return Colors.channels2hex(calculateColorArgb(hexFrom, hexTo, percent));
	}
	static calculateChannel(channelFrom, channelTo, percent) {
		channelFrom = Colors.#validateChannelValue(channelFrom);
		channelTo = Colors.#validateChannelValue(channelTo);
		return channelFrom < channelTo
			? channelFrom + Math.round(Math.floor((channelTo - channelFrom) * percent))
			: channelFrom - Math.round(Math.floor((channelFrom - channelTo) * percent));
	}
	static #dec2hex(dec) {
		return dec.toString(16).padStart(2, "0");
	}
	static #hex2dec(hex) {
		return parseInt(hex, 16);
	}
  static #validateChannelValue(val) {
    return Math.max(Math.min(val, 255), 0);
  }
}
/* <---------------------------------------------------------< colorHelper.js <---<<< */

export default nameof;

/* ================================================================================== */
/* >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>   END OF: JUST.JS    <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< */
/* ================================================================================== */
