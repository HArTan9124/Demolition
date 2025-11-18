package com.example.demolition

import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel

class CustomAiViewModel : ViewModel() {

    val selectedAvatarId = MutableLiveData<String>()
    val selectedVoice = MutableLiveData<String>()
    val aiName = MutableLiveData<String>()

    fun reset() {
        selectedAvatarId.value = ""
        selectedVoice.value = ""
        aiName.value = ""
    }
}
