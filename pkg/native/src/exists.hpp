#ifndef NATIVE_EXISTS
#define NATIVE_EXISTS

#include "common.hpp"

struct exists_work
{
	uv_work_t request;

	v8::Persistent<v8::Promise::Resolver> promise;

	std::filesystem::path abst; // generic_path
	bool exists;
};

static void exists_async(uv_work_t* req)
{
	exists_work* work = static_cast<exists_work*>(req->data);

	std::error_code ec;
	bool result = std::filesystem::exists(work->abst, ec);

	if (!result || ec) {
		work->exists = false;
	}
	else {
		work->exists = true;
	}
}

static void exists_complete(uv_work_t* req, int status)
{
	v8::HandleScope _(ISOLATE);

	exists_work* work = static_cast<exists_work*>(req->data);

	work->promise.Get(ISOLATE)->Resolve(CONTEXT, v8::Boolean::New(ISOLATE, work->exists));
	work->promise.Reset();

	delete work;
}

void exists(const v8::FunctionCallbackInfo<v8::Value>& info)
{
	v8::HandleScope _(ISOLATE);

	v8::Local<v8::Promise::Resolver> promise = v8::Promise::Resolver::New(CONTEXT).ToLocalChecked();
	info.GetReturnValue().Set(promise->GetPromise());

	if (info.Length() != 1 || !info[0]->IsString()) {
		promise->Reject(CONTEXT, to_string(V("invalid argument")));
		return;
	}

	exists_work* work = new exists_work();
	work->request.data = work;

	work->promise.Reset(ISOLATE, promise);

	work->abst = generic_path(std::filesystem::path(to_string(info[0]->ToString(CONTEXT).ToLocalChecked())));
	if (is_traversal(work->abst)) {
		promise->Reject(CONTEXT, to_string(V("traversal path not available")));
		delete work;
		return;
	}

	work->exists = false;

	uv_queue_work(uv_default_loop(), &work->request, exists_async, exists_complete);
}

#endif // include guard
