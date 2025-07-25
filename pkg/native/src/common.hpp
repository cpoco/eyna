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
#include <stdio.h>
void _println(const _string_t& str)
{
	#if _OS_WIN_
		_putws(str.c_str());
	#elif _OS_MAC_
		puts(str.c_str());
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

int raw_exists(const std::filesystem::path& path)
{
	std::error_code ec;
	std::filesystem::file_status status = std::filesystem::symlink_status(path, ec);
	if (ec && ec != std::errc::no_such_file_or_directory) {
		return -1;
	}
	return status.type() != std::filesystem::file_type::not_found;
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

/*
// _OS_WIN_
_putws(generic_path(V("C:/path/dir")).c_str());     // C:/path/dir
_putws(generic_path(V("C:/path/dir/")).c_str());    // C:/path/dir
_putws(generic_path(V("C:\\path\\dir")).c_str());   // C:/path/dir
_putws(generic_path(V("C:\\path\\dir\\")).c_str()); // C:/path/dir
// _OS_MAC_
puts(generic_path(V("/path/dir")).c_str());         // /path/dir
puts(generic_path(V("/path/dir/")).c_str());        // /path/dir
*/
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
