#include "common.hpp"
#include "copy.hpp"
#include "create_directory.hpp"
#include "exists.hpp"
#include "get_attribute.hpp"
#include "get_directory.hpp"
#include "get_directory_size.hpp"
#include "get_volume.hpp"
#include "is_elevated.hpp"
#include "move.hpp"
#include "move_to_trash.hpp"
#include "open_properties.hpp"
#include "resolve.hpp"
#include "watch.hpp"

// void cleanup(void* arg)
// {
// }

void init(v8::Local<v8::Object> exports)
{
	// node::AddEnvironmentCleanupHook(ISOLATE, cleanup, NULL);

	NODE_SET_METHOD(exports, "copy", copy);
	NODE_SET_METHOD(exports, "createDirectory", create_directory);
	NODE_SET_METHOD(exports, "exists", exists);
	NODE_SET_METHOD(exports, "getAttribute", get_attribute);
	NODE_SET_METHOD(exports, "getDirectory", get_directory);
	NODE_SET_METHOD(exports, "getDirectorySize", get_directory_size);
	NODE_SET_METHOD(exports, "getVolume", get_volume);
	NODE_SET_METHOD(exports, "isElevated", is_elevated);
	NODE_SET_METHOD(exports, "move", move);
	NODE_SET_METHOD(exports, "moveToTrash", move_to_trash);
	NODE_SET_METHOD(exports, "openProperties", open_properties);
	NODE_SET_METHOD(exports, "resolve", resolve);
	NODE_SET_METHOD(exports, "watch", watch);
	NODE_SET_METHOD(exports, "unwatch", unwatch);
}

NODE_MODULE(native, init)
