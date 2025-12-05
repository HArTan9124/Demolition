#include <jni.h>
#include <string>
#include "llama.h"

extern "C" {

// ---------------------------
// loadModel(path) : Long
// ---------------------------
#include <jni.h>
#include <string>
#include "llama.h"

extern "C" {

// ---------------------------
// loadModel(path) : Long
// ---------------------------
JNIEXPORT jlong JNICALL
Java_com_example_demolition_ai_LlamaNative_loadModel(
        JNIEnv *env,
        jobject thiz,
        jstring jModelPath) {

    const char *path = env->GetStringUTFChars(jModelPath, 0);

    llama_model_params mparams = llama_model_default_params();
    llama_model *model = llama_load_model_from_file(path, mparams);

    env->ReleaseStringUTFChars(jModelPath, path);

    return (jlong) model;
}

// ---------------------------
// createContext(modelPtr) : Long
// ---------------------------
JNIEXPORT jlong JNICALL
Java_com_example_demolition_ai_LlamaNative_createContext(
        JNIEnv *env,
        jobject thiz,
        jlong modelPtr) {

    llama_context_params cparams = llama_context_default_params();
    cparams.n_ctx = 512;

    llama_context *ctx = llama_new_context_with_model((llama_model*) modelPtr, cparams);
    return (jlong) ctx;
}

// ---------------------------
// generateText(ctxPtr, prompt)
// ---------------------------
JNIEXPORT jstring JNICALL
Java_com_example_demolition_ai_LlamaNative_generateText(
        JNIEnv *env,
        jobject thiz,
        jlong ctxPtr,
        jstring jPrompt) {

    const char *prompt = env->GetStringUTFChars(jPrompt, 0);

    llama_context *ctx = (llama_context*) ctxPtr;

    // output buffer
    std::string out;

    // tokenize prompt
    std::vector<llama_token> tokens =
            llama_tokenize(ctx, prompt, true);

    llama_batch batch = llama_batch_init(tokens.size(), 0, 1);

    for (int i = 0; i < tokens.size(); i++) {
        batch.token[i] = tokens[i];
        batch.n_seq_id[i] = 0;
        batch.seq_id[i][0] = 0;
        batch.pos[i] = i;
    }

    llama_decode(ctx, batch);

    for (int i = 0; i < 50; i++) { // 50 tokens output
        int token = llama_sample_token_greedy(ctx);
        if (token == llama_token_eos()) break;

        out += llama_token_to_str(ctx, token);

        llama_batch b = llama_batch_init(1, 0, 1);
        b.token[0] = token;
        b.pos[0] = tokens.size() + i;
        b.n_seq_id[0] = 1;
        b.seq_id[0][0] = 0;
        llama_decode(ctx, b);
    }

    env->ReleaseStringUTFChars(jPrompt, prompt);

    return env->NewStringUTF(out.c_str());
}

// ---------------------------
// freeContext
// ---------------------------
JNIEXPORT void JNICALL
Java_com_example_demolition_ai_LlamaNative_freeContext(
        JNIEnv *env,
jobject thiz,
        jlong ctxPtr) {

llama_free((llama_context*) ctxPtr);
}

// ---------------------------
// freeModel
// ---------------------------
JNIEXPORT void JNICALL
Java_com_example_demolition_ai_LlamaNative_freeModel(
        JNIEnv *env,
jobject thiz,
        jlong modelPtr) {

llama_free_model((llama_model*) modelPtr);
}

}


// ---------------------------
// createContext(modelPtr) : Long
// ---------------------------
JNIEXPORT jlong JNICALL
Java_com_example_demolition_ai_LlamaNative_createContext(
        JNIEnv *env,
        jobject thiz,
        jlong modelPtr) {

    llama_context_params cparams = llama_context_default_params();
    cparams.n_ctx = 512;

    llama_context *ctx = llama_new_context_with_model((llama_model*) modelPtr, cparams);
    return (jlong) ctx;
}

// ---------------------------
// generateText(ctxPtr, prompt)
// ---------------------------
JNIEXPORT jstring JNICALL
Java_com_example_demolition_ai_LlamaNative_generateText(
        JNIEnv *env,
        jobject thiz,
        jlong ctxPtr,
        jstring jPrompt) {

    const char *prompt = env->GetStringUTFChars(jPrompt, 0);

    llama_context *ctx = (llama_context*) ctxPtr;

    // output buffer
    std::string out;

    // tokenize prompt
    std::vector<llama_token> tokens =
            llama_tokenize(ctx, prompt, true);

    llama_batch batch = llama_batch_init(tokens.size(), 0, 1);

    for (int i = 0; i < tokens.size(); i++) {
        batch.token[i] = tokens[i];
        batch.n_seq_id[i] = 0;
        batch.seq_id[i][0] = 0;
        batch.pos[i] = i;
    }

    llama_decode(ctx, batch);

    for (int i = 0; i < 50; i++) { // 50 tokens output
        int token = llama_sample_token_greedy(ctx);
        if (token == llama_token_eos()) break;

        out += llama_token_to_str(ctx, token);

        llama_batch b = llama_batch_init(1, 0, 1);
        b.token[0] = token;
        b.pos[0] = tokens.size() + i;
        b.n_seq_id[0] = 1;
        b.seq_id[0][0] = 0;
        llama_decode(ctx, b);
    }

    env->ReleaseStringUTFChars(jPrompt, prompt);

    return env->NewStringUTF(out.c_str());
}

// ---------------------------
// freeContext
// ---------------------------
JNIEXPORT void JNICALL
Java_com_example_demolition_ai_LlamaNative_freeContext(
        JNIEnv *env,
jobject thiz,
        jlong ctxPtr) {

llama_free((llama_context*) ctxPtr);
}

// ---------------------------
// freeModel
// ---------------------------
JNIEXPORT void JNICALL
Java_com_example_demolition_ai_LlamaNative_freeModel(
        JNIEnv *env,
jobject thiz,
        jlong modelPtr) {

llama_free_model((llama_model*) modelPtr);
}

}
