const EventEmitter = require('events');

class SpikeDetector extends EventEmitter {
  constructor(opts = {}){
    super();
    this.windowMinutes = opts.windowMinutes || 10;
    this.bucketSizeMs = opts.bucketSizeMs || 60 * 1000;
    this.buckets = new Map();
    this.lastBucket = this._currentBucketIndex();
    this.multiplier = opts.multiplier || 3;
    this.minCount = opts.minCount || 3;

    setInterval(() => { this._rotate(); }, this.bucketSizeMs).unref();
  }

  _currentBucketIndex(){
    return Math.floor(Date.now() / this.bucketSizeMs);
  }

  _rotate(){
    const idx = this._currentBucketIndex();
    if (idx === this.lastBucket) return;
    this.lastBucket = idx;
    for (const [, arr] of this.buckets.entries()){
      if (arr.length > this.windowMinutes) arr.splice(0, arr.length - this.windowMinutes);
      if (arr.every(v => v === 0)) this.buckets.delete(arr);
    }
  }

  add(key){
    const idx = this._currentBucketIndex();
    if (!this.buckets.has(key)) this.buckets.set(key, []);
    const arr = this.buckets.get(key);
    if (arr._idx !== idx){
      arr.push(0);
      arr._idx = idx;
    }
    arr[arr.length - 1] = (arr[arr.length - 1] || 0) + 1;

    const len = arr.length;
    if (len < 2) return;
    const last = arr[len - 1];
    const prev = arr.slice(0, len - 1);
    const avg = prev.reduce((s,v)=>s+v,0) / prev.length;
    if (last >= this.minCount && avg > 0 && last > avg * this.multiplier){
      this.emit('spike', { key, last, avg, timestamp: Date.now() });
    }
  }
}

module.exports = SpikeDetector;
