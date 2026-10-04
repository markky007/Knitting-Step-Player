import * as THREE from 'three'

/**
 * Creates a low-poly rounded pebble/capsule stitch geometry (<= 100 triangles)
 * shared by all stitch instanced meshes.
 */
export function createStitchGeometry(): THREE.BufferGeometry {
  // Capsule with radius 0.3, length 0.3, 2 cap segments, 6 radial segments
  // Total triangles: ~50-60, smooth rounded stitch look
  const geom = new THREE.CapsuleGeometry(0.28, 0.32, 2, 6)
  geom.computeVertexNormals()
  return geom
}
