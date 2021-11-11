#ifndef NATIVE_COMMON
#define NATIVE_COMMON

#include <string>
#include <filesystem>
#include <regex>

#include <node.h>
#include <uv.h>

#if defined(_WIN64)
	#define _OS_WIN_ 1
#elif defined(__APPLE__) && defined(__MACH__)
	#define _OS_MAC_ 1
#else
	#error "unsupported os"
#endif

#define ISOLATE v8::Isolate::GetCurrent()
#define CONTEXT v8::Isolate::GetCurrent()->GetCurrentContext()

#if _OS_WIN_
	#include <windows.h>
	#include <shlobj.h>
#elif _OS_MAC_
	#import <AppKit/AppKit.h>
	#include <unistd.h>
#endif

#if _OS_WIN_
	#define V(s)						L ## s
	typedef wchar_t						_char_t;
	typedef std::basic_string<_char_t>	_string_t;
	typedef std::basic_regex<_char_t>	_regex_t;
#elif _OS_MAC_
	#define V(s)						s
	typedef char						_char_t;
	typedef std::basic_string<_char_t>	_string_t;
	typedef std::basic_regex<_char_t>	_regex_t;
#endif

_string_t to_string(const v8::Local<v8::String>& str)
{
	#if _OS_WIN_
		_string_t buff(str->Length(), '\0');
		str->Write(ISOLATE, (uint16_t*)&buff[0], 0, -1, v8::String::NO_NULL_TERMINATION);
		return buff;
	#elif _OS_MAC_
		_string_t buff(str->Utf8Length(ISOLATE), '\0');
		str->WriteUtf8(ISOLATE, &buff[0], -1, nullptr, v8::String::NO_NULL_TERMINATION);
		return buff;
	#endif
}

v8::Local<v8::String> to_string(const _string_t& str)
{
	#if _OS_WIN_
		return v8::String::NewFromTwoByte(ISOLATE, (uint16_t*)str.c_str()).ToLocalChecked();
	#elif _OS_MAC_
		return v8::String::NewFromUtf8(ISOLATE, str.c_str()).ToLocalChecked();
	#endif
}

std::filesystem::path generic_path(const std::filesystem::path& path)
{
	return std::filesystem::path(path.generic_string<_char_t>());
}

#include "common_attribute.hpp"

#endif // include guard
