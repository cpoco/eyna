#ifndef NATIVE_COMMON
#define NATIVE_COMMON

#if defined(_WIN64)
	#define _OS_WIN_ 1
#elif defined(__APPLE__) && defined(__MACH__)
	#define _OS_MAC_ 1
#else
	#error "unsupported os"
#endif

#include <filesystem>
#include <fstream>
#include <map>
#include <regex>
#include <string>

#include <node.h>
#include <node_buffer.h>
#include <uv.h>

#if _OS_WIN_
	#include <windows.h>
	#include <shlobj.h>
	#include <commoncontrols.h>
	#include <wincodec.h>
#elif _OS_MAC_
	#import <AppKit/AppKit.h>
	#include <unistd.h>
#endif

#define ISOLATE v8::Isolate::GetCurrent()
#define CONTEXT v8::Isolate::GetCurrent()->GetCurrentContext()

#if _OS_WIN_
	#define V(s)                        L ## s
	typedef wchar_t                     _char_t;
	typedef std::basic_string<_char_t>  _string_t;
	typedef std::basic_regex<_char_t>   _regex_t;
#elif _OS_MAC_
	#define V(s)                        s
	typedef char                        _char_t;
	typedef std::basic_string<_char_t>  _string_t;
	typedef std::basic_regex<_char_t>   _regex_t;
#endif

#define ERROR_INVALID_ARGUMENT V("invalid argument")
#define ERROR_INVALID_PATH     V("relative or traversal paths are not allowed")
#define ERROR_FAILED           V("failed")

/*
std::basic_string<char> string_to_char(const _string_t& str)
{
	#if _OS_WIN_
		int len = WideCharToMultiByte(CP_UTF8, 0, str.c_str(), str.length(), nullptr, 0, NULL, NULL);
		std::basic_string<char> buff(len, '\0');
		WideCharToMultiByte(CP_UTF8, 0, str.c_str(), str.length(), &buff[0], len, NULL, NULL);
		return buff;
	#elif _OS_MAC_
		return str;
	#endif
}

_string_t char_to_string(const std::basic_string<char>& str)
{
	#if _OS_WIN_
		int len = MultiByteToWideChar(CP_UTF8, 0, str.c_str(), str.length(), nullptr, 0);
		std::basic_string<wchar_t> buff(len, '\0');
		MultiByteToWideChar(CP_UTF8, 0, str.c_str(), str.length(), &buff[0], len);
		return buff;
	#elif _OS_MAC_
		return str;
	#endif
}
*/

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

bool is_relative(const std::filesystem::path& path)
{
	return !path.is_absolute();
}

bool is_traversal(const std::filesystem::path& path)
{
	for (const std::filesystem::path& p : path) {
		if (p == "." || p == "..") {
			return true;
		}
	}
	return false;
}

std::filesystem::path generic_path(const std::filesystem::path& path, const bool normalize = false)
{
	std::filesystem::path p(normalize
		? path.lexically_normal().generic_string<_char_t>()
		: path.generic_string<_char_t>()
	);
	if (p.has_filename()) {
		return p;
	}
	return std::filesystem::path(p.parent_path().generic_string<_char_t>());
}

#include "common_attribute.hpp"

#endif // include guard
