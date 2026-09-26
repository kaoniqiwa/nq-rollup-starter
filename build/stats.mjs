export default class Stats {
  startTimes = {};

  constructor() {
    Object.defineProperty(this, 'startTimes', {
      configurable: false,
      enumerable: false,
      writable: false,
    });
  }
  time(label) {
    this.startTimes[label] = process.hrtime();
  }
  // 计算进程消耗时间
  timeEnd(label) {
    const elapsed = process.hrtime(this.startTimes[label]);
    if (!this[label]) this[label] = 0;
    // seconds*1e3 + nanoseconds*1e-6 => 毫秒
    this[label] += (elapsed[0] * 1e3 + elapsed[1] * 1e-6) >> 0;
  }
}
