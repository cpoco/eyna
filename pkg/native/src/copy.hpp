#ifndef NATIVE_COPY
#define NATIVE_COPY

#include "common.hpp"

struct copy_work
{
	uv_work_t handle;

	v8::Persistent<v8::Promise::Resolver> promise;

	std::filesystem::path src; // generic_path
	std::filesystem::path dst; // generic_path
	bool error;
};

static void copy_async(uv_work_t* req)
{
	copy_work* work = static_cast<copy_work*>(req->data);

	{
		_attribute src = {};
		src.full = work->src;
		attribute(src);

		if (src.file_type != FILE_TYPE::FILE_TYPE_DIRECTORY && src.file_type != FILE_TYPE::FILE_TYPE_FILE) {
			work->error = true;
			return;
		}

		if (raw_exists(work->dst) != 0) {
			work->error = true;
			return;
		}
	}

	/*
	std::error_code ec;
	std::filesystem::copy(work->src, work->dst, std::filesystem::copy_options::recursive | std::filesystem::copy_options::copy_symlinks, ec);

	if (ec) {
		work->error = true;
	}
	*/

	#if OS_WIN64

		_string_t src(work->src.c_str());
		_string_t dst(work->dst.parent_path().c_str());
		_string_t file(work->dst.filename().c_str());
		std::replace(src.begin(), src.end(), L'/', L'\\');
		std::replace(dst.begin(), dst.end(), L'/', L'\\');

		IFileOperation* fo;
		CoCreateInstance(CLSID_FileOperation, NULL, CLSCTX_INPROC_SERVER, IID_PPV_ARGS(&fo));
		fo->SetOperationFlags(FOF_NO_UI | FOFX_SHOWELEVATIONPROMPT);

		IShellItem* isrc;
		SHCreateItemFromParsingName(src.c_str(), NULL, IID_PPV_ARGS(&isrc));
		IShellItem* idst;
		SHCreateItemFromParsingName(dst.c_str(), NULL, IID_PPV_ARGS(&idst));

		fo->CopyItem(isrc, idst, file.c_str(), NULL);

		if (FAILED(fo->PerformOperations())) {
			work->error = true;
		}

		idst->Release();
		isrc->Release();

		fo->Release();

	#elif OS_MAC64

		NSError* error = nil;
		BOOL ret = [[NSFileManager defaultManager]
			copyItemAtPath:[NSString stringWithCString:work->src.c_str() encoding:NSUTF8StringEncoding]
			toPath:[NSString stringWithCString:work->dst.c_str() encoding:NSUTF8StringEncoding]
			error:&error];

		if (!ret || error) {
			work->error = true;
		}

	#endif
}

static void copy_complete(uv_work_t* req, int status)
{
	v8::HandleScope _(ISOLATE);

	copy_work* work = static_cast<copy_work*>(req->data);

	if (work->error) {
		work->promise.Get(ISOLATE)->Reject(CONTEXT, to_string(ERROR_FAILED));
		work->promise.Reset();
	}
	else {
		work->promise.Get(ISOLATE)->Resolve(CONTEXT, v8::Undefined(ISOLATE));
		work->promise.Reset();
	}

	delete work;
}

void copy(const v8::FunctionCallbackInfo<v8::Value>& info)
{
	v8::HandleScope _(ISOLATE);

	v8::Local<v8::Promise::Resolver> promise = v8::Promise::Resolver::New(CONTEXT).ToLocalChecked();
	info.GetReturnValue().Set(promise->GetPromise());

	if (info.Length() != 2 || !info[0]->IsString() || !info[1]->IsString()) {
		promise->Reject(CONTEXT, to_string(ERROR_INVALID_ARGUMENT));
		return;
	}

	copy_work* work = new copy_work();
	work->handle.data = work;

	work->promise.Reset(ISOLATE, promise);

	work->src = generic_path(to_string(info[0].As<v8::String>()));
	if (is_relative(work->src) || is_traversal(work->src)) {
		promise->Reject(CONTEXT, to_string(ERROR_INVALID_PATH));
		delete work;
		return;
	}

	work->dst = generic_path(to_string(info[1].As<v8::String>()));
	if (is_relative(work->dst) || is_traversal(work->dst)) {
		promise->Reject(CONTEXT, to_string(ERROR_INVALID_PATH));
		delete work;
		return;
	}

	work->error = false;

	uv_queue_work(uv_default_loop(), &work->handle, copy_async, copy_complete);
}

#endif // include guard
