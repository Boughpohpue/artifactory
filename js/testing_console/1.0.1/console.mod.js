/* ================================================================================== */
/* >>>>>>>>>>>>>>>>>>>>>>>>>>>>>   TESTING_CONSOLE.JS   <<<<<<<<<<<<<<<<<<<<<<<<<<<<< */
/* ================================================================================== */

class TextHelper {
  static #scriptBlockPrefix = '=>';

  static get #sbPrfx() { return this.#scriptBlockPrefix; }
  static get scriptBlockPrefix() { return this.#scriptBlockPrefix; }
  static set scriptBlockPrefix(val) { this.#scriptBlockPrefix = val; }

  static count(str, s) {
	if (!str || !s) { return; }
	let sub = str.replaceAll(s, "");
	return (str.length - sub.length) / s.length;
  }
  static countLines(str) {
	if (str === '') { return 1; }
	return this.count(str, '\n') + 1;
  }

  static clean(str) {
	while (str.includes('\n\n')) { str = str.replace('\n\n', '\n'); }
	while (str.endsWith('\n')) { str = str.substring(0, str.length - 1); }
	return str.trim();
  }
  static cleanScript(str) {
	while (str.endsWith('\n\n')) { str = str.substring(0, str.length - 1); }
	return str;
  }

  static isScript(str) {
	return str.startsWith(this.#sbPrfx);
  }
  static getScriptBody(str) {
	if (!this.isScript(str)) { return ""; }
	let scriptBody = str.substring(this.#sbPrfx.length);
	return this.clean(scriptBody);
  }
  static isSubmittable(str) {
	return this.isScript(str)
	  ? this.getScriptBody(str).length > 0
	  : this.clean(str).length > 0;
  }
  static isSubmittableScript(str) {
	return this.isSubmittable(str) && str.endsWith('\n\n');
  }

  static parseNumTxtPair(str) {
	if (!str) { return; }
	const match = str.match(/^(\d+(?:\.\d+)?)(.*)$/);
	if (!match) { return; }
	const txt = match[2];
	const numStr = match[1];
	const num = numStr.includes('.')
	  ? parseFloat(numStr)
	  : parseInt(numStr, 10);
	return { num, txt };
  }
}

class DOMHelper {
  static get doc() { return document; }
  static get body() { return document.body; }
  static get head() { return document.head; }
  static get currentScriptUrl() { return document.currentScript.src; }
  static get scrollingElement() { return (document.scrollingElement || document.body); }

  static getCurrentDirectoryUrl(withEndSeparator = false) {
	const currentUrl = this.currentScriptUrl;
	if (!currentUrl) return;
	const separator = currentUrl.includes("\\")
	  ? "\\"
	  : currentUrl.includes("/")
		? "/"
		: undefined;
	if (!separator) return;
	const offset = withEndSeparator ? 1 : 0;
	return currentUrl.substring(0, currentUrl.lastIndexOf(separator) + offset);
  }

  static focusElement(elem) {
	if (!(elem instanceof HTMLElement))
	  throw new Error("elem must be ad instance of HTMLElement!");
	elem.focus();
  }
  static getElementById(id) {
	return document.getElementById(id);
  }
  static getElement(tagName, attributesMap = undefined) {
	if (attributesMap?.has("id"))
	  return document.getElementById(attributesMap.get("id"));
	if (!tagName) throw new Error("tagName is null or empty!");
	let selector = tagName;
	if (attributesMap?.size > 0)
	  for (const [key, val] of attributesMap)
		if (typeof key === "string" && typeof val === "string")
		  selector += `[${key}="${val}"]`;
	return document.querySelector(selector);
  }
  static getElements(tagName, attributesMap = undefined) {
	if (!tagName) throw new Error("tagName is null or empty!");
	let selector = tagName;
	if (attributesMap?.size > 0)
	  for (const [key, val] of attributesMap)
		if (typeof key === "string" && typeof val === "string")
		  selector += `[${key}="${val}"]`;
	return document.querySelectorAll(selector);
  }
  static elementExists(tagName, attributesMap = undefined) {
	return this.getElement(tagName, attributesMap) !== null;
  }
  static createElement(tagName, attributesMap = undefined, listenersMap = undefined) {
	if (attributesMap?.has("id") && this.elementExists(tagName, attributesMap))
	  return null;
	let elem = document.createElement(tagName);
	if (elem instanceof HTMLUnknownElement)
	  throw new Error("tagName must be a valid HTML tag name!");
	if (attributesMap?.size > 0)
	  for (const [key, val] of attributesMap)
		if (key === "classList")
		  this.addCssClasses(elem, val);
		else if (typeof key === "string")
		  elem.setAttribute(key, String(val));
	if (listenersMap?.size > 0)
	  this.addListeners(elem, listenersMap);
	return elem;
  }
  static addElement(targetElement, tagName, attributesMap = undefined, listenersMap = undefined) {
	if (!(targetElement instanceof HTMLElement))
	  throw new Error("targetElement must be an instance of HTMLElement!");
	const elem = this.createElement(tagName, attributesMap, listenersMap);
	if (elem !== null) return targetElement.appendChild(elem);
  }
  static removeElement(targetElement, elemToRemove) {
	if (!(targetElement instanceof HTMLElement))
	  throw new Error("targetElement must be an instance of HTMLElement!");
	return targetElement.removeChild(elemToRemove);
  }
  static clearElement(elem) {
	if (!(elem instanceof HTMLElement))
	  throw new Error("elem must be an instance of HTMLElement!");
	while (elem.lastChild) elem.removeChild(elem.lastChild);
  }

  static addTextNode(targetElement, text) {
	if (!(targetElement instanceof HTMLElement))
	  throw new Error("targetElement must be an instance of HTMLElement!");
	return targetElement.appendChild(document.createTextNode(text));
  }

  static addListener(elem, name, listener) {
	if (!(elem instanceof HTMLElement))
	  throw new Error("elem must be ad instance of HTMLElement!");
	if (typeof name !== "string" || name.length === 0)
	  throw new Error("Event name must be a non-empty string!");
	if (typeof listener !== "function")
	  throw new Error("Event listener must be a function!");
	elem.addEventListener(name, listener);
  }
  static addListeners(elem, listenersMap) {
	if (!(elem instanceof HTMLElement))
	  throw new Error("elem must be an instance of HTMLElement!");
	if (listenersMap?.size === 0) { return; }
	for (const [key, val] of listenersMap)
	  this.addListener(elem, key, val);
  }

  static addCssClass(elem, className) {
	if (!(elem instanceof HTMLElement))
	  throw new Error("elem must be an instance of HTMLElement!");
	if (typeof className !== "string" || className.length === 0) { return; }
	if (!elem.classList.contains(className)) elem.classList.add(className);
  }
  static addCssClasses(elem, classNames) {
	if (!(elem instanceof HTMLElement))
	  throw new Error("elem must be an instance of HTMLElement!");
	if (typeof classNames === "string") classNames = [ classNames ];
	if (!Array.isArray(classNames)) { return; }
	classNames.forEach((cls) => this.addCssClass(elem, cls));
  }

  static getCssValue(style, cssPropertyName) {
	if (!style || !cssPropertyName) return null;
	return style.getPropertyValue(cssPropertyName);
  }
  static getElementCssValue(elem, cssPropertyName) {
	if (!elem || !cssPropertyName) return null;
	return this.getCssValue(window.getComputedStyle(elem), cssPropertyName);
  }
  static getElementCssValueById(elementId, cssPropertyName) {
	if (!elementId) return null;
	return this.getElementCssValue(document.getElementById(elementId), cssPropertyName);
  }

  static scrollToBottom() {
	DOMHelper.scrollingElement.scrollTop = DOMHelper.scrollingElement.scrollHeight;
  }
  static orderScrollToBottom(timeout = 240) {
	setTimeout(this.scrollToBottom, timeout);
  }
}

class Chronicler {
  static #scrollIdx = -1;
  static #shelfSize = 69;
  static #shelvedScrolls = [];
  static #nonScrollValue = "";

  static get shelfSize() { return this.#shelfSize; }
  static set shelfSize(val) {
	if (val === this.#shelfSize || val < 0) { return; }
	this.#resetIdx();
	this.#shelfSize = val;
	this.#cleanShelf();
  }

  static get count() { return this.#shelvedScrolls.length; }
  static get hasScrolls() { return this.count > 0; }

  static get currScroll() {
	return this.hasScrolls && this.#scrollIdx >= 0
	  ? this.#shelvedScrolls[this.#scrollIdx]
	  : this.#nonScrollValue;
  }
  static get prevScroll() {
	if (this.#scrollIdx === -1)
	{ this.#scrollIdx = this.count - 1; }
	else if (this.#scrollIdx > 0)
	{ this.#scrollIdx--; }
	return this.currScroll;
  }
  static get nextScroll() {
	if (this.#scrollIdx >= 0)
	{ this.#scrollIdx++; }
	if (this.#scrollIdx === this.count)
	{ this.#resetIdx(); }
	return this.currScroll;
  }

  static inscribe(str) {
	if (!str) { return; }
	this.#resetIdx();
	this.#shelvedScrolls = this.#shelvedScrolls.filter(s => s !== str);
	this.#shelvedScrolls.push(str);
	this.#cleanShelf();
  }
  static clearShelf() {
	this.#resetIdx();
	this.#shelvedScrolls = [];
  }
  static reset(shelfSize = 69, nonScrollValue = "") {
	this.shelfSize = shelfSize;
	this.#scrollIdx = -1;
	this.#shelvedScrolls = [];
	this.#nonScrollValue = nonScrollValue;
  }

  static #resetIdx() {
	this.#scrollIdx = -1;
  }
  static #cleanShelf() {
	while (this.count > this.#shelfSize) {
	  this.#shelvedScrolls.shift();
	}
  }
}

class Printer {
  static #queue = [];
  static #initiated = false;
  static #isPrinting = false;
  static #outputElement = undefined;
  static #useAnimationFrameRequest = false;

  static get #hasItems() { return this.#queue.length > 0; }
  static get #nextItem() { return this.#queue.shift(); }

  static useTimeouts() { this.#useAnimationFrameRequest = false; }
  static useAnimations() { this.#useAnimationFrameRequest = true; }

  static init(outputElement, useAnimationFrameRequest = false) {
	if (this.#initiated) { return; }
	if (!(outputElement instanceof HTMLElement))
	  throw new Error('outputElement must be a instance of HTMLElement!');
	this.#queue = [];
	this.#isPrinting = false;
	this.#outputElement = outputElement;
	this.#useAnimationFrameRequest = useAnimationFrameRequest;
	this.#initiated = true;
  }
  static enqueue(msg) {
	if (!this.#initiated) throw new Error('Printer not initiated!');
	this.#queue.push(
	  msg.message.split('\n')
	  .map((line) => ({ content: line, attributes: msg.options })));
	if (!this.#isPrinting) { this.#print(); }
  }
  static clear() {
	if (!this.#initiated) throw new Error('Printer not initiated!');
	DOMHelper.clearElement(this.#outputElement);
  }
  static #print() {
	if (this.#isPrinting || !this.#hasItems) { return; }
	this.#isPrinting = true;
	this.#printItem(this.#nextItem);
  }
  static #printItem(item) {
	if (!item || item.length === 0) {
	  this.#isPrinting = false;
	  setTimeout(() => this.#print(), 369);
	  return;
	}
	this.#addTextItem(item.shift());
	DOMHelper.scrollToBottom();
	if (this.#useAnimationFrameRequest) {
	  requestAnimationFrame(() => this.#printItem(item));
	}
	else {
			setTimeout(() => this.#printItem(item), 144);
	}
  }
  static #addNewLine() {
	DOMHelper.addElement(this.#outputElement, "br")
  }
  static #addTextItem(itm) {
	this.#addNewLine();
	DOMHelper.addTextNode(
	  DOMHelper.addElement(
		this.#outputElement,
		"span",
		itm.attributes),
	  itm.content);
  }
}

class StdConsoleHandler {
  static #log   = undefined;
  static #info  = undefined;
  static #warn  = undefined;
  static #error = undefined;
  static #clear = undefined;
  static #initiated = false;
  static #isEnabled = false;

  static get #isActive() { return this.#initiated && this.#isEnabled; }

  static enable() { this.#isEnabled = true; }
  static disable() { this.#isEnabled = false; }
  static clear() { if (this.#isActive) { this.#clear(); } }
  static log(args) { if (this.#isActive) { this.#log(args); } }
  static info(args) { if (this.#isActive) { this.#info(args); } }
  static warn(args) { if (this.#isActive) { this.#warn(args); } }
  static error(args) { if (this.#isActive) { this.#error(args); } }

  static init(enabled = false) {
	if (this.#initiated) { return; }
	this.#log   = console.log;
	this.#info  = console.info;
	this.#warn  = console.warn;
	this.#error = console.error;
	this.#clear = console.clear;
	this.#isEnabled = enabled;
	this.#initiated = true;
  }
  static release(destroy = true) {
	if (!this.#initiated) { return; }
	console.log   = this.#log;
	console.info  = this.#info;
	console.warn  = this.#warn;
	console.error = this.#error;
	console.clear = this.#clear;
	if (destroy) this.#destroy();
	this.#isEnabled = false;
	this.#initiated = false;
  }
  static #destroy() {
	this.#log   = undefined;
	this.#info  = undefined;
	this.#warn  = undefined;
	this.#error = undefined;
	this.#clear = undefined;
  }
}

class DOMController {
  static #contentElement = undefined;
  static #userInputElement = undefined;
  static #userInputSubmitFn = undefined;

  static init(uiSubmitFn = undefined) {
	if (typeof uiSubmitFn !== "undefined"
	  && typeof uiSubmitFn !== "function")
		throw new Error("Provided uiSubmitFn is not a function!");
	this.#userInputSubmitFn = uiSubmitFn;
	this.#addViewportElement();
	this.#addStylesLinkElement();
		this.#addHeaderElement();
	this.#addOutputElement();
	this.#contentElement = DOMHelper.getElementById('log_content');
	if (typeof this.#userInputSubmitFn === "function") {
	  this.#addInputElement();
	  this.#userInputElement = DOMHelper.getElementById('user_input');
	  DOMHelper.addListener(DOMHelper.body, "keyup", DOMController.#onBodyKeyUp);
	}
  }

  static get #inputElem() { return this.#userInputElement; }
  static get #inputElemValue() { return this.#userInputElement.value; }
  static set #inputElemValue(val) { this.#userInputElement.value = val; }
  static get contentElement() { return this.#contentElement; }

  static #addViewportElement() {
	DOMHelper.addElement(
	  document.head,
	  "meta",
	  new Map([
		["name", "viewport"],
		["content", "width=device-width, initial-scale=1.0"]]));
  }
  static #addStylesLinkElement() {
	const href = `${DOMHelper.getCurrentDirectoryUrl()}/console.css`;
	DOMHelper.addElement(
	  document.head,
	  "link",
	  new Map([
		["href", href],
		["type", "text/css"],
		["rel", "stylesheet"]]));
  }
	static #addHeaderElement() {
		DOMHelper.addTextNode(
		DOMHelper.addElement(
		  DOMHelper.addElement(
			document.body,
			"div",
			new Map([
			  ["id", "console_header"],
			  ["classList", ["console-header"]]])),
		  "pre",
		  new Map([
			["id", "header_content"],
			["classList", ["header-content"]]])),
		this.#getHeaderText());
  }
  static #addOutputElement() {
	DOMHelper.addElement(
	  DOMHelper.addElement(
		document.body,
		"div",
		new Map([
		  ["id", "console_output"],
		  ["classList", ["console-output"]]])),
	  "pre",
	  new Map([
		["id", "log_content"],
		["classList", ["log-content"]]]));
  }
  static #addInputElement() {
	DOMHelper.addElement(
	  document.body,
	  "textarea",
	  new Map([
		["id", "user_input"],
		["rows", "1"],
		["spellcheck", "false"],
		["classList", ["user-input", "user-input-text", "user-input-hidden"]]]),
	  new Map([
		["keyup", DOMController.#onInputElementKeyUp],
		["focusout", DOMController.#onInputElementFocusOut]]));
  }

  static #onBodyKeyUp(e) {
	if (e.key === 'Enter'
	  && DOMController.#inputElem.classList.contains('user-input-hidden')) {
		DOMController.#showUserInputElement();
	}
  }
  static #onInputElementKeyUp(e) {
	DOMController.#handleInputKey(e.key);
  }
  static #onInputElementFocusOut() {
	DOMController.#hideUserInputElement();
  }

  static #showUserInputElement() {
	if (!DOMController.#inputElem.classList.contains('user-input-hidden'))
	{ return; }
	DOMController.#inputElem.classList.remove('user-input-hidden');
	DOMHelper.focusElement(DOMController.#inputElem);
	DOMHelper.orderScrollToBottom();
  }
  static #hideUserInputElement() {
	if (DOMController.#inputElem.classList.contains('user-input-hidden')) {
	  return;
	}
	DOMController.#inputElem.classList.add('user-input-hidden');
		DOMHelper.focusElement(document.body);
		DOMHelper.orderScrollToBottom();
  }
  static #orderHideUserInputElement() {
	setTimeout(() => DOMController.#hideUserInputElement(), 9369);
  }

  static #handleInputKey(key) {
	if (!this.#inputElem) { return; }
	const rawContent = this.#inputElemValue;
	if (key === 'ArrowUp') {
	  this.#inputElemValue = Chronicler.prevScroll;
	}
	else if (key === 'ArrowDown') {
	  this.#inputElemValue = Chronicler.nextScroll;
	}
	else if (key === '>'
	  && rawContent === TextHelper.scriptBlockPrefix) {
		this.#inputElemValue = `${rawContent}\n`;
	}
	else if (key === 'Backspace'
	  && rawContent === TextHelper.scriptBlockPrefix) {
		this.#inputElemValue = "";
	}
	else if(key === 'Enter') {
	  let canSubmit = true;
	  let content = TextHelper.clean(rawContent);
	  if (TextHelper.isScript(rawContent)) {
		canSubmit = TextHelper.isSubmittableScript(rawContent);
		if (!canSubmit) {
		  this.#inputElemValue = TextHelper.cleanScript(rawContent);
		}
	  }
	  else {
		canSubmit = TextHelper.isSubmittable(content);
		if (!canSubmit) {
		  this.#inputElemValue = content;
		}
	  }
	  if (canSubmit) {
		this.#inputElemValue = "";
		Chronicler.inscribe(content);
		this.#userInputSubmitFn(content);
	  }
	}

	this.#adjustUserInputElementClass();
	this.#adjustUserInputElementHeight();
	if (this.#inputElemValue.length === 0) {
	  this.#orderHideUserInputElement();
	}
  }

  static #adjustUserInputElementHeight() {
	if (!this.#inputElem) { return; }
	let height = TextHelper.parseNumTxtPair(
	  DOMHelper.getElementCssValue(this.#inputElem, 'height'));
	let fontSize = TextHelper.parseNumTxtPair(
	  DOMHelper.getElementCssValue(this.#inputElem, 'font-size'));
	if (!height || !fontSize) { return; }
	let linesCount = TextHelper.countLines(this.#inputElemValue);
	let newHeight = linesCount * fontSize.num * 1.44;
	let newHeightStr = `${newHeight}${fontSize.txt}`;
	this.#inputElem.style.height = newHeightStr;
  }
  static #adjustUserInputElementClass() {
	if (!this.#inputElem) { return; }
	let valueIsScript = TextHelper.isScript(this.#inputElemValue);
	if ((!valueIsScript
		&& this.#inputElem.classList.contains('user-input-text')
		&& !this.#inputElem.classList.contains('user-input-script'))
	  || (valueIsScript
		&& this.#inputElem.classList.contains('user-input-script')
		&& !this.#inputElem.classList.contains('user-input-text'))) {
	  return;
	}
	this.#inputElem.classList.toggle('user-input-text');
	this.#inputElem.classList.toggle('user-input-script');
	DOMHelper.orderScrollToBottom();
  }

	static #getHeaderText() {
		const headerText =
`██████ ▄▄▄▄▄  ▄▄▄▄ ▄▄▄▄▄▄ ▄▄ ▄▄  ▄▄  ▄▄▄▄   ▄█████  ▄▄▄  ▄▄  ▄▄  ▄▄▄▄  ▄▄▄  ▄▄    ▄▄▄▄▄
██   ██▄▄  ███▄▄   ██   ██ ███▄██ ██ ▄▄   ██     ██▀██ ███▄██ ███▄▄ ██▀██ ██    ██▄▄
██   ██▄▄▄ ▄▄██▀   ██   ██ ██ ▀██ ▀███▀   ▀█████ ▀███▀ ██ ▀██ ▄▄██▀ ▀███▀ ██▄▄▄ ██▄▄▄  by infertus`;
		return headerText;
	}
}

export class TestingConsole {
  static #initiated = false;
  static #loadedScripts = [];
  static #loadedStylesheets = [];

  static init(stdEnabled = false) {
	if (this.#initiated) { return; }
	console.log("Initializing this...");
	this.#loadedScripts = [];
	this.#loadedStylesheets = [];
	StdConsoleHandler.init(true);
	this.#overrideConsole();
	DOMController.init(this.#submit);
	Printer.init(DOMController.contentElement, true);
	StdConsoleHandler.log("TestingConsole initiated!");
	if (!stdEnabled) this.#disableStdConsole();
	this.#initiated = true;
  }

  static #enableStdConsole() { StdConsoleHandler.enable(); }
  static #disableStdConsole() { StdConsoleHandler.disable(); }
  static #printUsingTimeouts() { Printer.useTimeouts(); }
  static #printUsingAnimations() { Printer.useAnimations(); }

  static #clear() {
	if (!this.#initiated) { throw new Error("TestingConsole not initiated!"); }
	Printer.clear();
	StdConsoleHandler.clear();
  }
  static #log(args) {
	if (!this.#initiated) { throw new Error("TestingConsole not initiated!"); }
	let msg = this.#formatArgs(args);
	msg.options.set("classList", ["log"]);
	Printer.enqueue(msg);
	StdConsoleHandler.info(msg.message);
  }
  static #info(args) {
	if (!this.#initiated) { throw new Error("TestingConsole not initiated!"); }
	let msg = this.#formatArgs(args);
	msg.options.set("classList", ["info"]);
	Printer.enqueue(msg);
	StdConsoleHandler.info(msg.message);
  }
  static #warn(args) {
	if (!this.#initiated) { throw new Error("TestingConsole not initiated!"); }
	let msg = this.#formatArgs(args);
	msg.options.set("classList", ["warn"]);
	Printer.enqueue(msg);
	StdConsoleHandler.warn(msg.message);
  }
  static #error(args) {
	if (!this.#initiated) { throw new Error("TestingConsole not initiated!"); }
	let msg = this.#formatArgs(args);
	msg.options.set("classList", ["error"]);
	Printer.enqueue(msg);
	StdConsoleHandler.error(msg.message);
  }
  static #submitText(message) {
	if (!this.#initiated) { throw new Error("TestingConsole not initiated!"); }
	let msg = this.#getMessageObj(message);
	msg.options.set("classList", ["text"]);
	Printer.enqueue(msg);
	StdConsoleHandler.log(msg.message);
  }
  static #submitScript(message) {
	if (!this.#initiated) { throw new Error("TestingConsole not initiated!"); }
	let msg = this.#getMessageObj(message);
	msg.options.set("classList", ["script"]);
	Printer.enqueue(msg);
	StdConsoleHandler.log(msg.message);
  }
  static #submitScriptEval(message) {
	if (!this.#initiated) { throw new Error("TestingConsole not initiated!"); }
	try {
	  let evaluated = eval(message);
	  //let evaluated = new Function(message)();
	  if (!evaluated) { return; }
	  let msg = this.#getMessageObj(`=> ${evaluated}`);
	  msg.options.set("classList", ["script-eval"]);
	  Printer.enqueue(msg);
	  StdConsoleHandler.log(msg.message);
	} catch (e) {
	  this.#error(e.message);
	}
  }
  static #submit(message) {
	if (!TestingConsole.#initiated) { throw new Error("TestingConsole not initiated!"); }
	if (!TextHelper.isScript(message)) {
	  TestingConsole.#submitText(message);
	  return;
	}
	let scriptBody = TextHelper.getScriptBody(message);
	if (scriptBody.length === 0) { return; }
	TestingConsole.#submitScript(scriptBody);
	TestingConsole.#submitScriptEval(scriptBody);
  }

  static #loadScript(url, callback) {
	if (!this.#initiated) { throw new Error("TestingConsole not initiated!"); }
	this.#loadScriptFile(url, 'text/javascript', callback);
  }
  static #reloadScript(index) {
	if (!this.#initiated) { throw new Error("TestingConsole not initiated!"); }
	let scripts = this.#loadedScripts.filter(s => s.type !== 'module');
	if (index <= 0 || index > scripts.length) {
	  return 'Script index is out of range!';
	}
	let script = scripts[index - 1];
	return this.loadScript(script.src);
  }
  static #listScripts() {
	if (!this.#initiated) { throw new Error("TestingConsole not initiated!"); }
	let scripts = this.#loadedScripts.filter(s => s.type !== 'module').map(m => m.src);
	let retval = `Loaded scripts (${scripts.length}):`;
	for (let i = 0; i < scripts.length; i++) {
	  retval += `\n${i+1}. ${scripts[i]}`;
	}
	return retval;
  }
  static #loadModule(url, callback) {
	if (!this.#initiated) { throw new Error("TestingConsole not initiated!"); }
	this.#loadScriptFile(url, 'module', callback);
  }
  static #reloadModule(index) {
	if (!this.#initiated) { throw new Error("TestingConsole not initiated!"); }
	let modules = this.#loadedScripts.filter(s => s.type === 'module');
	if (index <= 0 || index > modules.length) {
	  return 'Module index is out of range!';
	}
	let mod = modules[index - 1];
	return this.loadModule(mod.src);
  }
  static #listModules() {
	if (!this.#initiated) { throw new Error("TestingConsole not initiated!"); }
	let modules = this.#loadedScripts.filter(s => s.type === 'module').map(m => m.src);
	let retval = `Loaded modules (${modules.length}):`;
	for (let i = 0; i < modules.length; i++) {
	  retval += `\n${i+1}. ${modules[i]}`;
	}
	return retval;
  }
  static #loadStylesheet(url) {
	if (!this.#initiated) { throw new Error("TestingConsole not initiated!"); }
	this.#loadStylesheetFile(url);
  }
  static #reloadStylesheet(index) {
	if (!this.#initiated) { throw new Error("TestingConsole not initiated!"); }
	let sheets = this.#loadedStylesheets;
	if (index <= 0 || index > sheets.length) {
	  return 'Stylesheet index is out of range!';
	}
	let sheet = sheets[index - 1];
	return this.loadStylesheet(sheet.href);
  }
  static #listStylesheets() {
	if (!this.#initiated) { throw new Error("TestingConsole not initiated!"); }
	let sheets = this.#loadedStylesheets.map(s => s.href);
	let retval = `Loaded stylesheets (${sheets.length}):`;
	for (let i = 0; i < sheets.length; i++) {
	  retval += `\n${i+1}. ${sheets[i]}`;
	}
	return retval;
  }

  static #loadStylesheetFile(url) {
	if (!this.#initiated) { throw new Error("TestingConsole not initiated!"); }
	const linkElement = document.createElement('link');
	linkElement.rel = "stylesheet";
	linkElement.type = "text/css";
	linkElement.href = url;
	this.#loadedStylesheets.push(document.head.appendChild(linkElement));
  }
  static #loadScriptFile(url, type, callback) {
	const existing = this.#loadedScripts.find(s => s.src === url);
	const scriptElement = document.createElement('script');
	scriptElement.onreadystatechange = callback;
	scriptElement.onload = callback;
	scriptElement.type = type;
	scriptElement.src = url;
	if (!existing) {
	  this.#loadedScripts.push({
		src: url,
		type: type,
		counter: 1,
		element: document.head.appendChild(scriptElement)});
	}
	else {
	  document.head.removeChild(existing.element);
	  scriptElement.src = `${url}?c=${existing.counter++}`;
	  existing.element = document.head.appendChild(scriptElement);
	}
  }

	static #getMessageObj(message, options = undefined) {
		const opts = options instanceof Map ? options : new Map();
		return { message: message, options: opts };
	}
  static #formatArgs(args) {
	if (args.length === 0) return;
	const [first, ...rest] = args;
	const opts = rest.length > 0 && rest[rest.length - 1] instanceof Map
			? rest.pop()
			: new Map();
		const breakLines = opts.has("breaklines")
			&& typeof opts.get("breaklines") === "boolean"
			? opts.get("breaklines")
			: false;
	const msgParts = [];
	if (typeof first === "string" && /%[sdifoO]/.test(first)) {
	  let i = 0;
	  const formatted = first.replace(/%[sdifoO]/g, () => {
		const val = rest[i++];
		return this.#formatArg(val, breakLines);
	  });
	  msgParts.push(formatted);
	  for (let j = i; j < rest.length; j++) {
		msgParts.push(this.#formatArg(rest[j], breakLines));
	  }
	} else {
	  msgParts.push(this.#formatArg(first, breakLines));
	  rest.forEach((arg) => msgParts.push(this.#formatArg(arg, breakLines)));
	}
	return this.#getMessageObj(msgParts.join(' '),  opts);
  }
  static #formatArg(arg, breakLines = false) {
	if (arg === null) return 'null';
	if (arg === undefined) return 'undefined';
	if (typeof arg === 'object') return this.#formatObj(arg, breakLines);
	if (typeof arg === 'symbol') return arg.toString();
	if (typeof arg === 'function') return arg.toString();
	return String(arg);
  }
	static #formatObj(obj, breakLines = false) {
	let objStr = JSON.stringify(obj, null, 2);
	objStr = objStr.replace(/"/g, "'");
	if (!breakLines)
	  objStr = objStr.replace(/\s+/g, ' ');
	if (!Array.isArray(obj))
	  objStr = objStr.replace(/'([^']+)':/g, '$1:');
	return objStr;
  }

  static #overrideConsole() {
	console.init = () => this.init();
	console.clear = () => this.#clear();
	console.log = (...args) => this.#log([...args]);
	console.info = (...args) => this.#info([...args]);
	console.warn = (...args) => this.#warn([...args]);
	console.error = (...args) => this.#error([...args]);
	console.enableStdConsole = () => this.#enableStdConsole();
	console.disableStdConsole = () => this.#disableStdConsole();
	console.printUsingTimeouts =  () => this.#printUsingTimeouts();
	console.printUsingAnimations = () => this.#printUsingAnimations();
	console.loadScript = (url, callback) => this.#loadScript(url, callback);
	console.reloadScript = (index) => { return this.#reloadScript(index); };
	console.listScripts = () => { return this.#listScripts(); };
	console.loadModule = (url, callback) => this.#loadModule(url, callback);
	console.reloadModule = (index) => { return this.#reloadModule(index); };
	console.listModules = () => { return this.#listModules(); };
	console.loadStylesheet = (url) => this.#loadStylesheet(url);
	console.reloadStylesheet = (index) => { return this.#reloadStylesheet(index); };
	console.listStylesheets = () => { return this.#listStylesheets(); };
	console.help = function () {
	  const availableFunctions = [];
	  availableFunctions.push('console.init(stdEnabled)');
	  availableFunctions.push('console.help()');
	  availableFunctions.push('console.clear()');
	  availableFunctions.push('console.log(...args, Map? opts)');
	  availableFunctions.push('console.info(...args, Map? opts)');
	  availableFunctions.push('console.warn(...args, Map? opts)');
	  availableFunctions.push('console.error(...args, Map? opts)');
	  availableFunctions.push('console.enableStdConsole()');
	  availableFunctions.push('console.disableStdConsole()');
	  availableFunctions.push('console.printUsingTimeouts()');
	  availableFunctions.push('console.printUsingAnimations()');
	  availableFunctions.push('console.loadScript(url)');
	  availableFunctions.push('console.listScripts()');
	  availableFunctions.push('console.reloadScript(index)');
	  availableFunctions.push('console.loadModule(url)');
	  availableFunctions.push('console.listModules()');
	  availableFunctions.push('console.reloadModule(index)');
	  availableFunctions.push('console.loadStylesheet(url)');
	  availableFunctions.push('console.listStylesheets()');
	  availableFunctions.push('console.reloadStylesheet(index)');
	  return `Available functions:\n${availableFunctions.join("\n")}`;
	};
  }
}

export default TestingConsole;

/* ================================================================================== */
/* >>>>>>>>>>>>>>>>>>>>>>>>>   END OF: TESTING_CONSOLE.JS   <<<<<<<<<<<<<<<<<<<<<<<<< */
/* ================================================================================== */
