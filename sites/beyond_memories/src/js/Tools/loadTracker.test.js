import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
  STATUS,
  createLoadTracker,
  resetHtmlMedia,
  isOptionalAsset,
  assetPhase,
} from "./loadTracker.js"

describe("createLoadTracker", () => {
  it("reaches ressourcesReady when every asset loads", () => {
    const tracker = createLoadTracker({ timeoutMs: 0 })
    tracker.add("map", { optional: false })
    tracker.add("eddie", { optional: false })
    tracker.start("map")
    tracker.succeed("map")
    tracker.start("eddie")
    tracker.succeed("eddie")
    const snapshot = tracker.getSnapshot()
    assert.equal(snapshot.settled, true)
    assert.equal(snapshot.canContinue, true)
    assert.equal(snapshot.percent, 100)
  })

  it("settles after an optional failure instead of hanging", () => {
    const tracker = createLoadTracker({ timeoutMs: 0 })
    tracker.add("map", { optional: false })
    tracker.add("music", { optional: true })
    tracker.succeed("map")
    tracker.fail("music", new Error("404"))
    const snapshot = tracker.getSnapshot()
    assert.equal(snapshot.settled, true)
    assert.equal(snapshot.canContinue, true)
    assert.equal(snapshot.items.find((item) => item.name === "music").status, STATUS.OPTIONAL_FAILED)
  })

  it("does not wait on optional audio before becoming playable", () => {
    const tracker = createLoadTracker({ timeoutMs: 0 })
    tracker.add("map", { optional: false })
    tracker.add("music", { optional: true })
    tracker.succeed("map")
    const snapshot = tracker.getSnapshot()
    assert.equal(snapshot.criticalSettled, true)
    assert.equal(snapshot.canContinue, true)
    assert.equal(snapshot.settled, false)
  })

  it("can continue when no assets are registered", () => {
    const tracker = createLoadTracker({ timeoutMs: 0 })
    const snapshot = tracker.getSnapshot()
    assert.equal(snapshot.canContinue, true)
    assert.equal(snapshot.percent, 100)
  })

  it("surfaces a critical failure instead of hanging", () => {
    const tracker = createLoadTracker({ timeoutMs: 0 })
    tracker.add("map")
    tracker.fail("map", new Error("network"))
    const snapshot = tracker.getSnapshot()
    assert.equal(snapshot.settled, true)
    assert.equal(snapshot.canContinue, false)
    assert.equal(snapshot.criticalFailed, 1)
  })
})

describe("resetHtmlMedia", () => {
  it("writes currentTime, not a misspelled currenTime", () => {
    const media = { pause() {}, currentTime: 12 }
    resetHtmlMedia(media)
    assert.equal(media.currentTime, 0)
    assert.equal(Object.prototype.hasOwnProperty.call(media, "currenTime"), false)
  })
})

describe("asset classification", () => {
  it("treats sounds as optional audio-phase assets", () => {
    assert.equal(isOptionalAsset({ type: "sound", name: "BM_MAIN" }), true)
    assert.equal(assetPhase({ type: "sound" }), "audio")
    assert.equal(assetPhase({ type: "model", src: "MAP.gltf" }), "world")
  })
})
