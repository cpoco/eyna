#ifndef NATIVE_MOVE_TO_TRASH
#define NATIVE_MOVE_TO_TRASH

#include "common.hpp"

struct move_to_trash_work
{
	uv_work_t request;

	v8::Persistent<v8::Promise::Resolver> promise;

	_string_t abst;
	bool error;
};

static void move_to_trash_async(uv_work_t* req)
{
	move_to_trash_work* work = static_cast<move_to_trash_work*>(req->data);

	#if _OS_WIN_

		std::replace(work->abst.begin(), work->abst.end(), L'/', L'\\');

		IFileOperation* fo;
		CoCreateInstance(CLSID_FileOperation, NULL, CLSCTX_INPROC_SERVER, IID_PPV_ARGS(&fo));
		fo->SetOperationFlags(FOF_NO_UI | FOFX_SHOWELEVATIONPROMPT | FOFX_RECYCLEONDELETE | FOFX_ADDUNDORECORD);

		IShellItem* item;
		SHCreateItemFromParsingName(work->abst.c_str(), NULL, IID_PPV_ARGS(&item));

		fo->DeleteItem(item, NULL);

		fo->PerformOperations();

		item->Release();

		fo->Release();

		CoUninitialize();

	#elif _OS_MAC_

		NSURL* url = [NSURL fileURLWithPath:[NSString stringWithCString:work->abst.c_str() encoding:NSUTF8StringEncoding]];

		NSError* error = nil;
		BOOL ret = [[NSFileManager defaultManager] trashItemAtURL:url resultingItemURL:nil error:&error];

		if (!ret || error) {
			work->error = true;
		}

	#endif
}

static void move_to_trash_complete(uv_work_t* req, int status)
{
	v8::HandleScope _(ISOLATE);

	move_to_trash_work* work = static_cast<move_to_trash_work*>(req->data);

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

void move_to_trash(const v8::FunctionCallbackInfo<v8::Value>& info)
{
	v8::HandleScope _(ISOLATE);

	v8::Local<v8::Promise::Resolver> promise = v8::Promise::Resolver::New(CONTEXT).ToLocalChecked();
	info.GetReturnValue().Set(promise->GetPromise());

	if (info.Length() != 1 || !info[0]->IsString()) {
		promise->Reject(CONTEXT, v8::Undefined(ISOLATE));
		return;
	}

	create_directory_work* work = new create_directory_work();
	work->request.data = work;

	work->promise.Reset(ISOLATE, promise);

	work->abst = to_string(info[0]->ToString(CONTEXT).ToLocalChecked());
	work->error = false;

	uv_queue_work(uv_default_loop(), &work->request, move_to_trash_async, move_to_trash_complete);
}

#endif // include guard
