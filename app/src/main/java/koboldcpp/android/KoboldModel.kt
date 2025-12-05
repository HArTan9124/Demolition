package koboldcpp.android

/**
 * Mock/stub implementation so IDE & compile-time checks succeed.
 * Replace with real implementation when you integrate the native library.
 */
class KoboldModel private constructor() {

    companion object {
        // factory used by real API; leaving a stub so your code compiles
        fun fromPath(path: String, threads: Int = 4, gpuLayers: Int = 0): KoboldModel {
            // Not actually loading model — real implementation will load native model.
            return KoboldModel()
        }
    }

    /**
     * Synchronously generate text. Real implementation will run model inference.
     * Here we return a placeholder so UI can be developed.
     */
    fun generate(prompt: String, maxTokens: Int = 200, temperature: Float = 0.7f, topK: Int = 40): String {
        // simple deterministic stub to help UI testing
        return "MOCK-RESPONSE: I would answer: '${prompt.take(50)}' (stub)"
    }
}
