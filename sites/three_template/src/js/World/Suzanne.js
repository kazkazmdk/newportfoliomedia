import { Object3D } from 'three'
import gsap from 'gsap'

export default class Suzanne {
  constructor(options) {
    // Options
    this.assets = options.assets

    // Set up
    this.container = new Object3D()
    this.container.name = 'Suzanne'

    this.createSuzanne()
    gsap.ticker.add((time, deltaTime) => {this.setMovement(time, deltaTime)})
  }
  createSuzanne() {
    const model = this.assets.models && this.assets.models.suzanne
    if (!model || !model.scene) return
    this.suzanne = model.scene
    if (this.suzanne.children[0] && this.assets.textures && this.assets.textures.suzanne_texture) {
      this.suzanne.children[0].material.map = this.assets.textures.suzanne_texture
    }
    this.container.add(this.suzanne)
  }
  setMovement(time, deltaTime) {
    if (!this.suzanne) return
    this.suzanne.rotation.y += 0.001 * deltaTime
  }
}
