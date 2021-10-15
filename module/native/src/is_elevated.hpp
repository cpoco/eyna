#ifndef NATIVE_IS_ELEVATED
#define NATIVE_IS_ELEVATED

#include "common.hpp"

void is_elevated(const v8::FunctionCallbackInfo<v8::Value>& info)
{
	if (info.Length() != 0) {
		info.GetReturnValue().Set(v8::Boolean::New(ISOLATE, false));
		return;
	}

	bool elevated = false;

	#if BOOST_OS_WINDOWS
		HANDLE handle = NULL;
		TOKEN_ELEVATION elevation;
		DWORD cb;
		if (OpenProcessToken(GetCurrentProcess(), TOKEN_QUERY, &handle)) {
			if (handle != NULL) {
				if (GetTokenInformation(handle, TokenElevation, &elevation, sizeof(elevation), &cb)) {
					elevated = elevation.TokenIsElevated;
				}
				CloseHandle(handle);
			}
		}
	#elif BOOST_OS_MACOS
		elevated = geteuid() == 0;
	#endif

	info.GetReturnValue().Set(v8::Boolean::New(ISOLATE, elevated));
}

#endif // include guard
