export const cameraPosition: [number, number, number] = [0, 1.5, 6];
export const cameraFov = 45;

/**
 * Where GLTFLoader fetches the Draco decoder (wasm/js) from.
 *
 * The current `/models/hero.glb` is NOT Draco-compressed, but registering a
 * DRACOLoader is harmless: three's GLTFLoader only invokes the decoder for
 * primitives that declare the `KHR_draco_mesh_compression` extension, and
 * DRACOLoader spins up its worker lazily on first use. Wiring it now means a
 * Draco-compressed re-export can be dropped in at the same path with no code
 * change. Hosted on gstatic rather than self-hosted because this project keeps
 * no third-party binaries in `public/` and self-hosting would need extra build
 * wiring to copy the decoder out of `node_modules`.
 */
export const dracoDecoderPath = 'https://www.gstatic.com/draco/v1/decoders/';
