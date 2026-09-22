#ifndef NATIVE_SET_TIME
#define NATIVE_SET_TIME

#include "common.hpp"

#if OS_MAC64
	#include <fcntl.h>
	#include <sys/stat.h>
#endif

struct set_time_work
{
	uv_work_t handle;

	v8::Global<v8::Promise::Resolver> promise;

	std::filesystem::path abst; // generic_path

	int64_t ctime;
	int64_t mtime;

	bool error;
};

static void set_time_async(uv_work_t* req)
{
	set_time_work* work = static_cast<set_time_work*>(req->data);

	if (raw_exists(work->abst) != 1) {
		work->error = true;
		return;
	}

	#if OS_WIN64

		HANDLE handle = CreateFileW(
			work->abst.c_str(),
			FILE_WRITE_ATTRIBUTES,
			FILE_SHARE_READ | FILE_SHARE_WRITE | FILE_SHARE_DELETE,
			NULL,
			OPEN_EXISTING,
			FILE_FLAG_OPEN_REPARSE_POINT | FILE_FLAG_BACKUP_SEMANTICS,
			NULL
		);

		if (handle == INVALID_HANDLE_VALUE) {
			work->error = true;
			return;
		}

		int64_t ctime = work->ctime / 100 + 116444736000000000;
		int64_t mtime = work->mtime / 100 + 116444736000000000;

		FILETIME ctime_f = { (DWORD)(ctime & 0xFFFFFFFF), (DWORD)(ctime >> 32) };
		FILETIME mtime_f = { (DWORD)(mtime & 0xFFFFFFFF), (DWORD)(mtime >> 32) };

		if (!SetFileTime(handle, &ctime_f, NULL, &mtime_f)) {
			work->error = true;
		}

		CloseHandle(handle);

	#elif OS_MAC64

	#endif
}

static void set_time_complete(uv_work_t* req, int status)
{
	v8::HandleScope _(ISOLATE);

	set_time_work* work = static_cast<set_time_work*>(req->data);

	if (work->error) {
		work->promise.Get(ISOLATE)->Reject(CONTEXT, to_string(ERROR_FAILED));
	}
	else {
		work->promise.Get(ISOLATE)->Resolve(CONTEXT, v8::Undefined(ISOLATE));
	}

	delete work;
}

void set_time(const v8::FunctionCallbackInfo<v8::Value>& info)
{
	v8::HandleScope _(ISOLATE);

	v8::Local<v8::Promise::Resolver> promise = v8::Promise::Resolver::New(CONTEXT).ToLocalChecked();
	info.GetReturnValue().Set(promise->GetPromise());

	if (info.Length() != 3 || !info[0]->IsString() || !info[1]->IsBigInt() || !info[2]->IsBigInt()) {
		promise->Reject(CONTEXT, to_string(ERROR_INVALID_ARGUMENT));
		return;
	}

	set_time_work* work = new set_time_work();
	work->handle.data = work;

	work->promise.Reset(ISOLATE, promise);

	work->abst = generic_path(to_string(info[0].As<v8::String>()));
	if (is_relative(work->abst) || is_traversal(work->abst)) {
		promise->Reject(CONTEXT, to_string(ERROR_INVALID_PATH));
		delete work;
		return;
	}

	work->ctime = info[1].As<v8::BigInt>()->Int64Value();
	work->mtime = info[2].As<v8::BigInt>()->Int64Value();

	work->error = false;

	uv_queue_work(uv_default_loop(), &work->handle, set_time_async, set_time_complete);
}

#endif // include guard
