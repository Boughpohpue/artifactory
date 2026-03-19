/* ================================================================================== */
/* >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>     JXTENSIONS.JS    <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< */
/* ================================================================================== */

export function extendObjectPrototype() {
  Object.prototype.isInstanceOf = function (c) {
    return c.name === this.constructor.name;
  };
  Object.prototype.resolveProperty = function (path) {
    return path.split(".").reduce((acc, key) => (acc != null ? acc[key] : undefined), this);
  };
  Object.prototype.getPaths = function (prefix = "") {
    return Object.entries(this).flatMap(([key, value]) => {
      const path = prefix ? `${prefix}.${key}` : key;
      if (Array.isArray(value)) {
        const firstElem = value.find((e) => !!e && typeof e === "object");
        return firstElem === undefined ? `${path}[]` : firstElem.getPaths(`${path}[]`);
      }
      return !value || typeof value !== "object" ? path : value.getPaths(path);
    });
  };
  Object.prototype.getStructureInfo = function (skipEmpty = false, recurrent = false, depthLimit = 0, _depth = 0) {
    if (Array.isArray(this)) {
      if (this.length === 0) return "Array<empty>";

      let firstElem = this.find((e) => e !== null && e !== undefined);
      if (firstElem === null || firstElem === undefined) {
        return "Array<?>";
      } else if (typeof firstElem === "object") {
        const elemType = firstElem.getStructureInfo(skipEmpty, recurrent, depthLimit, _depth + 1);
        return Array.isArray(elemType) || typeof elemType === "object" ? [elemType] : `Array<${elemType}>`;
      } else {
        return `Array<${typeof firstElem}>`;
      }
    }

    const className = this.constructor?.name || "Object";
    if (className === "Date") return "Date";

    const result = { __className: className };
    if (className !== "Object") {
      result["__archetype"] = this.constructor;
    }

    const canGoDeeper = recurrent && (depthLimit === 0 || _depth < depthLimit);

    for (const [key, value] of Object.entries(this)) {
      if (skipEmpty && (value === null || value === undefined)) continue;

      if (Array.isArray(value)) {
        if (value.length === 0) {
          result[key] = "Array<empty>";
        } else {
          let firstElem = value.find((e) => e !== null && e !== undefined);
          if (firstElem === null) {
            result[key] = "null";
          } else if (typeof firstElem === "object") {
            const firstType = firstElem.getStructureInfo(skipEmpty, canGoDeeper, depthLimit, _depth + 1);
            result[key] = `Array<${typeof firstType === "string" ? firstType : firstType.__className || "Object"}>`;
          } else {
            result[key] = `Array<${typeof firstElem}>`;
          }
        }
      } else if (value === null) {
        result[key] = "null";
      } else if (typeof value === "object") {
        if (canGoDeeper) {
          result[key] = value.getStructureInfo(skipEmpty, recurrent, depthLimit, _depth + 1);
        } else {
          result[key] = value.constructor?.name || "Object";
        }
      } else {
        result[key] = typeof value;
      }
    }

    return result;
  };
}

export function extendArrayPrototype() {
  Object.defineProperty(Array.prototype, "isEmpty", {
    get: function () {
      return this.length === 0;
    }
  });
  Object.defineProperty(Array.prototype, "first", {
    get: function () {
      return this.length === 0 ? null : this[0];
    }
  });
  Object.defineProperty(Array.prototype, "last", {
    get: function () {
      return this.length === 0 ? null : this[this.length - 1];
    }
  });
  Object.defineProperty(Array.prototype, "random", {
    get: function () {
      if (this.length === 0) return undefined;
      return this[Math.floor(Math.random() * this.length)];
    }
  });
  Object.defineProperty(Array.prototype, "randomItem", {
    get: function () {
      if (this.length === 0) return undefined;
      let i = Math.floor(Math.random() * this.length);
      return { index: i, value: this[i] };
    }
  });
  Object.defineProperty(Array.prototype, "itemsTypes", {
    get: function () {
      return this.map((e) => (e === null ? "null" : typeof e));
    }
  });
  Object.defineProperty(Array.prototype, "hasNullItem", {
    get: function () {
      return this.some((e) => e === null);
    }
  });
  Object.defineProperty(Array.prototype, "hasArrayItem", {
    get: function () {
      return this.some((e) => Array.isArray(e));
    }
  });
  Object.defineProperty(Array.prototype, "hasObjectItem", {
    get: function () {
      return this.some((e) => !!e && typeof e === "object");
    }
  });
  Array.prototype.findArrayItem = function () {
    return this.find((e) => Array.isArray(e));
  };
  Array.prototype.findObjectItem = function () {
    return this.find((e) => !!e && typeof e === "object");
  };
  Array.prototype.putnique = function (x) {
    if (this.isEmpty || this.last == x) {
      return;
    }
    if (this.includes(x)) {
      this.splice(this.indexOf(x), 1);
    }
    this.push(x);
  };
  Array.prototype.putniqueByKey = function (x, key) {
    if (!this.some((i) => i[key] == x[key])) {
      this.push(x);
    } else if (this.last[key] == x[key]) {
      this.pop();
      this.push(x);
    } else {
      this.splice(this.indexOf(this.find((i) => i[key] == x[key])), 1);
      this.push(x);
    }
  };
  Array.prototype.put = function (x) {
    if (this.isEmpty || this.last > x) {
      this.push(x);
    } else if (this.first < x) {
      this.reverse();
      this.push(x);
      this.reverse();
    } else {
      let temp = [];
      while (this.last < x) {
        temp.push(this.pop());
      }
      this.push(x, ...temp.reverse());
    }
  };
  Array.prototype.putByKey = function (item, compareKey) {
    if (this.isEmpty || this.last[compareKey] > item[compareKey]) {
      this.push(item);
    } else if (this.first[compareKey] < item[compareKey]) {
      this.reverse();
      this.push(item);
      this.reverse();
    } else {
      let temp = [];
      while (this.last[compareKey] < item[compareKey]) {
        temp.push(this.pop());
      }
      this.push(item, ...temp.reverse());
    }
  };
  Array.prototype.putOrMerge = function (item, keyKey, valueKey) {
    if (this.isEmpty) {
      this.push(item);
    } else if (!this.some((i) => i[keyKey] == item[keyKey])) {
      this.put(item, valueKey);
    } else {
      let itm = this.splice(this.indexOf(this.find((i) => i[keyKey] == item[keyKey])), 1).first;
      item[valueKey] += itm[valueKey];
      this.put(item, valueKey);
    }
  };
  Array.prototype.shuffle = function (times = 1) {
    if (this.isEmpty || this.length == 1) {
      return;
    }
    let temp = [];
    while (!this.isEmpty) {
      temp.push(this.pop());
    }
    for (let i = 0; i < times; i++) {
      let tmp = [];
      while (!temp.isEmpty) {
        let idx = Math.floor(Math.random() * temp.length);
        tmp.push(temp.splice(idx, 1).first);
      }
      temp = [...tmp];
    }
    while (!temp.isEmpty) {
      this.push(temp.pop());
    }
  };
}

export function extendDatePrototype() {
  Date.prototype.addSeconds = function (s, mutate = false) {
    if (mutate) {
      this.setSeconds(this.getSeconds() + s);
      return this;
    } else {
      return new Date(this.getTime() + s * 1000);
    }
  };
  Date.prototype.addMinutes = function (m, mutate = false) {
    return this.addSeconds(m * 60, mutate);
  };
  Date.prototype.addHours = function (h, mutate = false) {
    return this.addMinutes(h * 60, mutate);
  };
  Date.prototype.addDays = function (d, mutate = false) {
    return this.addHours(d * 24, mutate);
  };
  Date.prototype.addMonths = function(m, mutate = false) {
    const newDate = mutate ? this : new Date(this);
    newDate.setMonth(newDate.getMonth() + m);
    return newDate;
  };
  Date.prototype.addYears = function(y, mutate = false) {
    const newDate = mutate ? this : new Date(this);
    newDate.setFullYear(newDate.getFullYear() + y);
    return newDate;
  };
  Date.prototype.clone = function() {
    return new Date(this.getTime());
  };
  Date.prototype.format = function() {
    return this.toISOString();
  };
}

export function extendPrototypes() {
  extendObjectPrototype();
  extendArrayPrototype();
  extendDatePrototype();
}

export default extendPrototypes;

/* ================================================================================== */
/* >>>>>>>>>>>>>>>>>>>>>>>>>>>   END OF: JXTENSIONS.JS   <<<<<<<<<<<<<<<<<<<<<<<<<<<< */
/* ================================================================================== */
