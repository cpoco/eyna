#ifndef WATCH
#define WATCH

#include "common.hpp"

// http://docs.libuv.org/en/v1.x/fs_event.html

struct fs_event_data
{
	uv_fs_event_t* event;

	_string_t path;
	v8::Persistent<v8::Function> callback;
} data = {};

std::map<_string_t, fs_event_data*> watch_map;

void fs_event_callback(uv_fs_event_t* event, const char* filename, int events, int status)
{
	v8::HandleScope handleScope(ISOLATE);

	fs_event_data* data = static_cast<fs_event_data*>(event->data);

	if (event == data->event) {
		printf("c %s\n", filename);
		data->callback.Get(ISOLATE)->Call(CONTEXT, v8::Undefined(ISOLATE), 0, {});
	}
}

void watch(const v8::FunctionCallbackInfo<v8::Value>& info)
{
	v8::HandleScope handleScope(ISOLATE);

	if (info.Length() != 3
			|| !info[0]->IsString()
			|| !info[1]->IsString()
			|| !info[2]->IsFunction())
	{
		return;
	}

	_string_t key = to_string(info[0]->ToString(CONTEXT).ToLocalChecked());

	if (watch_map.count(key) != 0) {
		return;
	}

	fs_event_data* data = new fs_event_data();
	watch_map.insert(std::make_pair(key, data));

	data->event = new uv_fs_event_t();
	data->path = to_string(info[1]->ToString(CONTEXT).ToLocalChecked());
	data->callback.Reset(ISOLATE, v8::Local<v8::Function>::Cast(info[2]));
	data->event->data = data;

	uv_fs_event_init(uv_default_loop(), data->event);
	uv_fs_event_start(data->event, &fs_event_callback, to_mbstring(data->path).c_str(), UV_FS_EVENT_RECURSIVE);
}

void unwatch(const v8::FunctionCallbackInfo<v8::Value>& info)
{
	v8::HandleScope handleScope(ISOLATE);

	if (info.Length() != 1 || !info[0]->IsString()) {
		return;
	}

	_string_t key = to_string(info[0]->ToString(CONTEXT).ToLocalChecked());

	if (watch_map.count(key) == 0) {
		return;
	}

	fs_event_data* data = watch_map.at(key);
	watch_map.erase(key);

	uv_fs_event_stop(data->event);

	data->callback.Reset();
	delete data->event;
	delete data;
}

#endif // include guard

