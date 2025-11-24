#include "common.hpp"
#include "compare.hpp"
#include "copy.hpp"
#include "create_directory.hpp"
#include "create_file.hpp"
#include "create_symlink.hpp"
#include "exists.hpp"
#include "get_archive.hpp"
#include "get_attribute.hpp"
#include "get_directory.hpp"
#include "get_entry.hpp"
#include "get_icon.hpp"
#include "get_path_attribute.hpp"
#include "get_volume.hpp"
#include "is_elevated.hpp"
#include "move.hpp"
#include "move_to_trash.hpp"
#include "open_properties.hpp"
#include "watch.hpp"

void cleanup(void* arg)
{
	#if OS_WIN64 && !defined(ELECTRON_BUILD)
		CoUninitialize();
	#endif
}

void init(v8::Local<v8::Object> exports, v8::Local<v8::Value> module, void* context)
{
	node::AddEnvironmentCleanupHook(ISOLATE, cleanup, NULL);

	#if OS_WIN64 && !defined(ELECTRON_BUILD)
		CoInitializeEx(NULL, COINIT_MULTITHREADED);
	#endif

	#if OS_WIN64
		setlocale(LC_CTYPE, ".UTF-8");
	#elif OS_MAC64
		setlocale(LC_CTYPE, "C.UTF-8");
	#endif

	NODE_SET_METHOD(exports, "compare", compare);
	NODE_SET_METHOD(exports, "copy", copy);
	NODE_SET_METHOD(exports, "createDirectory", create_directory);
	NODE_SET_METHOD(exports, "createFile", create_file);
	NODE_SET_METHOD(exports, "createSymlink", create_symlink);
	NODE_SET_METHOD(exports, "exists", exists);
	NODE_SET_METHOD(exports, "getAttribute", get_attribute);
	NODE_SET_METHOD(exports, "getDirectory", get_directory);
	NODE_SET_METHOD(exports, "getIcon", get_icon);
	NODE_SET_METHOD(exports, "getPathAttribute", get_path_attribute);
	NODE_SET_METHOD(exports, "getVolume", get_volume);
	NODE_SET_METHOD(exports, "isElevated", is_elevated);
	NODE_SET_METHOD(exports, "move", move);
	NODE_SET_METHOD(exports, "moveToTrash", move_to_trash);
	NODE_SET_METHOD(exports, "openProperties", open_properties);
	NODE_SET_METHOD(exports, "watch", watch);
	NODE_SET_METHOD(exports, "unwatch", unwatch);
}

NODE_MODULE(native, init)

// delay load hook
#if OS_WIN64
#include <delayimp.h>
#include <windows.h>
static FARPROC WINAPI delay_load_hook(unsigned dliNotify, PDelayLoadInfo pdli) {
	if (dliNotify != dliNotePreLoadLibrary) {
		return NULL;
	}
	if (_stricmp(pdli->szDll, "node.exe") != 0) {
		return NULL;
	}
	return (FARPROC)GetModuleHandle(NULL);
}
decltype(__pfnDliNotifyHook2) __pfnDliNotifyHook2 = delay_load_hook;
#endif // OS_WIN64
