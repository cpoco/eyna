#ifndef NATIVE_OPEN_PROPERTIES
#define NATIVE_OPEN_PROPERTIES

#include "common.hpp"

void open_properties(const v8::FunctionCallbackInfo<v8::Value>& info)
{
	if (info.Length() != 1 || !info[0]->IsString()) {
		return;
	}

	boost::filesystem::path abst = boost::filesystem::path(to_string(info[0]->ToString(CONTEXT).ToLocalChecked()));

	#if BOOST_OS_WINDOWS

		SHObjectProperties(NULL, SHOP_FILEPATH, abst.make_preferred().c_str(), NULL);

	#elif BOOST_OS_MACOS

		NSPasteboard* pboard = [NSPasteboard pasteboardWithUniqueName];
		[pboard declareTypes:@[NSPasteboardTypeString] owner:nil];
		[pboard setString:[NSString stringWithCString:abst.c_str() encoding:NSUTF8StringEncoding] forType:NSPasteboardTypeString];

		NSPerformService(@"Finder/Show Info", pboard);

	#endif
}

#endif // include guard
