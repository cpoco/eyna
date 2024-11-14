#ifndef NATIVE_CREATE_FILE
#define NATIVE_CREATE_FILE

#include "common.hpp"

struct create_file_work
{
	uv_work_t request;

	v8::Persistent<v8::Promise::Resolver> promise;

	std::filesystem::path abst; // generic_path
	bool error;
};

static void create_file_async(uv_work_t* req)
{
	create_file_work* work = static_cast<create_file_work*>(req->data);

	_attribute attr = {};
	attr.full = work->abst;
	attribute(attr);

	if (attr.file_type == FILE_TYPE::FILE_TYPE_NONE) {
		std::ofstream f(work->abst);
		if (!f) {
			work->error = true;
		}
	}
	else {
		work->error = true;
	}
}

static void create_file_complete(uv_work_t* req, int status)
{
	v8::HandleScope _(ISOLATE);

	create_file_work* work = static_cast<create_file_work*>(req->data);

	if (work->error) {
		work->promise.Get(ISOLATE)->Reject(CONTEXT, to_string(V("failed")));
		work->promise.Reset();
    }
	else {
		work->promise.Get(ISOLATE)->Resolve(CONTEXT, v8::Undefined(ISOLATE));
		work->promise.Reset();
	}

	delete work;
}

void create_file(const v8::FunctionCallbackInfo<v8::Value>& info)
{
	v8::HandleScope _(ISOLATE);

	v8::Local<v8::Promise::Resolver> promise = v8::Promise::Resolver::New(CONTEXT).ToLocalChecked();
	info.GetReturnValue().Set(promise->GetPromise());

	if (info.Length() != 1 || !info[0]->IsString()) {
		promise->Reject(CONTEXT, to_string(ERROR_INVALID_ARGUMENT));
		return;
	}

	create_file_work* work = new create_file_work();
	work->request.data = work;

	work->promise.Reset(ISOLATE, promise);

	work->abst = generic_path(to_string(info[0]->ToString(CONTEXT).ToLocalChecked()));
	if (is_relative(work->abst) || is_traversal(work->abst)) {
		promise->Reject(CONTEXT, to_string(ERROR_INVALID_PATH));
		delete work;
		return;
	}

	work->error = false;

	uv_queue_work(uv_default_loop(), &work->request, create_file_async, create_file_complete);
}

#endif // include guard
