#ifndef NATIVE_SET_EXTE
#define NATIVE_SET_EXTE

#include "common.hpp"

void set_exte(const v8::FunctionCallbackInfo<v8::Value>& info)
{
	v8::HandleScope _(ISOLATE);

	if (info.Length() != 1 || !info[0]->IsArray()) {
		ISOLATE->ThrowException(to_string(ERROR_INVALID_ARGUMENT));
		return;
	}

	v8::Local<v8::Array> array = info[0].As<v8::Array>();

	multi_exte.clear();

	int length = array->Length();
	for (int i = 0; i < length; i++) {
		v8::Local<v8::Value> value = array->Get(CONTEXT, i).ToLocalChecked();
		if (value->IsString()) {
			multi_exte.push_back(to_string(value.As<v8::String>()));
		}
	}
}

#endif // include guard