import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
  STATUS,
  createLoadTracker,
  clampDevicePixelRatio,
  mountLoaderTemplate,
} from "./loadTracker.js"

describe("createLoadTracker", () => {
  it("reaches ressourcesReady when every asset loads", () => {
    const tracker = createLoadTracker({ timeoutMs: 0 })
    tracker.add("suzanne", { optional: false })
    tracker.start("suzanne")
    tracker.succeed("suzanne")
    const snapshot = tracker.getSnapshot()
    assert.equal(snapshot.settled, true)
    assert.equal(snapshot.canContinue, true)
    assert.equal(snapshot.percent, 100)
  })

  it("settles after an optional failure instead of hanging", () => {
    const tracker = createLoadTracker({ timeoutMs: 0 })
    tracker.add("suzanne", { optional: false })
    tracker.add("music", { optional: true })
    tracker.succeed("suzanne")
    tracker.fail("music", new Error("404"))
    const snapshot = tracker.getSnapshot()
    assert.equal(snapshot.settled, true)
    assert.equal(snapshot.canContinue, true)
    assert.equal(snapshot.items.find((item) => item.name === "music").status, STATUS.OPTIONAL_FAILED)
  })

  it("surfaces a critical failure instead of hanging", () => {
    const tracker = createLoadTracker({ timeoutMs: 0 })
    tracker.add("suzanne")
    tracker.fail("suzanne", new Error("network"))
    const snapshot = tracker.getSnapshot()
    assert.equal(snapshot.settled, true)
    assert.equal(snapshot.canContinue, false)
    assert.equal(snapshot.criticalFailed, 1)
  })

  it("can continue when the template has no assets", () => {
    const tracker = createLoadTracker({ timeoutMs: 0 })
    const snapshot = tracker.getSnapshot()
    assert.equal(snapshot.canContinue, true)
    assert.equal(snapshot.percent, 100)
  })
})

describe("clampDevicePixelRatio", () => {
  it("caps high DPR values", () => {
    assert.equal(clampDevicePixelRatio(3), 2)
    assert.equal(clampDevicePixelRatio(1.25), 1.25)
    assert.equal(clampDevicePixelRatio(0), 1)
  })
})

describe("mountLoaderTemplate", () => {
  it("does not concatenate into document.body.innerHTML", () => {
    const calls = []
    const host = {
      id: "",
      innerHTML: "keep",
      parentNode: null,
      insertAdjacentHTML(position, html) {
        calls.push([position, html])
      },
    }
    const scope = {
      getElementById: () => host,
      createElement: () => host,
      body: {
        get innerHTML() {
          throw new Error("do not read body.innerHTML")
        },
        set innerHTML(_value) {
          throw new Error("do not assign body.innerHTML")
        },
        appendChild() {},
      },
    }
    const previousDocument = global.document
    global.document = scope
    try {
      mountLoaderTemplate("<div class='loaderScreen'></div>")
    } finally {
      global.document = previousDocument
    }
    assert.equal(host.innerHTML, "")
    assert.deepEqual(calls, [["beforeend", "<div class='loaderScreen'></div>"]])
  })
})
