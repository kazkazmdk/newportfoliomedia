import { Scene, sRGBEncoding, WebGLRenderer } from 'three'
import gsap from 'gsap'
import { Pane } from 'tweakpane'

import CameraManager from './CameraManager'
import World from '@world/index'
import { clampDevicePixelRatio } from '@tools/loadTracker'

export default class AppManager {
  constructor(options) {
    this.time = options.time
    this.assets = options.assets
    this._tick = this.update.bind(this)
    this._onResize = this._handleResize.bind(this)
  }
  get SCENE() {
    return this._scene
  }
  get RENDERER() {
    return this._renderer
  }
  get CAMERA_MANAGER() {
    return this._cameraManager
  }
  get WORLD() {
    return this._world
  }
  setup(canvas = document.querySelector('#_canvas')) {
    this.canvas = canvas
    this._debug = this._setConfig()
    this._scene = this._setScene()
    this._renderer = this._setRenderer()
    this._cameraManager = this._setCamera()
    this._world = this._setWorld()
    this._setTicker()
    this._setEvents()
  }
  update() {
    if (!this._renderer || !this._cameraManager) return
    this._renderer.render(this._scene, this._cameraManager.CAMERA)
  }
  destroy() {
    gsap.ticker.remove(this._tick)
    window.removeEventListener('resize', this._onResize)
    if (this._debug && typeof this._debug.dispose === 'function') {
      this._debug.dispose()
    }
    if (this._renderer) {
      this._renderer.dispose()
    }
    this._debug = false
    this._renderer = null
  }
  _setScene() {
    const scene = new Scene()
    return scene
  }
  _setRenderer() {
    const renderer = new WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    })
    renderer.outputEncoding = sRGBEncoding
    renderer.gammaFactor = 2.2
    renderer.setClearColor(0x000000, 1)
    renderer.setPixelRatio(clampDevicePixelRatio(window.devicePixelRatio, 2))
    renderer.setSize(window.innerWidth, window.innerHeight)
    return renderer
  }
  _setCamera() {
    const cameraManager = new CameraManager({debug: this._debug})
    cameraManager.setup()
    this._scene.add(cameraManager.CAMERA)
    return cameraManager
  }
  _setWorld() {
    const world = new World({
      debug: this._debug,
      assets: this.assets,
    })
    this._scene.add(world.container)
    return world
  }
  _setConfig() {
    if (window.location.hash === '#debug') {
      const debug = new Pane({
        title: 'DEBUG',
        expanded: false,
      })
      return debug
    }
    return false
  }
  _setTicker() {
    gsap.ticker.fps(60)
    gsap.ticker.add(this._tick)
  }
  _setEvents() {
    window.addEventListener('resize', this._onResize, false)
  }
  _handleResize() {
    if (!this._cameraManager || !this._renderer) return
    this._cameraManager.setSizes()
    this._renderer.setPixelRatio(clampDevicePixelRatio(window.devicePixelRatio, 2))
    this._renderer.setSize(window.innerWidth, window.innerHeight)
  }
}
