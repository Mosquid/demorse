import { code } from "./dictionary";

interface InitParams {
  stream: HTMLMediaElement | MediaStream;
  fft: number;
  idle: number;
  threshold: number;
  render?: () => void;
}

class Demorse {
  private code = code;
  private render?: InitParams["render"];
  private idle: number;
  private threshold: number;
  private audioCtx: AudioContext;
  private analyser: AnalyserNode;
  private processor: ScriptProcessorNode;
  private dataArray: Float32Array;
  private renderString = "";
  private low = 0;
  private high = 0;
  private longBeep = 0;
  private longPause = 0;
  private codeArray: Array<string[]> = [[]];
  private maxVolume = 1;

  constructor({
    stream,
    fft = 1024,
    idle = 75,
    threshold = 45,
    render,
  }: InitParams) {
    this.render = render;
    this.idle = idle;
    this.threshold = threshold;
    this.audioCtx = new window.AudioContext();
    this.analyser = this.audioCtx.createAnalyser();
    this.processor = this.audioCtx.createScriptProcessor(2048, 1, 1);

    this.init(stream, fft);
  }

  normalize(num: number) {
    return Math.round(((100 + this.threshold) * num) / this.maxVolume / 100);
  }

  getArrayMax(arr: Array<unknown>) {
    return arr.sort().pop();
  }

  getArrayAvg(arr: Array<number> = []) {
    const arrLen = Math.max(arr.length, 1);
    const sum = arr.reduce((sum, cur) => {
      return sum + cur;
    }, 0);

    const avg = sum / arrLen;

    return avg;
  }

  tick = () => {
    const abs = this.getArrayAvg(
      Array.from(this.dataArray).map((x) => Math.abs(x) * 100)
    );
    this.maxVolume = Math.max(abs, this.maxVolume);

    const normal = this.normalize(abs);
    //handling the beep
    if (normal >= 1) {
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
    this.analyser.getFloatTimeDomainData(this.dataArray);
  };

  decode() {
    if (this.codeArray[this.codeArray.length - 2]) {
      const latestWord = this.codeArray.shift().join("");
      const symbolIndex = Object.values(this.code).findIndex(
        (it: string) => it === latestWord
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
    console.error("No stream detected");
  }

  init(stream: InitParams["stream"], fft: InitParams["fft"]) {
    if (!stream) return this.noStreamError();

    const source =
      stream instanceof Element
        ? this.audioCtx.createMediaElementSource(stream)
        : this.audioCtx.createMediaStreamSource(stream);
    source.connect(this.analyser);
    this.analyser.connect(this.processor);
    source.connect(this.audioCtx.destination);
    this.processor.connect(this.audioCtx.destination);
    this.analyser.fftSize = fft;
    this.analyser.connect(this.audioCtx.destination);

    this.dataArray = new Float32Array(this.analyser.fftSize);

    this.processor.onaudioprocess = this.tick;
  }
}

export default Demorse;
