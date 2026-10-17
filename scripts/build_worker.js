import fs from 'fs';

const polyfill = `
if (typeof Response !== 'undefined' && !Response.prototype.bytes) {
  Response.prototype.bytes = async function() {
    return new Uint8Array(await this.arrayBuffer());
  };
}
if (typeof Uint8Array !== 'undefined') {
  if (!Uint8Array.prototype.toHex) {
    Uint8Array.prototype.toHex = function() {
      return Array.from(this).map(b => b.toString(16).padStart(2, '0')).join('');
    };
  }
  if (!Uint8Array.fromHex) {
    Uint8Array.fromHex = function(hex) {
      const bytes = new Uint8Array(hex.length / 2);
      for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
      }
      return bytes;
    };
  }
}
if (typeof Map !== 'undefined') {
  if (!Map.prototype.getOrInsertComputed) {
    Map.prototype.getOrInsertComputed = function(key, callback) {
      if (this.has(key)) return this.get(key);
      const val = callback(key);
      this.set(key, val);
      return val;
    };
  }
  if (!Map.prototype.getOrInsert) {
    Map.prototype.getOrInsert = function(key, defaultValue) {
      if (this.has(key)) return this.get(key);
      this.set(key, defaultValue);
      return defaultValue;
    };
  }
}
if (typeof Promise !== 'undefined' && !Promise.withResolvers) {
  Promise.withResolvers = function() {
    let resolve, reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}
`;

const originalWorker = fs.readFileSync('node_modules/pdfjs-dist/build/pdf.worker.min.mjs', 'utf8');
fs.writeFileSync('public/pdf.worker.min.mjs', polyfill + '\n' + originalWorker, 'utf8');
console.log('Successfully created public/pdf.worker.min.mjs with polyfills!');
