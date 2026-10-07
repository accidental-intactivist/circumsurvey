var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// ../../../Users/v-apettit/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/_internal/utils.mjs
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
__name(createNotImplementedError, "createNotImplementedError");
// @__NO_SIDE_EFFECTS__
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw /* @__PURE__ */ createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
__name(notImplemented, "notImplemented");
// @__NO_SIDE_EFFECTS__
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
__name(notImplementedClass, "notImplementedClass");

// ../../../Users/v-apettit/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
var _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
var nodeTiming = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
var PerformanceEntry = class {
  static {
    __name(this, "PerformanceEntry");
  }
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
};
var PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
  static {
    __name(this, "PerformanceMark");
  }
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
};
var PerformanceMeasure = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceMeasure");
  }
  entryType = "measure";
};
var PerformanceResourceTiming = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceResourceTiming");
  }
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
};
var PerformanceObserverEntryList = class {
  static {
    __name(this, "PerformanceObserverEntryList");
  }
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
};
var Performance = class {
  static {
    __name(this, "Performance");
  }
  __unenv__ = true;
  timeOrigin = _timeOrigin;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw createNotImplementedError("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin) {
      return _performanceNow();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw createNotImplementedError("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
};
var PerformanceObserver = class {
  static {
    __name(this, "PerformanceObserver");
  }
  __unenv__ = true;
  static supportedEntryTypes = [];
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw createNotImplementedError("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw createNotImplementedError("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
};
var performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();

// ../../../Users/v-apettit/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
if (!("__unenv__" in performance)) {
  const proto = Performance.prototype;
  for (const key of Object.getOwnPropertyNames(proto)) {
    if (key !== "constructor" && !(key in performance)) {
      const desc = Object.getOwnPropertyDescriptor(proto, key);
      if (desc) {
        Object.defineProperty(performance, key, desc);
      }
    }
  }
}
globalThis.performance = performance;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;

// ../../../Users/v-apettit/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";

// ../../../Users/v-apettit/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default = Object.assign(() => {
}, { __unenv__: true });

// ../../../Users/v-apettit/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/console.mjs
var _console = globalThis.console;
var _ignoreErrors = true;
var _stderr = new Writable();
var _stdout = new Writable();
var log = _console?.log ?? noop_default;
var info = _console?.info ?? log;
var trace = _console?.trace ?? info;
var debug = _console?.debug ?? log;
var table = _console?.table ?? log;
var error = _console?.error ?? log;
var warn = _console?.warn ?? error;
var createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
var clear = _console?.clear ?? noop_default;
var count = _console?.count ?? noop_default;
var countReset = _console?.countReset ?? noop_default;
var dir = _console?.dir ?? noop_default;
var dirxml = _console?.dirxml ?? noop_default;
var group = _console?.group ?? noop_default;
var groupEnd = _console?.groupEnd ?? noop_default;
var groupCollapsed = _console?.groupCollapsed ?? noop_default;
var profile = _console?.profile ?? noop_default;
var profileEnd = _console?.profileEnd ?? noop_default;
var time = _console?.time ?? noop_default;
var timeEnd = _console?.timeEnd ?? noop_default;
var timeLog = _console?.timeLog ?? noop_default;
var timeStamp = _console?.timeStamp ?? noop_default;
var Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
var _times = /* @__PURE__ */ new Map();
var _stdoutErrorHandler = noop_default;
var _stderrErrorHandler = noop_default;

// ../../../Users/v-apettit/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole = globalThis["console"];
var {
  assert,
  clear: clear2,
  // @ts-expect-error undocumented public API
  context,
  count: count2,
  countReset: countReset2,
  // @ts-expect-error undocumented public API
  createTask: createTask2,
  debug: debug2,
  dir: dir2,
  dirxml: dirxml2,
  error: error2,
  group: group2,
  groupCollapsed: groupCollapsed2,
  groupEnd: groupEnd2,
  info: info2,
  log: log2,
  profile: profile2,
  profileEnd: profileEnd2,
  table: table2,
  time: time2,
  timeEnd: timeEnd2,
  timeLog: timeLog2,
  timeStamp: timeStamp2,
  trace: trace2,
  warn: warn2
} = workerdConsole;
Object.assign(workerdConsole, {
  Console,
  _ignoreErrors,
  _stderr,
  _stderrErrorHandler,
  _stdout,
  _stdoutErrorHandler,
  _times
});
var console_default = workerdConsole;

// ../../../Users/v-apettit/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
globalThis.console = console_default;

// ../../../Users/v-apettit/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
  const now = Date.now();
  const seconds = Math.trunc(now / 1e3);
  const nanos = now % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
  return BigInt(Date.now() * 1e6);
}, "bigint") });

// ../../../Users/v-apettit/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";

// ../../../Users/v-apettit/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
var ReadStream = class {
  static {
    __name(this, "ReadStream");
  }
  fd;
  isRaw = false;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
};

// ../../../Users/v-apettit/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
var WriteStream = class {
  static {
    __name(this, "WriteStream");
  }
  fd;
  columns = 80;
  rows = 24;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  clearLine(dir3, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env2) {
    return 1;
  }
  hasColors(count3, env2) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  write(str, encoding, cb) {
    if (str instanceof Uint8Array) {
      str = new TextDecoder().decode(str);
    }
    try {
      console.log(str);
    } catch {
    }
    cb && typeof cb === "function" && cb();
    return false;
  }
};

// ../../../Users/v-apettit/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs
var NODE_VERSION = "22.14.0";

// ../../../Users/v-apettit/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/internal/process/process.mjs
var Process = class _Process extends EventEmitter {
  static {
    __name(this, "Process");
  }
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(_Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  // --- event emitter ---
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  // --- stdio (lazy initializers) ---
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream(2);
  }
  // --- cwd ---
  #cwd = "/";
  chdir(cwd2) {
    this.#cwd = cwd2;
  }
  cwd() {
    return this.#cwd;
  }
  // --- dummy props and getters ---
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return `v${NODE_VERSION}`;
  }
  get versions() {
    return { node: NODE_VERSION };
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  // --- noop methods ---
  ref() {
  }
  unref() {
  }
  // --- unimplemented methods ---
  umask() {
    throw createNotImplementedError("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw createNotImplementedError("process.getActiveResourcesInfo");
  }
  exit() {
    throw createNotImplementedError("process.exit");
  }
  reallyExit() {
    throw createNotImplementedError("process.reallyExit");
  }
  kill() {
    throw createNotImplementedError("process.kill");
  }
  abort() {
    throw createNotImplementedError("process.abort");
  }
  dlopen() {
    throw createNotImplementedError("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw createNotImplementedError("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw createNotImplementedError("process.loadEnvFile");
  }
  disconnect() {
    throw createNotImplementedError("process.disconnect");
  }
  cpuUsage() {
    throw createNotImplementedError("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw createNotImplementedError("process.initgroups");
  }
  openStdin() {
    throw createNotImplementedError("process.openStdin");
  }
  assert() {
    throw createNotImplementedError("process.assert");
  }
  binding() {
    throw createNotImplementedError("process.binding");
  }
  // --- attached interfaces ---
  permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: /* @__PURE__ */ __name(() => 0, "rss") });
  // --- undefined props ---
  mainModule = void 0;
  domain = void 0;
  // optional
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  // internals
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
};

// ../../../Users/v-apettit/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess = globalThis["process"];
var getBuiltinModule = globalProcess.getBuiltinModule;
var workerdProcess = getBuiltinModule("node:process");
var unenvProcess = new Process({
  env: globalProcess.env,
  hrtime,
  // `nextTick` is available from workerd process v1
  nextTick: workerdProcess.nextTick
});
var { exit, features, platform } = workerdProcess;
var {
  _channel,
  _debugEnd,
  _debugProcess,
  _disconnect,
  _events,
  _eventsCount,
  _exiting,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _handleQueue,
  _kill,
  _linkedBinding,
  _maxListeners,
  _pendingMessage,
  _preload_modules,
  _rawDebug,
  _send,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  arch,
  argv,
  argv0,
  assert: assert2,
  availableMemory,
  binding,
  channel,
  chdir,
  config,
  connected,
  constrainedMemory,
  cpuUsage,
  cwd,
  debugPort,
  disconnect,
  dlopen,
  domain,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exitCode,
  finalization,
  getActiveResourcesInfo,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getMaxListeners,
  getuid,
  hasUncaughtExceptionCaptureCallback,
  hrtime: hrtime3,
  initgroups,
  kill,
  listenerCount,
  listeners,
  loadEnvFile,
  mainModule,
  memoryUsage,
  moduleLoadList,
  nextTick,
  off,
  on,
  once,
  openStdin,
  permission,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  reallyExit,
  ref,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  send,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setMaxListeners,
  setSourceMapsEnabled,
  setuid,
  setUncaughtExceptionCaptureCallback,
  sourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  throwDeprecation,
  title,
  traceDeprecation,
  umask,
  unref,
  uptime,
  version,
  versions
} = unenvProcess;
var _process = {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exit,
  finalization,
  features,
  getBuiltinModule,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  nextTick,
  on,
  off,
  once,
  pid,
  platform,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  // @ts-expect-error old API
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
};
var process_default = _process;

// ../../../Users/v-apettit/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
globalThis.process = process_default;

// api/cms/bulk-match.js
async function onRequestPost(context2) {
  const { env: env2 } = context2;
  if (!env2.SURVEY_DB || !env2.ARCHIVE_BUCKET) {
    return new Response(JSON.stringify({ error: "Missing database or bucket binding" }), { status: 500 });
  }
  try {
    let cursor = void 0;
    let allObjects = [];
    do {
      const options = { limit: 1e3 };
      if (cursor) options.cursor = cursor;
      const objects = await env2.ARCHIVE_BUCKET.list(options);
      allObjects.push(...objects.objects);
      cursor = objects.truncated ? objects.cursor : void 0;
    } while (cursor);
    const docs = await env2.SURVEY_DB.prepare("SELECT id, title, url FROM archive_documents").all();
    let matched = 0;
    let created = 0;
    let skipped = 0;
    const existingUrls = /* @__PURE__ */ new Set();
    docs.results.forEach((d) => {
      if (d.url) existingUrls.add(d.url);
    });
    for (const obj of allObjects) {
      const fileUrl = `/api/assets/${obj.key}`;
      if (existingUrls.has(fileUrl)) {
        skipped++;
        continue;
      }
      const normalizedFilename = obj.key.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ").toLowerCase().trim();
      let match3 = docs.results.find((d) => {
        if (!d.title) return false;
        if (d.url) return false;
        const normalizedTitle = d.title.replace(/[-_]/g, " ").toLowerCase().trim();
        return normalizedTitle.includes(normalizedFilename) || normalizedFilename.includes(normalizedTitle);
      });
      if (match3) {
        await env2.SURVEY_DB.prepare(`
          UPDATE archive_documents 
          SET url = ?, status = 'pending_ocr' 
          WHERE id = ?
        `).bind(fileUrl, match3.id).run();
        matched++;
        existingUrls.add(fileUrl);
        match3.url = fileUrl;
      } else {
        const newId = crypto.randomUUID().split("-")[0];
        const niceTitle = normalizedFilename.replace(/\b\w/g, (c) => c.toUpperCase());
        await env2.SURVEY_DB.prepare(`
          INSERT INTO archive_documents (id, title, url, type, status, source_collection)
          VALUES (?, ?, ?, ?, ?, ?)
        `).bind(newId, niceTitle, fileUrl, "pdf", "pending_ocr", "Bulk Ingest").run();
        created++;
        existingUrls.add(fileUrl);
      }
    }
    return new Response(JSON.stringify({
      success: true,
      stats: { matched, created, skipped, total: allObjects.length }
    }), { headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
__name(onRequestPost, "onRequestPost");

// api/cms/pending-ocr.js
async function onRequestGet(context2) {
  const { env: env2, request } = context2;
  if (!env2.SURVEY_DB) {
    return new Response(JSON.stringify({ error: "Missing bindings" }), { status: 500 });
  }
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit")) || 10;
    const { results } = await env2.SURVEY_DB.prepare(
      "SELECT * FROM archive_documents WHERE status = 'pending_ocr' LIMIT ?"
    ).bind(limit).all();
    return new Response(JSON.stringify({
      success: true,
      documents: results || []
    }), { headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
__name(onRequestGet, "onRequestGet");

// api/cms/process-ocr.js
async function onRequestPost2(context2) {
  const { env: env2 } = context2;
  if (!env2.SURVEY_DB || !env2.ARCHIVE_BUCKET || !env2.ARCHIVE_INDEX) {
    return new Response(JSON.stringify({ error: "Missing bindings" }), { status: 500 });
  }
  try {
    const doc = await env2.SURVEY_DB.prepare("SELECT * FROM archive_documents WHERE status = 'pending_ocr' LIMIT 1").first();
    if (!doc) {
      return new Response(JSON.stringify({ success: true, message: "No pending documents", processed: 0 }), { headers: { "Content-Type": "application/json" } });
    }
    if (!doc.url) {
      await env2.SURVEY_DB.prepare("UPDATE archive_documents SET status = 'error' WHERE id = ?").bind(doc.id).run();
      throw new Error(`Document ${doc.id} has no URL.`);
    }
    const filename = doc.url.replace("/api/assets/", "");
    console.log(`Processing ${filename} for OCR...`);
    let r2Object = await env2.ARCHIVE_BUCKET.get(filename);
    let pdfBuffer;
    if (!r2Object) {
      const fallbackRes = await fetch(`https://advocacy-shell.pages.dev/api/assets/${filename}`);
      if (!fallbackRes.ok) {
        await env2.SURVEY_DB.prepare("UPDATE archive_documents SET status = 'error' WHERE id = ?").bind(doc.id).run();
        throw new Error(`File ${filename} not found locally or in production R2.`);
      }
      pdfBuffer = await fallbackRes.arrayBuffer();
    } else {
      pdfBuffer = await r2Object.arrayBuffer();
    }
    const apiKey = env2.GEMINI_API_KEY;
    let extractedText = "";
    const ext = filename.split(".").pop().toLowerCase();
    let mimeType = "application/pdf";
    if (["jpg", "jpeg"].includes(ext)) mimeType = "image/jpeg";
    else if (ext === "png") mimeType = "image/png";
    else if (ext === "webp") mimeType = "image/webp";
    else if (ext === "mp4") mimeType = "video/mp4";
    if (!apiKey) {
      extractedText = `Mock extracted text for ${filename}`;
    } else {
      const uploadResponse = await fetch(`https://generativelanguage.googleapis.com/upload/v1beta/files?uploadType=media&key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": mimeType },
        body: pdfBuffer,
        duplex: "half"
        // Required for streaming bodies in Cloudflare Workers Fetch
      });
      if (!uploadResponse.ok) {
        const err = await uploadResponse.text();
        await env2.SURVEY_DB.prepare("UPDATE archive_documents SET status = 'error' WHERE id = ?").bind(doc.id).run();
        throw new Error(`Gemini Upload failed: ${err}`);
      }
      const uploadData = await uploadResponse.json();
      const fileUri = uploadData.file.uri;
      const prompt = "You are an expert archivist. Extract all text from this document. Output strict Markdown format. Use proper headers (##), bulleted lists, and format any tabular data as Markdown tables. Preserve all information, but format it cleanly in Markdown. Do not include any conversational filler. IMPORTANT: Your very first line MUST be '# TITLE: ' followed by a concise, friendly title you generate for this document based on its contents.";
      const generateResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { fileData: { mimeType, fileUri } }
            ]
          }]
        })
      });
      if (!generateResponse.ok) {
        const err = await generateResponse.text();
        await env2.SURVEY_DB.prepare("UPDATE archive_documents SET status = 'error' WHERE id = ?").bind(doc.id).run();
        throw new Error(`Gemini generateContent failed: ${err}`);
      }
      const generateData = await generateResponse.json();
      extractedText = generateData.candidates?.[0]?.content?.parts?.[0]?.text || "";
    }
    let newTitle = doc.title;
    const titleMatch = extractedText.match(/^# TITLE:\s*(.*)/i);
    if (titleMatch) {
      newTitle = titleMatch[1].trim();
      extractedText = extractedText.replace(/^# TITLE:\s*(.*)\n*/i, "").trim();
    }
    const chunks = extractedText.match(/[^]{1,1000}/g) || [];
    const aiBinding = env2.AI || env2.Workers_AI;
    if (chunks.length > 0) {
      const embeddingResponse = await aiBinding.run("@cf/baai/bge-small-en-v1.5", { text: chunks });
      const vectors = embeddingResponse.data.map((vec, i) => ({
        id: `${doc.id}-chunk-${i}`,
        values: vec,
        metadata: { source: filename, text: chunks[i], title: doc.title }
      }));
      await env2.ARCHIVE_INDEX.insert(vectors);
      const mdFilename = filename.replace(/\.[^/.]+$/, "") + ".md";
      await env2.ARCHIVE_BUCKET.put(`documents/${mdFilename}`, extractedText, {
        httpMetadata: { contentType: "text/markdown" }
      });
      await env2.SURVEY_DB.prepare(`
        UPDATE archive_documents 
        SET status = 'ingested', 
            chunks_vectorized = ?,
            title = ?,
            metadata_json = json_set(ifnull(metadata_json, '{}'), '$.extracted_text_url', ?)
        WHERE id = ?
      `).bind(vectors.length, newTitle, `/api/assets/${mdFilename}`, doc.id).run();
    } else {
      await env2.SURVEY_DB.prepare("UPDATE archive_documents SET status = 'ingested', chunks_vectorized = 0 WHERE id = ?").bind(doc.id).run();
    }
    return new Response(JSON.stringify({
      success: true,
      message: `Processed ${filename} successfully.`,
      docId: doc.id,
      chunks: chunks.length,
      processed: 1
    }), { headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
__name(onRequestPost2, "onRequestPost");

// api/cms/save-ocr.js
async function onRequestPost3(context2) {
  const { env: env2, request } = context2;
  if (!env2.SURVEY_DB || !env2.ARCHIVE_BUCKET || !env2.ARCHIVE_INDEX) {
    return new Response(JSON.stringify({ error: "Missing bindings" }), { status: 500 });
  }
  try {
    const payload = await request.json();
    const { docId, filename, originalTitle, extractedText, newTitle, metadata, errorMessage } = payload;
    if (!docId || !filename) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }
    if (errorMessage) {
      const existingDoc = await env2.SURVEY_DB.prepare("SELECT metadata_json FROM archive_documents WHERE id = ?").bind(docId).first();
      let updatedMetadata = {};
      try {
        if (existingDoc && existingDoc.metadata_json) {
          updatedMetadata = JSON.parse(existingDoc.metadata_json);
        }
      } catch (e) {
      }
      updatedMetadata.ocr_error = errorMessage;
      await env2.SURVEY_DB.prepare(`
        UPDATE archive_documents 
        SET status = 'error', 
            metadata_json = ?
        WHERE id = ?
      `).bind(JSON.stringify(updatedMetadata), docId).run();
      return new Response(JSON.stringify({ success: true, message: "Marked as error." }), { headers: { "Content-Type": "application/json" } });
    }
    if (!extractedText) {
      return new Response(JSON.stringify({ error: "Missing extractedText" }), { status: 400 });
    }
    const paragraphs = extractedText.split(/\n\n+/);
    const chunks = [];
    let currentChunk = "";
    for (const rawPara of paragraphs) {
      const para = (rawPara || "").trim();
      if (!para) continue;
      if (para.length > 1200) {
        if (currentChunk.trim()) {
          chunks.push(currentChunk.trim());
          currentChunk = "";
        }
        const sentences = para.match(/[^.!?\n]+[.!?\n]+|\S+/g) || [para];
        let subChunk = "";
        for (const sent of sentences) {
          if ((subChunk + " " + sent).length > 1e3 && subChunk.length > 0) {
            chunks.push(subChunk.trim());
            subChunk = sent;
          } else {
            subChunk = subChunk ? subChunk + " " + sent : sent;
          }
        }
        if (subChunk.trim()) chunks.push(subChunk.trim());
      } else {
        if ((currentChunk + "\n\n" + para).length > 1200 && currentChunk.length > 0) {
          chunks.push(currentChunk.trim());
          currentChunk = para;
        } else {
          currentChunk = currentChunk ? currentChunk + "\n\n" + para : para;
        }
      }
    }
    if (currentChunk.trim()) chunks.push(currentChunk.trim());
    const aiBinding = env2.AI || env2.Workers_AI;
    if (chunks.length > 0) {
      const embeddingResponse = await aiBinding.run("@cf/baai/bge-small-en-v1.5", { text: chunks });
      const vectors = embeddingResponse.data.map((vec, i) => {
        const chunkText = chunks[i] || "";
        const safeText = chunkText.length > 2500 ? chunkText.slice(0, 2500) + "..." : chunkText;
        return {
          id: `${docId}-chunk-${i}`,
          values: vec,
          metadata: {
            source: filename,
            text: safeText,
            title: (originalTitle || "").slice(0, 250)
          }
        };
      });
      await env2.ARCHIVE_INDEX.insert(vectors);
      const baseFilename = filename.replace(/^documents\//, "");
      const cleanMdName = baseFilename.replace(/\.[^/.]+$/, "") + ".md";
      const r2Key = `documents/${cleanMdName}`;
      await env2.ARCHIVE_BUCKET.put(r2Key, extractedText, {
        httpMetadata: { contentType: "text/markdown" }
      });
      const existingDoc = await env2.SURVEY_DB.prepare("SELECT metadata_json FROM archive_documents WHERE id = ?").bind(docId).first();
      let updatedMetadata = {};
      try {
        if (existingDoc && existingDoc.metadata_json) {
          updatedMetadata = JSON.parse(existingDoc.metadata_json);
        }
      } catch (e) {
      }
      updatedMetadata.extracted_text_url = `/api/assets/documents/${cleanMdName}`;
      updatedMetadata.gemini_extracted_metadata = metadata;
      await env2.SURVEY_DB.prepare(`
        UPDATE archive_documents 
        SET status = 'ingested', 
            chunks_vectorized = ?,
            title = ?,
            metadata_json = ?
        WHERE id = ?
      `).bind(vectors.length, newTitle || originalTitle, JSON.stringify(updatedMetadata), docId).run();
    } else {
      await env2.SURVEY_DB.prepare("UPDATE archive_documents SET status = 'ingested', chunks_vectorized = 0 WHERE id = ?").bind(docId).run();
    }
    return new Response(JSON.stringify({
      success: true,
      message: `Saved ${filename} successfully.`,
      docId,
      chunks: chunks.length
    }), { headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
__name(onRequestPost3, "onRequestPost");

// api/entities/merge.js
async function onRequestPost4(context2) {
  const { request, env: env2 } = context2;
  try {
    const data = await request.json();
    const { sourceId, sourceName, targetId, targetName } = data;
    if (!sourceId || !sourceName || !targetId || !targetName) {
      return new Response(JSON.stringify({ error: "Missing required fields for merge." }), { status: 400 });
    }
    if (sourceId === targetId) {
      return new Response(JSON.stringify({ error: "Cannot merge an entity into itself." }), { status: 400 });
    }
    const { results: documents } = await env2.SURVEY_DB.prepare("SELECT id, metadata_json FROM archive_documents WHERE metadata_json IS NOT NULL").all();
    const updatePromises = [];
    const lowerSource = sourceName.toLowerCase();
    for (const doc of documents) {
      let changed = false;
      let meta;
      try {
        meta = JSON.parse(doc.metadata_json);
      } catch (e) {
        continue;
      }
      const swapName = /* @__PURE__ */ __name((arr) => {
        if (!Array.isArray(arr)) return arr;
        let modified = false;
        const newArr = [];
        const seen = /* @__PURE__ */ new Set();
        for (const item of arr) {
          if (!item) continue;
          let finalName = item;
          if (item.toLowerCase() === lowerSource) {
            finalName = targetName;
            modified = true;
          }
          if (!seen.has(finalName.toLowerCase())) {
            seen.add(finalName.toLowerCase());
            newArr.push(finalName);
          } else {
            modified = true;
          }
        }
        return modified ? newArr : arr;
      }, "swapName");
      if (meta.organizations) {
        const updated = swapName(meta.organizations);
        if (updated !== meta.organizations) {
          meta.organizations = updated;
          changed = true;
        }
      }
      if (meta.key_people) {
        const updated = swapName(meta.key_people);
        if (updated !== meta.key_people) {
          meta.key_people = updated;
          changed = true;
        }
      }
      if (meta.gemini_extracted_metadata) {
        if (meta.gemini_extracted_metadata.organizations) {
          const updated = swapName(meta.gemini_extracted_metadata.organizations);
          if (updated !== meta.gemini_extracted_metadata.organizations) {
            meta.gemini_extracted_metadata.organizations = updated;
            changed = true;
          }
        }
        if (meta.gemini_extracted_metadata.authors) {
          const updated = swapName(meta.gemini_extracted_metadata.authors);
          if (updated !== meta.gemini_extracted_metadata.authors) {
            meta.gemini_extracted_metadata.authors = updated;
            changed = true;
          }
        }
      }
      if (changed) {
        updatePromises.push(
          env2.SURVEY_DB.prepare("UPDATE archive_documents SET metadata_json = ? WHERE id = ?").bind(JSON.stringify(meta), doc.id).run()
        );
      }
    }
    if (updatePromises.length > 0) {
      await Promise.all(updatePromises);
    }
    await env2.SURVEY_DB.prepare("DELETE FROM entities WHERE id = ?").bind(sourceId).run();
    return new Response(JSON.stringify({ success: true, updatedDocuments: updatePromises.length }), { headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
__name(onRequestPost4, "onRequestPost");

// api/translations/approve.js
async function onRequestPost5(context2) {
  const { request, env: env2 } = context2;
  try {
    const { document_id, target_language } = await request.json();
    if (!document_id || !target_language) {
      return new Response(JSON.stringify({ error: "Missing document_id or target_language" }), { status: 400 });
    }
    const doc = await env2.SURVEY_DB.prepare(
      `SELECT metadata_json FROM archive_documents WHERE id = ?`
    ).bind(document_id).first();
    if (!doc) {
      return new Response(JSON.stringify({ error: "Document not found" }), { status: 404 });
    }
    const metadata = JSON.parse(doc.metadata_json || "{}");
    let markdownText = "";
    if (metadata.text_content) {
      markdownText = metadata.text_content;
    } else if (metadata.extracted_text_url) {
      try {
        const textRes = await fetch(metadata.extracted_text_url);
        if (textRes.ok) {
          markdownText = await textRes.text();
        }
      } catch (e) {
        console.error("Failed to fetch text from URL", e);
      }
    }
    if (!markdownText || markdownText.trim() === "") {
      return new Response(JSON.stringify({ error: "Could not retrieve source text for translation" }), { status: 400 });
    }
    const prompt = `You are a professional archivist and translator. Translate the following document into ${target_language}.
CRITICAL INSTRUCTIONS: 
1. You MUST perfectly preserve ALL Markdown formatting (headers, lists, bold, italics, tables, etc.).
2. The output MUST be valid Markdown. 
3. Do not include any conversational filler (e.g., "Here is the translation:"). Output ONLY the translated Markdown text.

Source Text:
${markdownText}`;
    const aiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${env2.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1 }
      })
    });
    if (!aiRes.ok) {
      const errText = await aiRes.text();
      return new Response(JSON.stringify({ error: "Gemini API failed", details: errText }), { status: 500 });
    }
    const aiData = await aiRes.json();
    const translatedText = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!translatedText) {
      return new Response(JSON.stringify({ error: "Failed to parse translation from AI" }), { status: 500 });
    }
    const transId = crypto.randomUUID();
    await env2.SURVEY_DB.batch([
      env2.SURVEY_DB.prepare(
        `INSERT INTO document_translations (id, document_id, language, translated_text) VALUES (?, ?, ?, ?)`
      ).bind(transId, document_id, target_language, translatedText),
      env2.SURVEY_DB.prepare(
        `UPDATE translation_requests SET status = 'completed' WHERE document_id = ? AND target_language = ?`
      ).bind(document_id, target_language)
    ]);
    return new Response(JSON.stringify({ success: true, id: transId }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
__name(onRequestPost5, "onRequestPost");

// api/translations/hopper.js
async function onRequestGet2(context2) {
  const { env: env2 } = context2;
  try {
    const { results } = await env2.SURVEY_DB.prepare(`
      SELECT 
        tr.document_id,
        tr.target_language,
        ad.title as document_title,
        COUNT(tr.id) as request_count,
        MIN(tr.created_at) as first_requested_at
      FROM translation_requests tr
      LEFT JOIN archive_documents ad ON tr.document_id = ad.id
      WHERE tr.status = 'pending'
      GROUP BY tr.document_id, tr.target_language
      ORDER BY request_count DESC, first_requested_at ASC
    `).all();
    return new Response(JSON.stringify({ requests: results }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
__name(onRequestGet2, "onRequestGet");

// api/translations/request.js
async function onRequestPost6(context2) {
  const { request, env: env2 } = context2;
  try {
    const { document_id, target_languages } = await request.json();
    const url = new URL(request.url);
    const userId = request.headers.get("x-user-id") || "anonymous";
    if (!document_id || !target_languages || !Array.isArray(target_languages)) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), { status: 400 });
    }
    const stmt = env2.SURVEY_DB.prepare(
      `INSERT INTO translation_requests (id, document_id, target_language, requested_by) VALUES (?, ?, ?, ?)`
    );
    const batch = [];
    for (const lang of target_languages) {
      const id = crypto.randomUUID();
      batch.push(stmt.bind(id, document_id, lang, userId));
    }
    await env2.SURVEY_DB.batch(batch);
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
__name(onRequestPost6, "onRequestPost");

// api/cms/[id].js
async function onRequestGet3(context2) {
  const { env: env2, params } = context2;
  const id = params.id;
  try {
    const stmt = env2.SURVEY_DB.prepare("SELECT * FROM archive_documents WHERE id = ?").bind(id);
    const doc = await stmt.first();
    if (!doc) {
      return new Response(JSON.stringify({ error: "Document not found" }), { status: 404 });
    }
    return new Response(JSON.stringify(doc), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error3) {
    return new Response(JSON.stringify({ error: error3.message }), { status: 500 });
  }
}
__name(onRequestGet3, "onRequestGet");
async function onRequestPut(context2) {
  const { request, env: env2, params } = context2;
  const id = params.id;
  try {
    const data = await request.json();
    if (data.action === "approve") {
      const stmt = env2.SURVEY_DB.prepare(`
        UPDATE archive_documents 
        SET status = 'ingested', ingested_at = datetime('now')
        WHERE id = ?
      `).bind(id);
      await stmt.run();
      return new Response(JSON.stringify({ success: true, message: "Document approved" }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response("Invalid action", { status: 400 });
  } catch (error3) {
    return new Response(JSON.stringify({ error: error3.message }), { status: 500 });
  }
}
__name(onRequestPut, "onRequestPut");
async function onRequestDelete(context2) {
  const { env: env2, params } = context2;
  const id = params.id;
  try {
    const stmt = env2.SURVEY_DB.prepare("DELETE FROM archive_documents WHERE id = ?").bind(id);
    await stmt.run();
    return new Response(JSON.stringify({ success: true, message: "Document deleted" }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error3) {
    return new Response(JSON.stringify({ error: error3.message }), { status: 500 });
  }
}
__name(onRequestDelete, "onRequestDelete");

// api/collections/[slug].js
async function onRequestGet4(context2) {
  const { request, env: env2, params } = context2;
  const slug = params.slug;
  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get("limit")) || 1e4;
  const offset = parseInt(url.searchParams.get("offset")) || 0;
  const collectionsData = {
    "published-articles": {
      title: "Curated Published Articles",
      subtitle: "Medical, Legal, and Academic Journals",
      institution: "Intactivist Guide Archive",
      curator: "Tim Hammond",
      description: "A comprehensive collection of published articles spanning several decades, meticulously compiled by Tim Hammond. This collection contains critical medical literature, legal policy analyses, and academic journals regarding genital autonomy.",
      queryFilter: "type = 'academic_journal'",
      bindArgs: []
    },
    "umass-ms-1205": {
      title: "The Tim Hammond Genital Autonomy Advocacy Archive",
      subtitle: "MS 1205",
      institution: "UMass Amherst Special Collections",
      curator: "Tim Hammond",
      description: "The defining archive of the genital autonomy movement. This collection includes extensive hard copy and electronic records representing decades of advocacy, establishing the foundation of NOCIRC, NOHARMM, and modern human rights advocacy.",
      queryFilter: "source_collection = 'UMass MS 1205'",
      bindArgs: []
    },
    "msu-clippings": {
      title: "Changing Men Collection",
      subtitle: "Historic News Clippings",
      institution: "Michigan State University",
      curator: "Samer Daffarini (compiler)",
      description: "An extensive archive of early movement documentation and news clipping files. This material was heavily accessed and compiled by activists over the years, capturing the public and media sentiment during the formative years of the movement.",
      queryFilter: "source_collection = 'MSU Clippings'",
      bindArgs: []
    }
  };
  try {
    const collection = collectionsData[slug];
    if (!collection) {
      return new Response(JSON.stringify({ error: "Collection not found" }), { status: 404 });
    }
    let results = [];
    let total = 0;
    if (env2.SURVEY_DB) {
      const docsQuery = await env2.SURVEY_DB.prepare(
        `SELECT * FROM archive_documents WHERE ${collection.queryFilter} ORDER BY title ASC LIMIT ? OFFSET ?`
      ).bind(...collection.bindArgs, limit, offset).all();
      results = docsQuery.results || [];
      const countResult = await env2.SURVEY_DB.prepare(
        `SELECT count(*) as total FROM archive_documents WHERE ${collection.queryFilter}`
      ).bind(...collection.bindArgs).first();
      total = countResult ? countResult.total : 0;
    }
    return new Response(JSON.stringify({
      collection,
      documents: results,
      total
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error3) {
    return new Response(JSON.stringify({ error: error3.message }), { status: 500 });
  }
}
__name(onRequestGet4, "onRequestGet");

// ../node_modules/@clerk/shared/dist/constants.mjs
var DEV_OR_STAGING_SUFFIXES = [
  ".lcl.dev",
  ".stg.dev",
  ".lclstage.dev",
  ".stgstage.dev",
  ".dev.lclclerk.com",
  ".stg.lclclerk.com",
  ".accounts.lclclerk.com",
  "accountsstage.dev",
  "accounts.dev"
];

// ../node_modules/@clerk/shared/dist/_chunks/keySetupGuidance-C8CJm1c6.mjs
var existingAppSteps = `To use an existing Clerk app, run:
npx clerk@latest link
npx clerk@latest env pull

For production keys, run:
npx clerk@latest env pull --instance prod`;
var dashboardFallback = `Or copy keys from https://dashboard.clerk.com/~/api-keys into your .env file.`;
var keySetupGuidance = `To create a new Clerk app, run:
npx clerk@latest init

${existingAppSteps}

${dashboardFallback}`;
var existingAppKeyGuidance = `${existingAppSteps}

${dashboardFallback}`;

// ../node_modules/@clerk/shared/dist/isomorphicAtob.mjs
var isomorphicAtob = /* @__PURE__ */ __name((data) => {
  if (typeof atob !== "undefined" && typeof atob === "function") return atob(data);
  else if (typeof globalThis.Buffer !== "undefined") return globalThis.Buffer.from(data, "base64").toString();
  return data;
}, "isomorphicAtob");

// ../node_modules/@clerk/shared/dist/keys.mjs
function createDevOrStagingUrlCache() {
  const devOrStagingUrlCache = /* @__PURE__ */ new Map();
  return {
    /**
    * Checks if a URL is a development or staging environment.
    *
    * @param url - The URL to check (string or URL object).
    * @returns `true` if the URL is a development or staging environment, `false` otherwise.
    */
    isDevOrStagingUrl: /* @__PURE__ */ __name((url) => {
      if (!url) return false;
      const hostname = typeof url === "string" ? url : url.hostname;
      let res = devOrStagingUrlCache.get(hostname);
      if (res === void 0) {
        res = DEV_OR_STAGING_SUFFIXES.some((s) => hostname.endsWith(s));
        devOrStagingUrlCache.set(hostname, res);
      }
      return res;
    }, "isDevOrStagingUrl")
  };
}
__name(createDevOrStagingUrlCache, "createDevOrStagingUrlCache");

// ../node_modules/@clerk/shared/dist/retry.mjs
var defaultOptions = {
  initialDelay: 125,
  maxDelayBetweenRetries: 0,
  factor: 2,
  shouldRetry: /* @__PURE__ */ __name((_, iteration) => iteration < 5, "shouldRetry"),
  retryImmediately: false,
  jitter: true
};
var RETRY_IMMEDIATELY_DELAY = 100;
var sleep = /* @__PURE__ */ __name(async (ms) => new Promise((s) => setTimeout(s, ms)), "sleep");
var applyJitter = /* @__PURE__ */ __name((delay, jitter) => {
  return jitter ? delay * (1 + Math.random()) : delay;
}, "applyJitter");
var createExponentialDelayAsyncFn = /* @__PURE__ */ __name((opts) => {
  let timesCalled = 0;
  const calculateDelayInMs = /* @__PURE__ */ __name(() => {
    const constant = opts.initialDelay;
    const base = opts.factor;
    let delay = constant * Math.pow(base, timesCalled);
    delay = applyJitter(delay, opts.jitter);
    return Math.min(opts.maxDelayBetweenRetries || delay, delay);
  }, "calculateDelayInMs");
  return async () => {
    await sleep(calculateDelayInMs());
    timesCalled++;
  };
}, "createExponentialDelayAsyncFn");
var retry = /* @__PURE__ */ __name(async (callback, options = {}) => {
  let iterations = 0;
  const { shouldRetry, initialDelay, maxDelayBetweenRetries, factor, retryImmediately, jitter, onBeforeRetry } = {
    ...defaultOptions,
    ...options
  };
  const delay = createExponentialDelayAsyncFn({
    initialDelay,
    maxDelayBetweenRetries,
    factor,
    jitter
  });
  while (true) try {
    return await callback();
  } catch (e) {
    iterations++;
    if (!shouldRetry(e, iterations)) throw e;
    if (onBeforeRetry) await onBeforeRetry(iterations);
    if (retryImmediately && iterations === 1) await sleep(applyJitter(RETRY_IMMEDIATELY_DELAY, jitter));
    else await delay();
  }
}, "retry");

// ../node_modules/@clerk/shared/dist/url.mjs
var createDynamicParamParser = /* @__PURE__ */ __name(({ regex }) => ({ urlWithParam, entity }) => {
  const match3 = regex.exec(urlWithParam);
  if (match3) {
    const key = match3[1];
    if (key in entity) {
      const value = entity[key];
      return urlWithParam.replace(match3[0], value);
    }
  }
  return urlWithParam;
}, "createDynamicParamParser");
var populateParamFromObject = createDynamicParamParser({ regex: /:(\w+)/ });

// ../node_modules/@clerk/shared/dist/_chunks/clerkRuntimeError-DlesLWqO.mjs
function createErrorTypeGuard(ErrorClass) {
  function typeGuard(error3) {
    const target = error3 ?? this;
    if (!target) throw new TypeError(`${ErrorClass.kind || ErrorClass.name} type guard requires an error object`);
    if (ErrorClass.kind && typeof target === "object" && target !== null && "constructor" in target) {
      if (target.constructor?.kind === ErrorClass.kind) return true;
    }
    return target instanceof ErrorClass;
  }
  __name(typeGuard, "typeGuard");
  return typeGuard;
}
__name(createErrorTypeGuard, "createErrorTypeGuard");
var ClerkError = class ClerkError2 extends Error {
  static {
    __name(this, "ClerkError");
  }
  static kind = "ClerkError";
  clerkError = true;
  code;
  longMessage;
  docsUrl;
  cause;
  get name() {
    return this.constructor.name;
  }
  constructor(opts) {
    super(new.target.formatMessage(new.target.kind, opts.message, opts.code, opts.docsUrl), { cause: opts.cause });
    Object.setPrototypeOf(this, ClerkError2.prototype);
    this.code = opts.code;
    this.docsUrl = opts.docsUrl;
    this.longMessage = opts.longMessage;
    this.cause = opts.cause;
  }
  toString() {
    return `[${this.name}]
Message:${this.message}`;
  }
  static formatMessage(name, msg, code, docsUrl) {
    const prefix = "Clerk:";
    const regex = new RegExp(prefix.replace(" ", "\\s*"), "i");
    msg = msg.replace(regex, "");
    msg = `${prefix} ${msg.trim()}

(code="${code}")

`;
    if (docsUrl) msg += `

Docs: ${docsUrl}`;
    return msg;
  }
};
var ClerkRuntimeError = class ClerkRuntimeError2 extends ClerkError {
  static {
    __name(this, "ClerkRuntimeError");
  }
  static kind = "ClerkRuntimeError";
  /**
  * @deprecated Use `clerkError` property instead. This property is maintained for backward compatibility.
  */
  clerkRuntimeError = true;
  constructor(message, options) {
    super({
      ...options,
      message
    });
    Object.setPrototypeOf(this, ClerkRuntimeError2.prototype);
  }
};
var isClerkRuntimeError = createErrorTypeGuard(ClerkRuntimeError);

// ../node_modules/@clerk/shared/dist/_chunks/error-BUL83bSw.mjs
var ClerkAPIError = class {
  static {
    __name(this, "ClerkAPIError");
  }
  static kind = "ClerkAPIError";
  code;
  message;
  longMessage;
  meta;
  constructor(json) {
    const parsedError = {
      code: json.code,
      message: json.message,
      longMessage: json.long_message,
      meta: {
        paramName: json.meta?.param_name,
        sessionId: json.meta?.session_id,
        emailAddresses: json.meta?.email_addresses,
        identifiers: json.meta?.identifiers,
        zxcvbn: json.meta?.zxcvbn,
        plan: json.meta?.plan,
        isPlanUpgradePossible: json.meta?.is_plan_upgrade_possible,
        seatsQuantityToAdd: json.meta?.seats_quantity_to_add,
        seatsQuantity: json.meta?.seats_quantity,
        traceId: json.meta?.trace_id,
        kind: json.meta?.kind,
        title: json.meta?.title,
        description: json.meta?.description,
        linkUrl: json.meta?.link_url,
        linkText: json.meta?.link_text,
        data: json.meta?.data
      }
    };
    this.code = parsedError.code;
    this.message = parsedError.message;
    this.longMessage = parsedError.longMessage;
    this.meta = parsedError.meta;
  }
};
var isClerkAPIError = createErrorTypeGuard(ClerkAPIError);
var ClerkAPIResponseError = class ClerkAPIResponseError2 extends ClerkError {
  static {
    __name(this, "ClerkAPIResponseError");
  }
  static kind = "ClerkAPIResponseError";
  status;
  clerkTraceId;
  retryAfter;
  errors;
  constructor(message, options) {
    const { data: errorsJson, status, clerkTraceId, retryAfter } = options;
    super({
      ...options,
      message,
      code: "api_response_error"
    });
    Object.setPrototypeOf(this, ClerkAPIResponseError2.prototype);
    this.status = status;
    this.clerkTraceId = clerkTraceId;
    this.retryAfter = retryAfter;
    this.errors = (errorsJson || []).map((e) => new ClerkAPIError(e));
  }
  toString() {
    let message = `[${this.name}]
Message:${this.message}
Status:${this.status}
Serialized errors: ${this.errors.map((e) => JSON.stringify(e))}`;
    if (this.clerkTraceId) message += `
Clerk Trace ID: ${this.clerkTraceId}`;
    return message;
  }
  static formatMessage(name, msg, _, __) {
    return msg;
  }
};
var isClerkAPIResponseError = createErrorTypeGuard(ClerkAPIResponseError);
var DefaultMessages = Object.freeze({
  InvalidProxyUrlErrorMessage: `The proxyUrl passed to Clerk is invalid. The expected value for proxyUrl is an absolute URL or a relative path with a leading '/'. (key={{url}})`,
  InvalidPublishableKeyErrorMessage: `The publishableKey passed to Clerk is invalid (key={{key}}, expected format: pk_test_... or pk_live_...).

${keySetupGuidance}`,
  MissingPublishableKeyErrorMessage: `Clerk keys are missing from your environment.

${keySetupGuidance}`,
  MissingSecretKeyErrorMessage: `Missing secretKey.

${existingAppKeyGuidance}`,
  MissingClerkProvider: `{{source}} can only be used within the <ClerkProvider /> component. Learn more: https://clerk.com/docs/components/clerk-provider`
});
function buildErrorThrower({ packageName, customMessages }) {
  let pkg = packageName;
  function buildMessage(rawMessage, replacements) {
    if (!replacements) return `${pkg}: ${rawMessage}`;
    let msg = rawMessage;
    const matches = rawMessage.matchAll(/{{([a-zA-Z0-9-_]+)}}/g);
    for (const match3 of matches) {
      const replacement = (replacements[match3[1]] || "").toString();
      msg = msg.replace(`{{${match3[1]}}}`, replacement);
    }
    return `${pkg}: ${msg}`;
  }
  __name(buildMessage, "buildMessage");
  const messages = {
    ...DefaultMessages,
    ...customMessages
  };
  return {
    setPackageName({ packageName: packageName2 }) {
      if (typeof packageName2 === "string") pkg = packageName2;
      return this;
    },
    setMessages({ customMessages: customMessages2 }) {
      Object.assign(messages, customMessages2 || {});
      return this;
    },
    throwInvalidPublishableKeyError(params) {
      throw new Error(buildMessage(messages.InvalidPublishableKeyErrorMessage, params));
    },
    throwInvalidProxyUrl(params) {
      throw new Error(buildMessage(messages.InvalidProxyUrlErrorMessage, params));
    },
    throwMissingPublishableKeyError() {
      throw new Error(buildMessage(messages.MissingPublishableKeyErrorMessage));
    },
    throwMissingSecretKeyError() {
      throw new Error(buildMessage(messages.MissingSecretKeyErrorMessage));
    },
    throwMissingClerkProviderError(params) {
      throw new Error(buildMessage(messages.MissingClerkProvider, params));
    },
    throw(message) {
      throw new Error(buildMessage(message));
    }
  };
}
__name(buildErrorThrower, "buildErrorThrower");

// ../node_modules/@clerk/backend/dist/chunk-YBVFDYDR.mjs
var errorThrower = buildErrorThrower({ packageName: "@clerk/backend" });
var { isDevOrStagingUrl } = createDevOrStagingUrlCache();

// ../node_modules/@clerk/backend/dist/chunk-RZ7A7F6X.mjs
var TokenVerificationErrorCode = {
  InvalidSecretKey: "clerk_key_invalid"
};
var TokenVerificationErrorReason = {
  TokenExpired: "token-expired",
  TokenInvalid: "token-invalid",
  TokenInvalidAlgorithm: "token-invalid-algorithm",
  TokenInvalidAuthorizedParties: "token-invalid-authorized-parties",
  TokenInvalidSignature: "token-invalid-signature",
  TokenNotActiveYet: "token-not-active-yet",
  TokenIatInTheFuture: "token-iat-in-the-future",
  TokenVerificationFailed: "token-verification-failed",
  InvalidSecretKey: "secret-key-invalid",
  LocalJWKMissing: "jwk-local-missing",
  RemoteJWKFailedToLoad: "jwk-remote-failed-to-load",
  RemoteJWKInvalid: "jwk-remote-invalid",
  RemoteJWKMissing: "jwk-remote-missing",
  JWKFailedToResolve: "jwk-failed-to-resolve",
  JWKKidMismatch: "jwk-kid-mismatch"
};
var TokenVerificationErrorAction = {
  ContactSupport: "Contact support@clerk.com",
  EnsureClerkJWT: "Make sure that this is a valid Clerk-generated JWT.",
  SetClerkJWTKey: "Set the CLERK_JWT_KEY environment variable.",
  SetClerkSecretKey: "Set the CLERK_SECRET_KEY environment variable.",
  EnsureClockSync: "Make sure your system clock is in sync (e.g. turn off and on automatic time synchronization)."
};
var TokenVerificationError = class _TokenVerificationError extends Error {
  static {
    __name(this, "_TokenVerificationError");
  }
  constructor({
    action,
    message,
    reason
  }) {
    super(message);
    Object.setPrototypeOf(this, _TokenVerificationError.prototype);
    this.reason = reason;
    this.message = message;
    this.action = action;
  }
  getFullMessage() {
    return `${[this.message, this.action].filter((m) => m).join(" ")} (reason=${this.reason}, token-carrier=${this.tokenCarrier})`;
  }
};
var MachineTokenVerificationErrorCode = {
  TokenInvalid: "token-invalid",
  InvalidSecretKey: "secret-key-invalid",
  UnexpectedError: "unexpected-error",
  TokenVerificationFailed: "token-verification-failed"
};
var _MachineTokenVerificationError = class _MachineTokenVerificationError2 extends ClerkError {
  static {
    __name(this, "_MachineTokenVerificationError");
  }
  constructor({
    message,
    code,
    status,
    action
  }) {
    super({ message, code });
    Object.setPrototypeOf(this, _MachineTokenVerificationError2.prototype);
    this.status = status;
    this.action = action;
  }
  // Keep message unformatted, matching ClerkAPIResponseError's approach
  static formatMessage(_name, msg, _code, _docsUrl) {
    return msg;
  }
  getFullMessage() {
    return `${this.message} (code=${this.code}, status=${this.status || "n/a"})`;
  }
};
_MachineTokenVerificationError.kind = "MachineTokenVerificationError";
var MachineTokenVerificationError = _MachineTokenVerificationError;

// ../node_modules/@clerk/backend/dist/runtime/browser/crypto.mjs
var webcrypto = crypto;

// ../node_modules/@clerk/backend/dist/chunk-OBKCLPTQ.mjs
var globalFetch = fetch.bind(globalThis);
var runtime = {
  crypto: webcrypto,
  get fetch() {
    return false ? fetch : globalFetch;
  },
  AbortController: globalThis.AbortController,
  Blob: globalThis.Blob,
  FormData: globalThis.FormData,
  Headers: globalThis.Headers,
  Request: globalThis.Request,
  Response: globalThis.Response
};
var base64url = {
  parse(string, opts) {
    return parse(string, base64UrlEncoding, opts);
  },
  stringify(data, opts) {
    return stringify(data, base64UrlEncoding, opts);
  }
};
var base64UrlEncoding = {
  chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_",
  bits: 6
};
function parse(string, encoding, opts = {}) {
  if (!encoding.codes) {
    encoding.codes = {};
    for (let i = 0; i < encoding.chars.length; ++i) {
      encoding.codes[encoding.chars[i]] = i;
    }
  }
  if (!opts.loose && string.length * encoding.bits & 7) {
    throw new SyntaxError("Invalid padding");
  }
  let end = string.length;
  while (string[end - 1] === "=") {
    --end;
    if (!opts.loose && !((string.length - end) * encoding.bits & 7)) {
      throw new SyntaxError("Invalid padding");
    }
  }
  const out = new (opts.out ?? Uint8Array)(end * encoding.bits / 8 | 0);
  let bits = 0;
  let buffer = 0;
  let written = 0;
  for (let i = 0; i < end; ++i) {
    const value = encoding.codes[string[i]];
    if (value === void 0) {
      throw new SyntaxError("Invalid character " + string[i]);
    }
    buffer = buffer << encoding.bits | value;
    bits += encoding.bits;
    if (bits >= 8) {
      bits -= 8;
      out[written++] = 255 & buffer >> bits;
    }
  }
  if (bits >= encoding.bits || 255 & buffer << 8 - bits) {
    throw new SyntaxError("Unexpected end of data");
  }
  return out;
}
__name(parse, "parse");
function stringify(data, encoding, opts = {}) {
  const { pad = true } = opts;
  const mask = (1 << encoding.bits) - 1;
  let out = "";
  let bits = 0;
  let buffer = 0;
  for (let i = 0; i < data.length; ++i) {
    buffer = buffer << 8 | 255 & data[i];
    bits += 8;
    while (bits > encoding.bits) {
      bits -= encoding.bits;
      out += encoding.chars[mask & buffer >> bits];
    }
  }
  if (bits) {
    out += encoding.chars[mask & buffer << encoding.bits - bits];
  }
  if (pad) {
    while (out.length * encoding.bits & 7) {
      out += "=";
    }
  }
  return out;
}
__name(stringify, "stringify");
var algToHash = {
  RS256: "SHA-256",
  RS384: "SHA-384",
  RS512: "SHA-512"
};
var RSA_ALGORITHM_NAME = "RSASSA-PKCS1-v1_5";
var jwksAlgToCryptoAlg = {
  RS256: RSA_ALGORITHM_NAME,
  RS384: RSA_ALGORITHM_NAME,
  RS512: RSA_ALGORITHM_NAME
};
var algs = Object.keys(algToHash);
function getCryptoAlgorithm(algorithmName) {
  const hash = algToHash[algorithmName];
  const name = jwksAlgToCryptoAlg[algorithmName];
  if (!hash || !name) {
    throw new Error(`Unsupported algorithm ${algorithmName}, expected one of ${algs.join(",")}.`);
  }
  return {
    hash: { name: algToHash[algorithmName] },
    name: jwksAlgToCryptoAlg[algorithmName]
  };
}
__name(getCryptoAlgorithm, "getCryptoAlgorithm");
var isArrayString = /* @__PURE__ */ __name((s) => {
  return Array.isArray(s) && s.length > 0 && s.every((a) => typeof a === "string");
}, "isArrayString");
var assertAudienceClaim = /* @__PURE__ */ __name((aud, audience) => {
  const audienceList = [audience].flat().filter((a) => !!a);
  const audList = [aud].flat().filter((a) => !!a);
  const shouldVerifyAudience = audienceList.length > 0 && audList.length > 0;
  if (!shouldVerifyAudience) {
    return;
  }
  if (typeof aud === "string") {
    if (!audienceList.includes(aud)) {
      throw new TokenVerificationError({
        action: TokenVerificationErrorAction.EnsureClerkJWT,
        reason: TokenVerificationErrorReason.TokenVerificationFailed,
        message: `Invalid JWT audience claim (aud) ${JSON.stringify(aud)}. Is not included in "${JSON.stringify(
          audienceList
        )}".`
      });
    }
  } else if (isArrayString(aud)) {
    if (!aud.some((a) => audienceList.includes(a))) {
      throw new TokenVerificationError({
        action: TokenVerificationErrorAction.EnsureClerkJWT,
        reason: TokenVerificationErrorReason.TokenVerificationFailed,
        message: `Invalid JWT audience claim array (aud) ${JSON.stringify(aud)}. Is not included in "${JSON.stringify(
          audienceList
        )}".`
      });
    }
  }
}, "assertAudienceClaim");
var assertHeaderType = /* @__PURE__ */ __name((typ, allowedTypes) => {
  if (typeof typ === "undefined" && typeof allowedTypes === "undefined") {
    return;
  }
  const expectedTypes = allowedTypes ?? "JWT";
  const allowed = Array.isArray(expectedTypes) ? expectedTypes : [expectedTypes];
  if (!allowed.includes(typ)) {
    throw new TokenVerificationError({
      action: TokenVerificationErrorAction.EnsureClerkJWT,
      reason: TokenVerificationErrorReason.TokenInvalid,
      message: `Invalid JWT type ${JSON.stringify(typ)}. Expected "${allowed.join(", ")}".`
    });
  }
}, "assertHeaderType");
var assertHeaderAlgorithm = /* @__PURE__ */ __name((alg) => {
  if (!algs.includes(alg)) {
    throw new TokenVerificationError({
      action: TokenVerificationErrorAction.EnsureClerkJWT,
      reason: TokenVerificationErrorReason.TokenInvalidAlgorithm,
      message: `Invalid JWT algorithm ${JSON.stringify(alg)}. Supported: ${algs}.`
    });
  }
}, "assertHeaderAlgorithm");
var assertSubClaim = /* @__PURE__ */ __name((sub) => {
  if (typeof sub !== "string") {
    throw new TokenVerificationError({
      action: TokenVerificationErrorAction.EnsureClerkJWT,
      reason: TokenVerificationErrorReason.TokenVerificationFailed,
      message: `Subject claim (sub) is required and must be a string. Received ${JSON.stringify(sub)}.`
    });
  }
}, "assertSubClaim");
var assertAuthorizedPartiesClaim = /* @__PURE__ */ __name((azp, authorizedParties) => {
  if (!authorizedParties || authorizedParties.length === 0) {
    return;
  }
  if (!azp || !authorizedParties.includes(azp)) {
    throw new TokenVerificationError({
      reason: TokenVerificationErrorReason.TokenInvalidAuthorizedParties,
      message: `Invalid JWT Authorized party claim (azp) ${JSON.stringify(azp)}. Expected "${authorizedParties}".`
    });
  }
}, "assertAuthorizedPartiesClaim");
var assertExpirationClaim = /* @__PURE__ */ __name((exp, clockSkewInMs) => {
  if (typeof exp !== "number") {
    throw new TokenVerificationError({
      action: TokenVerificationErrorAction.EnsureClerkJWT,
      reason: TokenVerificationErrorReason.TokenVerificationFailed,
      message: `Invalid JWT expiry date claim (exp) ${JSON.stringify(exp)}. Expected number.`
    });
  }
  const currentDate = new Date(Date.now());
  const expiryDate = /* @__PURE__ */ new Date(0);
  expiryDate.setUTCSeconds(exp);
  const expired = expiryDate.getTime() <= currentDate.getTime() - clockSkewInMs;
  if (expired) {
    throw new TokenVerificationError({
      reason: TokenVerificationErrorReason.TokenExpired,
      message: `JWT is expired. Expiry date: ${expiryDate.toUTCString()}, Current date: ${currentDate.toUTCString()}.`
    });
  }
}, "assertExpirationClaim");
var assertActivationClaim = /* @__PURE__ */ __name((nbf, clockSkewInMs) => {
  if (typeof nbf === "undefined") {
    return;
  }
  if (typeof nbf !== "number") {
    throw new TokenVerificationError({
      action: TokenVerificationErrorAction.EnsureClerkJWT,
      reason: TokenVerificationErrorReason.TokenVerificationFailed,
      message: `Invalid JWT not before date claim (nbf) ${JSON.stringify(nbf)}. Expected number.`
    });
  }
  const currentDate = new Date(Date.now());
  const notBeforeDate = /* @__PURE__ */ new Date(0);
  notBeforeDate.setUTCSeconds(nbf);
  const early = notBeforeDate.getTime() > currentDate.getTime() + clockSkewInMs;
  if (early) {
    throw new TokenVerificationError({
      reason: TokenVerificationErrorReason.TokenNotActiveYet,
      message: `JWT cannot be used prior to not before date claim (nbf). Not before date: ${notBeforeDate.toUTCString()}; Current date: ${currentDate.toUTCString()};`
    });
  }
}, "assertActivationClaim");
var assertIssuedAtClaim = /* @__PURE__ */ __name((iat, clockSkewInMs) => {
  if (typeof iat === "undefined") {
    return;
  }
  if (typeof iat !== "number") {
    throw new TokenVerificationError({
      action: TokenVerificationErrorAction.EnsureClerkJWT,
      reason: TokenVerificationErrorReason.TokenVerificationFailed,
      message: `Invalid JWT issued at date claim (iat) ${JSON.stringify(iat)}. Expected number.`
    });
  }
  const currentDate = new Date(Date.now());
  const issuedAtDate = /* @__PURE__ */ new Date(0);
  issuedAtDate.setUTCSeconds(iat);
  const postIssued = issuedAtDate.getTime() > currentDate.getTime() + clockSkewInMs;
  if (postIssued) {
    throw new TokenVerificationError({
      reason: TokenVerificationErrorReason.TokenIatInTheFuture,
      message: `JWT issued at date claim (iat) is in the future. Issued at date: ${issuedAtDate.toUTCString()}; Current date: ${currentDate.toUTCString()};`
    });
  }
}, "assertIssuedAtClaim");
function pemToBuffer(secret) {
  const trimmed = secret.replace(/-----BEGIN.*?-----/g, "").replace(/-----END.*?-----/g, "").replace(/\s/g, "");
  const decoded = isomorphicAtob(trimmed);
  const buffer = new ArrayBuffer(decoded.length);
  const bufView = new Uint8Array(buffer);
  for (let i = 0, strLen = decoded.length; i < strLen; i++) {
    bufView[i] = decoded.charCodeAt(i);
  }
  return bufView;
}
__name(pemToBuffer, "pemToBuffer");
function importKey(key, algorithm, keyUsage) {
  if (typeof key === "object") {
    return runtime.crypto.subtle.importKey("jwk", key, algorithm, false, [keyUsage]);
  }
  const keyData = pemToBuffer(key);
  const format = keyUsage === "sign" ? "pkcs8" : "spki";
  return runtime.crypto.subtle.importKey(format, keyData, algorithm, false, [keyUsage]);
}
__name(importKey, "importKey");
var DEFAULT_CLOCK_SKEW_IN_MS = 5 * 1e3;
async function hasValidSignature(jwt, key) {
  const { header, signature, raw } = jwt;
  const encoder = new TextEncoder();
  const data = encoder.encode([raw.header, raw.payload].join("."));
  const algorithm = getCryptoAlgorithm(header.alg);
  try {
    const cryptoKey = await importKey(key, algorithm, "verify");
    const verified = await runtime.crypto.subtle.verify(
      algorithm.name,
      cryptoKey,
      signature,
      data
    );
    return { data: verified };
  } catch (error3) {
    return {
      errors: [
        new TokenVerificationError({
          reason: TokenVerificationErrorReason.TokenInvalidSignature,
          message: error3?.message
        })
      ]
    };
  }
}
__name(hasValidSignature, "hasValidSignature");
function decodeJwt(token) {
  const tokenParts = (token || "").toString().split(".");
  if (tokenParts.length !== 3) {
    return {
      errors: [
        new TokenVerificationError({
          reason: TokenVerificationErrorReason.TokenInvalid,
          message: `Invalid JWT form. A JWT consists of three parts separated by dots.`
        })
      ]
    };
  }
  const [rawHeader, rawPayload, rawSignature] = tokenParts;
  const decoder = new TextDecoder();
  let header, payload, signature;
  try {
    header = JSON.parse(decoder.decode(base64url.parse(rawHeader, { loose: true })));
    payload = JSON.parse(decoder.decode(base64url.parse(rawPayload, { loose: true })));
    signature = base64url.parse(rawSignature, { loose: true });
  } catch {
    return {
      errors: [
        new TokenVerificationError({
          reason: TokenVerificationErrorReason.TokenInvalid,
          message: `Invalid JWT form. The header, payload, or signature could not be decoded.`
        })
      ]
    };
  }
  const data = {
    header,
    payload,
    signature,
    raw: {
      header: rawHeader,
      payload: rawPayload,
      signature: rawSignature,
      text: token
    }
  };
  return { data };
}
__name(decodeJwt, "decodeJwt");
async function verifyJwt(token, options) {
  const { audience, authorizedParties, clockSkewInMs, key, headerType } = options;
  const clockSkew = typeof clockSkewInMs === "number" && Number.isFinite(clockSkewInMs) ? clockSkewInMs : DEFAULT_CLOCK_SKEW_IN_MS;
  const { data: decoded, errors } = decodeJwt(token);
  if (errors) {
    return { errors };
  }
  const { header, payload } = decoded;
  try {
    const { typ, alg } = header;
    assertHeaderType(typ, headerType);
    assertHeaderAlgorithm(alg);
  } catch (err) {
    return { errors: [err] };
  }
  const { data: signatureValid, errors: signatureErrors } = await hasValidSignature(decoded, key);
  if (signatureErrors) {
    return {
      errors: [
        new TokenVerificationError({
          action: TokenVerificationErrorAction.EnsureClerkJWT,
          reason: TokenVerificationErrorReason.TokenVerificationFailed,
          message: `Error verifying JWT signature. ${signatureErrors[0]}`
        })
      ]
    };
  }
  if (!signatureValid) {
    return {
      errors: [
        new TokenVerificationError({
          reason: TokenVerificationErrorReason.TokenInvalidSignature,
          message: "JWT signature is invalid."
        })
      ]
    };
  }
  try {
    const { azp, sub, aud, iat, exp, nbf } = payload;
    assertSubClaim(sub);
    assertAudienceClaim(aud, audience);
    assertAuthorizedPartiesClaim(azp, authorizedParties);
    assertExpirationClaim(exp, clockSkew);
    assertActivationClaim(nbf, clockSkew);
    assertIssuedAtClaim(iat, clockSkew);
  } catch (err) {
    return { errors: [err] };
  }
  return { data: payload };
}
__name(verifyJwt, "verifyJwt");

// ../node_modules/@clerk/backend/dist/chunk-TOROEX6P.mjs
var __create = Object.create;
var __defProp2 = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __typeError = /* @__PURE__ */ __name((msg) => {
  throw TypeError(msg);
}, "__typeError");
var __commonJS = /* @__PURE__ */ __name((cb, mod) => /* @__PURE__ */ __name(function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
}, "__require"), "__commonJS");
var __copyProps = /* @__PURE__ */ __name((to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp2(to, key, { get: /* @__PURE__ */ __name(() => from[key], "get"), enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
}, "__copyProps");
var __toESM = /* @__PURE__ */ __name((mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp2(target, "default", { value: mod, enumerable: true }) : target,
  mod
)), "__toESM");
var __accessCheck = /* @__PURE__ */ __name((obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg), "__accessCheck");
var __privateGet = /* @__PURE__ */ __name((obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj)), "__privateGet");

// ../node_modules/@clerk/shared/dist/underscore.mjs
function snakeToCamel(str) {
  return str ? str.replace(/([-_][a-z])/g, (match3) => match3.toUpperCase().replace(/-|_/, "")) : "";
}
__name(snakeToCamel, "snakeToCamel");
function camelToSnake(str) {
  return str ? str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`) : "";
}
__name(camelToSnake, "camelToSnake");
var createDeepObjectTransformer = /* @__PURE__ */ __name((transform) => {
  const deepTransform = /* @__PURE__ */ __name((obj) => {
    if (!obj) return obj;
    if (Array.isArray(obj)) return obj.map((el) => {
      if (typeof el === "object" || Array.isArray(el)) return deepTransform(el);
      return el;
    });
    const copy = { ...obj };
    const keys = Object.keys(copy);
    for (const oldName of keys) {
      const newName = transform(oldName.toString());
      if (newName !== oldName) {
        copy[newName] = copy[oldName];
        delete copy[oldName];
      }
      if (typeof copy[newName] === "object") copy[newName] = deepTransform(copy[newName]);
    }
    return copy;
  }, "deepTransform");
  return deepTransform;
}, "createDeepObjectTransformer");
var deepCamelToSnake = createDeepObjectTransformer(camelToSnake);
var deepSnakeToCamel = createDeepObjectTransformer(snakeToCamel);

// ../node_modules/@clerk/backend/dist/chunk-YTAN34JE.mjs
var require_dist = __commonJS({
  "../../node_modules/.pnpm/cookie@1.1.1/node_modules/cookie/dist/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parseCookie = parseCookie;
    exports.parse = parseCookie;
    exports.stringifyCookie = stringifyCookie;
    exports.stringifySetCookie = stringifySetCookie;
    exports.serialize = stringifySetCookie;
    exports.parseSetCookie = parseSetCookie;
    exports.stringifySetCookie = stringifySetCookie;
    exports.serialize = stringifySetCookie;
    var cookieNameRegExp = /^[\u0021-\u003A\u003C\u003E-\u007E]+$/;
    var cookieValueRegExp = /^[\u0021-\u003A\u003C-\u007E]*$/;
    var domainValueRegExp = /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i;
    var pathValueRegExp = /^[\u0020-\u003A\u003D-\u007E]*$/;
    var maxAgeRegExp = /^-?\d+$/;
    var __toString = Object.prototype.toString;
    var NullObject = /* @__PURE__ */ (() => {
      const C = /* @__PURE__ */ __name(function() {
      }, "C");
      C.prototype = /* @__PURE__ */ Object.create(null);
      return C;
    })();
    function parseCookie(str, options) {
      const obj = new NullObject();
      const len = str.length;
      if (len < 2)
        return obj;
      const dec = options?.decode || decode;
      let index = 0;
      do {
        const eqIdx = eqIndex(str, index, len);
        if (eqIdx === -1)
          break;
        const endIdx = endIndex(str, index, len);
        if (eqIdx > endIdx) {
          index = str.lastIndexOf(";", eqIdx - 1) + 1;
          continue;
        }
        const key = valueSlice(str, index, eqIdx);
        if (obj[key] === void 0) {
          obj[key] = dec(valueSlice(str, eqIdx + 1, endIdx));
        }
        index = endIdx + 1;
      } while (index < len);
      return obj;
    }
    __name(parseCookie, "parseCookie");
    function stringifyCookie(cookie, options) {
      const enc = options?.encode || encodeURIComponent;
      const cookieStrings = [];
      for (const name of Object.keys(cookie)) {
        const val = cookie[name];
        if (val === void 0)
          continue;
        if (!cookieNameRegExp.test(name)) {
          throw new TypeError(`cookie name is invalid: ${name}`);
        }
        const value = enc(val);
        if (!cookieValueRegExp.test(value)) {
          throw new TypeError(`cookie val is invalid: ${val}`);
        }
        cookieStrings.push(`${name}=${value}`);
      }
      return cookieStrings.join("; ");
    }
    __name(stringifyCookie, "stringifyCookie");
    function stringifySetCookie(_name, _val, _opts) {
      const cookie = typeof _name === "object" ? _name : { ..._opts, name: _name, value: String(_val) };
      const options = typeof _val === "object" ? _val : _opts;
      const enc = options?.encode || encodeURIComponent;
      if (!cookieNameRegExp.test(cookie.name)) {
        throw new TypeError(`argument name is invalid: ${cookie.name}`);
      }
      const value = cookie.value ? enc(cookie.value) : "";
      if (!cookieValueRegExp.test(value)) {
        throw new TypeError(`argument val is invalid: ${cookie.value}`);
      }
      let str = cookie.name + "=" + value;
      if (cookie.maxAge !== void 0) {
        if (!Number.isInteger(cookie.maxAge)) {
          throw new TypeError(`option maxAge is invalid: ${cookie.maxAge}`);
        }
        str += "; Max-Age=" + cookie.maxAge;
      }
      if (cookie.domain) {
        if (!domainValueRegExp.test(cookie.domain)) {
          throw new TypeError(`option domain is invalid: ${cookie.domain}`);
        }
        str += "; Domain=" + cookie.domain;
      }
      if (cookie.path) {
        if (!pathValueRegExp.test(cookie.path)) {
          throw new TypeError(`option path is invalid: ${cookie.path}`);
        }
        str += "; Path=" + cookie.path;
      }
      if (cookie.expires) {
        if (!isDate(cookie.expires) || !Number.isFinite(cookie.expires.valueOf())) {
          throw new TypeError(`option expires is invalid: ${cookie.expires}`);
        }
        str += "; Expires=" + cookie.expires.toUTCString();
      }
      if (cookie.httpOnly) {
        str += "; HttpOnly";
      }
      if (cookie.secure) {
        str += "; Secure";
      }
      if (cookie.partitioned) {
        str += "; Partitioned";
      }
      if (cookie.priority) {
        const priority = typeof cookie.priority === "string" ? cookie.priority.toLowerCase() : void 0;
        switch (priority) {
          case "low":
            str += "; Priority=Low";
            break;
          case "medium":
            str += "; Priority=Medium";
            break;
          case "high":
            str += "; Priority=High";
            break;
          default:
            throw new TypeError(`option priority is invalid: ${cookie.priority}`);
        }
      }
      if (cookie.sameSite) {
        const sameSite = typeof cookie.sameSite === "string" ? cookie.sameSite.toLowerCase() : cookie.sameSite;
        switch (sameSite) {
          case true:
          case "strict":
            str += "; SameSite=Strict";
            break;
          case "lax":
            str += "; SameSite=Lax";
            break;
          case "none":
            str += "; SameSite=None";
            break;
          default:
            throw new TypeError(`option sameSite is invalid: ${cookie.sameSite}`);
        }
      }
      return str;
    }
    __name(stringifySetCookie, "stringifySetCookie");
    function parseSetCookie(str, options) {
      const dec = options?.decode || decode;
      const len = str.length;
      const endIdx = endIndex(str, 0, len);
      const eqIdx = eqIndex(str, 0, endIdx);
      const setCookie = eqIdx === -1 ? { name: "", value: dec(valueSlice(str, 0, endIdx)) } : {
        name: valueSlice(str, 0, eqIdx),
        value: dec(valueSlice(str, eqIdx + 1, endIdx))
      };
      let index = endIdx + 1;
      while (index < len) {
        const endIdx2 = endIndex(str, index, len);
        const eqIdx2 = eqIndex(str, index, endIdx2);
        const attr = eqIdx2 === -1 ? valueSlice(str, index, endIdx2) : valueSlice(str, index, eqIdx2);
        const val = eqIdx2 === -1 ? void 0 : valueSlice(str, eqIdx2 + 1, endIdx2);
        switch (attr.toLowerCase()) {
          case "httponly":
            setCookie.httpOnly = true;
            break;
          case "secure":
            setCookie.secure = true;
            break;
          case "partitioned":
            setCookie.partitioned = true;
            break;
          case "domain":
            setCookie.domain = val;
            break;
          case "path":
            setCookie.path = val;
            break;
          case "max-age":
            if (val && maxAgeRegExp.test(val))
              setCookie.maxAge = Number(val);
            break;
          case "expires":
            if (!val)
              break;
            const date = new Date(val);
            if (Number.isFinite(date.valueOf()))
              setCookie.expires = date;
            break;
          case "priority":
            if (!val)
              break;
            const priority = val.toLowerCase();
            if (priority === "low" || priority === "medium" || priority === "high") {
              setCookie.priority = priority;
            }
            break;
          case "samesite":
            if (!val)
              break;
            const sameSite = val.toLowerCase();
            if (sameSite === "lax" || sameSite === "strict" || sameSite === "none") {
              setCookie.sameSite = sameSite;
            }
            break;
        }
        index = endIdx2 + 1;
      }
      return setCookie;
    }
    __name(parseSetCookie, "parseSetCookie");
    function endIndex(str, min, len) {
      const index = str.indexOf(";", min);
      return index === -1 ? len : index;
    }
    __name(endIndex, "endIndex");
    function eqIndex(str, min, max) {
      const index = str.indexOf("=", min);
      return index < max ? index : -1;
    }
    __name(eqIndex, "eqIndex");
    function valueSlice(str, min, max) {
      let start = min;
      let end = max;
      do {
        const code = str.charCodeAt(start);
        if (code !== 32 && code !== 9)
          break;
      } while (++start < end);
      while (end > start) {
        const code = str.charCodeAt(end - 1);
        if (code !== 32 && code !== 9)
          break;
        end--;
      }
      return str.slice(start, end);
    }
    __name(valueSlice, "valueSlice");
    function decode(str) {
      if (str.indexOf("%") === -1)
        return str;
      try {
        return decodeURIComponent(str);
      } catch (e) {
        return str;
      }
    }
    __name(decode, "decode");
    function isDate(val) {
      return __toString.call(val) === "[object Date]";
    }
    __name(isDate, "isDate");
  }
});
var API_URL = "https://api.clerk.com";
var API_VERSION = "v1";
var USER_AGENT = `${"@clerk/backend"}@${"3.20.1"}`;
var MAX_CACHE_LAST_UPDATED_AT_SECONDS = 5 * 60;
var SUPPORTED_BAPI_VERSION = "2026-05-12";
var Cookies = {
  Session: "__session",
  Refresh: "__refresh",
  ClientUat: "__client_uat",
  Handshake: "__clerk_handshake",
  DevBrowser: "__clerk_db_jwt",
  RedirectCount: "__clerk_redirect_count",
  HandshakeNonce: "__clerk_handshake_nonce"
};
var QueryParameters = {
  ClerkSynced: "__clerk_synced",
  SuffixedCookies: "suffixed_cookies",
  ClerkRedirectUrl: "__clerk_redirect_url",
  // use the reference to Cookies to indicate that it's the same value
  DevBrowser: Cookies.DevBrowser,
  Handshake: Cookies.Handshake,
  HandshakeHelp: "__clerk_help",
  LegacyDevBrowser: "__dev_session",
  HandshakeReason: "__clerk_hs_reason",
  HandshakeNonce: Cookies.HandshakeNonce,
  HandshakeFormat: "format",
  Session: "__session"
};
var TokenType = {
  SessionToken: "session_token",
  ApiKey: "api_key",
  M2MToken: "m2m_token",
  OAuthToken: "oauth_token"
};
var SEPARATOR = "/";
var MULTIPLE_SEPARATOR_REGEX = new RegExp("(?<!:)" + SEPARATOR + "{1,}", "g");
var MAX_DECODES = 10;
function isDotSegment(segment) {
  let candidate = segment;
  for (let i = 0; i <= MAX_DECODES; i++) {
    if (candidate.split(/[/\\]/).some((p) => p === "." || p === "..")) {
      return true;
    }
    if (i === MAX_DECODES) {
      throw new Error(`joinPaths: too many layers of encoding in ${segment}`);
    }
    try {
      const next = decodeURIComponent(candidate);
      if (next === candidate) {
        break;
      }
      candidate = next;
    } catch {
      break;
    }
  }
  return false;
}
__name(isDotSegment, "isDotSegment");
function joinPaths(...args) {
  const result = args.filter((p) => p).join(SEPARATOR).replace(MULTIPLE_SEPARATOR_REGEX, SEPARATOR);
  for (const segment of result.split(SEPARATOR)) {
    if (isDotSegment(segment)) {
      throw new Error(`joinPaths: "." and ".." path segments are not allowed (received "${result}")`);
    }
  }
  return result;
}
__name(joinPaths, "joinPaths");
var M2M_RESERVED_JWT_CLAIMS = /* @__PURE__ */ new Set(["iss", "sub", "exp", "nbf", "iat", "jti"]);
function extractCustomClaims(payload) {
  const claims = {};
  for (const key of Object.keys(payload)) {
    if (!M2M_RESERVED_JWT_CLAIMS.has(key)) {
      claims[key] = payload[key];
    }
  }
  return Object.keys(claims).length > 0 ? claims : null;
}
__name(extractCustomClaims, "extractCustomClaims");
var M2MToken = class _M2MToken {
  static {
    __name(this, "_M2MToken");
  }
  constructor(id, subject, scopes, claims, revoked, revocationReason, expired, expiration, createdAt, updatedAt, token) {
    this.id = id;
    this.subject = subject;
    this.scopes = scopes;
    this.claims = claims;
    this.revoked = revoked;
    this.revocationReason = revocationReason;
    this.expired = expired;
    this.expiration = expiration;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.token = token;
  }
  static fromJSON(data) {
    return new _M2MToken(
      data.id,
      data.subject,
      data.scopes,
      data.claims,
      data.revoked,
      data.revocation_reason,
      data.expired,
      data.expiration,
      data.created_at,
      data.updated_at,
      data.token
    );
  }
  static fromJwtPayload(payload, clockSkewInMs = 5e3) {
    return new _M2MToken(
      payload.jti ?? "",
      // jti should always be present in Clerk-issued M2M JWTs
      payload.sub,
      payload.scopes?.split(" ") ?? payload.aud ?? [],
      extractCustomClaims(payload),
      false,
      null,
      payload.exp * 1e3 <= Date.now() - clockSkewInMs,
      payload.exp * 1e3,
      // milliseconds — expiration, converted from JWT exp claim
      payload.iat * 1e3,
      // milliseconds — createdAt, converted from JWT iat claim
      payload.iat * 1e3
      // milliseconds — updatedAt, no JWT equivalent; defaults to iat
    );
  }
};
var JWT_CATEGORY_M2M_TOKEN = "cl_B7d4PD333AAA";
var remoteCaches = /* @__PURE__ */ new Map();
function getRemoteCache(scope) {
  let cache = remoteCaches.get(scope);
  if (!cache) {
    for (const [key, entry] of remoteCaches) {
      if (cacheHasExpired(entry)) {
        remoteCaches.delete(key);
      }
    }
    cache = { keys: {}, lastUpdatedAt: 0 };
    remoteCaches.set(scope, cache);
  }
  return cache;
}
__name(getRemoteCache, "getRemoteCache");
var PEM_HEADER = "-----BEGIN PUBLIC KEY-----";
var PEM_TRAILER = "-----END PUBLIC KEY-----";
var RSA_PREFIX = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA";
var RSA_SUFFIX = "IDAQAB";
function loadClerkJwkFromPem(params) {
  const { kid, pem } = params;
  if (!pem) {
    throw new TokenVerificationError({
      action: TokenVerificationErrorAction.SetClerkJWTKey,
      message: "Missing local JWK.",
      reason: TokenVerificationErrorReason.LocalJWKMissing
    });
  }
  const modulus = pem.replace(/\r\n|\n|\r/g, "").replace(PEM_HEADER, "").replace(PEM_TRAILER, "").replace(RSA_PREFIX, "").replace(RSA_SUFFIX, "").replace(/\+/g, "-").replace(/\//g, "_");
  const jwk = { kid: `local-${kid}`, kty: "RSA", alg: "RS256", n: modulus, e: "AQAB" };
  return jwk;
}
__name(loadClerkJwkFromPem, "loadClerkJwkFromPem");
async function loadClerkJWKFromRemote(params) {
  const { secretKey, apiUrl = API_URL, apiVersion = API_VERSION, kid, skipJwksCache } = params;
  const cache = getRemoteCache(`${apiUrl}|${apiVersion}|${secretKey ?? ""}`);
  if (skipJwksCache || cacheHasExpired(cache) || !cache.keys[kid]) {
    if (!secretKey) {
      throw new TokenVerificationError({
        action: TokenVerificationErrorAction.ContactSupport,
        message: "Failed to load JWKS from Clerk Backend or Frontend API.",
        reason: TokenVerificationErrorReason.RemoteJWKFailedToLoad
      });
    }
    const fetcher = /* @__PURE__ */ __name(() => fetchJWKSFromBAPI(apiUrl, secretKey, apiVersion), "fetcher");
    const { keys } = await retry(fetcher);
    if (!keys || !keys.length) {
      throw new TokenVerificationError({
        action: TokenVerificationErrorAction.ContactSupport,
        message: "The JWKS endpoint did not contain any signing keys. Contact support@clerk.com.",
        reason: TokenVerificationErrorReason.RemoteJWKFailedToLoad
      });
    }
    keys.forEach((key) => {
      cache.keys[key.kid] = key;
    });
    cache.lastUpdatedAt = Date.now();
  }
  const jwk = cache.keys[kid];
  if (!jwk) {
    throw new TokenVerificationError({
      action: `Go to your Dashboard and validate your secret and public keys are correct. ${TokenVerificationErrorAction.ContactSupport} if the issue persists.`,
      message: `Unable to find a signing key in JWKS that matches the kid='${kid}' of the provided session token. Please make sure that the __session cookie or the HTTP authorization header contain a Clerk-generated session JWT.`,
      reason: TokenVerificationErrorReason.JWKKidMismatch
    });
  }
  return jwk;
}
__name(loadClerkJWKFromRemote, "loadClerkJWKFromRemote");
async function fetchJWKSFromBAPI(apiUrl, key, apiVersion) {
  if (!key) {
    throw new TokenVerificationError({
      action: TokenVerificationErrorAction.SetClerkSecretKey,
      message: "Missing Clerk Secret Key or API Key. Go to https://dashboard.clerk.com and get your key for your instance.",
      reason: TokenVerificationErrorReason.RemoteJWKFailedToLoad
    });
  }
  const url = new URL(apiUrl);
  url.pathname = joinPaths(url.pathname, apiVersion, "/jwks");
  const response = await runtime.fetch(url.href, {
    headers: {
      Authorization: `Bearer ${key}`,
      "Clerk-API-Version": SUPPORTED_BAPI_VERSION,
      "Content-Type": "application/json",
      "User-Agent": USER_AGENT
    }
  });
  if (!response.ok) {
    const json = await response.json();
    const invalidSecretKeyError = getErrorObjectByCode(json?.errors, TokenVerificationErrorCode.InvalidSecretKey);
    if (invalidSecretKeyError) {
      const reason = TokenVerificationErrorReason.InvalidSecretKey;
      throw new TokenVerificationError({
        action: TokenVerificationErrorAction.ContactSupport,
        message: invalidSecretKeyError.message,
        reason
      });
    }
    throw new TokenVerificationError({
      action: TokenVerificationErrorAction.ContactSupport,
      message: `Error loading Clerk JWKS from ${url.href} with code=${response.status}`,
      reason: TokenVerificationErrorReason.RemoteJWKFailedToLoad
    });
  }
  return response.json();
}
__name(fetchJWKSFromBAPI, "fetchJWKSFromBAPI");
function cacheHasExpired(cache) {
  const isExpired = Date.now() - cache.lastUpdatedAt >= MAX_CACHE_LAST_UPDATED_AT_SECONDS * 1e3;
  if (isExpired) {
    cache.keys = {};
  }
  return isExpired;
}
__name(cacheHasExpired, "cacheHasExpired");
var getErrorObjectByCode = /* @__PURE__ */ __name((errors, code) => {
  if (!errors) {
    return null;
  }
  return errors.find((err) => err.code === code);
}, "getErrorObjectByCode");
var MACHINE_TOKEN_TYPES = /* @__PURE__ */ new Set([TokenType.ApiKey, TokenType.M2MToken, TokenType.OAuthToken]);
async function resolveKeyAndVerifyJwt(token, kid, options, headerType) {
  try {
    let key;
    if (options.jwtKey) {
      key = loadClerkJwkFromPem({ kid, pem: options.jwtKey });
    } else if (options.secretKey) {
      key = await loadClerkJWKFromRemote({ ...options, kid });
    } else {
      return {
        error: new MachineTokenVerificationError({
          action: TokenVerificationErrorAction.SetClerkJWTKey,
          message: "Failed to resolve JWK during verification.",
          code: MachineTokenVerificationErrorCode.TokenVerificationFailed
        })
      };
    }
    const { data: payload, errors: verifyErrors } = await verifyJwt(token, {
      ...options,
      key,
      ...headerType ? { headerType } : {}
    });
    if (verifyErrors) {
      return {
        error: new MachineTokenVerificationError({
          code: MachineTokenVerificationErrorCode.TokenVerificationFailed,
          message: verifyErrors[0].message
        })
      };
    }
    return { payload };
  } catch (error3) {
    return {
      error: new MachineTokenVerificationError({
        code: MachineTokenVerificationErrorCode.TokenVerificationFailed,
        message: error3.message
      })
    };
  }
}
__name(resolveKeyAndVerifyJwt, "resolveKeyAndVerifyJwt");
async function verifyM2MJwt(token, decoded, options) {
  const cat = decoded.header.cat;
  if (cat !== void 0 && cat !== JWT_CATEGORY_M2M_TOKEN) {
    return {
      data: void 0,
      tokenType: TokenType.M2MToken,
      errors: [
        new MachineTokenVerificationError({
          code: MachineTokenVerificationErrorCode.TokenInvalid,
          message: "Invalid M2M JWT category."
        })
      ]
    };
  }
  const result = await resolveKeyAndVerifyJwt(token, decoded.header.kid, options);
  if ("error" in result) {
    return { data: void 0, tokenType: TokenType.M2MToken, errors: [result.error] };
  }
  return {
    data: M2MToken.fromJwtPayload(result.payload, options.clockSkewInMs),
    tokenType: TokenType.M2MToken,
    errors: void 0
  };
}
__name(verifyM2MJwt, "verifyM2MJwt");
var _verifyOptions;
var _M2MTokenApi_instances;
var createRequestOptions_fn;
var verifyJwtFormat_fn;
_verifyOptions = /* @__PURE__ */ new WeakMap();
_M2MTokenApi_instances = /* @__PURE__ */ new WeakSet();
createRequestOptions_fn = /* @__PURE__ */ __name(function(options, machineSecretKey) {
  if (machineSecretKey) {
    return {
      ...options,
      headerParams: {
        ...options.headerParams,
        Authorization: `Bearer ${machineSecretKey}`
      }
    };
  }
  return options;
}, "createRequestOptions_fn");
verifyJwtFormat_fn = /* @__PURE__ */ __name(async function(token) {
  let decoded;
  try {
    const { data, errors } = decodeJwt(token);
    if (errors) {
      throw errors[0];
    }
    decoded = data;
  } catch (e) {
    throw new MachineTokenVerificationError({
      code: MachineTokenVerificationErrorCode.TokenInvalid,
      message: e.message
    });
  }
  const result = await verifyM2MJwt(token, decoded, __privateGet(this, _verifyOptions));
  if (result.errors) {
    throw result.errors[0];
  }
  return result.data;
}, "verifyJwtFormat_fn");
var PlainObjectConstructor = {}.constructor;
var import_cookie = __toESM(require_dist());
async function verifyToken(token, options) {
  const { data: decodedResult, errors } = decodeJwt(token);
  if (errors) {
    return { errors };
  }
  const { header } = decodedResult;
  const { kid } = header;
  if (header.cat === JWT_CATEGORY_M2M_TOKEN) {
    return {
      errors: [
        new TokenVerificationError({
          action: TokenVerificationErrorAction.EnsureClerkJWT,
          reason: TokenVerificationErrorReason.TokenInvalid,
          message: "Invalid session token category."
        })
      ]
    };
  }
  try {
    let key;
    if (options.jwtKey) {
      key = loadClerkJwkFromPem({ kid, pem: options.jwtKey });
    } else if (options.secretKey) {
      key = await loadClerkJWKFromRemote({ ...options, kid });
    } else {
      return {
        errors: [
          new TokenVerificationError({
            action: TokenVerificationErrorAction.SetClerkJWTKey,
            message: "Failed to resolve JWK during verification.",
            reason: TokenVerificationErrorReason.JWKFailedToResolve
          })
        ]
      };
    }
    return await verifyJwt(token, { ...options, key });
  } catch (error3) {
    return { errors: [error3] };
  }
}
__name(verifyToken, "verifyToken");

// ../node_modules/@clerk/backend/dist/chunk-P263NW7Z.mjs
function withLegacyReturn(cb) {
  return async (...args) => {
    const { data, errors } = await cb(...args);
    if (errors) {
      throw errors[0];
    }
    return data;
  };
}
__name(withLegacyReturn, "withLegacyReturn");

// ../node_modules/@clerk/backend/dist/index.mjs
var verifyToken2 = withLegacyReturn(verifyToken);

// api/entities/[id].js
async function checkAuth(request, env2) {
  const auth = request.headers.get("Authorization");
  if (!auth || !auth.startsWith("Bearer ")) return false;
  const token = auth.replace("Bearer ", "").trim();
  if (env2.ADMIN_TOKEN && token === env2.ADMIN_TOKEN) return true;
  if (env2.CLERK_SECRET_KEY) {
    try {
      const verified = await verifyToken2(token, { secretKey: env2.CLERK_SECRET_KEY });
      if (verified && verified.sub) return true;
    } catch (e) {
      console.error("Clerk Token Verification Failed:", e);
    }
  }
  return false;
}
__name(checkAuth, "checkAuth");
async function onRequestDelete2(context2) {
  const { request, params, env: env2 } = context2;
  if (!await checkAuth(request, env2)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  const id = params.id;
  try {
    await env2.SURVEY_DB.prepare("DELETE FROM entities WHERE id = ?").bind(id).run();
    return new Response(JSON.stringify({ success: true }));
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
__name(onRequestDelete2, "onRequestDelete");

// api/ingestion/[id].js
async function onRequestPut2(context2) {
  const { request, env: env2, params } = context2;
  const id = params.id;
  try {
    const { action } = await request.json();
    if (action === "reject") {
      await env2.SURVEY_DB.prepare("UPDATE ingestion_queue SET status = 'rejected' WHERE id = ?").bind(id).run();
      return new Response(JSON.stringify({ success: true, status: "rejected" }), { headers: { "Content-Type": "application/json" } });
    }
    if (action === "approve") {
      const item = await env2.SURVEY_DB.prepare("SELECT * FROM ingestion_queue WHERE id = ?").bind(id).first();
      if (!item) return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
      const docId = `news-${Date.now()}-${Math.floor(Math.random() * 1e3)}`;
      const metadata_json = JSON.stringify({
        academic_title: item.title,
        abstract: item.abstract,
        source_publication: item.source,
        date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
      });
      await env2.SURVEY_DB.prepare(`
        INSERT INTO archive_documents (
          id, title, source_collection, url, type, status, metadata_json
        ) VALUES (?, ?, ?, ?, ?, 'indexed', ?)
      `).bind(
        docId,
        item.title,
        "Deep Research Monitor",
        item.url,
        "external_news",
        metadata_json
      ).run();
      const aiBinding = env2.AI || env2.Workers_AI;
      if (aiBinding && env2.ARCHIVE_INDEX) {
        try {
          const vectorData = await aiBinding.run("@cf/baai/bge-small-en-v1.5", { text: [item.abstract] });
          if (vectorData && vectorData.data && vectorData.data[0]) {
            const vector = vectorData.data[0];
            await env2.ARCHIVE_INDEX.upsert([{
              id: docId,
              values: vector,
              metadata: { source: item.url, text: item.abstract }
            }]);
          }
        } catch (e) {
          console.error("Vectorization failed", e);
        }
      }
      await env2.SURVEY_DB.prepare("UPDATE ingestion_queue SET status = 'approved' WHERE id = ?").bind(id).run();
      return new Response(JSON.stringify({ success: true, status: "approved" }), { headers: { "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400 });
  } catch (error3) {
    return new Response(JSON.stringify({ error: error3.message }), { status: 500 });
  }
}
__name(onRequestPut2, "onRequestPut");

// api/nominations/[id].js
async function onRequestPut3(context2) {
  const { request, env: env2, params } = context2;
  const id = params.id;
  try {
    const { action } = await request.json();
    if (action === "reject") {
      await env2.SURVEY_DB.prepare("UPDATE entity_nominations SET status = 'rejected' WHERE id = ?").bind(id).run();
      return new Response(JSON.stringify({ success: true, status: "rejected" }), { headers: { "Content-Type": "application/json" } });
    }
    if (action === "approve") {
      const nom = await env2.SURVEY_DB.prepare("SELECT * FROM entity_nominations WHERE id = ?").bind(id).first();
      if (!nom) return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
      const newEntityId = `entity-${Date.now()}`;
      await env2.SURVEY_DB.prepare(
        "INSERT INTO entities (id, type, name, description, url) VALUES (?, ?, ?, ?, ?)"
      ).bind(
        newEntityId,
        nom.type,
        nom.name,
        nom.description,
        nom.url
      ).run();
      await env2.SURVEY_DB.prepare("UPDATE entity_nominations SET status = 'approved' WHERE id = ?").bind(id).run();
      return new Response(JSON.stringify({ success: true, status: "approved" }), { headers: { "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400 });
  } catch (error3) {
    return new Response(JSON.stringify({ error: error3.message }), { status: 500 });
  }
}
__name(onRequestPut3, "onRequestPut");

// api/translations/[docId].js
async function onRequestGet5(context2) {
  const { params, env: env2 } = context2;
  const docId = params.docId;
  if (!docId) {
    return new Response(JSON.stringify({ error: "Missing docId" }), { status: 400 });
  }
  try {
    const { results } = await env2.SURVEY_DB.prepare(
      `SELECT language, translated_text FROM document_translations WHERE document_id = ?`
    ).bind(docId).all();
    return new Response(JSON.stringify({ translations: results }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
__name(onRequestGet5, "onRequestGet");

// api/assets/[[path]].js
async function onRequestGet6(context2) {
  const { env: env2, params } = context2;
  const pathArray = params.path || [];
  let fullPath = pathArray.map((p) => decodeURIComponent(p)).join("/");
  if (!fullPath.startsWith("documents/") && !fullPath.startsWith("thumbnails/")) {
    fullPath = `documents/${fullPath}`;
  }
  if (!env2.ARCHIVE_BUCKET) {
    return new Response("R2 bucket binding (ARCHIVE_BUCKET) not found", { status: 500 });
  }
  try {
    let object = await env2.ARCHIVE_BUCKET.get(fullPath);
    if (!object && fullPath.startsWith("documents/")) {
      object = await env2.ARCHIVE_BUCKET.get(`documents/${fullPath}`);
    }
    if (!object) {
      return new Response(`Document not found in the archive: ${fullPath}`, { status: 404 });
    }
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    return new Response(object.body, { headers });
  } catch (error3) {
    return new Response(`Error retrieving asset: ${error3.message}`, { status: 500 });
  }
}
__name(onRequestGet6, "onRequestGet");

// api/chat.js
var DB_SCHEMA = `
CREATE TABLE respondents (id INTEGER PRIMARY KEY, submitted_at TEXT, pathway TEXT, consent INTEGER);
CREATE TABLE demographics (respondent_id INTEGER PRIMARY KEY, country_born TEXT, country_now TEXT, us_state_born TEXT, us_state_now TEXT, race_ethnicity TEXT, age_bracket TEXT, generation TEXT, education TEXT, politics TEXT, sexuality TEXT, gender TEXT, sex_assigned TEXT);
CREATE TABLE religion (respondent_id INTEGER PRIMARY KEY, primary_tradition TEXT);
CREATE TABLE responses (respondent_id INTEGER, question_id TEXT, value_text TEXT, value_num REAL);
CREATE TABLE questions (id TEXT PRIMARY KEY, section TEXT, prompt TEXT, type TEXT);
`;
var rateLimitMap = /* @__PURE__ */ new Map();
var RATE_LIMIT_MS = 5e3;
async function onRequestPost7(context2) {
  const { request, env: env2 } = context2;
  try {
    const ip = request.headers.get("cf-connecting-ip") || "unknown";
    const now = Date.now();
    if (ip !== "unknown") {
      const lastRequest = rateLimitMap.get(ip);
      if (lastRequest && now - lastRequest < RATE_LIMIT_MS) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait a few seconds before asking another question." }), {
          status: 429,
          headers: { "Content-Type": "application/json", "Retry-After": Math.ceil((RATE_LIMIT_MS - (now - lastRequest)) / 1e3).toString() }
        });
      }
      rateLimitMap.set(ip, now);
      if (rateLimitMap.size > 1e3) {
        for (const [key, timestamp] of rateLimitMap.entries()) {
          if (now - timestamp > RATE_LIMIT_MS) rateLimitMap.delete(key);
        }
      }
    }
    const { query } = await request.json();
    if (!query) return new Response(JSON.stringify({ error: "Missing query" }), { status: 400 });
    const aiBinding = env2.AI || env2.Workers_AI;
    if (!aiBinding) throw new Error("AI binding is missing");
    const intentPrompt = `Classify the user's query into one of two categories:
ANALYTICAL: Strictly asks for statistics, numbers, counts, averages, or structured demographic data from a database. (e.g. "How many respondents are from CA?", "What percentage are intact?")
QUALITATIVE: Asks for themes, beliefs, historical documents, feelings, narratives, or is a conversational follow-up. (e.g. "Who is the author?", "Is there a specific person?", "How do men feel?")
Reply ONLY with the exact word "ANALYTICAL" or "QUALITATIVE".`;
    const intentResponse = await aiBinding.run("@cf/meta/llama-3.1-8b-instruct-fp8", {
      messages: [{ role: "system", content: intentPrompt }, { role: "user", content: query }]
    });
    let intent = intentResponse.response.trim().toUpperCase();
    let finalAnswer = "";
    let citations = [];
    let fallbackToRag = false;
    if (intent.includes("ANALYTICAL")) {
      try {
        if (!env2.SURVEY_DB) throw new Error("SURVEY_DB binding is missing");
        const questionsResult = await env2.SURVEY_DB.prepare("SELECT id, prompt FROM questions").all();
        const questionsList = questionsResult.results.map((q) => `ID: ${q.id} | Prompt: ${q.prompt}`).join("\n");
        const sqlPrompt = `You are a SQLite expert. Write a SQL query to answer the user's question based on this schema:
${DB_SCHEMA}

Available Survey Questions:
${questionsList}

Return ONLY the raw SQL query. Do not wrap in markdown or explain. Use standard SQLite syntax.`;
        const sqlResponse = await aiBinding.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
          messages: [{ role: "system", content: sqlPrompt }, { role: "user", content: query }]
        });
        let rawSql = sqlResponse.response.trim();
        if (rawSql.startsWith("```sql")) rawSql = rawSql.substring(6);
        if (rawSql.startsWith("```")) rawSql = rawSql.substring(3);
        if (rawSql.endsWith("```")) rawSql = rawSql.substring(0, rawSql.length - 3);
        rawSql = rawSql.trim();
        if (!/^\s*SELECT\b/i.test(rawSql)) {
          throw new Error("Only SELECT queries are permitted.");
        }
        const dbResult = await env2.SURVEY_DB.prepare(rawSql).all();
        const resultString = JSON.stringify(dbResult.results);
        const synthesisPrompt = `You are a data analyst. Answer the user's question using the provided database results.
Data Results: ${resultString}
Keep it factual and concise.`;
        const synthResponse = await aiBinding.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
          messages: [{ role: "system", content: synthesisPrompt }, { role: "user", content: query }],
          max_tokens: 1024
        });
        finalAnswer = synthResponse.response;
        citations.push(`Query Execution: ${rawSql}`);
      } catch (dbError) {
        console.warn("Analytical query failed, falling back to Qualitative RAG:", dbError.message);
        fallbackToRag = true;
      }
    }
    if (!intent.includes("ANALYTICAL") || fallbackToRag) {
      if (!env2.ARCHIVE_INDEX) throw new Error("ARCHIVE_INDEX binding is missing");
      const queryEmbedding = await aiBinding.run("@cf/baai/bge-small-en-v1.5", { text: [query] });
      const vector = queryEmbedding.data[0];
      const matches = await env2.ARCHIVE_INDEX.query(vector, { topK: 3, returnMetadata: true });
      let contextText = "";
      let citationMap = /* @__PURE__ */ new Map();
      if (matches.matches && matches.matches.length > 0) {
        matches.matches.forEach((match3, index) => {
          if (match3.metadata && match3.metadata.text) {
            const docId = match3.metadata.doc_id || match3.id.split("-")[0];
            const snippet = match3.metadata.text.length > 1e3 ? match3.metadata.text.substring(0, 1e3) + "..." : match3.metadata.text;
            contextText += `
--- Document ID: ${docId} (Source: ${match3.metadata.source}) ---
${snippet}
`;
            const key = match3.metadata.source + docId;
            if (!citationMap.has(key)) {
              citationMap.set(key, {
                source: match3.metadata.source,
                doc_id: docId === "doc" ? null : docId,
                // ignore 'doc' fallback from generic ingestion
                snippets: []
              });
            }
            citationMap.get(key).snippets.push(match3.metadata.text);
          }
        });
      }
      citations = Array.from(citationMap.values());
      let docIds = citations.map((c) => c.doc_id).filter(Boolean);
      if (docIds.length > 0 && env2.SURVEY_DB) {
        try {
          const placeholders = docIds.map(() => "?").join(",");
          const dbDocs = await env2.SURVEY_DB.prepare(`SELECT id, media_urls, url, type FROM archive_documents WHERE id IN (${placeholders})`).bind(...docIds).all();
          if (dbDocs && dbDocs.results) {
            dbDocs.results.forEach((row) => {
              let image = null;
              if (row.media_urls) {
                try {
                  const arr = JSON.parse(row.media_urls);
                  if (arr.length > 0) image = arr[0];
                } catch (e) {
                }
              }
              if (!image && row.type === "image" && row.url) {
                image = row.url;
              }
              if (image) {
                contextText += `
[System Note: Document ID ${row.id} has an associated image. URL: ${image}]
`;
              }
            });
          }
        } catch (e) {
          console.warn("Failed to fetch media urls", e);
        }
      }
      let groundTruthOverride = "";
      if (env2.SURVEY_DB) {
        try {
          const { results } = await env2.SURVEY_DB.prepare("SELECT * FROM ground_truth").all();
          if (results && results.length > 0) {
            const lowerQuery = query.toLowerCase();
            const matchedTruths = [];
            for (const row of results) {
              const keywords = row.keywords.split(",").map((k) => k.trim().toLowerCase());
              if (keywords.some((k) => lowerQuery.includes(k))) {
                matchedTruths.push(row.statement);
              }
            }
            if (matchedTruths.length > 0) {
              groundTruthOverride = `

CRITICAL OVERRIDE: The following facts are Ground Truth and supersede all archival documents. You must center your response around these facts and treat them as the absolute current truth:
${matchedTruths.join("\n")}

`;
            }
          }
        } catch (e) {
          console.warn("Could not query ground_truth table:", e.message);
        }
      }
      const systemPrompt = `You are Glenda, the chief archivist and senior research assistant for a comprehensive archive of Intactivism (the movement for genital autonomy). 
Your goal is to synthesize the provided archival documents into a deeply insightful, nuanced, and beautifully written encyclopedic response.
CRITICAL RULES:
1. NEVER use the words "Snippet", "Extract", or refer to the "provided context" or "provided text". Weave the information organically into a cohesive, scholarly narrative as if you possess innate knowledge.
2. If the documents contain powerful phrasing, integrate those exact quotes gracefully.
3. If the documents do not contain enough information, acknowledge the limits of the archive but synthesize whatever is available gracefully.
4. Do not hallucinate external facts; rely entirely on the spirit and text of the provided documents.
5. Whenever you mention a specific person, organization, or key entity, include an inline markdown hyperlink pointing to their entity page using the format: [Entity Name](/to/EntityName) (e.g. [Tim Hammond](/to/Tim%20Hammond)).
6. Whenever you mention a specific document, film, or source from the archives, include an inline markdown hyperlink pointing to its library page using the provided DocID from the documents: [Source Name](/library/DocID) (e.g. [Whose Body, Whose Rights?](/library/umass-ms1205-1234)).
7. Frame your responses in the context of Intactivism as a broad human rights movement, rather than in relation to any specific project.
8. If a Document ID has an associated image URL provided in a System Note, you MUST embed it inline when discussing that document using Markdown image syntax: ![Alt Text describing the image](URL).${groundTruthOverride}

ARCHIVAL DOCUMENTS:
${contextText || "No relevant documents found in the archive for this query."}`;
      const response = await aiBinding.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: query }],
        max_tokens: 1024
      });
      finalAnswer = response.response;
    }
    return new Response(JSON.stringify({
      response: finalAnswer,
      citations,
      intent_parsed: intent.includes("ANALYTICAL") ? "ANALYTICAL" : "QUALITATIVE"
    }), { headers: { "Content-Type": "application/json" } });
  } catch (error3) {
    console.error("Chat Error:", error3);
    return new Response(JSON.stringify({ error: error3.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
__name(onRequestPost7, "onRequestPost");

// api/cms/index.js
async function onRequestGet7(context2) {
  const { request, env: env2 } = context2;
  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const type = url.searchParams.get("type");
  const limit = parseInt(url.searchParams.get("limit")) || 100;
  const offset = parseInt(url.searchParams.get("offset")) || 0;
  try {
    let query = "SELECT * FROM archive_documents ";
    let countQuery = "SELECT count(*) as total FROM archive_documents ";
    let params = [];
    if (status) {
      query += "WHERE status = ? ";
      countQuery += "WHERE status = ? ";
      params = [status];
    } else if (type) {
      query += "WHERE type = ? ";
      countQuery += "WHERE type = ? ";
      params = [type];
    }
    query += `ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
    const { results } = await env2.SURVEY_DB.prepare(query).bind(...params).all();
    const countResult = await env2.SURVEY_DB.prepare(countQuery).bind(...params).first();
    return new Response(JSON.stringify({
      data: results,
      total: countResult.total
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error3) {
    return new Response(JSON.stringify({ error: error3.message }), { status: 500 });
  }
}
__name(onRequestGet7, "onRequestGet");
async function onRequestPost8(context2) {
  const { request, env: env2 } = context2;
  try {
    const data = await request.json();
    const id = crypto.randomUUID().split("-")[0];
    const stmt = env2.SURVEY_DB.prepare(`
      INSERT INTO archive_documents (
        id, title, source_collection, url, type, status, media_urls, content, metadata_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      data.title || "Untitled",
      data.source_collection || "Uncategorized",
      data.url || null,
      data.type || "web_page",
      data.status || "pending",
      data.media_urls ? JSON.stringify(data.media_urls) : null,
      data.content || null,
      data.metadata ? JSON.stringify(data.metadata) : null
    );
    await stmt.run();
    if ((data.type === "article" || data.type === "recap") && data.content && env2.ARCHIVE_INDEX) {
      try {
        const aiBinding = env2.AI || env2.Workers_AI;
        const vectorData = await aiBinding.run("@cf/baai/bge-small-en-v1.5", { text: [data.content.slice(0, 1e3)] });
        if (vectorData && vectorData.data && vectorData.data[0]) {
          const vector = vectorData.data[0];
          await env2.ARCHIVE_INDEX.upsert([{
            id,
            values: vector,
            metadata: { source: "CMS Authoring Studio", text: data.content.slice(0, 1e3), doc_id: id }
          }]);
        }
      } catch (e) {
        console.error("Vectorization failed during CMS POST", e);
      }
    }
    return new Response(JSON.stringify({ success: true, id }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error3) {
    return new Response(JSON.stringify({ error: error3.message }), { status: 500 });
  }
}
__name(onRequestPost8, "onRequestPost");

// api/collections.js
async function onRequestGet8(context2) {
  const { env: env2 } = context2;
  try {
    const { results } = await env2.SURVEY_DB.prepare("SELECT * FROM archive_collections ORDER BY title ASC").all();
    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error3) {
    return new Response(JSON.stringify({ error: error3.message }), { status: 500 });
  }
}
__name(onRequestGet8, "onRequestGet");

// api/comments.js
async function onRequestGet9(context2) {
  const { request, env: env2 } = context2;
  if (!env2.SURVEY_DB) return new Response("Missing DB", { status: 500 });
  await env2.SURVEY_DB.prepare(`
    CREATE TABLE IF NOT EXISTS item_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      doc_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      user_name TEXT,
      comment TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `).run();
  const url = new URL(request.url);
  const doc_id = url.searchParams.get("doc_id");
  const all = url.searchParams.get("all") === "true";
  let results;
  if (all) {
    const query = await env2.SURVEY_DB.prepare("SELECT * FROM item_comments ORDER BY created_at DESC").all();
    results = query.results;
  } else if (doc_id) {
    const query = await env2.SURVEY_DB.prepare("SELECT * FROM item_comments WHERE doc_id = ? AND status = 'approved' ORDER BY created_at ASC").bind(doc_id).all();
    results = query.results;
  } else {
    return new Response("Missing doc_id or all flag", { status: 400 });
  }
  return new Response(JSON.stringify(results || []), { headers: { "Content-Type": "application/json" } });
}
__name(onRequestGet9, "onRequestGet");
async function onRequestPost9(context2) {
  const { request, env: env2 } = context2;
  if (!env2.SURVEY_DB) return new Response("Missing DB", { status: 500 });
  await env2.SURVEY_DB.prepare(`
    CREATE TABLE IF NOT EXISTS item_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      doc_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      user_name TEXT,
      comment TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `).run();
  const body = await request.json();
  const { doc_id, user_id, user_name, comment } = body;
  if (!doc_id || !user_id || !comment) {
    return new Response("Missing required fields", { status: 400 });
  }
  if (comment.length > 2e3) {
    return new Response(JSON.stringify({ error: "Comment exceeds 2000 characters limit." }), { status: 400, headers: { "Content-Type": "application/json" } });
  }
  const recent = await env2.SURVEY_DB.prepare(
    "SELECT COUNT(*) as cnt FROM item_comments WHERE user_id = ? AND created_at > datetime('now', '-1 hour')"
  ).bind(user_id).first();
  if (recent && recent.cnt >= 5) {
    return new Response(JSON.stringify({ error: "Rate limit exceeded. Maximum 5 comments per hour allowed." }), { status: 429, headers: { "Content-Type": "application/json" } });
  }
  await env2.SURVEY_DB.prepare(
    "INSERT INTO item_comments (doc_id, user_id, user_name, comment, status) VALUES (?, ?, ?, ?, 'pending')"
  ).bind(doc_id, user_id, user_name || "Anonymous", comment).run();
  return new Response(JSON.stringify({ success: true, message: "Comment submitted for moderation." }), { headers: { "Content-Type": "application/json" } });
}
__name(onRequestPost9, "onRequestPost");
async function onRequestPut4(context2) {
  const { request, env: env2 } = context2;
  if (!env2.SURVEY_DB) return new Response("Missing DB", { status: 500 });
  const body = await request.json();
  const { id, status } = body;
  if (!id || !status) return new Response("Missing id or status", { status: 400 });
  await env2.SURVEY_DB.prepare(
    "UPDATE item_comments SET status = ? WHERE id = ?"
  ).bind(status, id).run();
  return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
}
__name(onRequestPut4, "onRequestPut");

// api/embed_text.js
async function onRequestPost10(context2) {
  const { request, env: env2 } = context2;
  try {
    const body = await request.json();
    const { text, metadata } = body;
    if (!text) {
      return new Response("Missing text", { status: 400 });
    }
    const chunks = text.match(/[^]{1,1000}/g) || [];
    console.log(`Generating embeddings for ${chunks.length} chunks...`);
    const aiBinding = env2.AI || env2.Workers_AI;
    const embeddingResponse = await aiBinding.run("@cf/baai/bge-small-en-v1.5", { text: chunks });
    const vectors = embeddingResponse.data.map((vec, i) => ({
      id: `${metadata.id || "doc"}-${Date.now()}-chunk-${i}`,
      values: vec,
      metadata: { source: metadata.source || "unknown", text: chunks[i], doc_id: metadata.id || null, ...metadata }
    }));
    console.log(`Storing ${vectors.length} vectors in Vectorize...`);
    if (vectors.length > 0) {
      await env2.ARCHIVE_INDEX.insert(vectors);
    }
    return new Response(JSON.stringify({
      success: true,
      message: `Successfully embedded and stored ${vectors.length} chunks`,
      chunks_vectorized: vectors.length
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error3) {
    return new Response(JSON.stringify({ error: error3.message }), { status: 500 });
  }
}
__name(onRequestPost10, "onRequestPost");

// api/entities/index.js
async function onRequestGet10(context2) {
  const { env: env2, request } = context2;
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit")) || 0;
    const offset = parseInt(url.searchParams.get("offset")) || 0;
    const search = url.searchParams.get("search") || "";
    const fields = url.searchParams.get("fields") || "full";
    const type = url.searchParams.get("type") || "";
    let whereClause = "";
    const bindings = [];
    if (search) {
      whereClause = "WHERE name LIKE ?";
      bindings.push(`%${search}%`);
      if (type) {
        whereClause += " AND type = ?";
        bindings.push(type);
      }
    } else if (type) {
      whereClause = "WHERE type = ?";
      bindings.push(type);
    }
    const countStmt = env2.SURVEY_DB.prepare(`SELECT COUNT(*) as total FROM entities ${whereClause}`);
    const countResult = await (bindings.length ? countStmt.bind(...bindings) : countStmt).first();
    const total = countResult?.total || 0;
    const columns = fields === "slim" ? "id, type, name, tagline, stance, featured, image_url" : "*";
    let query = `SELECT ${columns} FROM entities ${whereClause} ORDER BY name`;
    if (limit > 0) {
      query += ` LIMIT ? OFFSET ?`;
      bindings.push(limit, offset);
    }
    const stmt = env2.SURVEY_DB.prepare(query);
    const result = await (bindings.length ? stmt.bind(...bindings) : stmt).all();
    if (!limit && !url.searchParams.has("total")) {
      return new Response(JSON.stringify(result.results), {
        headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=300" }
      });
    }
    return new Response(JSON.stringify({
      data: result.results,
      total,
      limit,
      offset
    }), {
      headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=300" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
__name(onRequestGet10, "onRequestGet");
async function checkAuth2(request, env2) {
  const auth = request.headers.get("Authorization");
  if (!auth || !auth.startsWith("Bearer ")) return false;
  const token = auth.replace("Bearer ", "").trim();
  if (env2.ADMIN_TOKEN && token === env2.ADMIN_TOKEN) return true;
  if (env2.CLERK_SECRET_KEY) {
    try {
      const verified = await verifyToken2(token, { secretKey: env2.CLERK_SECRET_KEY });
      if (verified && verified.sub) {
        return true;
      }
    } catch (e) {
      console.error("Clerk Token Verification Failed:", e);
    }
  }
  return false;
}
__name(checkAuth2, "checkAuth");
async function onRequestPost11(context2) {
  const { request, env: env2 } = context2;
  if (!await checkAuth2(request, env2)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  try {
    const data = await request.json();
    const id = `entity-${Date.now()}`;
    await env2.SURVEY_DB.prepare(
      `INSERT INTO entities (id, type, name, project_context, universal_summary, metadata, wikipedia_url, image_url, stance, tagline, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(id, data.type, data.name, data.project_context || "", data.universal_summary || "", data.metadata || "", data.wikipedia_url || "", data.image_url || "", data.stance || "", data.tagline || "", data.tags || "").run();
    return new Response(JSON.stringify({ success: true, id }), { headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
__name(onRequestPost11, "onRequestPost");
async function onRequestPut5(context2) {
  const { request, env: env2 } = context2;
  if (!await checkAuth2(request, env2)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  try {
    const data = await request.json();
    if (!data.id) throw new Error("Missing entity ID for update");
    const updates = [];
    const bindings = [];
    if (data.project_context !== void 0) {
      updates.push("project_context = ?");
      bindings.push(data.project_context || "");
    }
    if (data.universal_summary !== void 0) {
      updates.push("universal_summary = ?");
      bindings.push(data.universal_summary || "");
    }
    if (data.metadata !== void 0) {
      updates.push("metadata = ?");
      bindings.push(data.metadata || "");
    }
    if (data.wikipedia_url !== void 0) {
      updates.push("wikipedia_url = ?");
      bindings.push(data.wikipedia_url || "");
    }
    if (data.tags !== void 0) {
      updates.push("tags = ?");
      bindings.push(data.tags || "");
    }
    if (data.image_url !== void 0) {
      updates.push("image_url = ?");
      bindings.push(data.image_url || "");
    }
    if (data.stance !== void 0) {
      updates.push("stance = ?");
      bindings.push(data.stance);
    }
    if (data.tagline !== void 0) {
      updates.push("tagline = ?");
      bindings.push(data.tagline || "");
    }
    if (data.featured !== void 0) {
      updates.push("featured = ?");
      bindings.push(data.featured ? 1 : 0);
    }
    if (data.see_also_json !== void 0) {
      updates.push("see_also_json = ?");
      bindings.push(data.see_also_json || "");
    }
    if (data.url !== void 0) {
      updates.push("url = ?");
      bindings.push(data.url || "");
    }
    if (updates.length === 0) throw new Error("No fields to update");
    bindings.push(data.id);
    await env2.SURVEY_DB.prepare(
      `UPDATE entities SET ${updates.join(", ")} WHERE id = ?`
    ).bind(...bindings).run();
    return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
__name(onRequestPut5, "onRequestPut");

// api/fix_dates.js
async function onRequestGet11(context2) {
  const { env: env2 } = context2;
  try {
    const { results } = await env2.SURVEY_DB.prepare("SELECT id, title, metadata_json FROM archive_documents").all();
    let updatedCount = 0;
    for (const doc of results) {
      if (doc.metadata_json) {
        try {
          const meta = JSON.parse(doc.metadata_json);
          let pub_date = meta.date || meta.publication_date || "Unknown";
          if (pub_date === "Unknown" || !pub_date || pub_date === "--") {
            const match3 = doc.title.match(/(?:19|20)\d{2}(?:-\d{2}-\d{2})?/);
            if (match3) {
              meta.date = match3[0];
              meta.publication_date = match3[0];
              const updatedMetaJson = JSON.stringify(meta);
              await env2.SURVEY_DB.prepare(
                "UPDATE archive_documents SET metadata_json = ? WHERE id = ?"
              ).bind(updatedMetaJson, doc.id).run();
              updatedCount++;
            }
          }
        } catch (e) {
        }
      }
    }
    return new Response(JSON.stringify({ success: true, updatedCount }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error3) {
    return new Response(JSON.stringify({ error: error3.message }), { status: 500 });
  }
}
__name(onRequestGet11, "onRequestGet");

// api/ground-truth.js
async function onRequestGet12(context2) {
  const { env: env2 } = context2;
  if (!env2.SURVEY_DB) return new Response("Missing SURVEY_DB binding", { status: 500 });
  await env2.SURVEY_DB.prepare(`
    CREATE TABLE IF NOT EXISTS ground_truth (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      keywords TEXT NOT NULL,
      statement TEXT NOT NULL
    );
  `).run();
  const { results } = await env2.SURVEY_DB.prepare("SELECT * FROM ground_truth ORDER BY id DESC").all();
  return new Response(JSON.stringify(results || []), { headers: { "Content-Type": "application/json" } });
}
__name(onRequestGet12, "onRequestGet");
async function onRequestPost12(context2) {
  const { request, env: env2 } = context2;
  if (!env2.SURVEY_DB) return new Response("Missing SURVEY_DB binding", { status: 500 });
  await env2.SURVEY_DB.prepare(`
    CREATE TABLE IF NOT EXISTS ground_truth (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      keywords TEXT NOT NULL,
      statement TEXT NOT NULL
    );
  `).run();
  const body = await request.json();
  if (body.action === "delete") {
    await env2.SURVEY_DB.prepare("DELETE FROM ground_truth WHERE id = ?").bind(body.id).run();
    return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
  }
  const { keywords, statement } = body;
  await env2.SURVEY_DB.prepare("INSERT INTO ground_truth (keywords, statement) VALUES (?, ?)").bind(keywords, statement).run();
  return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
}
__name(onRequestPost12, "onRequestPost");

// api/ingest.js
async function onRequestPost13(context2) {
  const { request, env: env2 } = context2;
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const metadataStr = formData.get("metadata");
    if (!file) {
      return new Response("Missing file", { status: 400 });
    }
    const metadata = metadataStr ? JSON.parse(metadataStr) : {};
    const fileName = file.name || `doc_${Date.now()}.pdf`;
    console.log(`Uploading ${fileName} to R2...`);
    await env2.ARCHIVE_BUCKET.put(fileName, file.stream(), {
      httpMetadata: { contentType: file.type || "application/pdf" }
    });
    const r2Url = `/api/assets/${fileName}`;
    console.log(`Sending to Gemini 1.5 Flash for OCR...`);
    const apiKey = env2.GEMINI_API_KEY;
    let extractedText = "";
    if (!apiKey) {
      console.warn("No GEMINI_API_KEY found, skipping OCR.");
      extractedText = `Mock extracted text from Gemini for ${fileName}...`;
    } else {
      try {
        console.log("Uploading file to Gemini File API...");
        const uploadResponse = await fetch(`https://generativelanguage.googleapis.com/upload/v1beta/files?uploadType=media&key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": file.type || "application/pdf" },
          body: file
          // passing the File object / stream directly
        });
        if (!uploadResponse.ok) {
          const errText = await uploadResponse.text();
          throw new Error(`Gemini Upload failed: ${errText}`);
        }
        const uploadData = await uploadResponse.json();
        const fileUri = uploadData.file.uri;
        console.log(`Uploaded to Gemini File API, URI: ${fileUri}`);
        const prompt = "You are an expert archivist. Extract all text from this document. Output strict Markdown format. Use proper headers (##), bulleted lists, and format any tabular data as Markdown tables. Preserve all information, but format it cleanly in Markdown. Do not include any conversational filler.";
        const generateResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: prompt },
                { fileData: { mimeType: file.type || "application/pdf", fileUri } }
              ]
            }]
          })
        });
        if (!generateResponse.ok) {
          const errText = await generateResponse.text();
          throw new Error(`Gemini generateContent failed: ${errText}`);
        }
        const generateData = await generateResponse.json();
        extractedText = generateData.candidates?.[0]?.content?.parts?.[0]?.text || "";
        console.log(`Successfully extracted ${extractedText.length} characters of text via Gemini.`);
      } catch (geminiError) {
        console.error("Gemini API Error:", geminiError);
        let modelsList = "Could not fetch models";
        try {
          const mRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
          const mData = await mRes.json();
          modelsList = mData.models ? mData.models.map((m) => m.name).join(", ") : JSON.stringify(mData);
        } catch (e) {
        }
        return new Response(JSON.stringify({ error: `Gemini OCR Failed: ${geminiError.message}. Available models: ${modelsList}` }), { status: 500 });
      }
    }
    console.log(`Chunking text...`);
    const chunks = extractedText.match(/[^]{1,1000}/g) || [];
    console.log(`Generating embeddings...`);
    const aiBinding = env2.AI || env2.Workers_AI;
    const embeddingResponse = await aiBinding.run("@cf/baai/bge-small-en-v1.5", { text: chunks });
    const docId = crypto.randomUUID().split("-")[0];
    const vectors = embeddingResponse.data.map((vec, i) => ({
      id: `${docId}-chunk-${i}`,
      values: vec,
      metadata: { source: fileName, text: chunks[i], doc_id: docId, ...metadata }
    }));
    console.log(`Storing ${vectors.length} vectors in Vectorize...`);
    if (vectors.length > 0) {
      await env2.ARCHIVE_INDEX.insert(vectors);
      console.log(`Logging to CMS database...`);
      if (env2.SURVEY_DB) {
        await env2.SURVEY_DB.prepare(`
          INSERT INTO archive_documents (id, title, source_collection, url, type, status, chunks_vectorized)
          VALUES (?, ?, ?, ?, ?, 'ingested', ?)
        `).bind(
          docId,
          metadata.title || fileName,
          metadata.source_collection || "Manual Upload",
          r2Url,
          "pdf",
          vectors.length
        ).run();
      }
    }
    return new Response(JSON.stringify({
      success: true,
      message: `Successfully ingested ${fileName}`,
      r2_url: r2Url,
      chunks_vectorized: vectors.length
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error3) {
    return new Response(JSON.stringify({ error: error3.message }), { status: 500 });
  }
}
__name(onRequestPost13, "onRequestPost");

// api/ingestion/index.js
async function onRequestGet13(context2) {
  const { env: env2 } = context2;
  try {
    const result = await env2.SURVEY_DB.prepare("SELECT * FROM ingestion_queue WHERE status = 'pending' ORDER BY created_at DESC").all();
    return new Response(JSON.stringify(result.results || []), { headers: { "Content-Type": "application/json" } });
  } catch (error3) {
    return new Response(JSON.stringify({ error: error3.message }), { status: 500 });
  }
}
__name(onRequestGet13, "onRequestGet");

// api/inventory/index.js
async function onRequestGet14(context2) {
  const { env: env2 } = context2;
  if (!env2.SURVEY_DB) {
    return new Response(JSON.stringify({ error: "Database binding not found" }), { status: 500 });
  }
  try {
    const result = await env2.SURVEY_DB.prepare(`
      SELECT * FROM physical_inventory 
      ORDER BY series_title, CAST(box_number AS INTEGER), CAST(folder_number AS INTEGER)
    `).all();
    return new Response(JSON.stringify(result.results), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error3) {
    return new Response(JSON.stringify({ error: error3.message }), { status: 500 });
  }
}
__name(onRequestGet14, "onRequestGet");

// api/news.js
async function onRequestGet15(context2) {
  const { env: env2 } = context2;
  if (!env2.SURVEY_DB) return new Response("Missing DB", { status: 500 });
  const { results } = await env2.SURVEY_DB.prepare(
    "SELECT * FROM archive_documents WHERE type = 'external_news' ORDER BY id DESC LIMIT 50"
  ).all();
  return new Response(JSON.stringify(results || []), { headers: { "Content-Type": "application/json" } });
}
__name(onRequestGet15, "onRequestGet");

// api/nominations/index.js
async function onRequestGet16(context2) {
  const { env: env2 } = context2;
  try {
    const result = await env2.SURVEY_DB.prepare("SELECT * FROM entity_nominations WHERE status = 'pending' ORDER BY created_at DESC").all();
    return new Response(JSON.stringify(result.results || []), { headers: { "Content-Type": "application/json" } });
  } catch (error3) {
    return new Response(JSON.stringify({ error: error3.message }), { status: 500 });
  }
}
__name(onRequestGet16, "onRequestGet");
async function onRequestPost14(context2) {
  const { request, env: env2 } = context2;
  try {
    const data = await request.json();
    const id = `nom-${Date.now()}-${Math.floor(Math.random() * 1e3)}`;
    await env2.SURVEY_DB.prepare(
      "INSERT INTO entity_nominations (id, type, name, description, url, justification, status) VALUES (?, ?, ?, ?, ?, ?, 'pending')"
    ).bind(
      id,
      data.type,
      data.name,
      data.description || "",
      data.url || "",
      data.justification || "Manually nominated by curator."
    ).run();
    return new Response(JSON.stringify({ success: true, id }), { headers: { "Content-Type": "application/json" } });
  } catch (error3) {
    return new Response(JSON.stringify({ error: error3.message }), { status: 500 });
  }
}
__name(onRequestPost14, "onRequestPost");

// api/semantic-search.js
async function onRequestPost15(context2) {
  const { request, env: env2 } = context2;
  try {
    const { query } = await request.json();
    if (!query) {
      return new Response(JSON.stringify({ error: "Missing query" }), { status: 400 });
    }
    const aiBinding = env2.AI || env2.Workers_AI;
    if (!aiBinding) {
      return new Response(JSON.stringify({ error: "AI binding missing" }), { status: 500 });
    }
    if (!env2.ARCHIVE_INDEX) {
      return new Response(JSON.stringify({ error: "Vectorize binding ARCHIVE_INDEX missing" }), { status: 500 });
    }
    const queryEmbedding = await aiBinding.run("@cf/baai/bge-small-en-v1.5", { text: [query] });
    const vector = queryEmbedding.data[0];
    const searchResults = await env2.ARCHIVE_INDEX.query(vector, { topK: 20, returnMetadata: "all" });
    const matches = searchResults.matches.map((m) => {
      let rawId = m.metadata ? m.metadata.doc_id || m.id : m.id;
      let doc_id = rawId.split("-chunk-")[0];
      if (doc_id.includes("-") && doc_id.length > 8) {
        doc_id = doc_id.split("-")[0];
      }
      return { doc_id, score: m.score };
    });
    return new Response(JSON.stringify({ matches }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("Semantic Search Error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
__name(onRequestPost15, "onRequestPost");

// api/subjects.js
async function onRequestGet17(context2) {
  const { env: env2 } = context2;
  try {
    const result = await env2.SURVEY_DB.prepare("SELECT * FROM subjects ORDER BY name").all();
    return new Response(JSON.stringify(result.results), { headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
__name(onRequestGet17, "onRequestGet");

// api/submissions.js
async function onRequestPost16(context2) {
  const { request, env: env2 } = context2;
  try {
    const data = await request.json();
    const { type, name, email, subject, message } = data;
    if (!type || !email || !message) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }
    if (!env2.SURVEY_DB) {
      throw new Error("Database binding SURVEY_DB is missing");
    }
    const id = crypto.randomUUID();
    const stmt = env2.SURVEY_DB.prepare(
      "INSERT INTO user_submissions (id, type, name, email, subject, message, status) VALUES (?, ?, ?, ?, ?, ?, 'pending')"
    ).bind(
      id,
      type,
      name || "Anonymous",
      email,
      subject || "No Subject",
      message
    );
    await stmt.run();
    console.log(`[EMAIL ROUTING MOCK] Email sent to info@circumsurvey.online from ${email}`);
    console.log(`[EMAIL ROUTING MOCK] Subject: ${type} - ${subject}`);
    return new Response(JSON.stringify({ success: true, id }), { headers: { "Content-Type": "application/json" } });
  } catch (error3) {
    console.error("Submission Error:", error3);
    return new Response(JSON.stringify({ error: error3.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
__name(onRequestPost16, "onRequestPost");

// api/suggest-actions.js
var rateLimitMap2 = /* @__PURE__ */ new Map();
var RATE_LIMIT_MS2 = 5e3;
async function onRequestPost17(context2) {
  const { request, env: env2 } = context2;
  try {
    const ip = request.headers.get("cf-connecting-ip") || "unknown";
    const now = Date.now();
    if (ip !== "unknown") {
      const lastRequest = rateLimitMap2.get(ip);
      if (lastRequest && now - lastRequest < RATE_LIMIT_MS2) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
          status: 429,
          headers: { "Content-Type": "application/json", "Retry-After": Math.ceil((RATE_LIMIT_MS2 - (now - lastRequest)) / 1e3).toString() }
        });
      }
      rateLimitMap2.set(ip, now);
      if (rateLimitMap2.size > 1e3) {
        for (const [key, timestamp] of rateLimitMap2.entries()) {
          if (now - timestamp > RATE_LIMIT_MS2) rateLimitMap2.delete(key);
        }
      }
    }
    const { text } = await request.json();
    if (!text) return new Response(JSON.stringify({ error: "Missing text" }), { status: 400 });
    const aiBinding = env2.AI || env2.Workers_AI;
    if (!aiBinding) throw new Error("AI binding is missing");
    const prompt = `You are a research assistant. A user has highlighted the following text from an archive about circumcision and genital autonomy:
"${text}"

Generate exactly 3 short, thought-provoking questions the user might want to ask an AI about this text to deepen their understanding. 
Format your response as a raw JSON array of 3 strings. Do not include markdown formatting or backticks. Example:
["What is the historical context of this?", "Who is the author?", "Why was this policy changed?"]
`;
    const response = await aiBinding.run("@cf/meta/llama-3.1-8b-instruct", {
      messages: [{ role: "system", content: "You output raw JSON arrays of strings." }, { role: "user", content: prompt }]
    });
    let rawText = response.response.trim();
    if (rawText.startsWith("```json")) rawText = rawText.replace(/```json/g, "").replace(/```/g, "");
    if (rawText.startsWith("```")) rawText = rawText.replace(/```/g, "");
    let questions = [];
    try {
      questions = JSON.parse(rawText.trim());
    } catch (e) {
      questions = ["Analyze this text further.", "What is the context of this snippet?", "Summarize this highlighted text."];
    }
    return new Response(JSON.stringify({ questions }), { headers: { "Content-Type": "application/json" } });
  } catch (error3) {
    console.error("Suggestion Error:", error3);
    return new Response(JSON.stringify({ error: error3.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
__name(onRequestPost17, "onRequestPost");

// api/survey-stats.js
async function onRequestGet18(context2) {
  const { env: env2 } = context2;
  try {
    const totalQuery = await env2.SURVEY_DB.prepare("SELECT count(*) as count FROM respondents").first();
    const totalResponses = totalQuery ? totalQuery.count : 0;
    const pathwaysQuery = await env2.SURVEY_DB.prepare(
      "SELECT IFNULL(pathway, 'unspecified') as name, count(*) as value FROM respondents GROUP BY pathway ORDER BY value DESC"
    ).all();
    const generationsQuery = await env2.SURVEY_DB.prepare(
      "SELECT generation as name, count(*) as value FROM demographics WHERE generation IS NOT NULL AND generation != '' GROUP BY generation ORDER BY value DESC"
    ).all();
    const politicsQuery = await env2.SURVEY_DB.prepare(
      "SELECT politics as name, count(*) as value FROM demographics WHERE politics IS NOT NULL AND politics != '' GROUP BY politics ORDER BY value DESC"
    ).all();
    const religionQuery = await env2.SURVEY_DB.prepare(
      "SELECT primary_tradition as name, count(*) as value FROM religion WHERE primary_tradition IS NOT NULL AND primary_tradition != '' GROUP BY primary_tradition ORDER BY value DESC"
    ).all();
    return new Response(JSON.stringify({
      total: totalResponses,
      pathways: pathwaysQuery.results || [],
      generations: generationsQuery.results || [],
      politics: politicsQuery.results || [],
      religion: religionQuery.results || []
    }), { headers: { "Content-Type": "application/json" } });
  } catch (error3) {
    return new Response(JSON.stringify({ error: error3.message }), { status: 500 });
  }
}
__name(onRequestGet18, "onRequestGet");

// api/test.js
async function onRequestGet19() {
  return new Response("OK");
}
__name(onRequestGet19, "onRequestGet");

// api/cron_daily_digest.js
async function onRequest(context2) {
  const { env: env2 } = context2;
  if (!env2.SURVEY_DB) {
    return new Response("Database binding not found", { status: 500 });
  }
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1e3).toISOString();
    const dbDocs = await env2.SURVEY_DB.prepare(`
      SELECT id, title, type, url, metadata_json 
      FROM archive_documents 
      WHERE type IN ('external_news', 'social_post') 
      ORDER BY id DESC 
      LIMIT 20
    `).all();
    if (!dbDocs || !dbDocs.results || dbDocs.results.length === 0) {
      return new Response(JSON.stringify({ success: true, message: "No recent news to digest." }), { headers: { "Content-Type": "application/json" } });
    }
    let contextText = "Recent Headlines & Topics:\\n\\n";
    let index = 1;
    for (const doc of dbDocs.results) {
      let abstract = "";
      let author = "";
      try {
        const meta = JSON.parse(doc.metadata_json || "{}");
        abstract = meta.abstract || meta.summary || "";
        author = meta.author || meta.source_publication || "Unknown Source";
      } catch (e) {
      }
      contextText += `${index}. TITLE: ${doc.title}\\nSOURCE: ${author}\\nURL: ${doc.url}\\nSUMMARY: ${abstract}\\n\\n`;
      index++;
    }
    const prompt = `
You are the Senior Editor for the "Accidental Intactivist" archive.
Your task is to synthesize today's raw news ingestions into a cohesive daily digest.

Follow the "Inquiry Frame" philosophy: lead with curiosity, respect lived experiences, and focus on fundamental bodily autonomy and equal protection arguments. Do not use the phrase "So what", but embed that contextual interpretation into your analysis. Why does this matter to the movement?

Today's Ingestions:
${contextText}

Return a single JSON object with the following schema:
{
  "abstract": "A cohesive 1-2 paragraph overview summarizing today's news and how it fits into the broader intactivist movement.",
  "community_zeitgeist": "A 1-paragraph summary capturing the mood and strategic focus of recent community comments, calling users to action or debate without using the exact phrase 'So what'. Support markdown bolding (**text**) for emphasis.",
  "digest_items": [
    {
      "title": "Title of the item",
      "body": "A synthesized 1-2 paragraph editorialized summary of the item.",
      "item_id": "A short ID for UI rendering (e.g. news-1)"
    }
  ]
}

Do NOT include markdown block formatting (like \`\`\`json). Just return the raw JSON object.
`;
    let digestMarkdown = "";
    if (env2.GEMINI_API_KEY) {
      const aiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${env2.GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.4 }
        })
      });
      const aiData = await aiRes.json();
      if (aiData.candidates && aiData.candidates[0].content.parts[0].text) {
        digestMarkdown = aiData.candidates[0].content.parts[0].text;
      }
    } else {
      const aiBinding = env2.AI || env2.Workers_AI;
      if (aiBinding) {
        const response = await aiBinding.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
          messages: [{ role: "system", content: "You write daily news digests." }, { role: "user", content: prompt }],
          max_tokens: 1500
        });
        digestMarkdown = response.response;
      }
    }
    let digestData = {};
    if (digestMarkdown) {
      let cleanJson = digestMarkdown.trim();
      if (cleanJson.startsWith("```json")) cleanJson = cleanJson.slice(7, -3).trim();
      else if (cleanJson.startsWith("```")) cleanJson = cleanJson.slice(3, -3).trim();
      try {
        digestData = JSON.parse(cleanJson);
      } catch (e) {
        throw new Error("Failed to parse JSON from AI: " + e.message + "\\nRaw: " + cleanJson);
      }
    } else {
      throw new Error("Failed to generate digest content.");
    }
    const today = (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    const docId = `digest-${Date.now()}`;
    const digestTitle = `News & Field Notes: ${today}`;
    const metadata_json = JSON.stringify({
      abstract: digestData.abstract || "A synthesized roundup of the day's top headlines.",
      community_zeitgeist: digestData.community_zeitgeist || "",
      digest_items: digestData.digest_items || [],
      author: "Glenda (AI Assistant)",
      date: (/* @__PURE__ */ new Date()).toISOString(),
      source_publication: "Internal Archives",
      tags: ["Daily Digest", "News Roundup", "AI Synthesis"]
    });
    await env2.SURVEY_DB.prepare(`
      INSERT INTO archive_documents (
        id, title, source_collection, type, status, content, metadata_json
      ) VALUES (?, ?, ?, ?, 'indexed', ?, ?)
    `).bind(
      docId,
      digestTitle,
      "Daily Digests",
      "recap",
      // maps to the types accepted in NewsAggregator
      digestData.abstract,
      // put abstract in content for full-text search fallback
      metadata_json
    ).run();
    if (env2.ARCHIVE_INDEX) {
      try {
        const aiBinding = env2.AI || env2.Workers_AI;
        const vectorData = await aiBinding.run("@cf/baai/bge-small-en-v1.5", { text: [digestMarkdown.slice(0, 1e3)] });
        if (vectorData && vectorData.data && vectorData.data[0]) {
          const vector = vectorData.data[0];
          await env2.ARCHIVE_INDEX.upsert([{
            id: docId,
            values: vector,
            metadata: { source: "Daily Digest", text: digestMarkdown.slice(0, 1e3), doc_id: docId }
          }]);
        }
      } catch (e) {
        console.error("Vectorization failed for digest", e);
      }
    }
    return new Response(JSON.stringify({
      success: true,
      message: `Successfully generated and saved daily digest: ${digestTitle}`
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error3) {
    console.error("Cron Digest Error:", error3);
    return new Response(JSON.stringify({ error: error3.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
__name(onRequest, "onRequest");

// api/cron_news_ingest.js
async function onRequest2(context2) {
  const { env: env2 } = context2;
  if (!env2.SURVEY_DB) {
    return new Response("Database binding not found", { status: 500 });
  }
  const aiBinding = env2.AI || env2.Workers_AI;
  if (!aiBinding) {
    return new Response("AI binding not found", { status: 500 });
  }
  if (!env2.ARCHIVE_INDEX) {
    return new Response("ARCHIVE_INDEX binding not found", { status: 500 });
  }
  try {
    console.log("Fetching latest news from Google News RSS...");
    const queries = [
      'intactivism OR "circumcision ethics"',
      '"circumcision rate" AND ("US" OR "United States")',
      '"genital autonomy"',
      "circumcision"
    ];
    let allArticles = [];
    for (const q of queries) {
      const rssUrl = "https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent(`https://news.google.com/rss/search?q=${q}`);
      try {
        const res = await fetch(rssUrl);
        if (res.ok) {
          const data = await res.json();
          if (data.items) allArticles = allArticles.concat(data.items);
        }
      } catch (e) {
        console.error("Failed to fetch RSS for query:", q);
      }
    }
    const uniqueArticles = Array.from(new Map(allArticles.map((item) => [item.link, item])).values());
    let inserted = 0;
    for (const article of uniqueArticles.slice(0, 10)) {
      const existing = await env2.SURVEY_DB.prepare("SELECT id FROM archive_documents WHERE url = ?").bind(article.link).first();
      if (!existing) {
        let pageText = article.description || "";
        let ogImage = null;
        try {
          const pageRes = await fetch(article.link);
          const html = await pageRes.text();
          const ogImageMatch = html.match(/<meta[^>]*property=['"]og:image['"][^>]*content=['"]([^'"]+)['"]/i) || html.match(/<meta[^>]*content=['"]([^'"]+)['"][^>]*property=['"]og:image['"]/i);
          if (ogImageMatch && ogImageMatch[1]) {
            ogImage = ogImageMatch[1];
          }
          pageText = html.replace(/<[^>]*>?/gm, "").slice(0, 15e3);
        } catch (e) {
          console.log("Could not fetch full article, using description.");
        }
        const prompt = `
          Analyze the following news article text and extract key metadata into a strict JSON format.
          Return ONLY a raw JSON object with:
          {
            "academic_title": "The article headline",
            "summary": "A 1-2 paragraph summary.",
            "abstract": "A concise abstract of the article's contents.",
            "source_publication": "The name of the news outlet",
            "author": "Author name if any",
            "tags": ["Tag 1", "Tag 2"],
            "key_people": ["Name 1", "Name 2"],
            "organizations": ["Org 1", "Org 2"],
            "date": "YYYY-MM-DD"
          }
          Text: ${pageText}
        `;
        let metadata_json = JSON.stringify({
          academic_title: article.title,
          abstract: article.description,
          date: article.pubDate,
          source_publication: "News Source"
        });
        if (env2.GEMINI_API_KEY) {
          try {
            const aiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${env2.GEMINI_API_KEY}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json", temperature: 0.2 }
              })
            });
            const aiData = await aiRes.json();
            if (aiData.candidates && aiData.candidates[0].content.parts[0].text) {
              let parsedAI = JSON.parse(aiData.candidates[0].content.parts[0].text);
              if (ogImage) {
                parsedAI.image_url = ogImage;
              }
              metadata_json = JSON.stringify(parsedAI);
            }
          } catch (e) {
            console.error("Gemini API failed", e);
          }
        }
        const docId = crypto.randomUUID().split("-")[0];
        await env2.SURVEY_DB.prepare(`
          INSERT INTO archive_documents (
            id, title, source_collection, url, type, status, metadata_json
          ) VALUES (?, ?, ?, ?, ?, 'indexed', ?)
        `).bind(
          docId,
          article.title,
          "Global News Monitoring",
          article.link,
          "external_news",
          metadata_json
        ).run();
        let abstract = article.description;
        try {
          const parsedMeta = JSON.parse(metadata_json);
          if (parsedMeta.abstract) abstract = parsedMeta.abstract;
        } catch (e) {
        }
        try {
          const vectorData = await aiBinding.run("@cf/baai/bge-small-en-v1.5", { text: [abstract] });
          if (vectorData && vectorData.data && vectorData.data[0]) {
            const vector = vectorData.data[0];
            await env2.ARCHIVE_INDEX.upsert([{
              id: docId,
              values: vector,
              metadata: { source: article.link, text: abstract, doc_id: docId }
            }]);
          }
        } catch (e) {
          console.error("Vectorization failed", e);
        }
        inserted++;
      }
    }
    return new Response(JSON.stringify({
      success: true,
      message: `Scraped ${uniqueArticles.length} news items, extracted metadata, and inserted ${inserted} external_news records.`
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error3) {
    return new Response(JSON.stringify({ error: error3.message }), { status: 500 });
  }
}
__name(onRequest2, "onRequest");

// api/cron_social_ingest.js
async function onRequest3(context2) {
  const { env: env2 } = context2;
  if (!env2.SURVEY_DB) {
    return new Response("Database binding not found", { status: 500 });
  }
  try {
    console.log("Fetching latest posts from r/Intactivism...");
    const res = await fetch("https://www.reddit.com/r/Intactivism/new.json?limit=10", {
      headers: { "User-Agent": "windows:org.intactivism.archive:v1.0 (by /u/apettit)" }
    });
    if (!res.ok) {
      throw new Error(`Reddit API failed with status ${res.status}`);
    }
    const data = await res.json();
    const posts = data.data.children;
    let inserted = 0;
    for (const post of posts) {
      const p = post.data;
      if (!p.selftext && !p.url) continue;
      let mediaUrls = [];
      if (p.url && p.url.match(/\.(jpeg|jpg|gif|png)$/i)) {
        mediaUrls.push(p.url);
      } else if (p.thumbnail && p.thumbnail.startsWith("http")) {
        mediaUrls.push(p.thumbnail);
      }
      const docId = `reddit-${p.id}`;
      const existing = await env2.SURVEY_DB.prepare("SELECT id FROM archive_documents WHERE id = ?").bind(docId).first();
      if (!existing) {
        let metadata_json = JSON.stringify({
          author: p.author,
          date: new Date(p.created_utc * 1e3).toISOString(),
          abstract: p.selftext.slice(0, 500),
          source_publication: "Reddit (r/Intactivism)"
        });
        if (env2.GEMINI_API_KEY && p.selftext) {
          const prompt = `
              Analyze the following Reddit post and extract key metadata into a strict JSON format.
              Return ONLY a raw JSON object with:
              {
                "academic_title": "A short, clean title for the post",
                "summary": "A 1-2 paragraph summary.",
                "abstract": "A concise abstract of the post's contents.",
                "author": "The author's username",
                "tags": ["Tag 1", "Tag 2"],
                "key_people": ["Name 1", "Name 2"],
                "organizations": ["Org 1", "Org 2"],
                "source_publication": "Reddit (r/Intactivism)"
              }
              Post Title: ${p.title}
              Post Text: ${p.selftext}
            `;
          try {
            const aiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${env2.GEMINI_API_KEY}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json", temperature: 0.2 }
              })
            });
            const aiData = await aiRes.json();
            if (aiData.candidates && aiData.candidates[0].content.parts[0].text) {
              const aiMeta = JSON.parse(aiData.candidates[0].content.parts[0].text);
              aiMeta.date = new Date(p.created_utc * 1e3).toISOString();
              metadata_json = JSON.stringify(aiMeta);
            }
          } catch (e) {
            console.error("Gemini API failed for Reddit", e);
          }
        }
        await env2.SURVEY_DB.prepare(`
          INSERT INTO archive_documents (
            id, title, source_collection, url, type, status, media_urls, metadata_json
          ) VALUES (?, ?, ?, ?, ?, 'indexed', ?, ?)
        `).bind(
          docId,
          p.title,
          "Social Media Monitoring",
          `https://reddit.com${p.permalink}`,
          "social_post",
          mediaUrls.length > 0 ? JSON.stringify(mediaUrls) : null,
          metadata_json
        ).run();
        let abstractToVectorize = p.selftext.slice(0, 1e3) || p.title;
        try {
          const parsedMeta = JSON.parse(metadata_json);
          if (parsedMeta.abstract) abstractToVectorize = parsedMeta.abstract;
        } catch (e) {
        }
        if (env2.ARCHIVE_INDEX) {
          try {
            const aiBinding = env2.AI || env2.Workers_AI;
            const vectorData = await aiBinding.run("@cf/baai/bge-small-en-v1.5", { text: [abstractToVectorize] });
            if (vectorData && vectorData.data && vectorData.data[0]) {
              const vector = vectorData.data[0];
              await env2.ARCHIVE_INDEX.upsert([{
                id: docId,
                values: vector,
                metadata: { source: `https://reddit.com${p.permalink}`, text: abstractToVectorize, doc_id: docId }
              }]);
            }
          } catch (e) {
            console.error("Vectorization failed for Reddit", e);
          }
        }
        inserted++;
      }
    }
    return new Response(JSON.stringify({
      success: true,
      message: `Scraped ${posts.length} posts, inserted ${inserted} new pending items into the CMS.`
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error3) {
    return new Response(JSON.stringify({ error: error3.message }), { status: 500 });
  }
}
__name(onRequest3, "onRequest");

// [[path]].js
async function onRequestGet20(context2) {
  const { request, env: env2, next } = context2;
  const url = new URL(request.url);
  const response = await env2.ASSETS.fetch(request);
  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("text/html")) {
    return response;
  }
  let title2 = "Intactivism Archive";
  let description = "A digital repository preserving historical documents, medical journals, and personal accounts concerning genital autonomy and circumcision.";
  const pathParts = url.pathname.split("/").filter(Boolean);
  if ((pathParts[0] === "library" || pathParts[0] === "news") && pathParts[1]) {
    const docId = pathParts[1];
    try {
      if (env2.SURVEY_DB) {
        const doc = await env2.SURVEY_DB.prepare("SELECT title, metadata_json, type FROM archive_documents WHERE id = ?").bind(docId).first();
        if (doc) {
          try {
            const meta = JSON.parse(doc.metadata_json || "{}");
            title2 = meta.academic_title || meta.title || doc.title || title2;
            description = meta.abstract || meta.summary || meta.description || description;
            if (description.length > 200) {
              description = description.substring(0, 197) + "...";
            }
          } catch (e) {
          }
        }
      }
    } catch (e) {
      console.warn("Error fetching SEO metadata for doc:", e);
    }
  }
  return new HTMLRewriter().on("title", {
    element(e) {
      e.setInnerContent(`${title2} | Intactivism Archive`);
    }
  }).on('meta[property="og:title"]', {
    element(e) {
      e.setAttribute("content", title2);
    }
  }).on('meta[name="twitter:title"]', {
    element(e) {
      e.setAttribute("content", title2);
    }
  }).on('meta[property="og:description"]', {
    element(e) {
      e.setAttribute("content", description);
    }
  }).on('meta[name="twitter:description"]', {
    element(e) {
      e.setAttribute("content", description);
    }
  }).transform(response);
}
__name(onRequestGet20, "onRequestGet");

// ../.wrangler/tmp/pages-md7evL/functionsRoutes-0.19793683589984334.mjs
var routes = [
  {
    routePath: "/api/cms/bulk-match",
    mountPath: "/api/cms",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  },
  {
    routePath: "/api/cms/pending-ocr",
    mountPath: "/api/cms",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet]
  },
  {
    routePath: "/api/cms/process-ocr",
    mountPath: "/api/cms",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost2]
  },
  {
    routePath: "/api/cms/save-ocr",
    mountPath: "/api/cms",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost3]
  },
  {
    routePath: "/api/entities/merge",
    mountPath: "/api/entities",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost4]
  },
  {
    routePath: "/api/translations/approve",
    mountPath: "/api/translations",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost5]
  },
  {
    routePath: "/api/translations/hopper",
    mountPath: "/api/translations",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet2]
  },
  {
    routePath: "/api/translations/request",
    mountPath: "/api/translations",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost6]
  },
  {
    routePath: "/api/cms/:id",
    mountPath: "/api/cms",
    method: "DELETE",
    middlewares: [],
    modules: [onRequestDelete]
  },
  {
    routePath: "/api/cms/:id",
    mountPath: "/api/cms",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet3]
  },
  {
    routePath: "/api/cms/:id",
    mountPath: "/api/cms",
    method: "PUT",
    middlewares: [],
    modules: [onRequestPut]
  },
  {
    routePath: "/api/collections/:slug",
    mountPath: "/api/collections",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet4]
  },
  {
    routePath: "/api/entities/:id",
    mountPath: "/api/entities",
    method: "DELETE",
    middlewares: [],
    modules: [onRequestDelete2]
  },
  {
    routePath: "/api/ingestion/:id",
    mountPath: "/api/ingestion",
    method: "PUT",
    middlewares: [],
    modules: [onRequestPut2]
  },
  {
    routePath: "/api/nominations/:id",
    mountPath: "/api/nominations",
    method: "PUT",
    middlewares: [],
    modules: [onRequestPut3]
  },
  {
    routePath: "/api/translations/:docId",
    mountPath: "/api/translations",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet5]
  },
  {
    routePath: "/api/assets/:path*",
    mountPath: "/api/assets",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet6]
  },
  {
    routePath: "/api/chat",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost7]
  },
  {
    routePath: "/api/cms",
    mountPath: "/api/cms",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet7]
  },
  {
    routePath: "/api/cms",
    mountPath: "/api/cms",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost8]
  },
  {
    routePath: "/api/collections",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet8]
  },
  {
    routePath: "/api/comments",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet9]
  },
  {
    routePath: "/api/comments",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost9]
  },
  {
    routePath: "/api/comments",
    mountPath: "/api",
    method: "PUT",
    middlewares: [],
    modules: [onRequestPut4]
  },
  {
    routePath: "/api/embed_text",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost10]
  },
  {
    routePath: "/api/entities",
    mountPath: "/api/entities",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet10]
  },
  {
    routePath: "/api/entities",
    mountPath: "/api/entities",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost11]
  },
  {
    routePath: "/api/entities",
    mountPath: "/api/entities",
    method: "PUT",
    middlewares: [],
    modules: [onRequestPut5]
  },
  {
    routePath: "/api/fix_dates",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet11]
  },
  {
    routePath: "/api/ground-truth",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet12]
  },
  {
    routePath: "/api/ground-truth",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost12]
  },
  {
    routePath: "/api/ingest",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost13]
  },
  {
    routePath: "/api/ingestion",
    mountPath: "/api/ingestion",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet13]
  },
  {
    routePath: "/api/inventory",
    mountPath: "/api/inventory",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet14]
  },
  {
    routePath: "/api/news",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet15]
  },
  {
    routePath: "/api/nominations",
    mountPath: "/api/nominations",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet16]
  },
  {
    routePath: "/api/nominations",
    mountPath: "/api/nominations",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost14]
  },
  {
    routePath: "/api/semantic-search",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost15]
  },
  {
    routePath: "/api/subjects",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet17]
  },
  {
    routePath: "/api/submissions",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost16]
  },
  {
    routePath: "/api/suggest-actions",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost17]
  },
  {
    routePath: "/api/survey-stats",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet18]
  },
  {
    routePath: "/api/test",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet19]
  },
  {
    routePath: "/api/cron_daily_digest",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest]
  },
  {
    routePath: "/api/cron_news_ingest",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest2]
  },
  {
    routePath: "/api/cron_social_ingest",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest3]
  },
  {
    routePath: "/:path*",
    mountPath: "/",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet20]
  }
];

// ../../../Users/v-apettit/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/path-to-regexp/dist.es2015/index.js
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count3 = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count3--;
          if (count3 === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count3++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count3)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse2(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse2, "parse");
function match2(str, options) {
  var keys = [];
  var re = pathToRegexp2(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match2, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp2(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse2(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp2(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp2, "pathToRegexp");

// ../../../Users/v-apettit/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match2(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match2(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match2(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match2(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env2, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context2 = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env: env2,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context2);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env2["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error3) {
      if (isFailOpen) {
        const response = await env2["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error3;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");

// ../../../Users/v-apettit/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../Users/v-apettit/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } catch (e) {
    const error3 = reduceError(e);
    const body = JSON.stringify(error3);
    const headers = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body);
    if (encoded.length <= 8192) {
      headers["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body, { status: 500, headers });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// ../.wrangler/tmp/bundle-SLmzft/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;

// ../../../Users/v-apettit/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env2, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env2, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env2, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env2, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// ../.wrangler/tmp/bundle-SLmzft/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env2, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env2, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env2, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env2, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env2, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env2, ctx) => {
      this.env = env2;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=functionsWorker-0.18796195788602077.mjs.map
