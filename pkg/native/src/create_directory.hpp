#ifndef NATIVE_CREATE_DIRECTORY
#define NATIVE_CREATE_DIRECTORY

#include "common.hpp"

struct create_directory_work
{
	uv_work_t request;

	v8::Persistent<v8::Promise::Resolver> promise;

	std::filesystem::path abst; // generic_path
	bool error;
};

static void create_directory_async(uv_work_t* req)
{
	create_directory_work* work = static_cast<create_directory_work*>(req->data);

	std::error_code ec;
	bool result = std::filesystem::create_directories(work->abst, ec);

	if (!result || ec) {
		work->error = true;
	}
}

static void create_directory_complete(uv_work_t* req, int status)
{
	v8::HandleScope _(ISOLATE);

	create_directory_work* work = static_cast<create_directory_work*>(req->data);

	if (work->error) {
		work->promise.Get(ISOLATE)->Reject(CONTEXT, v8::Undefined(ISOLATE));
		work->promise.Reset();
    }
	else {
		work->promise.Get(ISOLATE)->Resolve(CONTEXT, v8::Undefined(ISOLATE));
		work->promise.Reset();
	}

	delete work;
}

void create_directory(const v8::FunctionCallbackInfo<v8::Value>& info)
{
	v8::HandleScope _(ISOLATE);

	v8::Local<v8::Promise::Resolver> promise = v8::Promise::Resolver::New(CONTEXT).ToLocalChecked();
	info.GetReturnValue().Set(promise->GetPromise());

	if (info.Length() != 1 || !info[0]->IsString()) {
		promise->Reject(CONTEXT, to_string(V("invalid argument")));
		return;
	}

	create_directory_work* work = new create_directory_work();
	work->request.data = work;

	work->promise.Reset(ISOLATE, promise);

	work->abst = generic_path(std::filesystem::path(to_string(info[0]->ToString(CONTEXT).ToLocalChecked())));
	if (is_traversal(work->abst)) {
		promise->Reject(CONTEXT, to_string(V("traversal path not available")));
		return;
	}

	work->error = false;

	uv_queue_work(uv_default_loop(), &work->request, create_directory_async, create_directory_complete);
}

#endif // include guard
