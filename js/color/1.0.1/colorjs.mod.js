import Enum from 'https://boughpohpue.github.io/artifactory/js/enum/1.0.1/enum.mod.js'

export class ColorHelper {
  static isHexColor(s) {
    return s.match(/^#?([A-F0-9]{3,4}|[A-F0-9]{6}|[A-F0-9]{8})$/i) !== null;
  }
  static isHexColorWithAlpha(s) {
    return s.match(/^#?([A-F0-9]{4}|[A-F0-9]{8})$/i) !== null;
  }
  static isValidChannelValue(n) {
    return typeof(n) === "number" && n >= 0 && n <= 255;
  }
  static isAlphaValue(n) {
    return typeof(n) === "number" && n >= 0.0 && n <= 1.0;
  }
	static channels2hex(channels) {
		if (!channels || !Array.isArray(channels)
		|| channels.length < 3 || channels.length > 4)
			throw new Error("Invalid argument format!");
		return channels.length === 3
      ? `#${channels.map((ch) => ColorHelper.#dec2hex(ch)).join("")}`
      : `${ColorHelper.channels2hex(channels.slice(0, 3))}${ColorHelper.#dec2hex(Math.round(channels[3] * 255))}`;
	}
  static hex2channels(hex) {
    return ColorHelper.isHexColorWithAlpha(hex)
      ? ColorHelper.hex2rgba(hex)
      : ColorHelper.hex2rgb(hex);
  }
	static rgb2hex(r, g, b) {
		return ColorHelper.channels2hex([r, g, b]);
	}
	static rgba2hex(r, g, b, a) {
		return ColorHelper.channels2hex([r, g, b, a * 255]);
	}
  static hex2rgb(hex) {
		return ColorHelper.hex2rgba(hex).slice(0, 3);
	}
	static hex2rgba(hex) {
    if (!ColorHelper.isHexColor(hex)) throw new Error("Provided parameter is of invalid format!");
		hex = ColorHelper.normalizeHex(hex).substring(1);
		let channels = [];
		for (var x = 0; x <= hex.length - 1; x += 2)
			channels.push(parseInt(hex.substring(x, x + 2), 16));
    channels[3] = channels[3] / 255;
		return channels;
	}
  static calculateColorChannelsTransit(channelsFrom, channelsTo, transit) {
    if (transit === 0) return channelsFrom;
    if (transit === 1) return channelsTo;
    const channels = [];
    const from = ColorHelper.normalizeChannels(channelsFrom);
    const to = ColorHelper.normalizeChannels(channelsTo);
    for (let i = 0; i < from.length; i++)
      channels.push(ColorHelper.calculateChannelTransit(from[i], to[i], transit));
		return channels;
	}
	static calculateColorHexTransit(hexFrom, hexTo, transit) {
    return ColorHelper.channels2hex(
      ColorHelper.calculateColorChannelsTransit(
        ColorHelper.hex2channels(hexFrom),
        ColorHelper.hex2channels(hexTo),
        transit));
	}
	static calculateRgbTransitHex(hexFrom, hexTo, transit) {
		return ColorHelper.channels2hex(calculateColorTransitRgb(hexFrom, hexTo, transit));
	}
	static calculateRgbaTransitHex(hexFrom, hexTo, percent) {
		return ColorHelper.channels2hex(calculateColorTransitRgba(hexFrom, hexTo, transit));
	}
	static calculateChannelTransit(channelFrom, channelTo, transit) {
		channelFrom = ColorHelper.#validateChannelValue(channelFrom);
		channelTo = ColorHelper.#validateChannelValue(channelTo);
		return channelFrom < channelTo
			? channelFrom + Math.round(Math.floor((channelTo - channelFrom) * transit))
			: channelFrom - Math.round(Math.floor((channelFrom - channelTo) * transit));
	}
  static getContrastColor(hex) {
    [r,g,b] = ColorHelper.hex2rgb(hex);
    const luminance = (0.2126 * r) + (0.7152 * g) + (0.0722 * b);
    return luminance > 140 ? "#000000" : "#FFFFFF";
  }
  static invertHsl(h, s, l) {
    return [(h + 180) % 360, s, 1 - l];
  }
  static rgb2hsl(r, g, b) {
    const max = Math.max(r,g,b);
    const min = Math.min(r,g,b);
    let h, s, l = (max+min)/2;
    if (max === min) { h = s = 0; }
    else {
      const d = max - min;
      s = l > 0.5 ? d/(2-max-min) : d/(max+min);
      switch(max){
        case r: h=(g-b)/d+(g<b?6:0); break;
        case g: h=(b-r)/d+2; break;
        case b: h=(r-g)/d+4; break;
      }
      h/=6;
    }
    return [h*360, s, l];
  }

  static hsl2rgb(h, s, l) {
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;

    if (h < 60)       [r,g,b] = [c,x,0];
    else if (h < 120) [r,g,b] = [x,c,0];
    else if (h < 180) [r,g,b] = [0,c,x];
    else if (h < 240) [r,g,b] = [0,x,c];
    else if (h < 300) [r,g,b] = [x,0,c];
    else              [r,g,b] = [c,0,x];
    return [
      Math.round((r + m) * 255),
      Math.round((g + m) * 255),
      Math.round((b + m) * 255)
    ];
  }
  static hsl2rgb2(h, s, l) {
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [
      Math.round(255 * f(0)),
      Math.round(255 * f(8)),
      Math.round(255 * f(4))
    ];
  }
  static normalizeHex(hex) {
    hex = hex.startsWith('#') ? hex.substring(1) : hex;
    if (hex.length === 3 || hex.length === 4)
      hex = hex.split("").map((h) => `${h}${h}`).join("");
    if (hex.length === 6)
      hex = `${hex}ff`;
    return `#${hex}`;
  }
  static normalizeChannels(channels) {
    if (channels.length === 3) channels.push(1.0);
    return channels;
  }
  static resolveColor(color) {
    if (color instanceof Color) return color;
    if (color instanceof NamedColor) return color.value;
    return new Color(color);
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


export class Color {
  #name = "noname";
  #red = 0;
  #green = 0;
  #blue = 0;
  #alpha = 0;

  constructor(...args) {
    const parsed = Color.#parseInput(args);
    if (parsed.name !== undefined)
      this.#name = parsed.name;
    if (parsed.r !== undefined) {
      this.#red = parsed.r;
      this.#green = parsed.g;
      this.#blue = parsed.b;
    }
    if (parsed.a !== undefined)
      this.#alpha = parsed.a;
  }

  get colorName() { return this.#name; }
  get red() { return this.#red; }
  get green() { return this.#green; }
  get blue() { return this.#blue; }
  get alpha() { return this.#alpha; }
  get opacity() { return this.#alpha / 255; }
  get rgb() { return [this.red, this.green, this.blue]; }
  get rgba() { return [this.red, this.green, this.blue, this.opacity]; }
  get hexRgb() { return ColorHelper.channels2hex(this.rgb); }
  get hexRgba() { return ColorHelper.channels2hex([this.red, this.green, this.blue, this.alpha]); }

  toString() {
    return `R:${this.#red} G:${this.#green} B:${this.#blue} A:${this.#alpha} | Name:${this.#name}`;
  }

  static #parseInput(args) {
    const isHex = v => typeof v === "string" && ColorHelper.isHexColor(v);
    const isName = v => typeof v === "string" && !isHex(v);
    const isChannels = v => Array.isArray(v) && (v.length === 3 || v.length === 4);

    let name;
    let r, g, b, a;
    for (const arg of args) {
      if (isName(arg)) name = arg;
      else if (isHex(arg)) {
        const ch = ColorHelper.hex2rgba(arg);
        [r,g,b] = ch;
        a = ch[3] * 255;
      }
      else if (isChannels(arg)) {
        [r,g,b] = arg;
        a = arg.length === 4 ? arg[3] : 255;
      }
      else if (typeof arg === "number") {
        if (r === undefined) r = arg;
        else if (g === undefined) g = arg;
        else if (b === undefined) b = arg;
        else if (a === undefined) a = arg;
      }
    }
    return {name,r,g,b,a};
  }
}

export class NamedColor extends Enum {
    static AliceBlue =                 new NamedColor(new Color("AliceBlue", [240, 248, 255]));
    static AntiqueWhite =              new NamedColor(new Color("AntiqueWhite", [250, 235, 215]));
    static Aqua =                      new NamedColor(new Color("Aqua", [0, 255, 255]));
    static Aquamarine =                new NamedColor(new Color("Aquamarine", [127, 255, 212]));
    static Azure =                     new NamedColor(new Color("Azure", [240, 255, 255]));
    static Beige =                     new NamedColor(new Color("Beige", [245, 245, 220]));
    static Bisque =                    new NamedColor(new Color("Bisque", [255, 228, 196]));
    static Black =                     new NamedColor(new Color("Black", [0, 0, 0]));
    static BlanchedAlmond =            new NamedColor(new Color("BlanchedAlmond", [255, 235, 205]));
    static Blue =                      new NamedColor(new Color("Blue", [0, 0, 255]));
    static BlueViolet =                new NamedColor(new Color("BlueViolet", [138, 43, 226]));
    static Brown =                     new NamedColor(new Color("Brown", [165, 42, 42]));
    static BurlyWood =                 new NamedColor(new Color("BurlyWood", [222, 184, 135]));
    static CadetBlue =                 new NamedColor(new Color("CadetBlue", [95, 158, 160]));
    static Chartreuse =                new NamedColor(new Color("Chartreuse", [127, 255, 0]));
    static Chocolate =                 new NamedColor(new Color("Chocolate", [210, 105, 30]));
    static Coral =                     new NamedColor(new Color("Coral", [255, 127, 80]));
    static CornflowerBlue =            new NamedColor(new Color("CornflowerBlue", [100, 149, 237]));
    static Cornsilk =                  new NamedColor(new Color("Cornsilk", [255, 248, 220]));
    static Crimson =                   new NamedColor(new Color("Crimson", [220, 20, 60]));
    static Cyan =                      new NamedColor(new Color("Cyan", [0, 255, 255]));
    static DarkBlue =                  new NamedColor(new Color("DarkBlue", [0, 0, 139]));
    static DarkCyan =                  new NamedColor(new Color("DarkCyan", [0, 139, 139]));
    static DarkGoldenrod =             new NamedColor(new Color("DarkGoldenrod", [184, 134, 11]));
    static DarkGray =                  new NamedColor(new Color("DarkGray", [169, 169, 169]));
    static DarkGreen =                 new NamedColor(new Color("DarkGreen", [0, 100, 0]));
    static DarkKhaki =                 new NamedColor(new Color("DarkKhaki", [189, 183, 107]));
    static DarkMagenta =               new NamedColor(new Color("DarkMagenta", [139, 0, 139]));
    static DarkOliveGreen =            new NamedColor(new Color("DarkOliveGreen", [85, 107, 47]));
    static DarkOrange =                new NamedColor(new Color("DarkOrange", [255, 140, 0]));
    static DarkOrchid =                new NamedColor(new Color("DarkOrchid", [153, 50, 204]));
    static DarkRed =                   new NamedColor(new Color("DarkRed", [139, 0, 0]));
    static DarkSalmon =                new NamedColor(new Color("DarkSalmon", [233, 150, 122]));
    static DarkSeaGreen =              new NamedColor(new Color("DarkSeaGreen", [143, 188, 143]));
    static DarkSlateBlue =             new NamedColor(new Color("DarkSlateBlue", [72, 61, 139]));
    static DarkSlateGray =             new NamedColor(new Color("DarkSlateGray", [47, 79, 79]));
    static DarkTurquoise =             new NamedColor(new Color("DarkTurquoise", [0, 206, 209]));
    static DarkViolet =                new NamedColor(new Color("DarkViolet", [148, 0, 211]));
    static DeepPink =                  new NamedColor(new Color("DeepPink", [255, 20, 147]));
    static DeepSkyBlue =               new NamedColor(new Color("DeepSkyBlue", [0, 191, 255]));
    static DimGray =                   new NamedColor(new Color("DimGray", [105, 105, 105]));
    static DodgerBlue =                new NamedColor(new Color("DodgerBlue", [30, 144, 255]));
    static Firebrick =                 new NamedColor(new Color("Firebrick", [178, 34, 34]));
    static FloralWhite =               new NamedColor(new Color("FloralWhite", [255, 250, 240]));
    static ForestGreen =               new NamedColor(new Color("ForestGreen", [34, 139, 34]));
    static Fuchsia =                   new NamedColor(new Color("Fuchsia", [255, 0, 255]));
    static Gainsboro =                 new NamedColor(new Color("Gainsboro", [220, 220, 220]));
    static GhostWhite =                new NamedColor(new Color("GhostWhite", [248, 248, 255]));
    static Gold =                      new NamedColor(new Color("Gold", [255, 215, 0]));
    static Goldenrod =                 new NamedColor(new Color("Goldenrod", [218, 165, 32]));
    static Gray =                      new NamedColor(new Color("Gray", [128, 128, 128]));
    static Green =                     new NamedColor(new Color("Green", [0, 128, 0]));
    static GreenYellow =               new NamedColor(new Color("GreenYellow", [173, 255, 47]));
    static Honeydew =                  new NamedColor(new Color("Honeydew", [240, 255, 240]));
    static HotPink =                   new NamedColor(new Color("HotPink", [255, 105, 180]));
    static IndianRed =                 new NamedColor(new Color("IndianRed", [205, 92, 92]));
    static Indigo =                    new NamedColor(new Color("Indigo", [75, 0, 130]));
    static Ivory =                     new NamedColor(new Color("Ivory", [255, 255, 240]));
    static Khaki =                     new NamedColor(new Color("Khaki", [240, 230, 140]));
    static Lavender =                  new NamedColor(new Color("Lavender", [230, 230, 250]));
    static LavenderBlush =             new NamedColor(new Color("LavenderBlush", [255, 240, 245]));
    static LawnGreen =                 new NamedColor(new Color("LawnGreen", [124, 252, 0]));
    static LemonChiffon =              new NamedColor(new Color("LemonChiffon", [255, 250, 205]));
    static LightBlue =                 new NamedColor(new Color("LightBlue", [173, 216, 230]));
    static LightCoral =                new NamedColor(new Color("LightCoral", [240, 128, 128]));
    static LightCyan =                 new NamedColor(new Color("LightCyan", [224, 255, 255]));
    static LightGoldenrodYellow =      new NamedColor(new Color("LightGoldenrodYellow", [250, 250, 210]));
    static LightGreen =                new NamedColor(new Color("LightGreen", [144, 238, 144]));
    static LightGray =                 new NamedColor(new Color("LightGray", [211, 211, 211]));
    static LightPink =                 new NamedColor(new Color("LightPink", [255, 182, 193]));
    static LightSalmon =               new NamedColor(new Color("LightSalmon", [255, 160, 122]));
    static LightSeaGreen =             new NamedColor(new Color("LightSeaGreen", [32, 178, 170]));
    static LightSkyBlue =              new NamedColor(new Color("LightSkyBlue", [135, 206, 250]));
    static LightSlateGray =            new NamedColor(new Color("LightSlateGray", [119, 136, 153]));
    static LightSteelBlue =            new NamedColor(new Color("LightSteelBlue", [176, 224, 230]));
    static LightYellow =               new NamedColor(new Color("LightYellow", [255, 255, 224]));
    static Lime =                      new NamedColor(new Color("Lime", [0, 255, 0]));
    static LimeGreen =                 new NamedColor(new Color("LimeGreen", [50, 205, 50]));
    static Linen =                     new NamedColor(new Color("Linen", [250, 240, 230]));
    static Magenta =                   new NamedColor(new Color("Magenta", [255, 0, 255]));
    static Maroon =                    new NamedColor(new Color("Maroon", [128, 0, 0]));
    static MediumAquaMarine =          new NamedColor(new Color("MediumAquaMarine", [102, 205, 170]));
    static MediumBlue =                new NamedColor(new Color("MediumBlue", [0, 0, 205]));
    static MediumOrchid =              new NamedColor(new Color("MediumOrchid", [186, 85, 211]));
    static MediumPurple =              new NamedColor(new Color("MediumPurple", [147, 112, 219]));
    static MediumSeaGreen =            new NamedColor(new Color("MediumSeaGreen", [60, 179, 113]));
    static MediumSlateBlue =           new NamedColor(new Color("MediumSlateBlue", [123, 104, 238]));
    static MediumSpringGreen =         new NamedColor(new Color("MediumSpringGreen", [0, 250, 154]));
    static MediumTurquoise =           new NamedColor(new Color("MediumTurquoise", [72, 209, 204]));
    static MediumVioletRed =           new NamedColor(new Color("MediumVioletRed", [199, 21, 133]));
    static MidnightBlue =              new NamedColor(new Color("MidnightBlue", [25, 25, 112]));
    static MintCream =                 new NamedColor(new Color("MintCream", [245, 255, 250]));
    static MistyRose =                 new NamedColor(new Color("MistyRose", [255, 228, 225]));
    static Moccasin =                  new NamedColor(new Color("Moccasin", [255, 228, 181]));
    static NavajoWhite =               new NamedColor(new Color("NavajoWhite", [255, 222, 173]));
    static Navy =                      new NamedColor(new Color("Navy", [0, 0, 128]));
    static OldLace =                   new NamedColor(new Color("OldLace", [253, 245, 230]));
    static Olive =                     new NamedColor(new Color("Olive", [128, 128, 0]));
    static OliveDrab =                 new NamedColor(new Color("OliveDrab", [107, 142, 35]));
    static Orange =                    new NamedColor(new Color("Orange", [255, 165, 0]));
    static OrangeRed =                 new NamedColor(new Color("OrangeRed", [255, 69, 0]));
    static Orchid =                    new NamedColor(new Color("Orchid", [218, 112, 214]));
    static PaleGoldenrod =             new NamedColor(new Color("PaleGoldenrod", [238, 232, 170]));
    static PaleGreen =                 new NamedColor(new Color("PaleGreen", [152, 251, 152]));
    static PaleTurquoise =             new NamedColor(new Color("PaleTurquoise", [175, 238, 238]));
    static PaleVioletRed =             new NamedColor(new Color("PaleVioletRed", [219, 112, 147]));
    static PapayaWhip =                new NamedColor(new Color("PapayaWhip", [255, 239, 182]));
    static PeachPuff =                 new NamedColor(new Color("PeachPuff", [255, 218, 185]));
    static Peru =                      new NamedColor(new Color("Peru", [205, 133, 63]));
    static Pink =                      new NamedColor(new Color("Pink", [255, 192, 203]));
    static Plum =                      new NamedColor(new Color("Plum", [221, 160, 221]));
    static PowderBlue =                new NamedColor(new Color("PowderBlue", [176, 224, 230]));
    static Purple =                    new NamedColor(new Color("Purple", [128, 0, 128]));
    static Red =                       new NamedColor(new Color("Red", [255, 0, 0]));
    static RosyBrown =                 new NamedColor(new Color("RosyBrown", [188, 143, 143]));
    static RoyalBlue =                 new NamedColor(new Color("RoyalBlue", [65, 105, 225]));
    static SaddleBrown =               new NamedColor(new Color("SaddleBrown", [139, 69, 19]));
    static Salmon =                    new NamedColor(new Color("Salmon", [250, 128, 114]));
    static SandyBrown =                new NamedColor(new Color("SandyBrown", [244, 164, 96]));
    static SeaGreen =                  new NamedColor(new Color("SeaGreen", [46, 139, 87]));
    static SeaShell =                  new NamedColor(new Color("SeaShell", [255, 245, 238]));
    static Sienna =                    new NamedColor(new Color("Sienna", [160, 82, 45]));
    static Silver =                    new NamedColor(new Color("Silver", [192, 192, 192]));
    static SkyBlue =                   new NamedColor(new Color("SkyBlue", [135, 206, 235]));
    static SlateBlue =                 new NamedColor(new Color("SlateBlue", [106, 90, 205]));
    static SlateGray =                 new NamedColor(new Color("SlateGray", [112, 128, 144]));
    static Snow =                      new NamedColor(new Color("Snow", [255, 250, 250]));
    static SpringGreen =               new NamedColor(new Color("SpringGreen", [0, 255, 127]));
    static SteelBlue =                 new NamedColor(new Color("SteelBlue", [70, 130, 180]));
    static Tan =                       new NamedColor(new Color("Tan", [210, 180, 140]));
    static Teal =                      new NamedColor(new Color("Teal", [0, 128, 128]));
    static Thistle =                   new NamedColor(new Color("Thistle", [216, 191, 216]));
    static Tomato =                    new NamedColor(new Color("Tomato", [255, 99, 71]));
    static Turquoise =                 new NamedColor(new Color("Turquoise", [64, 224, 208]));
    static Violet =                    new NamedColor(new Color("Violet", [238, 130, 238]));
    static Wheat =                     new NamedColor(new Color("Wheat", [245, 222, 179]));
    static White =                     new NamedColor(new Color("White", [255, 255, 255]));
    static WhiteSmoke =                new NamedColor(new Color("WhiteSmoke", [245, 245, 245]));
    static Yellow =                    new NamedColor(new Color("Yellow", [255, 255, 0]));
    static YellowGreen =               new NamedColor(new Color("YellowGreen", [154, 205, 50]));
    static { this.seal(); }
}

export default Color;
