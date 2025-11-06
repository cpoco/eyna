#ifndef NATIVE_OPEN_PROPERTIES
#define NATIVE_OPEN_PROPERTIES

#include "common.hpp"

void open_properties(const v8::FunctionCallbackInfo<v8::Value>& info)
{
	v8::HandleScope _(ISOLATE);

	if (info.Length() != 1 || !info[0]->IsString()) {
		info.GetReturnValue().Set(v8::Boolean::New(ISOLATE, false));
		return;
	}

	std::filesystem::path abst = generic_path(to_string(info[0].As<v8::String>()));
	if (is_relative(abst) || is_traversal(abst)) {
		info.GetReturnValue().Set(v8::Boolean::New(ISOLATE, false));
		return;
	}

	#if _OS_WIN_

		SHObjectProperties(NULL, SHOP_FILEPATH, abst.make_preferred().c_str(), NULL);

	#elif _OS_MAC_

		NSPasteboard* pboard = [NSPasteboard pasteboardWithUniqueName];
		[pboard declareTypes:@[NSPasteboardTypeString] owner:nil];
		[pboard setString:[NSString stringWithCString:abst.c_str() encoding:NSUTF8StringEncoding] forType:NSPasteboardTypeString];

		NSPerformService(@"Finder/Show Info", pboard);

	#endif

	info.GetReturnValue().Set(v8::Boolean::New(ISOLATE, true));
}

#endif // include guard
