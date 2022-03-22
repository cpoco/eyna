#ifndef NATIVE_OPEN_PROPERTIES
#define NATIVE_OPEN_PROPERTIES

#include "common.hpp"

void open_properties(const v8::FunctionCallbackInfo<v8::Value>& info)
{
	v8::HandleScope _(ISOLATE);

	if (info.Length() != 1 || !info[0]->IsString()) {
		return;
	}

	std::filesystem::path abst = std::filesystem::path(to_string(info[0]->ToString(CONTEXT).ToLocalChecked()));

	#if _OS_WIN_

		SHObjectProperties(NULL, SHOP_FILEPATH, abst.make_preferred().c_str(), NULL);

	#elif _OS_MAC_

		NSPasteboard* pboard = [NSPasteboard pasteboardWithUniqueName];
		[pboard declareTypes:@[NSPasteboardTypeString] owner:nil];
		[pboard setString:[NSString stringWithCString:abst.c_str() encoding:NSUTF8StringEncoding] forType:NSPasteboardTypeString];

		NSPerformService(@"Finder/Show Info", pboard);

	#endif
}

#endif // include guard
