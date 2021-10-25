#ifndef NATIVE_COPY
#define NATIVE_COPY

#include "common.hpp"

struct copy_work
{
	uv_work_t request;

	v8::Persistent<v8::Promise::Resolver> promise;

	boost::filesystem::path src;
	boost::filesystem::path dst;
	bool error;
};

static void copy_async(uv_work_t* req)
{
	copy_work* work = static_cast<copy_work*>(req->data);

	#if BOOST_OS_WINDOWS

		boost::system::error_code error;
		boost::filesystem::copy(work->src, work->dst, boost::filesystem::copy_options::recursive | boost::filesystem::copy_options::copy_symlinks, error);

		if (error) {
			work->error = true;
		}

	#elif BOOST_OS_MACOS

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
	copy_work* work = static_cast<copy_work*>(req->data);

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

void copy(const v8::FunctionCallbackInfo<v8::Value>& info)
{
	v8::Local<v8::Promise::Resolver> promise = v8::Promise::Resolver::New(CONTEXT).ToLocalChecked();
	info.GetReturnValue().Set(promise->GetPromise());

	if (info.Length() != 2 || !info[0]->IsString() || !info[1]->IsString()) {
		promise->Reject(CONTEXT, v8::Undefined(ISOLATE));
		return;
	}

	copy_work* work = new copy_work();
	work->request.data = work;

	work->promise.Reset(ISOLATE, promise);

	work->src = boost::filesystem::path(to_string(info[0]->ToString(CONTEXT).ToLocalChecked())).generic_path();
	work->dst = boost::filesystem::path(to_string(info[1]->ToString(CONTEXT).ToLocalChecked())).generic_path();
	work->error = false;

	uv_queue_work(uv_default_loop(), &work->request, copy_async, copy_complete);
}

#endif // include guard