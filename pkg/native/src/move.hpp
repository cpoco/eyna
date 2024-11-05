#ifndef NATIVE_MOVE
#define NATIVE_MOVE

#include "common.hpp"

struct move_work
{
	uv_work_t request;

	v8::Persistent<v8::Promise::Resolver> promise;

	std::filesystem::path src; // generic_path
	std::filesystem::path dst; // generic_path
	bool error;
};

static void move_async(uv_work_t* req)
{
	move_work* work = static_cast<move_work*>(req->data);

	/*
	std::error_code ec;
	std::filesystem::rename(work->src, work->dst, ec);

	if (ec) {
		work->error = true;
	}
	*/

	#if _OS_WIN_

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

		fo->MoveItem(isrc, idst, file.c_str(), NULL);

		if (FAILED(fo->PerformOperations())) {
			work->error = true;
		}

		idst->Release();
		isrc->Release();

		fo->Release();

	#elif _OS_MAC_

		NSError* error = nil;
		BOOL ret = [[NSFileManager defaultManager]
			moveItemAtPath:[NSString stringWithCString:work->src.c_str() encoding:NSUTF8StringEncoding]
			toPath:[NSString stringWithCString:work->dst.c_str() encoding:NSUTF8StringEncoding]
			error:&error];

		if (!ret || error) {
			work->error = true;
		}

	#endif
}

static void move_complete(uv_work_t* req, int status)
{
	v8::HandleScope _(ISOLATE);

	move_work* work = static_cast<move_work*>(req->data);

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

void move(const v8::FunctionCallbackInfo<v8::Value>& info)
{
	v8::HandleScope _(ISOLATE);

	v8::Local<v8::Promise::Resolver> promise = v8::Promise::Resolver::New(CONTEXT).ToLocalChecked();
	info.GetReturnValue().Set(promise->GetPromise());

	if (info.Length() != 2 || !info[0]->IsString() || !info[1]->IsString()) {
		promise->Reject(CONTEXT, to_string(ERROR_INVALID_ARGUMENT));
		return;
	}

	move_work* work = new move_work();
	work->request.data = work;

	work->promise.Reset(ISOLATE, promise);

	work->src = generic_path(std::filesystem::path(to_string(info[0]->ToString(CONTEXT).ToLocalChecked())));
	if (is_relative(work->src) || is_traversal(work->src)) {
		promise->Reject(CONTEXT, to_string(ERROR_INVALID_PATH));
		delete work;
		return;
	}

	work->dst = generic_path(std::filesystem::path(to_string(info[1]->ToString(CONTEXT).ToLocalChecked())));
	if (is_relative(work->dst) || is_traversal(work->dst)) {
		promise->Reject(CONTEXT, to_string(ERROR_INVALID_PATH));
		delete work;
		return;
	}

	work->error = false;

	uv_queue_work(uv_default_loop(), &work->request, move_async, move_complete);
}

#endif // include guard
