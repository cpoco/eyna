#ifndef NATIVE_GET_VOLUME
#define NATIVE_GET_VOLUME

#include "common.hpp"

struct _volume
{
	_string_t name;
	std::filesystem::path full;
};

struct get_volume_work
{
	uv_work_t request;

	v8::Persistent<v8::Promise::Resolver> promise;

	std::vector<_volume> volumes;
};

static void get_volume_async(uv_work_t *req)
{
	get_volume_work* work = static_cast<get_volume_work*>(req->data);

	#if _OS_WIN_
		DWORD bit = GetLogicalDrives();
		for (int i = 0; i< 26; i++) {
			if (bit & (1 << i)) {
				work->volumes.push_back(_volume());

				_volume& v = work->volumes.back();
				v.name.append(1, L'A' + i).append(L":/");
				v.full = std::filesystem::path(v.name);
			}
		}
	#elif _OS_MAC_
		NSArray* array = [[NSFileManager defaultManager] mountedVolumeURLsIncludingResourceValuesForKeys:nil options:NSVolumeEnumerationSkipHiddenVolumes];

		for (NSURL* url in array) {
			NSError* error = nil;
			NSDictionary* dic = [url resourceValuesForKeys:@[
				NSURLVolumeNameKey
			] error:&error];

			work->volumes.push_back(_volume());

			_volume& v = work->volumes.back();
			v.name = _string_t([[dic objectForKey:NSURLVolumeNameKey] UTF8String]);
			v.full = std::filesystem::path(_string_t([[url path] UTF8String]));
		}
	#endif
}

static void get_volume_complete(uv_work_t* req, int status)
{
	get_volume_work* work = static_cast<get_volume_work*>(req->data);

	v8::Local<v8::Array> array = v8::Array::New(ISOLATE);

	for (_volume& v : work->volumes) {
		v8::Local<v8::Object> obj = v8::Object::New(ISOLATE);

		obj->Set(CONTEXT, to_string(V("full")), to_string(v.full));
		obj->Set(CONTEXT, to_string(V("name")), to_string(v.name));

		array->Set(CONTEXT, array->Length(), obj);
	}

	work->promise.Get(ISOLATE)->Resolve(CONTEXT, array);
	work->promise.Reset();

	delete work;
}

void get_volume(const v8::FunctionCallbackInfo<v8::Value>& info)
{
	v8::Local<v8::Promise::Resolver> promise = v8::Promise::Resolver::New(CONTEXT).ToLocalChecked();
	info.GetReturnValue().Set(promise->GetPromise());

	if (info.Length() != 0) {
		promise->Reject(CONTEXT, v8::Undefined(ISOLATE));
		return;
	}

	get_volume_work* work = new get_volume_work();
	work->request.data = work;

	work->promise.Reset(ISOLATE, promise);

	work->volumes.clear();

	uv_queue_work(uv_default_loop(), &work->request, get_volume_async, get_volume_complete);
}

#endif // include guard
