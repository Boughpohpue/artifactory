/* ================================================================================== */
/* >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>      BREWERY.JS     <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< */
/* ================================================================================== */
import { nameof, Is, Matcher } from 'https://boughpohpue.github.io/artifacts/js/just/1.0.1/just.js';


/* POTIONS BREWERY SERVICE (dynamic objects factory really ;)) */

export class IngredientAttributes {
  static None = 0n;
  static Default = 1n << 0n;
  static DefaultNull = 1n << 2n;
  static DefaultUndefined = 1n << 3n;
  static Configurable = 1n << 4n;
  static Enumerable = 1n << 5n;
  static Writable = 1n << 6n;
  static Boolean = 1n << 7n;
  static Number = 1n << 8n;
  static Bigint = 1n << 9n;
  static String = 1n << 10n;
  static Symbol = 1n << 11n;
  static Object = 1n << 12n;
  static Array = 1n << 13n;
  static Function = 1n << 14n;
  static Anonymous = 1n << 15n;
  static ParameterStuff = IngredientAttributes.Writable | IngredientAttributes.Enumerable | IngredientAttributes.Configurable;
  static get list() {
    let items = [];
    for (const key in IngredientAttributes) {
      if (Is.thisBigInt(IngredientAttributes[key])) {
        items.push(IngredientAttributes[key]);
      }
    }
    return items;
  }
}

export class Rune {
  key;
  value;
  attributes;
  constructor(key, value, attributes) {
    this.key = key;
    this.value = value;
    this.attributes = attributes;
  }

  static fromObj(obj) {
    if (!Is.thisObject(obj)) { throw new Error("Argument must be an object."); }
    if (!Is.thisString(obj.key)) { throw new Error("Argument property 'name' must be a string."); }
    if (!Is.thisSomething(obj.value)) { throw new Error("Argument property 'value' must have a value."); }
    if (!Is.thisString(obj.attributes)) { throw new Error("Argument property 'attributes'  must be a string."); }
    return new Rune(obj.key, obj.value, obj.attributes);
  }
}

export class Ingredient {
  key;
  value;
  attributes;
  constructor(attributes, key, value = null) {
    this.key = key;
    this.value = value;
    this.attributes = attributes;
  }
  hasAttribute(expected) {
    return (this.attributes & expected) > 0;
  }

  static fromRune(rune) {
    if (!(rune instanceof Rune)) {
      throw new Error("Argument must be an instance of Rune!")
    }
    if (Is.thisString(rune.attributes)) {
      const flags = rune.attributes
        .split("|")
        .map(a => a.trim())
        .filter(Boolean)
        .reduce((acc, a) => {
          const attr = IngredientAttributes[a];
          return Is.thisBigInt(attr)
            ? acc | attr
            : acc;
        }, 0n);
      return new Ingredient(flags, rune.key, rune.value);
    }
    return new Ingredient(rune.attributes ?? IngredientAttributes.None, rune.key, rune.value);
  }
}

export class Recipe {
  ingredients = [];
  constructor(ingredients) {
    if (!Is.thisArray(ingredients) || Is.thisEmpty(ingredients)) {
      throw new Error("Recipe must have ingredients!");
    }
    if (ingredients.some((i) => !(i instanceof Ingredient))) {
      throw new Error("One or more provided ingredients are invalid!");
    }
    this.ingredients = ingredients;
  }
}

export class Legend {
  name;
  runes;
  constructor(name, runes = []) {
    this.name = name;
    this.runes = runes
      .map((rune) =>
        rune instanceof Rune
        ? rune
        : Rune.fromObj(rune));
  }
  getArchetype() {
    const cls = class {};
    Object.defineProperty(cls, "name", { value: this.name });
    this.runes.forEach((rune) =>
      Object.defineProperty(cls.prototype, rune.key, {
        value: structuredClone(rune.value),
        writable: true,
        enumerable: true,
        configurable: true
    }));
    return cls;
  }
  getRecipe() {
    return new Recipe(this.runes.map((rune) => Ingredient.fromRune(rune)));
  }

  static fromObj(obj) {
    if (!Is.thisObject(obj)) { throw new Error("Argument must be an object."); }
    if (!Is.thisString(obj.name)) { throw new Error("Argument property 'name'  must be a string."); }
    if (!Is.thisArray(obj.runes)) { throw new Error("Argument property 'runes' must be an array."); }
    return new Legend(obj.name, obj.runes);
  }
  static fromJson(json) {
    if (!Is.thisString(json)) { throw new Error("Argument must be a JSON string."); }
    let parsed;
    try { parsed = JSON.parse(json); }
    catch (e) { throw new Error("JSON parsing error.", { cause: e }); }
    const src =
      Is.thisObject(parsed) && Is.thisArray(parsed.legends)
        ? parsed.legends
        : Is.thisArray(parsed)
          ? parsed
          : Is.thisObject(parsed)
            ? [parsed]
            : null;
    if (!src) { throw new Error("JSON does not contain valid Legend data."); }
    const legends = src
      .map((l, index) => {
        try { return Legend.fromObj(l); }
        catch (e) { return { index, error: e }; }
      });
    if (!legends.every((l) => l instanceof Legend)) {
      console.warn("Some legends failed to parse:",
        legends.filter((l) => !(l instanceof Legend)));
    }
    return legends.filter((l) => l instanceof Legend);
  }
}

export class CustomSupply {
  ingredientName;
  value;
  constructor(ingredientName, value) {
    this.ingredientName = ingredientName;
    this.value = value;
  }
}

export class Grimoire {
  static #_index = new Map();
  static #_recipes = new Map();
  static inscribe(potion, recipe, overwrite = false) {
    if (Is.thisNothing(potion) || !Is.thisClass(potion)) {
      throw new Error("Argument potion must be a class!");
    }
    let potionName = nameof(potion);
    if (this.#_index.has(potionName)) {
      if (!overwrite) {
        console.error(`${potionName} already exists in Grimoire!`);
        return;
      }
      console.warn(`${potionName} is being overwritten in Grimoire.`);
    }
    this.#_index.set(potionName, potion);
    if (Is.thisSomething(recipe)) {
      this.#_recipes.set(potionName, recipe);
    }
    console.log(`🧪 ${potionName} has been etched into the Grimoire.`);
  }
  static getArchetype(potionName) {
    return this.#_index.get(potionName);
  }
  static getRecipe(potionName) {
    return this.#_recipes.get(potionName);
  }
}

export class Brewery {
  static brew(potionName, supplies = null) {
    const potion = Grimoire.getArchetype(potionName);
    if (Is.thisNothing(potion)) {
      throw new Error(`${potionName} not found in the grimoire!`);
    }
    const recipe = Grimoire.getRecipe(potionName);
    if (Is.thisNothing(recipe)) {
      return Object.create(potion.prototype);
    }
    const mixture = this.prepareMixture(recipe, supplies);
    return Object.create(potion.prototype, mixture);
  }
  static prepareMixture(recipe, supplies) {
    const mixture = {};
    for (const ingredient of recipe.ingredients) {
      mixture[ingredient.key] = this.marinate(ingredient, supplies);
    }
    return mixture;
  }
  static marinate(ingredient, supplies) {
    let marinade = ingredient.value;
    if (Is.thisArray(supplies)) {
      const supply = supplies.find((s) => s.ingredientName === ingredient.key);
      if (Is.thisSomething(supply)) {
        marinade = supply.value;
      }
    }
    return {
      value: this.spice(marinade, ingredient),
      writable: ingredient.hasAttribute(IngredientAttributes.Writable),
      enumerable: ingredient.hasAttribute(IngredientAttributes.Enumerable),
      configurable: ingredient.hasAttribute(IngredientAttributes.Configurable)
    };
  }
  static spice(marinade, ingredient) {
    if (ingredient.hasAttribute(IngredientAttributes.String) && !Is.thisString(marinade)) {
      return String(marinade);
    }
    return marinade;
  }
}

export class Wizard {
  static #todo = Promise.resolve();

  static brewPotion(potionName, supplies = null) {
    const brewPotionJob = () => this.#brewPotionJob(potionName, supplies);
    this.#todo = this.#todo.then(brewPotionJob, brewPotionJob);
    let customStr = supplies === null || supplies.length === 0 ? "the" : "customized";
    console.log(`🧙‍♂️ Wizard says: 👍 Agree, I shall brew ${customStr} ${potionName} for you.`);
    return this.#todo;
  }
  static craftPotion(potionName, supplies = null, chants = null) {
    const craftPotionJob = () => this.#craftPotionJob(potionName, supplies, chants);
    this.#todo = this.#todo.then(craftPotionJob, craftPotionJob);
    let customStr = supplies === null || supplies.length === 0 ? "the" : "customized";
    console.log(`🧙‍♂️ Wizard says: 👍 Agree, I shall craft ${customStr} ${potionName} for you.`);
    return this.#todo;
  }
  static enchantPotion(potion, chants = null) {
    const enchantPotionJob = () => this.#enchantPotionJob(potion, chants);
    this.#todo = this.#todo.then(enchantPotionJob, enchantPotionJob);
    console.log(`🧙‍♂️ Wizard says: 👍 Agree, I shall enchant this ${nameof(potion)} for you.`);
    return this.#todo;
  }

  static async #brewPotionJob(potionName, supplies = null) {
    await this.#sleep(369);
    console.log(`🧙‍♂️ Wizard brews: 🫕 ${potionName}`);
    await this.#sleep(693);
    const potion = Brewery.brew(potionName, supplies);
    await this.#sleep(396);
    return potion;
  }
  static async #craftPotionJob(potionName, supplies = null, chants = null) {
    await this.#sleep(369);
    console.log(`🧙‍♂️ Wizard crafts: ⚡ ${potionName}`);
    let potion = await this.#brewPotionJob(potionName, supplies);
    await this.#sleep(693);
    return await this.#enchantPotionJob(potion, chants);
  }
  static async #enchantPotionJob(potion, chants) {
    if (Is.thisArray(chants)) {
      for (let i = 0; i < chants.length; i++) {
        await this.#sleep(963);
        let chant = Matcher.detag(chants[i], potion);
        console.log(`🧙‍♂️ Wizard chants: 🪄 ${nameof(potion)}! ${chant}!!`);
      }
    }
    await this.#sleep(639);
    return potion;
  }
  static #sleep(ms) {
    return new Promise((res) => setTimeout(res, ms));
  }
}

/* *** * *** */

export default Wizard;

/* ================================================================================== */
/* >>>>>>>>>>>>>>>>>>>>>>>>>>>>   END OF: BREWERY.JS    <<<<<<<<<<<<<<<<<<<<<<<<<<<<< */
/* ================================================================================== */
