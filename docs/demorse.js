/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "../dictionary.ts":
/*!************************!*\
  !*** ../dictionary.ts ***!
  \************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports["default"] = {
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


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!*********************!*\
  !*** ../demorse.ts ***!
  \*********************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const dictionary_1 = __webpack_require__(/*! ./dictionary */ "../dictionary.ts");
class Demorse {
    code = dictionary_1.default;
    render;
    idle;
    threshold;
    audioCtx;
    analyser;
    processor;
    dataArray;
    renderString = "";
    low = 0;
    high = 0;
    longBeep = 0;
    longPause = 0;
    codeArray = [[]];
    maxVolume = 1;
    constructor({ stream, fft = 1024, idle = 75, threshold = 45, render, }) {
        this.render = render;
        this.idle = idle;
        this.threshold = threshold;
        this.audioCtx = new window.AudioContext();
        this.analyser = this.audioCtx.createAnalyser();
        this.processor = this.audioCtx.createScriptProcessor(2048, 1, 1);
        this.init(stream, fft);
    }
    normalize(num) {
        return Math.round(((100 + this.threshold) * num) / this.maxVolume / 100);
    }
    getArrayMax(arr) {
        return arr.sort().pop();
    }
    getArrayAvg(arr = []) {
        const arrLen = Math.max(arr.length, 1);
        const sum = arr.reduce((sum, cur) => {
            return sum + cur;
        }, 0);
        const avg = sum / arrLen;
        return avg;
    }
    tick = () => {
        const abs = this.getArrayAvg(Array.from(this.dataArray).map((x) => Math.abs(x) * 100));
        this.maxVolume = Math.max(abs, this.maxVolume);
        const normal = this.normalize(abs);
        if (normal >= 1) {
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
        }
        else {
            if (this.high && 10 * this.high >= this.longBeep) {
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
            const symbolIndex = Object.values(this.code).findIndex((it) => it === latestWord);
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
    init(stream, fft) {
        if (!stream)
            return this.noStreamError();
        const source = stream instanceof Element
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
if (typeof window != "undefined") {
    window.Demorse = Demorse;
}
exports["default"] = Demorse;

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QU8sTUFBTSxJQUFJLFdBQVcsRUFBRTtJQUNqQixNQUFPLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztDQUMxQztBQUVELHFCQUFlLE9BQU8sQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovLy8uLi9kaWN0aW9uYXJ5LnRzIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly8vLi4vZGVtb3JzZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCB7XG4gIDA6IFwiLS0tLS1cIixcbiAgMTogXCIuLS0tLVwiLFxuICAyOiBcIi4uLS0tXCIsXG4gIDM6IFwiLi4uLS1cIixcbiAgNDogXCIuLi4uLVwiLFxuICA1OiBcIi4uLi4uXCIsXG4gIDY6IFwiLS4uLi5cIixcbiAgNzogXCItLS4uLlwiLFxuICA4OiBcIi0tLS4uXCIsXG4gIDk6IFwiLS0tLS5cIixcbiAgYTogXCIuLVwiLFxuICBiOiBcIi0uLi5cIixcbiAgYzogXCItLi0uXCIsXG4gIGQ6IFwiLS4uXCIsXG4gIGU6IFwiLlwiLFxuICBmOiBcIi4uLS5cIixcbiAgZzogXCItLS5cIixcbiAgaDogXCIuLi4uXCIsXG4gIGk6IFwiLi5cIixcbiAgajogXCIuLS0tXCIsXG4gIGs6IFwiLS4tXCIsXG4gIGw6IFwiLi0uLlwiLFxuICBtOiBcIi0tXCIsXG4gIG46IFwiLS5cIixcbiAgbzogXCItLS1cIixcbiAgcDogXCIuLS0uXCIsXG4gIHE6IFwiLS0uLVwiLFxuICByOiBcIi4tLlwiLFxuICBzOiBcIi4uLlwiLFxuICB0OiBcIi1cIixcbiAgdTogXCIuLi1cIixcbiAgdjogXCIuLi4tXCIsXG4gIHc6IFwiLi0tXCIsXG4gIHg6IFwiLS4uLVwiLFxuICB5OiBcIi0uLS1cIixcbiAgejogXCItLS4uXCIsXG4gIFwiLlwiOiBcIi4tLi0uLVwiLFxuICBcIixcIjogXCItLS4uLS1cIixcbiAgXCI/XCI6IFwiLi4tLS4uXCIsXG4gIFwiIVwiOiBcIi0uLS4tLVwiLFxuICBcIi1cIjogXCItLi4uLi1cIixcbiAgXCIvXCI6IFwiLS4uLS5cIixcbiAgXCJAXCI6IFwiLi0tLi0uXCIsXG4gIFwiKFwiOiBcIi0uLS0uXCIsXG4gIFwiKVwiOiBcIi0uLS0uLVwiLFxuICBcIiBcIjogXCJeXCIsXG59O1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsImltcG9ydCBjb2RlIGZyb20gXCIuL2RpY3Rpb25hcnlcIjtcblxuaW50ZXJmYWNlIEluaXRQYXJhbXMge1xuICBzdHJlYW06IEhUTUxNZWRpYUVsZW1lbnQgfCBNZWRpYVN0cmVhbTtcbiAgZmZ0OiBudW1iZXI7XG4gIGlkbGU6IG51bWJlcjtcbiAgdGhyZXNob2xkOiBudW1iZXI7XG4gIHJlbmRlcj86ICgpID0+IHZvaWQ7XG59XG5cbmNsYXNzIERlbW9yc2Uge1xuICBwcml2YXRlIGNvZGUgPSBjb2RlO1xuICBwcml2YXRlIHJlbmRlcj86IEluaXRQYXJhbXNbXCJyZW5kZXJcIl07XG4gIHByaXZhdGUgaWRsZTogbnVtYmVyO1xuICBwcml2YXRlIHRocmVzaG9sZDogbnVtYmVyO1xuICBwcml2YXRlIGF1ZGlvQ3R4OiBBdWRpb0NvbnRleHQ7XG4gIHByaXZhdGUgYW5hbHlzZXI6IEFuYWx5c2VyTm9kZTtcbiAgcHJpdmF0ZSBwcm9jZXNzb3I6IFNjcmlwdFByb2Nlc3Nvck5vZGU7XG4gIHByaXZhdGUgZGF0YUFycmF5OiBGbG9hdDMyQXJyYXk7XG4gIHByaXZhdGUgcmVuZGVyU3RyaW5nID0gXCJcIjtcbiAgcHJpdmF0ZSBsb3cgPSAwO1xuICBwcml2YXRlIGhpZ2ggPSAwO1xuICBwcml2YXRlIGxvbmdCZWVwID0gMDtcbiAgcHJpdmF0ZSBsb25nUGF1c2UgPSAwO1xuICBwcml2YXRlIGNvZGVBcnJheTogQXJyYXk8c3RyaW5nW10+ID0gW1tdXTtcbiAgcHJpdmF0ZSBtYXhWb2x1bWUgPSAxO1xuXG4gIGNvbnN0cnVjdG9yKHtcbiAgICBzdHJlYW0sXG4gICAgZmZ0ID0gMTAyNCxcbiAgICBpZGxlID0gNzUsXG4gICAgdGhyZXNob2xkID0gNDUsXG4gICAgcmVuZGVyLFxuICB9OiBJbml0UGFyYW1zKSB7XG4gICAgdGhpcy5yZW5kZXIgPSByZW5kZXI7XG4gICAgdGhpcy5pZGxlID0gaWRsZTtcbiAgICB0aGlzLnRocmVzaG9sZCA9IHRocmVzaG9sZDtcbiAgICB0aGlzLmF1ZGlvQ3R4ID0gbmV3IHdpbmRvdy5BdWRpb0NvbnRleHQoKTtcbiAgICB0aGlzLmFuYWx5c2VyID0gdGhpcy5hdWRpb0N0eC5jcmVhdGVBbmFseXNlcigpO1xuICAgIHRoaXMucHJvY2Vzc29yID0gdGhpcy5hdWRpb0N0eC5jcmVhdGVTY3JpcHRQcm9jZXNzb3IoMjA0OCwgMSwgMSk7XG5cbiAgICB0aGlzLmluaXQoc3RyZWFtLCBmZnQpO1xuICB9XG5cbiAgbm9ybWFsaXplKG51bTogbnVtYmVyKSB7XG4gICAgcmV0dXJuIE1hdGgucm91bmQoKCgxMDAgKyB0aGlzLnRocmVzaG9sZCkgKiBudW0pIC8gdGhpcy5tYXhWb2x1bWUgLyAxMDApO1xuICB9XG5cbiAgZ2V0QXJyYXlNYXgoYXJyOiBBcnJheTx1bmtub3duPikge1xuICAgIHJldHVybiBhcnIuc29ydCgpLnBvcCgpO1xuICB9XG5cbiAgZ2V0QXJyYXlBdmcoYXJyOiBBcnJheTxudW1iZXI+ID0gW10pIHtcbiAgICBjb25zdCBhcnJMZW4gPSBNYXRoLm1heChhcnIubGVuZ3RoLCAxKTtcbiAgICBjb25zdCBzdW0gPSBhcnIucmVkdWNlKChzdW0sIGN1cikgPT4ge1xuICAgICAgcmV0dXJuIHN1bSArIGN1cjtcbiAgICB9LCAwKTtcblxuICAgIGNvbnN0IGF2ZyA9IHN1bSAvIGFyckxlbjtcblxuICAgIHJldHVybiBhdmc7XG4gIH1cblxuICB0aWNrID0gKCkgPT4ge1xuICAgIGNvbnN0IGFicyA9IHRoaXMuZ2V0QXJyYXlBdmcoXG4gICAgICBBcnJheS5mcm9tKHRoaXMuZGF0YUFycmF5KS5tYXAoKHgpID0+IE1hdGguYWJzKHgpICogMTAwKVxuICAgICk7XG4gICAgdGhpcy5tYXhWb2x1bWUgPSBNYXRoLm1heChhYnMsIHRoaXMubWF4Vm9sdW1lKTtcblxuICAgIGNvbnN0IG5vcm1hbCA9IHRoaXMubm9ybWFsaXplKGFicyk7XG4gICAgLy9oYW5kbGluZyB0aGUgYmVlcFxuICAgIGlmIChub3JtYWwgPj0gMSkge1xuICAgICAgLy8gZ2V0IHBlcmNlbnRhZ2Ugb2YgYSBrbm93IGxvbmcgcGF1c2VcbiAgICAgIGNvbnN0IGR1cmF0aW9uU2lsZW50ID0gTWF0aC5yb3VuZCgodGhpcy5sb3cgKiAxMDApIC8gdGhpcy5sb25nUGF1c2UpO1xuXG4gICAgICBpZiAoZHVyYXRpb25TaWxlbnQgPiB0aGlzLmlkbGUpIHtcbiAgICAgICAgdGhpcy5jb2RlQXJyYXkucHVzaChbXCJeXCJdKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGR1cmF0aW9uU2lsZW50ID4gMzApIHtcbiAgICAgICAgdGhpcy5jb2RlQXJyYXkucHVzaChbXSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMubG9uZ1BhdXNlID0gTWF0aC5tYXgodGhpcy5sb3csIHRoaXMubG9uZ1BhdXNlKTtcbiAgICAgIHRoaXMubG9uZ0JlZXAgPSBNYXRoLm1heCh0aGlzLmhpZ2gsIHRoaXMubG9uZ0JlZXApO1xuXG4gICAgICB0aGlzLmhpZ2grKztcblxuICAgICAgdGhpcy5sb3cgPSAwO1xuICAgIH0gZWxzZSB7XG4gICAgICAvL2hhbmRsaW5nIGVuZCBvZiB0aGUgYmVlcFxuICAgICAgaWYgKHRoaXMuaGlnaCAmJiAxMCAqIHRoaXMuaGlnaCA+PSB0aGlzLmxvbmdCZWVwKSB7XG4gICAgICAgIC8vIGlmIHRoaXMuaGlnaCBpcyBjbG9zZXIgdG8gbG9uZ0JlZXBcbiAgICAgICAgY29uc3QgaXNMb25nVG9uZSA9IE1hdGguZmxvb3IodGhpcy5sb25nQmVlcCAvIHRoaXMuaGlnaCkgPD0gMTtcbiAgICAgICAgY29uc3Qgc3ltYm9sID0gaXNMb25nVG9uZSA/IFwiLVwiIDogXCIuXCI7XG5cbiAgICAgICAgdGhpcy5jb2RlQXJyYXlbdGhpcy5jb2RlQXJyYXkubGVuZ3RoIC0gMV0ucHVzaChzeW1ib2wpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmxvdysrO1xuICAgICAgdGhpcy5oaWdoID0gMDtcbiAgICB9XG5cbiAgICB0aGlzLmRlY29kZSgpO1xuICAgIHRoaXMuYW5hbHlzZXIuZ2V0RmxvYXRUaW1lRG9tYWluRGF0YSh0aGlzLmRhdGFBcnJheSk7XG4gIH07XG5cbiAgZGVjb2RlKCkge1xuICAgIGlmICh0aGlzLmNvZGVBcnJheVt0aGlzLmNvZGVBcnJheS5sZW5ndGggLSAyXSkge1xuICAgICAgY29uc3QgbGF0ZXN0V29yZCA9IHRoaXMuY29kZUFycmF5LnNoaWZ0KCkuam9pbihcIlwiKTtcbiAgICAgIGNvbnN0IHN5bWJvbEluZGV4ID0gT2JqZWN0LnZhbHVlcyh0aGlzLmNvZGUpLmZpbmRJbmRleChcbiAgICAgICAgKGl0OiBzdHJpbmcpID0+IGl0ID09PSBsYXRlc3RXb3JkXG4gICAgICApO1xuICAgICAgY29uc3Qgc3ltYm9sID0gT2JqZWN0LmtleXModGhpcy5jb2RlKVtzeW1ib2xJbmRleF07XG5cbiAgICAgIGlmICghIXN5bWJvbCkge1xuICAgICAgICB0aGlzLnJlbmRlclN0cmluZyArPSBzeW1ib2w7XG5cbiAgICAgICAgaWYgKHRoaXMucmVuZGVyICYmIHR5cGVvZiB0aGlzLnJlbmRlciA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgdGhpcy5yZW5kZXIuY2FsbCh0aGlzLCB0aGlzLnJlbmRlclN0cmluZywgbGF0ZXN0V29yZCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBub1N0cmVhbUVycm9yKCkge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJObyBzdHJlYW0gZGV0ZWN0ZWRcIik7XG4gIH1cblxuICBpbml0KHN0cmVhbTogSW5pdFBhcmFtc1tcInN0cmVhbVwiXSwgZmZ0OiBJbml0UGFyYW1zW1wiZmZ0XCJdKSB7XG4gICAgaWYgKCFzdHJlYW0pIHJldHVybiB0aGlzLm5vU3RyZWFtRXJyb3IoKTtcblxuICAgIGNvbnN0IHNvdXJjZSA9XG4gICAgICBzdHJlYW0gaW5zdGFuY2VvZiBFbGVtZW50XG4gICAgICAgID8gdGhpcy5hdWRpb0N0eC5jcmVhdGVNZWRpYUVsZW1lbnRTb3VyY2Uoc3RyZWFtKVxuICAgICAgICA6IHRoaXMuYXVkaW9DdHguY3JlYXRlTWVkaWFTdHJlYW1Tb3VyY2Uoc3RyZWFtKTtcbiAgICBzb3VyY2UuY29ubmVjdCh0aGlzLmFuYWx5c2VyKTtcbiAgICB0aGlzLmFuYWx5c2VyLmNvbm5lY3QodGhpcy5wcm9jZXNzb3IpO1xuICAgIHNvdXJjZS5jb25uZWN0KHRoaXMuYXVkaW9DdHguZGVzdGluYXRpb24pO1xuICAgIHRoaXMucHJvY2Vzc29yLmNvbm5lY3QodGhpcy5hdWRpb0N0eC5kZXN0aW5hdGlvbik7XG4gICAgdGhpcy5hbmFseXNlci5mZnRTaXplID0gZmZ0O1xuICAgIHRoaXMuYW5hbHlzZXIuY29ubmVjdCh0aGlzLmF1ZGlvQ3R4LmRlc3RpbmF0aW9uKTtcblxuICAgIHRoaXMuZGF0YUFycmF5ID0gbmV3IEZsb2F0MzJBcnJheSh0aGlzLmFuYWx5c2VyLmZmdFNpemUpO1xuXG4gICAgdGhpcy5wcm9jZXNzb3Iub25hdWRpb3Byb2Nlc3MgPSB0aGlzLnRpY2s7XG4gIH1cbn1cblxuaWYgKHR5cGVvZiB3aW5kb3cgIT0gXCJ1bmRlZmluZWRcIikge1xuICAoPFdpbmRvdyAmIGFueT53aW5kb3cpLkRlbW9yc2UgPSBEZW1vcnNlO1xufVxuXG5leHBvcnQgZGVmYXVsdCBEZW1vcnNlO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9