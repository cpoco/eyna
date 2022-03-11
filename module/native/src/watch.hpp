#ifndef NATIVE_WATCH
#define NATIVE_WATCH

#include "common.hpp"

// http://docs.libuv.org/en/v1.x/fs_event.html

class _watch_map
{
	struct _data
	{
		uv_fs_event_t* event;
		_string_t id;
		std::filesystem::path path; // generic_path
		v8::Persistent<v8::Function> callback;
	};

	std::map<_string_t, _data*> map;

public:

	~_watch_map()
	{
		for (auto& [key, data] : map) {
			data->callback.Reset();
			delete data->event;
			delete data;
		}
	}

	void add(const _string_t& _id, const _string_t& _path, const v8::Local<v8::Function>& _callback)
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
		data->path = generic_path(std::filesystem::path(_path));
		data->callback.Reset(ISOLATE, _callback);
	
		uv_fs_event_init(uv_default_loop(), data->event);
		uv_fs_event_start(data->event, &_watch_map::callback, data->path.u8string().c_str(), UV_FS_EVENT_RECURSIVE);
	}

	void remove(const _string_t& _id)
	{
		if (map.count(_id) == 0) {
			return;
		}

		_data* data = map.at(_id);

		map.erase(_id);

		uv_fs_event_stop(data->event);

		data->callback.Reset();
		delete data->event;
		delete data;
	}

	static void callback(uv_fs_event_t* _event, const char* _filename, int _events, int _status)
	{
		v8::HandleScope _(ISOLATE);

		_data* data = static_cast<_data*>(_event->data);

		if (_event == data->event) {
			const int argc = 2;
			v8::Local<v8::Value> argv[argc] = {
				to_string(data->id),
				to_string(generic_path(data->path / std::filesystem::path(_filename)))
			};
			data->callback.Get(ISOLATE)->Call(CONTEXT, v8::Undefined(ISOLATE), argc, argv);
		}
	}

} watch_map = _watch_map();

void watch(const v8::FunctionCallbackInfo<v8::Value>& info)
{
	v8::HandleScope _(ISOLATE);

	if (info.Length() != 3
			|| !info[0]->IsString()
			|| !info[1]->IsString()
			|| !info[2]->IsFunction())
	{
		return;
	}

	_string_t id = to_string(info[0]->ToString(CONTEXT).ToLocalChecked());
	_string_t path = to_string(info[1]->ToString(CONTEXT).ToLocalChecked());

	watch_map.add(id, path, v8::Local<v8::Function>::Cast(info[2]));
}

void unwatch(const v8::FunctionCallbackInfo<v8::Value>& info)
{
	v8::HandleScope _(ISOLATE);

	if (info.Length() != 1 || !info[0]->IsString()) {
		return;
	}

	_string_t id = to_string(info[0]->ToString(CONTEXT).ToLocalChecked());

	watch_map.remove(id);
}

#endif // include guard
