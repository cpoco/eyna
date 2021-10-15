#ifndef NATIVE_MOVE
#define NATIVE_MOVE

#include "common.hpp"

struct move_work
{
	uv_work_t request;

	v8::Persistent<v8::Promise::Resolver> promise;

	boost::filesystem::path src;
	boost::filesystem::path dst;
	bool error;
};

static void move_async(uv_work_t* req)
{
	move_work* work = static_cast<move_work*>(req->data);

	boost::system::error_code error;
	boost::filesystem::rename(work->src, work->dst, error);

	if (error) {
		work->error = true;
	}
	else {
		work->error = false;
	}
}

static void move_complete(uv_work_t* req, int status)
{
	move_work* work = static_cast<move_work*>(req->data);

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

void move(const v8::FunctionCallbackInfo<v8::Value>& info)
{
	v8::Local<v8::Promise::Resolver> promise = v8::Promise::Resolver::New(CONTEXT).ToLocalChecked();
	info.GetReturnValue().Set(promise->GetPromise());

	if (info.Length() != 2 || !info[0]->IsString() || !info[1]->IsString()) {
		promise->Reject(CONTEXT, v8::Undefined(ISOLATE));
		return;
	}

	move_work* work = new move_work();
	work->request.data = work;

	work->promise.Reset(ISOLATE, promise);

	work->src = boost::filesystem::path(to_string(info[0]->ToString(CONTEXT).ToLocalChecked())).generic_path();
	work->dst = boost::filesystem::path(to_string(info[1]->ToString(CONTEXT).ToLocalChecked())).generic_path();
	work->error = false;

	uv_queue_work(uv_default_loop(), &work->request, move_async, move_complete);
}

#endif // include guard