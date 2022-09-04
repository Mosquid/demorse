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

  getArrayAverage(arr) {
    return arr.reduce((acc, curr) => 100 * acc + curr, 0) / arr.length;
  }

  tick = () => {
    const abs = this.getArrayAverage(this.dataArray.map(Math.abs));

    //handling the beep
    if (abs > 1) {
      // get percentage of a know long pause
      const durationSilent = Math.round((this.low * 100) / this.longPause);

      if (durationSilent > this.idle) {
        this.codeArray.push(["^"]);
      }

      if (durationSilent > 30) {
        this.codeArray.push([]);
      }

      this.longPause = Math.max(this.low, this.longPause);
      this.longBeep = Math.max(this.high, this.longBeep);

      this.high++;

      this.low = 0;
    } else {
      //handling end of the beep
      if (this.high && 10 * this.high >= this.longBeep) {
        // if this.high is closer to longBeep
        const isLongTone = Math.floor(this.longBeep / this.high) <= 1;
        const symbol = isLongTone ? "-" : ".";

        this.codeArray[this.codeArray.length - 1].push(symbol);
      }

      this.low++;
      this.high = 0;
    }

    this.decode();
    setTimeout(this.tick, 10);
    this.analyser.getFloatTimeDomainData(this.dataArray);
  };

  decode() {
    if (this.codeArray[this.codeArray.length - 2]) {
      const latestWord = this.codeArray.shift().join("");
      const symbolIndex = Object.values(this.code).findIndex(
        (it) => it === latestWord
      );
      const symbol = Object.keys(this.code)[symbolIndex];

      if (!!symbol) {
        this.renderString += symbol;

        if (this.render && typeof this.render === "function") {
          this.render.call(this, this.renderString, latestWord);
        }
      }
    }
  }

  noStreamError() {
    console.error("No stream specified");
  }
}
