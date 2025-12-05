package koboldcpp.android

import android.content.Context

/**
 * Mock object that imitates the real Kobold loader API.
 * Replace with the real SDK / native bridge later.
 */
object Kobold {

    /**
     * Mock loader - returns a stub KoboldModel. In real integration this should:
     *  - copy model from assets to filesDir (if needed)
     *  - call native loader or library to load the GGUF and return a model handle
     */
    fun load(context: Context, modelPath: String, threads: Int = 4, gpuLayers: Int = 0): KoboldModel {
        // In actual implementation you must ensure modelPath exists.
        return KoboldModel.fromPath(modelPath, threads, gpuLayers)
    }
}
