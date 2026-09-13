import EventEmitter from './EventEmitter'

import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'

import { AudioLoader, TextureLoader } from 'three'
import { createLoadTracker, isOptionalAsset, mountLoaderTemplate } from './loadTracker'

export default class Loader extends EventEmitter {
  constructor(options) {
    super()
    this.template = options.template

    this.ressourcesList = []
    this.total = 0
    this.done = 0
    this.failed = 0
    this.currentPercent = 0
    this.models = {}
    this.textures = {}
    this.sounds = {}
    this.fonts = {}
    this.tracker = createLoadTracker({ timeoutMs: 45000 })
    this.loadDiv = null
    this.progressBar = []
    this.loadModels = null

    this.tracker.onChange((snapshot) => {
      this.total = snapshot.total
      this.done = snapshot.done
      this.failed = snapshot.failed
      this.currentPercent = snapshot.percent
      this.trigger('ressourceLoad', [snapshot])
      this.updateProgress(snapshot)
      if (snapshot.criticalSettled && !this._criticalSettled) {
        this._criticalSettled = true
        if (snapshot.canContinue) {
          this.trigger('ressourcesReady')
          this.hideLoader()
        } else {
          this.trigger('ressourcesFailed', [snapshot])
          this.showFailure(snapshot)
        }
      }
    })

    this.setLoaders()
    this.setRessourcesList()
  }
  setLoaders() {
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('./draco/')
    dracoLoader.setDecoderConfig({ type: 'js' })

    const gltfLoader = new GLTFLoader()
    gltfLoader.setDRACOLoader(dracoLoader)
    const fbxLoader = new FBXLoader()
    const textureLoader = new TextureLoader()
    const fontLoader = new FontLoader()
    const soundLoader = new AudioLoader()

    const wrap = (threeLoader) => (ressource) => {
      this.tracker.start(ressource.name)
      threeLoader.load(
        ressource.src,
        (loaded) => {
          this.loadComplete(ressource, loaded)
        },
        (xhr) => {
          this.progress(ressource, xhr)
        },
        (error) => {
          this.loadError(ressource, error)
        }
      )
    }

    this.loaders = [
      { filetype: ['gltf', 'glb'], action: wrap(gltfLoader) },
      { filetype: ['fbx'], action: wrap(fbxLoader) },
      { filetype: ['png', 'jpg', 'jpeg'], action: wrap(textureLoader) },
      { filetype: ['json'], action: wrap(fontLoader) },
      { filetype: ['mp3', 'ogg', 'wav'], action: wrap(soundLoader) },
    ]
  }
  progress(ressource, xhr) {
    if (xhr && xhr.lengthComputable) {
      this.tracker.progress(ressource.name, xhr.loaded, xhr.total)
    }
  }
  setRessourcesList() {
    const modelsContext = require.context('@models', true, /\.(glb|gltf|fbx)$/)
    modelsContext.keys().forEach((key) => {
      const newKey = `${key}`.substring(2)
      const modelSrc = require('../../models/' + newKey)
      this.ressourcesList.push({
        name: key.substring(2, key.length - (key.length - newKey.lastIndexOf('.') - 2)),
        src: modelSrc.default,
        type: 'model',
      })
    })
    const texturesContext = require.context('@textures', true, /\.(png|jpeg|jpg)$/)
    texturesContext.keys().forEach((key) => {
      const newKey = `${key}`.substring(2)
      const textureSrc = require('../../textures/' + newKey)
      this.ressourcesList.push({
        name: key.substring(2, key.length - (key.length - newKey.lastIndexOf('.') - 2)),
        src: textureSrc.default,
        type: 'texture',
      })
    })
    const fontsContext = require.context('@fonts', true, /\.(json)$/)
    fontsContext.keys().forEach((key) => {
      const newKey = `${key}`.substring(2)
      const fontSrc = 'assets/fonts/' + newKey
      this.ressourcesList.push({
        name: key.substring(2, key.length - (key.length - newKey.lastIndexOf('.') - 2)),
        src: fontSrc,
        type: 'font',
      })
    })
    const soundsContext = require.context('@sounds', true, /\.(mp3|ogg|wav)$/)
    soundsContext.keys().forEach((key) => {
      const newKey = `${key}`.substring(2)
      const soundSrc = require('../../sounds/' + newKey)
      this.ressourcesList.push({
        name: key.substring(2, key.length - (key.length - newKey.lastIndexOf('.') - 2)),
        src: soundSrc.default,
        type: 'sound',
        optional: true,
      })
    })

    this.ressourcesList.forEach((ressource) => {
      ressource.optional = isOptionalAsset(ressource)
      this.tracker.add(ressource.name, { optional: ressource.optional })
    })

    if (this.ressourcesList.length > 0) {
      this.mountLoader()
      this.loadRessources(this.ressourcesList)
    } else {
      this.trigger('ressourcesReady')
    }
  }
  mountLoader() {
    this.loaderHost = mountLoaderTemplate(this.template)
    this.loadDiv = document.querySelector('.loaderScreen')
    this.loadModels = this.loadDiv.querySelector('.loaderScreen__load')
    this.progressBar = this.loadDiv.querySelectorAll('.loaderScreen__progress')
    this.retryButton = this.loadDiv.querySelector('.loaderScreen__retry')
    this.status = this.loadDiv.querySelector('.loaderScreen__status')
    if (this.retryButton) {
      this.retryButton.addEventListener('click', () => {
        this.retryFailed()
      })
    }
  }
  loadRessources(ressources) {
    ressources.forEach((ressource) => {
      const ressourceExtension =
        ressource.src.substring(ressource.src.lastIndexOf('.') + 1, ressource.src.length) ||
        ressource.src
      if (!ressourceExtension) {
        this.loadError(ressource, new Error('Invalid ressource'))
        return
      }
      const loader = this.loaders.find(($loader) =>
        $loader.filetype.find(($filetype) => $filetype === ressourceExtension)
      )
      if (!loader) {
        this.loadError(ressource, new Error(`No loader is set for ${ressourceExtension}`))
        return
      }
      loader.action(ressource)
    })
  }
  loadComplete(ressource, loaded) {
    this.createNestedObject(this[`${ressource.type}s`], ressource.name.split('/'), loaded)
    this.tracker.succeed(ressource.name)
  }
  loadError(ressource, error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[Three template] failed to load ${ressource.name}`, error)
    }
    this.tracker.fail(ressource.name, error)
  }
  updateProgress(snapshot) {
    if (!this.loadModels) return
    const label = `${snapshot.percent}%`
    this.loadModels.textContent = label
    this.progressBar.forEach((el) => {
      el.style.width = `${snapshot.percent}%`
    })
  }
  showFailure() {
    if (this.status) {
      this.status.hidden = false
      this.status.textContent = 'Failed to load a required asset.'
    }
    if (this.retryButton) this.retryButton.hidden = false
  }
  hideLoader() {
    if (!this.loadDiv) return
    this.loadDiv.style.opacity = 0
    setTimeout(() => {
      if (this.loadDiv) this.loadDiv.remove()
    }, 550)
  }
  retryFailed() {
    this._criticalSettled = false
    if (this.retryButton) this.retryButton.hidden = true
    if (this.status) this.status.textContent = 'Retrying…'
    const failedNames = this.tracker
      .getSnapshot()
      .items.filter(
        (item) => item.status === 'FAILED' || item.status === 'OPTIONAL_FAILED'
      )
      .map((item) => item.name)
    this.tracker.resetFailed()
    this.loadRessources(
      this.ressourcesList.filter((ressource) => failedNames.includes(ressource.name))
    )
  }
  createNestedObject(base, names, value) {
    let lastName = arguments.length === 3 ? names.pop() : false
    for (let i = 0; i < names.length; i++) {
      base = base[names[i]] = base[names[i]] || {}
    }
    if (lastName) base = base[lastName] = value
    return base
  }
}
