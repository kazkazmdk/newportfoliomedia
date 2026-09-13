const fs = require("fs")
const path = require("path")

function assertDistMedia(html) {
  const leftover = []
  if (html.includes("./sounds/")) leftover.push("./sounds/")
  if (html.includes("./textures/video/")) leftover.push("./textures/video/")
  if (leftover.length) {
    return {
      ok: false,
      reason: `dist HTML still references unhashed media paths: ${leftover.join(", ")}`,
    }
  }
  if (!html.includes("assets/videos/") || !html.includes("assets/audios/")) {
    return {
      ok: false,
      reason: "dist HTML is missing hashed audio/video file-loader paths",
    }
  }
  if (!html.includes("./assets/logo_beyond.png")) {
    return {
      ok: false,
      reason: "mobile logo should stay a static CopyWebpackPlugin path",
    }
  }
  return { ok: true }
}

module.exports = { assertDistMedia }

if (require.main === module) {
  const htmlPath = path.join(__dirname, "../dist/index.html")
  if (!fs.existsSync(htmlPath)) {
    console.error("Missing dist/index.html — run the webpack build first.")
    process.exit(1)
  }
  const result = assertDistMedia(fs.readFileSync(htmlPath, "utf8"))
  if (!result.ok) {
    console.error(result.reason)
    process.exit(1)
  }
  console.log("dist HTML media paths look correct.")
}
