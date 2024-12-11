#ifndef NATIVE_WATCH
#define NATIVE_WATCH

#include "common.hpp"

// http://docs.libuv.org/en/v1.x/handle.html
// http://docs.libuv.org/en/v1.x/fs_event.html

class _watch_map
{
	struct _data
	{
		uv_fs_event_t* event;
		int32_t id;
		std::filesystem::path path; // generic_path
		v8::Persistent<v8::Function> callback;
	};

	std::map<int32_t, _data*> map;

public:

	~_watch_map()
	{
		for (auto& [key, data] : map) {
			uv_close((uv_handle_t*)data->event, &_watch_map::release);
		}
	}

	void add(const int32_t _id, const std::filesystem::path& _path, const v8::Local<v8::Function>& _callback)
	{
		if (map.count(_id) != 0) {
			remove(_id);
		}

		v8::HandleScope _(ISOLATE);

		_data* data = new _data();

		map.insert(std::make_pair(_id, data));

		data->event = new uv_fs_event_t();
		data->event->data = data;
		data->id = _id;
		data->path = _path;
		data->callback.Reset(ISOLATE, _callback);
	
		uv_fs_event_init(uv_default_loop(), data->event);
		uv_fs_event_start(data->event, &_watch_map::callback, (const char*)data->path.u8string().c_str(), UV_FS_EVENT_RECURSIVE);
	}

	void remove(const int32_t _id)
	{
		if (map.count(_id) == 0) {
			return;
		}

		_data* data = map.at(_id);

		map.erase(_id);

		uv_fs_event_stop(data->event);

		uv_close((uv_handle_t*)data->event, &_watch_map::release);
	}

	// uv_fs_event_cb
	static void callback(uv_fs_event_t* _event, const char* _filename, int _events, int _status)
	{
		v8::HandleScope _(ISOLATE);

		_data* data = static_cast<_data*>(_event->data);

		if (_event != data->event || _filename == nullptr) {
			return;
		}

		std::basic_string<char8_t> filename((char8_t*)_filename);
		#if _OS_WIN_
		int depth = std::count(filename.cbegin(), filename.cend(), u8'\\');
		#elif _OS_MAC_
		int depth = std::count(filename.cbegin(), filename.cend(), u8'/');
		#endif

		const int argc = 3;
		v8::Local<v8::Value> argv[argc] = {
			v8::Number::New(ISOLATE, data->id),
			v8::Number::New(ISOLATE, depth),
			to_string(generic_path(data->path / filename))
		};
		data->callback.Get(ISOLATE)->Call(CONTEXT, v8::Undefined(ISOLATE), argc, argv);
	}

	// uv_close_cb
	static void release(uv_handle_t* _event)
	{
		_data* data = static_cast<_data*>(_event->data);

		data->callback.Reset();
		delete data->event;
		delete data;
	}

} watch_map = _watch_map();

void watch(const v8::FunctionCallbackInfo<v8::Value>& info)
{
	v8::HandleScope _(ISOLATE);

	if (info.Length() != 3
			|| !info[0]->IsNumber()
			|| !info[1]->IsString()
			|| !info[2]->IsFunction())
	{
		info.GetReturnValue().Set(v8::Boolean::New(ISOLATE, false));
		return;
	}

	int32_t id = info[0]->Int32Value(CONTEXT).ToChecked();

	std::filesystem::path abst = generic_path(to_string(info[1]->ToString(CONTEXT).ToLocalChecked()));
	if (is_relative(abst) || is_traversal(abst)) {
		info.GetReturnValue().Set(v8::Boolean::New(ISOLATE, false));
		return;
	}

	watch_map.add(id, abst, v8::Local<v8::Function>::Cast(info[2]));

	info.GetReturnValue().Set(v8::Boolean::New(ISOLATE, true));
}

void unwatch(const v8::FunctionCallbackInfo<v8::Value>& info)
{
	v8::HandleScope _(ISOLATE);

	if (info.Length() != 1 || !info[0]->IsNumber()) {
		info.GetReturnValue().Set(v8::Boolean::New(ISOLATE, false));
		return;
	}

	int32_t id = info[0]->Int32Value(CONTEXT).ToChecked();

	watch_map.remove(id);

	info.GetReturnValue().Set(v8::Boolean::New(ISOLATE, true));
}

#endif // include guard
