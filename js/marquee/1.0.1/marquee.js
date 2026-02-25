class Enum {
  constructor() {
    if (this.constructor._sealed)
      throw new Error(`Can't construct Enum instance from outside an enum!`);
  }
  static seal() {
    this._sealed = true;
    Object.freeze(this);
    Object.freeze(this.prototype);
  }
}

class MqSpeed extends Enum {
  static FAST     = new MqSpeed();
  static SLOW     = new MqSpeed();
  static NORMAL   = new MqSpeed();
  static { this.seal(); }
}

class MqDelay extends Enum {
  static NONE   = new MqDelay();
  static LONG   = new MqDelay();
  static SHORT  = new MqDelay();
  static { this.seal(); }
}

class MqRange extends Enum {
  static INNER   = new MqRange();
  static OUTER   = new MqRange();
  static { this.seal(); }
}

class MqHover extends Enum {
  static NONE   = new MqHover();
  static PLAY   = new MqHover();
  static PAUSE  = new MqHover();
  static { this.seal(); }
}

class MqBehavior extends Enum {
  static SLIDE      = new MqBehavior();
  static SCROLL     = new MqBehavior();
  static { this.seal(); }
}

class MqPlayback extends Enum {
  static SINGLE   = new MqPlayback();
  static REPEAT   = new MqPlayback();
  static BOUNCE   = new MqPlayback();
  static { this.seal(); }
}

class MqDirection extends Enum {
  static UP     = new MqDirection();
  static DOWN   = new MqDirection();
  static LEFT   = new MqDirection();
  static RIGHT  = new MqDirection();
  static { this.seal(); }

  get isVertical() { return this === MqDirection.UP || this === MqDirection.DOWN; }
  get isHorizontal() { return this === MqDirection.LEFT || this === MqDirection.RIGHT; }
}

class MqMaps {
  static #speedMap = new Map([
    [MqSpeed.FAST, 144],
    [MqSpeed.NORMAL, 96],
    [MqSpeed.SLOW, 69]
  ]);
  static #delayMap = new Map([
    [MqDelay.NONE, 0],
    [MqDelay.SHORT, 1],
    [MqDelay.LONG, 3]
  ]);

  static getSpeed(speed, deflt = MqSpeed.NORMAL) {
    return this.#speedMap.has(speed)
      ? this.#speedMap.get(speed)
      : typeof speed !== "number"
        ? this.#speedMap.get(deflt)
        : speed;
  }
  static getDelay(delay, deflt = MqDelay.NONE) {
    return this.#delayMap.has(delay)
      ? this.#delayMap.get(delay)
      : typeof delay !== "number"
        ? this.#delayMap.get(deflt)
        : delay;
  }
}

class Marquee {

  static #defaults = {
    allowHtml: false,
    speed: MqSpeed.NORMAL,
    delay: MqDelay.NONE,
    hover: MqHover.PAUSE,
    range: MqRange.OUTER,
    behavior: MqBehavior.SCROLL,
    playback: MqPlayback.REPEAT,
    direction: MqDirection.LEFT,
  };

  static create(text, target = document.body, id = undefined, style = "", options = {}) {
    if (!(target instanceof HTMLElement))
      throw new Error("Target must be an instance of a HTMLElement!");
    if (typeof text !== "string" || text.length === 0)
      throw new Error("Text must be a non-empty string!");

    return this.#appendMarqueeContainer(target, id, style, text,
        this.#validateConfig({ ...this.#defaults, ...options }));
  }

  static #validateConfig(config) {

    const speed = MqMaps.getSpeed(config.speed, this.#defaults.speed);
    config.speed = Math.min(1269, Math.max(36, speed));

    const delay = MqMaps.getDelay(config.delay, this.#defaults.delay);
    config.delay = Math.min(69, Math.max(0, delay));

    if (!(config.playback instanceof MqPlayback)) {
      if (typeof config.playback === "number")
        config.playback = Math.min(12, Math.max(1, config.playback));
      else
        config.playback = Marquee.#defaults.playback;
    }

    if (typeof config.allowHtml !== "boolean")
      config.allowHtml = Marquee.#defaults.allowHtml;

    if (!(config.hover instanceof MqHover))
      config.hover = Marquee.#defaults.hover;

    if (!(config.range instanceof MqRange))
      config.range = Marquee.#defaults.range;

    if (!(config.behavior instanceof MqBehavior))
      config.behavior = Marquee.#defaults.behavior;

    if (!(config.direction instanceof MqDirection))
      config.direction = Marquee.#defaults.direction;

    if (config.behavior === MqBehavior.SLIDE && config.direction.isHorizontal)
      config.direction = MqDirection.UP;

    if (config.behavior === MqBehavior.SCROLL && config.direction.isVertical)
      config.direction = this.#defaults.direction;

    return config;
  }

  static #appendMarqueeContainer(target, id, style, text, config) {

    const container = document.createElement("div");
    container.className = "marquee";
    if (typeof id === "string" && id.length > 0)
      container.id = id;
    if (typeof style === "string" && style.length > 0)
      container.style.cssText = style;

    target.appendChild(container);
    this.#appendMarqueeTrack(container, text, config);

    return container;
  }

  static #appendMarqueeTrack(container, text, config) {

    const track = document.createElement("div");
    track.className = "track";
    if (config.behavior === MqBehavior.SLIDE)
      track.classList.add("multiline");

    const textSpan = document.createElement("span");
    if (config.allowHtml)
      textSpan.innerHTML = text;
    else
      textSpan.textContent = text;
    track.appendChild(textSpan);

    container.appendChild(track);

    config.textWidth = track.scrollWidth;
    config.textHeight = track.scrollHeight;

    if (config.range === MqRange.INNER) {
      if (config.behavior === MqBehavior.SCROLL
        && track.scrollWidth > container.clientWidth) {
          track.appendChild(textSpan.cloneNode(true));
      }
      if (config.behavior === MqBehavior.SLIDE
        && track.scrollHeight > container.clientHeight) {
          const spaceSpan = document.createElement("span");
          spaceSpan.innerHTML = "<br/>";
          track.appendChild(spaceSpan);
          track.appendChild(textSpan.cloneNode(true));
          track.appendChild(spaceSpan.cloneNode(true));
      }
    }

    this.#applyMarqueeHover(container, track, config);
    this.#applyMarqueeAnimation(container, track, config);

    return track;
  }

  static #applyMarqueeHover(container, track, config) {
    if (config.hover === MqHover.NONE) return;

    switch (config.hover) {
      case MqHover.PLAY:
        track.style.animationPlayState = "paused";
        container.addEventListener("mouseenter", () =>
          { track.style.animationPlayState = "running"; });
        container.addEventListener("mouseleave", () =>
          { track.style.animationPlayState = "paused"; });
        break;

      case MqHover.PAUSE:
        container.addEventListener("mouseenter", () =>
          { track.style.animationPlayState = "paused"; });
        container.addEventListener("mouseleave", () =>
          { track.style.animationPlayState = "running"; });
        break;
    }
  }

  static #applyMarqueeAnimation(container, track, config) {

    track.classList.add("animated");

    if (config.behavior === MqBehavior.SCROLL)
      this.#applyScrollAnimation(container, track, config);
    else
      this.#applySlideAnimation(container, track, config);

    track.style.animationDelay = config.delay + "s";
    track.style.animationDirection = this.#getDirection(config);
    track.style.animationIterationCount = this.#getIterationCount(config);
    if (track.style.animationIterationCount !== "infinite") {
      track.addEventListener("animationend", (e) => {
        track.classList.remove("animated");
      }, { once: true });
    }
  }

  static #applyScrollAnimation(container, track, config) {
    if (config.behavior !== MqBehavior.SCROLL) return;

    requestAnimationFrame(() => {
      this.#applyScrollAnimationBounds(container, track, config);
      track.style.animationName = "scroll-horizontal";
    });
  }

  static #applySlideAnimation(container, track, config) {
    if (config.behavior !== MqBehavior.SLIDE) return;

    requestAnimationFrame(() => {
      this.#applySlideAnimationBounds(container, track, config);
      track.style.animationName = "scroll-vertical";
    });
  }

  static #applyScrollAnimationBounds(container, track, config) {
    const textWidth = config.textWidth ?? track.scrollWidth
    const containerWidth = container.clientWidth;

    let x1, x2;
    if (config.playback === MqPlayback.BOUNCE) {
      x1 = config.range === MqRange.INNER
        ? textWidth < containerWidth
          ? containerWidth - textWidth
          : -(textWidth - containerWidth)
        : containerWidth;
      x2 = config.range === MqRange.INNER
        ? 0
        : -textWidth;
    }
    else {
      x1 = config.range === MqRange.INNER
        ? textWidth === track.scrollWidth
          ? containerWidth - textWidth
          : 0
        : containerWidth;
      x2 = config.range === MqRange.INNER && textWidth === track.scrollWidth
        ? 0
        :  -textWidth;
    }

    track.style.setProperty("--mq-start-x", x1 + "px");
    track.style.setProperty("--mq-end-x", x2 + "px");
    track.style.animationDuration = this.#getSpeed(containerWidth, textWidth, config) + "s";
  }

  static #applySlideAnimationBounds(container, track, config) {
    const textHeight = config.textHeight ?? track.scrollHeight
    const containerHeight = container.clientHeight;

    let y1, y2;
    if (config.playback === MqPlayback.BOUNCE) {
      y1 = config.range === MqRange.INNER
        ? textHeight < containerHeight
          ? containerHeight - textHeight
          : -(textHeight - containerHeight)
        : containerHeight;
      y2 = config.range === MqRange.INNER
        ? 0
        : -textHeight;
    }
    else {
      y1 = config.range === MqRange.INNER
        ? textHeight === track.scrollHeight
          ? containerHeight - textHeight
          : 0
        : containerHeight;
      y2 = config.range === MqRange.INNER && textHeight === track.scrollHeight
        ? 0
        :  -textHeight;
    }

    track.style.setProperty("--mq-start-y", y1 + "px");
    track.style.setProperty("--mq-end-y", y2 + "px");
    track.style.animationDuration = this.#getSpeed(containerHeight, textHeight, config) + "s";
  }

  static #getSpeed(containerDimension, textDimension, config) {
    if (containerDimension === 0) return config.speed;

    const totalDistance = config.range === MqRange.INNER
      ? Math.max(containerDimension, textDimension)
      : containerDimension + (textDimension * 2);
    return Math.min(24, totalDistance / config.speed);
  }

  static #getDirection(config) {
    return config.playback === MqPlayback.BOUNCE
      ? config.direction === MqDirection.LEFT || config.direction === MqDirection.UP
        ? "alternate"
        : "alternate-reverse"
      : config.direction === MqDirection.LEFT || config.direction === MqDirection.UP
        ? "normal"
        : "reverse";
  }

  static #getIterationCount(config) {
    return config.playback === MqPlayback.SINGLE
      ? "1"
      : typeof config.playback === "number"
        ? `${config.playback}`
        : "infinite";
  }
}
