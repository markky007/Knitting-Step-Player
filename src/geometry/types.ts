// Pure TypeScript Geometry Types (Zero Three.js / Vue / Quasar dependencies)

export interface StitchLayout {
  partId: string
  totalStitches: number
  /**
   * Float32Array of 4x4 transformation matrices in column-major order.
   * Total length = totalStitches * 16
   */
  matrices: Float32Array
  /**
   * Starting stitch instance index for each step. Length = numSteps + 1
   * Step i instances occupy indices [stepOffsets[i], stepOffsets[i + 1])
   */
  stepOffsets: Uint32Array
  stepIds: string[]
  yarnIds: string[]
}

export interface PartPlacementTransform {
  position: [number, number, number]
  rotation: [number, number, number]
}
