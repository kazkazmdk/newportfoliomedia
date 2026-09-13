/* global module */
import Assets from '@tools/Loader'
import '@style/style.styl'
import AppManager from '@js/AppManager'

const loader = `
<div class="loaderScreen">
  <div class="loaderScreen__progressBar">
    <div class="loaderScreen__progress"></div>
  </div>
  <h1 class="loaderScreen__load">0%</h1>
  <p class="loaderScreen__status" hidden>Loading assets…</p>
  <button class="loaderScreen__retry" type="button" hidden>Retry</button>
  <div class="loaderScreen__progressBar">
    <div class="loaderScreen__progress"></div>
  </div>
</div>
`

const assets = new Assets({
  template: loader
})

const app = new AppManager({
  assets: assets,
})
app.setup()

if (typeof module !== 'undefined' && module.hot) {
  module.hot.dispose(() => {
    app.destroy()
  })
}
