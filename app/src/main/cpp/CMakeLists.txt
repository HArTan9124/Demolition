cmake_minimum_required(VERSION 3.10)

project(llama-jni)

add_library(llama SHARED IMPORTED)
set_target_properties(llama PROPERTIES IMPORTED_LOCATION
        ${CMAKE_SOURCE_DIR}/src/main/jniLibs/arm64-v8a/libllama.so)

add_library(llama_jni SHARED
        src/main/cpp/llama_jni.cpp
)


find_library(log-lib log)

target_link_libraries(
        llama_jni
        llama
        ggml
        ggml-base
        ggml-cpu
)
