const { describe, it } = require("node:test")
const assert = require("node:assert/strict")
const { assertDistMedia } = require("./assert-dist-media")

describe("assertDistMedia", () => {
  it("rejects leftover source-relative media URLs", () => {
    const result = assertDistMedia(
      '<audio src="./sounds/BM_MAIN.ogg"><video src="./textures/video/INTRO.mp4">'
    )
    assert.equal(result.ok, false)
  })

  it("accepts hashed webpack URLs while keeping static images", () => {
    const result = assertDistMedia(
      '<img src="./assets/logo_beyond.png"><audio src="assets/audios/abc.ogg"><video src="assets/videos/xyz.mp4">'
    )
    assert.equal(result.ok, true)
  })
})
