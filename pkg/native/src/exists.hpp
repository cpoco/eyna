#ifndef NATIVE_EXISTS
#define NATIVE_EXISTS

#include "common.hpp"

struct exists_work
{
	uv_work_t handle;

	v8::Persistent<v8::Promise::Resolver> promise;

	std::filesystem::path abst; // generic_path
	bool exists;
	bool error;
};

static void exists_async(uv_work_t* req)
{
	exists_work* work = static_cast<exists_work*>(req->data);

	int code = raw_exists(work->abst);

	work->error = (code == -1);
	work->exists = (code == 1);
}

static void exists_complete(uv_work_t* req, int status)
{
	v8::HandleScope _(ISOLATE);

	exists_work* work = static_cast<exists_work*>(req->data);

	if (work->error) {
		work->promise.Get(ISOLATE)->Reject(CONTEXT, to_string(ERROR_FAILED));
		work->promise.Reset();
	}
	else {
		work->promise.Get(ISOLATE)->Resolve(CONTEXT, v8::Boolean::New(ISOLATE, work->exists));
		work->promise.Reset();
	}

	delete work;
}

void exists(const v8::FunctionCallbackInfo<v8::Value>& info)
{
	v8::HandleScope _(ISOLATE);

	v8::Local<v8::Promise::Resolver> promise = v8::Promise::Resolver::New(CONTEXT).ToLocalChecked();
	info.GetReturnValue().Set(promise->GetPromise());

	if (info.Length() != 1 || !info[0]->IsString()) {
		promise->Reject(CONTEXT, to_string(ERROR_INVALID_ARGUMENT));
		return;
	}

	exists_work* work = new exists_work();
	work->handle.data = work;

	work->promise.Reset(ISOLATE, promise);

	work->abst = generic_path(to_string(info[0].As<v8::String>()));
	if (is_relative(work->abst) || is_traversal(work->abst)) {
		promise->Reject(CONTEXT, to_string(ERROR_INVALID_PATH));
		delete work;
		return;
	}

	work->exists = false;
	work->error = false;

	uv_queue_work(uv_default_loop(), &work->handle, exists_async, exists_complete);
}

#endif // include guard
