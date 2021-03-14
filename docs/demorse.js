class Demorse {
  code = {
    0: "-----",
    1: ".----",
    2: "..---",
    3: "...--",
    4: "....-",
    5: ".....",
    6: "-....",
    7: "--...",
    8: "---..",
    9: "----.",
    a: ".-",
    b: "-...",
    c: "-.-.",
    d: "-..",
    e: ".",
    f: "..-.",
    g: "--.",
    h: "....",
    i: "..",
    j: ".---",
    k: "-.-",
    l: ".-..",
    m: "--",
    n: "-.",
    o: "---",
    p: ".--.",
    q: "--.-",
    r: ".-.",
    s: "...",
    t: "-",
    u: "..-",
    v: "...-",
    w: ".--",
    x: "-..-",
    y: "-.--",
    z: "--..",
    ".": ".-.-.-",
    ",": "--..--",
    "?": "..--..",
    "!": "-.-.--",
    "-": "-....-",
    "/": "-..-.",
    "@": ".--.-.",
    "(": "-.--.",
    ")": "-.--.-",
    " ": "^",
  };

  constructor({ stream, fft = 32, idle = 75, render }) {
    this.render = render || console.log;
    this.idle = idle;
    this.audioCtx = new window.AudioContext();
    this.analyser = this.audioCtx.createAnalyser();
    this.renderString = "";

    if (!stream) return this.noStreamError();

    const source =
      stream instanceof Element
        ? this.audioCtx.createMediaElementSource(stream)
        : this.audioCtx.createMediaStreamSource(stream);
    source.connect(this.analyser);
    source.connect(this.audioCtx.destination);
    this.analyser.fftSize = fft;
    this.analyser.connect(this.audioCtx.destination);

    this.dataArray = new Float32Array(this.analyser.fftSize);
    this.low = 0;
    this.high = 0;
    this.longBeep = 0;
    this.longPause = 0;
    this.codeArray = [[]];

    this.tick.call(this);
  }

  tick() {
    const abs = this.dataArray.map(Math.abs).sort((a, b) => b - a)[0] * 100;

    if (abs > 1) {
      if (this.low && 10 * this.low >= this.longPause) {
        const tone = Math.round((this.low * 100) / this.longPause);

        if (tone > 30) {
          if (tone >= 70) {
            this.codeArray.push(["^"]);
          }
          this.codeArray.push([]);
        }
      }

      if (!this.longBeep || this.high > this.longBeep) {
        this.longBeep = this.high;
      }

      if (!this.longPause || this.low > this.longPause) {
        this.longPause = this.low;
      }

      this.high++;
      this.low = 0;
    } else {
      if (this.high && 10 * this.high >= this.longBeep) {
        const tone = Math.floor(this.longBeep / this.high);

        if (tone <= 1) {
          this.codeArray[this.codeArray.length - 1].push("-");
        } else {
          this.codeArray[this.codeArray.length - 1].push(".");
        }
      }

      this.low++;
      this.high = 0;
    }
    this.decode();
    requestAnimationFrame(this.tick.bind(this));
    this.analyser.getFloatTimeDomainData(this.dataArray);

    if (this.low > this.idle) {
      this.codeArray.push([]);
      return this.decode();
    }
  }

  decode() {
    if (this.codeArray[this.codeArray.length - 2]) {
      var cd = this.codeArray.shift().join("");

      for (let w in this.code) {
        if (this.code[w] == cd) {
          this.renderString += w;

          if (this.render && typeof this.render === "function")
            this.render.call(this, this.renderString, cd);
        }
      }
    }
  }

  noStreamError() {
    console.error("No stream specified");
  }
}
