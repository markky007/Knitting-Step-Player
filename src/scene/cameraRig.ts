import * as THREE from 'three'
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export interface CameraTransition {
  startTime: number
  duration: number
  startPosition: THREE.Vector3
  targetPosition: THREE.Vector3
  startTarget: THREE.Vector3
  targetLookAt: THREE.Vector3
}

export class CameraRig {
  private camera: THREE.PerspectiveCamera
  private controls: OrbitControls
  private transition: CameraTransition | null = null
  private isUserInteracting = false
  private autoFocusPaused = false

  constructor(camera: THREE.PerspectiveCamera, controls: OrbitControls) {
    this.camera = camera
    this.controls = controls

    this.controls.addEventListener('start', () => {
      this.isUserInteracting = true
      this.autoFocusPaused = true
      this.transition = null
    })

    this.controls.addEventListener('end', () => {
      this.isUserInteracting = false
    })
  }

  public onStepChange(): void {
    // Re-enable auto-focus on next step change
    this.autoFocusPaused = false
  }

  public frameBounds(
    targetCenter: THREE.Vector3,
    radius: number,
    duration = 300
  ): void {
    if (this.autoFocusPaused || this.isUserInteracting) return

    const fov = (this.camera.fov * Math.PI) / 180
    const distance = Math.max(radius / Math.sin(fov / 2), 6.0)

    // Current camera direction
    const currentDir = new THREE.Vector3()
      .subVectors(this.camera.position, this.controls.target)
      .normalize()
    if (currentDir.lengthSq() < 0.1) currentDir.set(0, 0.5, 1).normalize()

    const targetCamPos = new THREE.Vector3()
      .copy(targetCenter)
      .addScaledVector(currentDir, distance)

    this.transition = {
      startTime: performance.now(),
      duration,
      startPosition: this.camera.position.clone(),
      targetPosition: targetCamPos,
      startTarget: this.controls.target.clone(),
      targetLookAt: targetCenter.clone()
    }
  }

  public resetCamera(center = new THREE.Vector3(0, 2, 0), distance = 16): void {
    this.transition = null
    this.autoFocusPaused = false

    this.camera.position.set(0, center.y + distance * 0.4, distance)
    this.controls.target.copy(center)
    this.controls.update()
  }

  public update(): boolean {
    if (!this.transition) {
      this.controls.update()
      return false
    }

    const elapsed = performance.now() - this.transition.startTime
    const progress = Math.min(elapsed / this.transition.duration, 1.0)
    // Cubic ease out
    const ease = 1 - Math.pow(1 - progress, 3)

    this.camera.position.lerpVectors(
      this.transition.startPosition,
      this.transition.targetPosition,
      ease
    )
    this.controls.target.lerpVectors(
      this.transition.startTarget,
      this.transition.targetLookAt,
      ease
    )
    this.controls.update()

    if (progress >= 1.0) {
      this.transition = null
      return false
    }

    return true // Still animating
  }

  public dispose(): void {
    this.controls.dispose()
  }
}
