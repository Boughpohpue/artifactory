/* ================================================================================== */
/* >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>   XHR_OBSERVER.JS   <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< */
/* ================================================================================== */
import { nameof, Is, Otis } from 'https://boughpohpue.github.io/artifacts/js/just/1.0.1/just.js';

/* >>>---> request_method.js >------------------------------------------------------> */
export class RequestMethod {
  static GET = new RequestMethod();
  static PUT = new RequestMethod();
  static HEAD = new RequestMethod();
  static POST = new RequestMethod();
  static PATCH = new RequestMethod();
  static DELETE = new RequestMethod();
  static OPTIONS = new RequestMethod();

  #name;

  get name() {
    if (!this.#name) {
      for (const [key, value] of Object.entries(RequestMethod)) {
        if (value === this) {
          this.#name = key.toUpperCase();
          break;
        }
      }
    }
    return this.#name;
  }

  isMatching(method) {
    return typeof method === "string" && method.toUpperCase() === this.name;
  }

  static get all() {
    return Object.values(RequestMethod).filter(v => v instanceof RequestMethod);
  }

  static match(method) {
    return RequestMethod.all.find(m => m.isMatching(method));
  }

  static ensure(method) {
    if (method instanceof RequestMethod) return method;
    if (typeof method === "string") return RequestMethod.match(method);
    return undefined;
  }
}
/* <------------------------------------------------------< request_method.js <---<<< */

/* >>>---> interceptor.js >---------------------------------------------------------> */
export class Interceptor {
  static #open;
  static #send;
  static #sendHandler;

  static get isInitiated() {
    return !!Interceptor.#open && !!Interceptor.#send;
  }

  static get hasHandler() {
    return typeof Interceptor.#sendHandler === "function";
  }

  static init(sendHandler = null) {
    try {
      if (Interceptor.isInitiated) {
        throw new Error("Already initiated!");
      }

      if (Is.thisFunction(sendHandler)) {
        Interceptor.#sendHandler = sendHandler;
      }

      Interceptor.#open = XMLHttpRequest.prototype.open;
      Interceptor.#send = XMLHttpRequest.prototype.send;

      XMLHttpRequest.prototype.open = Interceptor.#interceptorOpen;
      XMLHttpRequest.prototype.send = Interceptor.#interceptorSend;

      Otis.log("Init complete.", `${Interceptor.name}.${nameof(Interceptor.init)}`);
      return true;
    } catch (e) {
      Otis.log(e, `${Interceptor.name}.${nameof(Interceptor.init)}`);
      return false;
    }
  }

  static applyHandler(sendHandler) {
    try {
      if (Interceptor.hasHandler) {
        throw new Error("Already handled!");
      }
      if (!Is.thisFunction(sendHandler)) {
        throw new Error("Handler must be a function!");
      }

      Interceptor.#sendHandler = sendHandler;
      Otis.log("Handler applied.", `${Interceptor.name}.${nameof(Interceptor.applyHandler)}`);
      return true;
    } catch (e) {
      Otis.log(e, `${Interceptor.name}.${nameof(Interceptor.applyHandler)}`);
      return false;
    }
  }

  static #interceptorOpen(method, url, ...rest) {
    this._url = url;
    this._method = method;
    return Interceptor.#open.call(this, method, url, ...rest);
  }

  static #interceptorSend(...args) {
    this.addEventListener(
      "load",
      function () {
        try {
          let content = this.responseText;
          const contentType = this.getResponseHeader("content-type") ?? "N/A";

          if (contentType === "N/A") {
            const acam = this.getResponseHeader("access-control-allow-methods");
            if (acam) content = acam;
          }

          if (Interceptor.hasHandler) {
            Interceptor.#sendHandler(this._url, this._method, contentType, content);
          }
        } catch (e) {
          Otis.log(e, `${Interceptor.name}.${nameof(Interceptor.#interceptorSend)}`);
        }
      },
      { once: true } // prevents listener accumulation
    );

    return Interceptor.#send.apply(this, args);
  }
}
/* <---------------------------------------------------------< interceptor.js <---<<< */

/* >>>---> request_handler.js >-----------------------------------------------------> */
export class RequestHandler {
  static #customHandler;
  static #initialized = false;

  static get isInitialized() {
    return RequestHandler.#initialized;
  }

  static get hasHandler() {
    return typeof RequestHandler.#customHandler === "function";
  }

  static init(customHandler = null) {
    try {
      if (RequestHandler.isInitialized) {
        throw new Error("Already initialized!");
      }

      if (Is.thisFunction(customHandler)) {
        RequestHandler.#customHandler = customHandler;
      }

      RequestHandler.#initialized = Interceptor.init(RequestHandler.#handle);
      Otis.log("Init complete.", `${RequestHandler.name}.${nameof(RequestHandler.init)}`);
      return RequestHandler.#initialized;
    } catch (e) {
      Otis.log(e, `${RequestHandler.name}.${nameof(RequestHandler.init)}`);
      return false;
    }
  }

  static applyHandler(customHandler) {
    try {
      if (RequestHandler.hasHandler) {
        throw new Error("Already handled!");
      }
      if (!Is.thisFunction(customHandler)) {
        throw new Error("Handler must be a function!");
      }

      RequestHandler.#customHandler = customHandler;
      Otis.log("Handler applied.", `${RequestHandler.name}.${nameof(RequestHandler.applyHandler)}`);
      return true;
    } catch (e) {
      Otis.log(e, `${RequestHandler.name}.${nameof(RequestHandler.applyHandler)}`);
      return false;
    }
  }

  static #handle(url, method, contentType, content) {
    if (RequestHandler.hasHandler) {
      RequestHandler.#customHandler(url, method, contentType, content);
    }
  }
}
/* <-----------------------------------------------------< request_handler.js <---<<< */

export default RequestHandler;
