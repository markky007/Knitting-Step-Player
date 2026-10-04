import { ref, onMounted, onUnmounted, type Ref } from 'vue'
import type { Pattern, PatternAnalysis } from '../domain/types'
import type { StitchLayout } from '../geometry/types'
import { buildPatternLayouts, computeAssemblyTransforms } from '../geometry/assembly'
import { createStitchGeometry } from './stitchGeometry'
import { computeHighlightRange, applyInstanceColors, getCssVariable } from './highlight'
import { CameraRig } from './cameraRig'

export const MAX_STITCHES_PER_SCENE = 20000

export interface SceneState {
  isSupported: boolean
  isLoading: boolean
  isExceedingLimit: boolean
  errorMessage: string | null
}

export function useStitchScene(
  containerRef: Ref<HTMLElement | null>,
  pattern: Ref<Pattern | null>,
  analysis: Ref<PatternAnalysis | null>,
  partIndex: Ref<number>,
  stepIndex: Ref<number>,
  iteration: Ref<number | null>,
  viewMode: Ref<'steps' | 'assembly' | 'complete'>,
  enableAnimation: Ref<boolean>,
  enableAutoFocus: Ref<boolean>
) {
  const sceneState = ref<SceneState>({
    isSupported: true,
    isLoading: true,
    isExceedingLimit: false,
    errorMessage: null
  })

  let threeModule: typeof import('three') | null = null
  let orbitControlsModule: typeof import('three/examples/jsm/controls/OrbitControls.js') | null = null

  let renderer: import('three').WebGLRenderer | null = null
  let scene: import('three').Scene | null = null
  let camera: import('three').PerspectiveCamera | null = null
  let cameraRig: CameraRig | null = null
  let stitchGeometry: import('three').BufferGeometry | null = null
  let sharedMaterial: import('three').MeshStandardMaterial | null = null

  const meshesByPart = new Map<string, import('three').InstancedMesh>()
  const layoutsByPart = new Map<string, StitchLayout>()
  const yarnsMap = new Map<string, string>()

  let animationFrameId: number | null = null
  let isDirty = true
  let animationStartTime: number | null = null
  const ANIMATION_DURATION = 400

  function markDirty() {
    isDirty = true
    if (!animationFrameId) {
      animationFrameId = requestAnimationFrame(renderLoop)
    }
  }

  function renderLoop() {
    animationFrameId = null

    if (!renderer || !scene || !camera) return

    let needsNextFrame = false

    // Update camera transitions
    if (cameraRig) {
      const isRigAnimating = cameraRig.update()
      if (isRigAnimating) needsNextFrame = true
    }

    // Step-in animation progress
    if (animationStartTime !== null) {
      const elapsed = performance.now() - animationStartTime
      const progress = Math.min(elapsed / ANIMATION_DURATION, 1.0)

      updateHighlightColors(progress)

      if (progress < 1.0) {
        needsNextFrame = true
      } else {
        animationStartTime = null
      }
    }

    renderer.render(scene, camera)

    if (needsNextFrame || isDirty) {
      isDirty = false
      animationFrameId = requestAnimationFrame(renderLoop)
    }
  }

  function updateHighlightColors(animationProgress = 1.0) {
    if (!threeModule || !pattern.value || !analysis.value) return

    const currentPart = pattern.value.parts[partIndex.value]
    if (!currentPart) return

    const layout = layoutsByPart.get(currentPart.id)
    const mesh = meshesByPart.get(currentPart.id)
    if (!layout || !mesh) return

    const stepAnalysis = analysis.value.parts[partIndex.value]?.steps[stepIndex.value]
    const repeatTotal = stepAnalysis?.repeatGroup?.repeat

    const range = computeHighlightRange(
      layout,
      stepIndex.value,
      iteration.value,
      repeatTotal
    )

    mesh.count = range.visibleCount

    const accentHex = getCssVariable('--kp-color-accent', '#F6F202')
    applyInstanceColors(
      mesh,
      layout,
      yarnsMap,
      range,
      accentHex,
      animationProgress
    )
  }

  async function initThree() {
    if (!containerRef.value) return

    try {
      sceneState.value.isLoading = true

      // Dynamic imports to keep initial bundle small
      threeModule = await import('three')
      orbitControlsModule = await import('three/examples/jsm/controls/OrbitControls.js')

      const THREE = threeModule
      const { OrbitControls } = orbitControlsModule

      const container = containerRef.value
      const width = container.clientWidth || 300
      const height = container.clientHeight || 300

      // Scene
      scene = new THREE.Scene()
      const surfaceColor = getCssVariable('--kp-color-surface', '#FFFFFF')
      scene.background = new THREE.Color(surfaceColor)

      // Camera
      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
      camera.position.set(0, 8, 18)

      // Renderer
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance'
      })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
      renderer.setSize(width, height)

      // WebGL Context Loss Handling
      renderer.domElement.addEventListener('webglcontextlost', (e) => {
        e.preventDefault()
        sceneState.value.errorMessage = 'WebGL context lost. Restoring...'
      })
      renderer.domElement.addEventListener('webglcontextrestored', () => {
        sceneState.value.errorMessage = null
        rebuildScene()
      })

      container.appendChild(renderer.domElement)

      // Controls & Rig
      const controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true
      controls.dampingFactor = 0.05
      controls.addEventListener('change', () => markDirty())

      cameraRig = new CameraRig(camera, controls)

      // Lighting
      const hemiLight = new THREE.HemisphereLight(0xffffff, 0xd0cfcd, 1.2)
      scene.add(hemiLight)

      const dirLight = new THREE.DirectionalLight(0xffffff, 1.0)
      dirLight.position.set(10, 20, 15)
      scene.add(dirLight)

      // Geometry & Material
      stitchGeometry = createStitchGeometry()
      sharedMaterial = new THREE.MeshStandardMaterial({
        roughness: 0.75,
        metalness: 0.1
      })

      window.addEventListener('resize', handleResize)

      sceneState.value.isLoading = false
      rebuildScene()
    } catch (err: unknown) {
      sceneState.value.isSupported = false
      sceneState.value.isLoading = false
      sceneState.value.errorMessage =
        err instanceof Error ? err.message : 'Failed to initialize WebGL'
    }
  }

  function handleResize() {
    if (!containerRef.value || !renderer || !camera) return
    const width = containerRef.value.clientWidth
    const height = containerRef.value.clientHeight
    if (width === 0 || height === 0) return

    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
    markDirty()
  }

  function rebuildScene() {
    if (!threeModule || !scene || !stitchGeometry || !sharedMaterial) return
    if (!pattern.value || !analysis.value) return

    const THREE = threeModule

    // Clear existing meshes
    for (const mesh of meshesByPart.values()) {
      scene.remove(mesh)
      mesh.dispose()
    }
    meshesByPart.clear()
    layoutsByPart.clear()
    yarnsMap.clear()

    // Populate yarn colors
    for (const yarn of pattern.value.materials.yarns) {
      yarnsMap.set(yarn.id, yarn.colorHex)
    }

    // Check stitch count safeguard
    const totalStitches = analysis.value.totalStitches
    if (totalStitches > MAX_STITCHES_PER_SCENE) {
      sceneState.value.isExceedingLimit = true
    } else {
      sceneState.value.isExceedingLimit = false
    }

    // Build pure geometry layouts
    const layouts = buildPatternLayouts(pattern.value, analysis.value)
    const assemblyTransforms = computeAssemblyTransforms(pattern.value, layouts)

    for (const [partId, layout] of layouts.entries()) {
      layoutsByPart.set(partId, layout)

      const mesh = new THREE.InstancedMesh(
        stitchGeometry,
        sharedMaterial,
        layout.totalStitches
      )

      // Upload transformation matrices
      const dummyMat = new THREE.Matrix4()
      for (let i = 0; i < layout.totalStitches; i++) {
        dummyMat.fromArray(layout.matrices, i * 16)
        mesh.setMatrixAt(i, dummyMat)
      }
      mesh.instanceMatrix.needsUpdate = true

      // Initialize instance colors buffer
      mesh.instanceColor = new THREE.InstancedBufferAttribute(
        new Float32Array(layout.totalStitches * 3),
        3
      )

      // Position according to assembly or origin
      const transform = assemblyTransforms.get(partId)
      if (transform && viewMode.value === 'assembly') {
        mesh.position.set(...transform.position)
        mesh.rotation.set(...transform.rotation)
      } else {
        mesh.position.set(0, 0, 0)
        mesh.rotation.set(0, 0, 0)
      }

      scene.add(mesh)
      meshesByPart.set(partId, mesh)
    }

    updateVisibilityAndFocus(true)
  }

  function updateVisibilityAndFocus(isInitialOrPartChange = false) {
    if (!pattern.value || !analysis.value || !threeModule) return

    const currentPart = pattern.value.parts[partIndex.value]
    if (!currentPart) return

    const isAssembly = viewMode.value === 'assembly'

    for (const [partId, mesh] of meshesByPart.entries()) {
      if (isAssembly) {
        mesh.visible = true
        mesh.count = layoutsByPart.get(partId)?.totalStitches ?? 0
      } else {
        mesh.visible = partId === currentPart.id
      }
    }

    if (cameraRig) {
      cameraRig.onStepChange()
    }

    // Check reduced motion preference
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (enableAnimation.value && !prefersReducedMotion && !isAssembly) {
      animationStartTime = performance.now()
    } else {
      animationStartTime = null
      updateHighlightColors(1.0)
    }

    // Auto focus framing
    if (cameraRig && enableAutoFocus.value && !isAssembly) {
      const layout = layoutsByPart.get(currentPart.id)
      if (layout) {
        const stepAnalysis = analysis.value.parts[partIndex.value]?.steps[stepIndex.value]
        const repeatTotal = stepAnalysis?.repeatGroup?.repeat
        const range = computeHighlightRange(
          layout,
          stepIndex.value,
          iteration.value,
          repeatTotal
        )

        // Calculate center of highlighted stitches
        const center = new threeModule.Vector3()
        let count = 0
        const tempMat = new threeModule.Matrix4()
        const tempPos = new threeModule.Vector3()

        for (let i = range.start; i < range.end; i++) {
          tempMat.fromArray(layout.matrices, i * 16)
          tempPos.setFromMatrixPosition(tempMat)
          center.add(tempPos)
          count++
        }

        if (count > 0) {
          center.divideScalar(count)
          const radius = Math.max(Math.sqrt(layout.totalStitches) * 0.4, 3.0)
          cameraRig.frameBounds(center, radius, isInitialOrPartChange ? 0 : 300)
        }
      }
    }

    markDirty()
  }

  function resetCamera() {
    if (cameraRig) {
      cameraRig.resetCamera()
      markDirty()
    }
  }

  onMounted(() => {
    initThree()
  })

  onUnmounted(() => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
    }
    window.removeEventListener('resize', handleResize)

    if (cameraRig) {
      cameraRig.dispose()
    }

    for (const mesh of meshesByPart.values()) {
      mesh.dispose()
    }
    meshesByPart.clear()

    if (stitchGeometry) stitchGeometry.dispose()
    if (sharedMaterial) sharedMaterial.dispose()
    if (renderer) {
      renderer.dispose()
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement)
      }
    }
  })

  return {
    sceneState,
    markDirty,
    rebuildScene,
    updateVisibilityAndFocus,
    resetCamera
  }
}
