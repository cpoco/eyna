#ifndef NATIVE_COMMON
#define NATIVE_COMMON

#if defined(_WIN64)
	#define OS_WIN64 1
#elif defined(__APPLE__) && defined(__MACH__)
	#define OS_MAC64 1
#else
	#error "unsupported os"
#endif

#include <filesystem>
#include <fstream>
#include <map>
#include <regex>
#include <string>
//#include <thread>
//#include <mutex>
//#include <queue>

#include <node.h>
#include <node_buffer.h>
#include <uv.h>

#include <archive.h>
#include <archive_entry.h>

#if OS_WIN64
	#include <windows.h>
	#include <shlobj.h>
	#include <commoncontrols.h>
	#include <wincodec.h>
#elif OS_MAC64
	#import <AppKit/AppKit.h>
	#include <unistd.h>
#endif

#define ISOLATE v8::Isolate::GetCurrent()
#define CONTEXT v8::Isolate::GetCurrent()->GetCurrentContext()

#if OS_WIN64
	static_assert( sizeof(wchar_t) ==  sizeof(uint16_t), "wchar_t and uint16_t must have same size");
	static_assert(alignof(wchar_t) == alignof(uint16_t), "wchar_t and uint16_t must have same alignment");
#endif

#if OS_WIN64
	#define V(s)                        L ## s
	typedef wchar_t                     _char_t;
	typedef std::basic_string<_char_t>  _string_t;
	typedef std::basic_regex<_char_t>   _regex_t;
#elif OS_MAC64
	#define V(s)                        s
	typedef char                        _char_t;
	typedef std::basic_string<_char_t>  _string_t;
	typedef std::basic_regex<_char_t>   _regex_t;
#endif

#define ERROR_INVALID_ARGUMENT V("invalid argument")
#define ERROR_INVALID_PATH     V("relative or traversal paths are not allowed")
#define ERROR_INVALID_T_PATH   V("traversal paths not allowed")
#define ERROR_FAILED           V("failed")

_string_t to_string(const v8::Local<v8::String>& str)
{
	#if OS_WIN64
		size_t size = str->Length();
		if (size == 0) {
			return _string_t();
		}
		_string_t buff(size, '\0');
		str->WriteV2(ISOLATE, 0, buff.size(), (uint16_t*)&buff[0]);
		return buff;
	#elif OS_MAC64
		size_t size = str->Utf8LengthV2(ISOLATE);
		if (size == 0) {
			return _string_t();
		}
		_string_t buff(size, '\0');
		str->WriteUtf8V2(ISOLATE, &buff[0], buff.size());
		return buff;
	#endif
}

v8::Local<v8::String> to_string(const _string_t& str)
{
	#if OS_WIN64
		return v8::String::NewFromTwoByte(ISOLATE, (uint16_t*)str.c_str()).ToLocalChecked();
	#elif OS_MAC64
		return v8::String::NewFromUtf8(ISOLATE, str.c_str()).ToLocalChecked();
	#endif
}

v8::Local<v8::String> c_string(const std::basic_string<char>& str)
{
	return v8::String::NewFromUtf8(ISOLATE, str.c_str()).ToLocalChecked();
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
// OS_WIN64
_putws(generic_path(V("C:/path/dir")).c_str());     // C:/path/dir
_putws(generic_path(V("C:/path/dir/")).c_str());    // C:/path/dir
_putws(generic_path(V("C:\\path\\dir")).c_str());   // C:/path/dir
_putws(generic_path(V("C:\\path\\dir\\")).c_str()); // C:/path/dir
// OS_MAC64
puts(generic_path(V("/path/dir")).c_str());         // /path/dir
puts(generic_path(V("/path/dir/")).c_str());        // /path/dir
*/

std::filesystem::path generic_path(const std::filesystem::path& path, const bool normalize = false, const bool keep_trailing_slash = false)
{
	std::filesystem::path p(normalize
		? path.lexically_normal().generic_string<_char_t>()
		: path.generic_string<_char_t>()
	);
	if (keep_trailing_slash || p.has_filename()) {
		return p;
	}
	return std::filesystem::path(p.parent_path().generic_string<_char_t>());
}

bool compare_path(int depth, const std::filesystem::path& a, const std::filesystem::path& b)
{
	if (depth <= 0) {
		return true;
	}

	std::filesystem::path::iterator ita = a.begin();
	std::filesystem::path::iterator itb = b.begin();
	const std::filesystem::path::const_iterator enda = a.end();
	const std::filesystem::path::const_iterator endb = b.end();

	for (int i = 0; i < depth; i++) {
		if (ita == enda || itb == endb) {
			return false;
		}
		if (*ita != *itb) {
			return false;
		}
		++ita;
		++itb;
	}
	return true;
}

#include "common_attribute.hpp"

#endif // include guard
