#ifndef NATIVE_COMMON
#define NATIVE_COMMON

#include <string>
#include <regex>

#include <node.h>
#include <uv.h>

#include <boost/predef.h>
#include <boost/filesystem.hpp>

#define ISOLATE v8::Isolate::GetCurrent()
#define CONTEXT v8::Isolate::GetCurrent()->GetCurrentContext()

#if BOOST_OS_WINDOWS
	#include <windows.h>
	#include <shlobj.h>
	// #include <wrl/client.h>
#elif BOOST_OS_MACOS
	#import <AppKit/AppKit.h>
	#include <unistd.h>
#endif

#if BOOST_OS_WINDOWS
	#define V(s)						L ## s
	typedef wchar_t						_char_t;
	typedef std::basic_string<_char_t>	_string_t;
	typedef std::basic_regex<_char_t>	_regex_t;
#elif BOOST_OS_MACOS
	#define V(s)						s
	typedef char						_char_t;
	typedef std::basic_string<_char_t>	_string_t;
	typedef std::basic_regex<_char_t>	_regex_t;
#endif

_string_t to_string(const v8::Local<v8::String>& str)
{
	#if BOOST_OS_WINDOWS
		_string_t buff(str->Length(), '\0');
		str->Write(ISOLATE, (uint16_t*)&buff[0], 0, -1, v8::String::NO_NULL_TERMINATION);
		return buff;
	#elif BOOST_OS_MACOS
		_string_t buff(str->Utf8Length(ISOLATE), '\0');
		str->WriteUtf8(ISOLATE, &buff[0], -1, nullptr, v8::String::NO_NULL_TERMINATION);
		return buff;
	#endif
}

v8::Local<v8::String> to_string(const _string_t& str)
{
	#if BOOST_OS_WINDOWS
		return v8::String::NewFromTwoByte(ISOLATE, (uint16_t*)str.c_str()).ToLocalChecked();
	#elif BOOST_OS_MACOS
		return v8::String::NewFromUtf8(ISOLATE, str.c_str()).ToLocalChecked();
	#endif
}

v8::Local<v8::String> path_to_string(const boost::filesystem::path& path)
{
	#if BOOST_OS_WINDOWS
		return v8::String::NewFromTwoByte(ISOLATE, (uint16_t*)path.c_str()).ToLocalChecked();
	#elif BOOST_OS_MACOS
		return v8::String::NewFromUtf8(ISOLATE, path.c_str()).ToLocalChecked();
	#endif
}

#include "common_attribute.hpp"
#include "common_path.hpp"

#endif // include guard
