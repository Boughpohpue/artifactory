class Enum {
  #value = undefined;
  get value() { return this.#value; }
  get valueType() { return typeof this.#value; }

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
  static seal() {
    this._sealed = true;
    Object.freeze(this);
    Object.freeze(this.prototype);
  }
}

class MqSpeed extends Enum {
  static NORMAL   = new MqSpeed(96);
  static FAST     = new MqSpeed(144);
  static SLOW     = new MqSpeed(69);
  static { this.seal(); }
}

class MqDelay extends Enum {
  static NONE   = new MqDelay(0);
  static SHORT  = new MqDelay(1);
  static LONG   = new MqDelay(3);
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

class MqAxis extends Enum {
  static VERTICAL   = new MqAxis();
  static HORIZONTAL = new MqAxis();
  static { this.seal(); }
  get defaultDirection() {
    return this === MqAxis.VERTICAL
      ? MqDirection.UP
      : MqDirection.LEFT;
  }
}

class MarqueeDefaults {
  static get range() { return MqRange.OUTER; }
  static get hover() { return MqHover.PAUSE; }
  static get delay() { return MqDelay.NONE; }
  static get speed() { return MqSpeed.NORMAL; }
  static get axis() { return MqAxis.HORIZONTAL; }
  static get playback() { return MqPlayback.REPEAT; }
  static get direction() { return MqDirection.LEFT; }
  static get allowHtml() { return false; }
  static get all() {
    return [
      MarqueeDefaults.axis,
      MarqueeDefaults.speed,
      MarqueeDefaults.delay,
      MarqueeDefaults.range,
      MarqueeDefaults.hover,
      MarqueeDefaults.playback,
      MarqueeDefaults.direction,
      MarqueeDefaults.allowHtml
    ];
  }
}

class Marquee {

  static create(text, target = document.body, id = undefined, style = "", options = {}) {
    if (!(target instanceof HTMLElement))
      throw new Error("Target must be an instance of a HTMLElement!");
    if (typeof text !== "string" || text.length === 0)
      throw new Error("Text must be a non-empty string!");

    return this.#appendMarqueeContainer(target, id, style, text,
        this.#validateConfig({ ...MarqueeDefaults.all, ...options }));
  }

  static #validateConfig(config) {

    const speed = MqSpeed.getValue(config.speed, MarqueeDefaults.speed);
    config.speed = Math.min(1269, Math.max(36, speed));

    const delay = MqDelay.getValue(config.delay, MarqueeDefaults.delay);
    config.delay = Math.min(69, Math.max(0, delay));

    if (typeof config.allowHtml !== "boolean")
      config.allowHtml = MarqueeDefaults.allowHtml;

    config.playback = typeof config.playback === "number"
      ? Math.min(12, Math.max(1, config.playback))
      : MqPlayback.ensure(config.playback) ?? MarqueeDefaults.playback;

    config.axis = MqAxis.ensure(config.axis) ?? MarqueeDefaults.axis;
    config.hover = MqHover.ensure(config.hover) ?? MarqueeDefaults.hover;
    config.range = MqRange.ensure(config.range) ?? MarqueeDefaults.range;
    config.direction = MqDirection.ensure(config.direction) ?? MarqueeDefaults.direction;
    if ((config.axis === MqAxis.VERTICAL && config.direction.isHorizontal)
      || (config.axis === MqAxis.HORIZONTAL && config.direction.isVertical))
        config.direction = config.axis.defaultDirection;

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
    if (config.axis === MqAxis.HORIZONTAL)
      this.#appendHorizontalText(container, track, text, config);
    else {
      track.classList.add("multiline");
      this.#appendVerticalText(container, track, text, config);
    }

    return track;
  }

  static #appendHorizontalText(container, track, text, config) {
    const textSpan = document.createElement("span");
    if (config.allowHtml)
      textSpan.innerHTML = text;
    else
      textSpan.textContent = text;

    track.appendChild(textSpan);
    container.appendChild(track);

    if (container.clientHeight <= 0) return track;

    if (config.range === MqRange.INNER
      && track.scrollWidth > container.clientWidth) {
        config.textWidth = track.scrollWidth;
        track.appendChild(textSpan.cloneNode(true));
    }
    this.#applyMarqueeAnimation(container, track, config);
    this.#applyMarqueeHover(container, track, config);

    return track
  }

  static #appendVerticalText(container, track, text, config) {
    const textWrapper = document.createElement("div");
    const textSpan = document.createElement("span");

    if (config.allowHtml) {
      textSpan.innerHTML = text;
      textWrapper.appendChild(textSpan);
    }
    else if (this.#isSingleLine(text)) {
      textSpan.textContent = text;
      textWrapper.appendChild(textSpan);
    }
    else {
      const lines = this.#getTextLines(text).filter((l) => l.length > 0);
      for (var i = 0; i < lines.length; i++) {
        const lineSpan = document.createElement("span");
        lineSpan.textContent = lines[i];
        textWrapper.appendChild(lineSpan);
        if (i < lines.length - 1) {
          const spaceSpan = document.createElement("span");
          spaceSpan.innerHTML = "<br/>";
          textWrapper.appendChild(spaceSpan);
        }
      }
    }

    track.appendChild(textWrapper);
    container.appendChild(track);

    if (container.clientHeight <=  0) return track;

    if (config.range === MqRange.INNER
    && track.scrollHeight > container.clientHeight) {
      config.textHeight = track.scrollHeight;
      const spaceSpan = document.createElement("span");
      spaceSpan.innerHTML = "<br/>"
      track.appendChild(spaceSpan);
      track.appendChild(textWrapper.cloneNode(true));
      track.appendChild(spaceSpan.cloneNode(true));
    }
    this.#applyMarqueeAnimation(container, track, config);
    this.#applyMarqueeHover(container, track, config);

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

    if (config.axis === MqAxis.HORIZONTAL)
      this.#applyHorizontalAnimation(container, track, config);
    else
      this.#applyVerticalAnimation(container, track, config);

    track.style.animationDelay = config.delay + "s";
    track.style.animationDirection = this.#getDirection(config);
    track.style.animationIterationCount = this.#getIterationCount(config);
    if (track.style.animationIterationCount !== "infinite") {
      track.addEventListener("animationend", (e) => {
        track.classList.remove("animated");
      }, { once: true });
    }
  }

  static #applyHorizontalAnimation(container, track, config) {
    if (config.axis !== MqAxis.HORIZONTAL) return;

    requestAnimationFrame(() => {
      this.#applyAnimationBounds(container, track, config);
      track.style.animationName = "marquee-horizontal";
    });
  }

  static #applyVerticalAnimation(container, track, config) {
    if (config.axis !== MqAxis.VERTICAL) return;

    requestAnimationFrame(() => {
      this.#applyAnimationBounds(container, track, config);
      track.style.animationName = "marquee-vertical";
    });
  }

  static #applyAnimationBounds(container, track, config) {
	  const axis = config.direction.isHorizontal ? "x" : "y";
    const textSize = config.direction.isHorizontal
		? config.textWidth ?? track.scrollWidth
		: config.textHeight ?? track.scrollHeight ;
    const containerSize = config.direction.isHorizontal
		? container.clientWidth
		: container.clientHeight;

    let start, end;
    if (config.playback === MqPlayback.BOUNCE) {
      start = config.range === MqRange.INNER
        ? textSize < containerSize
          ? containerSize - textSize
          : -(textSize - containerSize)
        : containerSize;
      end = config.range === MqRange.INNER
        ? 0
        : -textSize;
    }
    else {
      start = config.range === MqRange.INNER
        ? textSize === track.scrollSize
          ? containerSize - textSize
          : 0
        : containerSize;
      end = config.range === MqRange.INNER
      && textSize === track.scrollSize
        ? 0
        :  -textSize;
    }

    track.style.setProperty(`--mq-start-${axis}`, start + "px");
    track.style.setProperty(`--mq-end-${axis}`, end + "px");
    track.style.animationDuration = this.#getSpeed(containerSize, textSize, config) + "s";
  }

  static #getSpeed(containerDimension, textDimension, config) {
    const totalDistance = config.range === MqRange.INNER
      ? Math.max(containerDimension, textDimension)
      : containerDimension + (textDimension * 2);
    return totalDistance / config.speed;
  }

  static #getDirection(config) {
    return config.playback === MqPlayback.BOUNCE
      ? config.direction === MqDirection.LEFT
      || config.direction === MqDirection.UP
        ? "alternate"
        : "alternate-reverse"
      : config.direction === MqDirection.LEFT
      || config.direction === MqDirection.UP
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

  static #isSingleLine(text) {
    return text.indexOf('\n') < 0
      && text.indexOf('\r') < 0
      && text.indexOf('<br') < 0;
  }
  static #getTextLines(text) {
    return text.replace(/(\n|\r|\r\n)/g, '<br/>').split('<br/>');
  }
}
