/* ================================================================================== */
/* >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>     JFATHER.JS     <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< */
/* ================================================================================== */

export class JFATHER {
  static parse(input, paths, map = null) {
    this.#validatePaths(paths);
    return this.#pickByPaths(this.#validateInput(input), paths);
  }
  static stringify(input, paths, pretty = true, indent = 2) {
    this.#validatePaths(paths);
    return pretty
      ? JSON.stringify(this.#pickByPaths(this.#validateInput(input), paths), null, indent)
      : JSON.stringify(this.#pickByPaths(this.#validateInput(input), paths));
  }

  static #validateInput(input) {
    if (typeof input !== "string" && typeof input !== "object") {
      throw new Error("The input item is not an object nor a string!");
    }
    let obj = undefined;
    try {
      obj = typeof input === "string" ? JSON.parse(input) : input;
    } catch {
      throw new Error("The input string is not in format my grandson could recognize!");
    }
    if (obj === undefined) {
      throw new Error("Item is not defined!");
    }
    return obj;
  }
  static #validatePaths(paths) {
    if (!Array.isArray(paths) || paths.length == 0 || paths.some((p) => typeof p !== "string")) {
      throw new Error("Paths must be a non empty array of strings!");
    }
    return true;
  }

  static #pickByPaths(obj, paths) {
    const out = {};
    for (const p of paths) {
      const tokens = this.#parsePath(p);
      this.#assignPath(out, obj, tokens);
    }
    return out;
  }
  static #parsePath(path) {
    return path.split(".").map((seg) => {
      if (seg.endsWith("[]")) return { key: seg.slice(0, -2), array: true };
      return { key: seg, array: false };
    });
  }
  static #assignPath(dst, src, tokens, idx = 0) {
    if (src == null) return;

    const { key, array } = tokens[idx];

    if (array) {
      const srcArr = src[key];
      if (!Array.isArray(srcArr)) return;

      const dstArr = (dst[key] ??= []);
      for (let i = 0; i < srcArr.length; i++) {
        const srcItem = srcArr[i];
        if (idx === tokens.length - 1) {
          // leaf: take the whole element
          dstArr[i] = srcItem;
        } else {
          dstArr[i] ??= {};
          this.#assignPath(dstArr[i], srcItem, tokens, idx + 1);
        }
      }
      return;
    }

    const child = src[key];
    if (child === undefined) return;

    if (idx === tokens.length - 1) {
      // leaf: assign value
      dst[key] = child;
    } else {
      const nextDst = (dst[key] ??= Array.isArray(child) ? [] : {});
      this.#assignPath(nextDst, child, tokens, idx + 1);
    }
  }
}

export default JFATHER;

/* ================================================================================== */
/* >>>>>>>>>>>>>>>>>>>>>>>>>>>>>   END OF: JFATHER.JS   <<<<<<<<<<<<<<<<<<<<<<<<<<<<< */
/* ================================================================================== */
