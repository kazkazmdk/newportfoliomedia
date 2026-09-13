export const STATUS = {
  PENDING: "PENDING",
  LOADING: "LOADING",
  LOADED: "LOADED",
  FAILED: "FAILED",
  OPTIONAL_FAILED: "OPTIONAL_FAILED",
}

export function createLoadTracker({ timeoutMs = 45000 } = {}) {
  const items = new Map()
  const listeners = new Set()

  function emit() {
    const snapshot = getSnapshot()
    listeners.forEach((listener) => listener(snapshot))
  }

  function getSnapshot() {
    const list = Array.from(items.values())
    const total = list.length
    const done = list.filter((item) =>
      [STATUS.LOADED, STATUS.FAILED, STATUS.OPTIONAL_FAILED].includes(item.status)
    ).length
    const loaded = list.filter((item) => item.status === STATUS.LOADED).length
    const failed = list.filter(
      (item) => item.status === STATUS.FAILED || item.status === STATUS.OPTIONAL_FAILED
    ).length
    const critical = list.filter((item) => !item.optional)
    const criticalDone = critical.filter((item) =>
      [STATUS.LOADED, STATUS.FAILED].includes(item.status)
    ).length
    const criticalFailed = list.filter(
      (item) => item.status === STATUS.FAILED && !item.optional
    ).length
    const bytesTotal = list.reduce((sum, item) => sum + (item.bytes || 0), 0)
    const bytesLoaded = list.reduce((sum, item) => sum + (item.loadedBytes || 0), 0)
    const percent =
      total === 0 ? 100 : Math.min(100, Math.floor((done / total) * 100))
    const criticalSettled = critical.length === 0 || criticalDone === critical.length
    return {
      total,
      done,
      loaded,
      failed,
      criticalFailed,
      percent,
      bytesTotal,
      bytesLoaded,
      settled: total === 0 || done === total,
      criticalSettled,
      canContinue: criticalSettled && criticalFailed === 0,
      failedCritical: list.filter((item) => item.status === STATUS.FAILED && !item.optional),
      items: list,
    }
  }

  function add(name, { optional = false, bytes = 0, phase = "world" } = {}) {
    items.set(name, {
      name,
      optional,
      bytes,
      loadedBytes: 0,
      phase,
      status: STATUS.PENDING,
      error: null,
    })
  }

  function start(name) {
    const item = items.get(name)
    if (!item) return
    item.status = STATUS.LOADING
    emit()
    if (timeoutMs > 0) {
      item.timeoutId = setTimeout(() => {
        if (item.status === STATUS.LOADING) {
          fail(name, new Error(`Timed out loading ${name}`))
        }
      }, timeoutMs)
    }
  }

  function succeed(name) {
    const item = items.get(name)
    if (!item) return
    clearTimeout(item.timeoutId)
    item.status = STATUS.LOADED
    item.loadedBytes = item.bytes || item.loadedBytes
    item.error = null
    emit()
  }

  function fail(name, error) {
    const item = items.get(name)
    if (!item) return
    clearTimeout(item.timeoutId)
    item.error = error
    item.status = item.optional ? STATUS.OPTIONAL_FAILED : STATUS.FAILED
    emit()
  }

  function progress(name, loadedBytes, totalBytes) {
    const item = items.get(name)
    if (!item) return
    item.loadedBytes = loadedBytes
    if (totalBytes) item.bytes = totalBytes
    emit()
  }

  function resetFailed() {
    items.forEach((item) => {
      if (item.status === STATUS.FAILED || item.status === STATUS.OPTIONAL_FAILED) {
        item.status = STATUS.PENDING
        item.error = null
        item.loadedBytes = 0
      }
    })
    emit()
  }

  return {
    add,
    start,
    succeed,
    fail,
    progress,
    resetFailed,
    getSnapshot,
    onChange(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}

export function resetHtmlMedia(element) {
  if (!element) return false
  if (typeof element.pause === "function") element.pause()
  if ("currentTime" in element) element.currentTime = 0
  return true
}

export function isOptionalAsset(ressource) {
  if (!ressource) return false
  if (ressource.optional) return true
  if (ressource.type === "sound") return true
  const name = `${ressource.name || ""} ${ressource.src || ""}`.toLowerCase()
  return name.includes("/video/") || name.endsWith(".md")
}

export function assetPhase(ressource) {
  if (!ressource) return "world"
  if (ressource.type === "sound") return "audio"
  if (`${ressource.src || ""}`.includes("/video/")) return "intro"
  return "world"
}
