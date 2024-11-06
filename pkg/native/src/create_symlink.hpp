#ifndef NATIVE_CREATE_SYMLINK
#define NATIVE_CREATE_SYMLINK

#include "common.hpp"

struct create_symlink_work
{
	uv_work_t request;

	v8::Persistent<v8::Promise::Resolver> promise;

	std::filesystem::path link; // generic_path
	std::filesystem::path trgt; // generic_path

	bool error;
};

static void create_symlink_async(uv_work_t* req)
{
	create_symlink_work* work = static_cast<create_symlink_work*>(req->data);

	_attribute link = {};
	link.full = work->link;
	attribute(link);

	if (link.file_type != FILE_TYPE::FILE_TYPE_NONE) {
		work->error = true;
		return;
	}

	_attribute trgt = {};
	trgt.full = work->trgt;
	attribute(trgt);

	if (trgt.file_type == FILE_TYPE::FILE_TYPE_FILE || trgt.file_type == FILE_TYPE::FILE_TYPE_LINK) {
		std::error_code ec;
		std::filesystem::create_symlink(work->trgt, work->link, ec);
		if (ec) {
			work->error = true;
		}
	}
	else if (trgt.file_type == FILE_TYPE::FILE_TYPE_DIRECTORY) {
		std::error_code ec;
		std::filesystem::create_directory_symlink(work->trgt, work->link, ec);
		if (ec) {
			work->error = true;
		}
	}
	else {
		work->error = true;
	}
}

static void create_symlink_complete(uv_work_t* req, int status)
{
	v8::HandleScope _(ISOLATE);

	create_symlink_work* work = static_cast<create_symlink_work*>(req->data);

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

void create_symlink(const v8::FunctionCallbackInfo<v8::Value>& info)
{
	v8::HandleScope _(ISOLATE);

	v8::Local<v8::Promise::Resolver> promise = v8::Promise::Resolver::New(CONTEXT).ToLocalChecked();
	info.GetReturnValue().Set(promise->GetPromise());

	if (info.Length() != 2 || !info[0]->IsString() || !info[1]->IsString()) {
		promise->Reject(CONTEXT, to_string(ERROR_INVALID_ARGUMENT));
		return;
	}

	create_symlink_work* work = new create_symlink_work();
	work->request.data = work;

	work->promise.Reset(ISOLATE, promise);

	work->link = generic_path(std::filesystem::path(to_string(info[0]->ToString(CONTEXT).ToLocalChecked())));
	if (is_relative(work->link) || is_traversal(work->link)) {
		promise->Reject(CONTEXT, to_string(ERROR_INVALID_PATH));
		delete work;
		return;
	}

	work->trgt = generic_path(std::filesystem::path(to_string(info[1]->ToString(CONTEXT).ToLocalChecked())));
	if (is_relative(work->trgt) || is_traversal(work->trgt)) {
		promise->Reject(CONTEXT, to_string(ERROR_INVALID_PATH));
		delete work;
		return;
	}

	work->error = false;

	uv_queue_work(uv_default_loop(), &work->request, create_symlink_async, create_symlink_complete);
}

#endif // include guard
