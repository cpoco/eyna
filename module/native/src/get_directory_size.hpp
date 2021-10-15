#ifndef NATIVE_GET_DIRECTORY_SIZE
#define NATIVE_GET_DIRECTORY_SIZE

#include "common.hpp"

struct get_directory_size_work
{
	uv_work_t request;

	v8::Persistent<v8::Promise::Resolver> promise;

	boost::filesystem::path wd; // generic_path
	int32_t dp;
	int64_t s;
	int32_t d;
	int32_t f;
	int32_t e;
};

static void get_directory_size(get_directory_size_work* work, const boost::filesystem::path& wd, int32_t dp)
{
	try {
		std::for_each(boost::filesystem::directory_iterator(wd), boost::filesystem::directory_iterator(),
			[&](const boost::filesystem::path& path)
			{
				_attribute attr = {};
				attr.full = path.generic_path();
				attribute(attr);

				if (dp < work->dp && attr.file_type == FILE_TYPE::FILE_TYPE_DIRECTORY) {
					work->d++;
					get_directory_size(work, attr.full, dp + 1);
				}
				else {
					work->s += attr.size;
					work->f++;
				}
			}
		);
	}
	catch (boost::filesystem::filesystem_error& e) {
		work->e++;
	}
}

static void get_directory_size_async(uv_work_t* req)
{
	get_directory_size_work* work = static_cast<get_directory_size_work*>(req->data);

	get_directory_size(work, work->wd, 0);
}

static void get_directory_size_complete(uv_work_t* req, int status)
{
	get_directory_size_work* work = static_cast<get_directory_size_work*>(req->data);

	v8::Local<v8::Object> obj = v8::Object::New(ISOLATE);
	obj->Set(CONTEXT, to_string(V("wd")), path_to_string(work->wd));
	obj->Set(CONTEXT, to_string(V("s")), v8::Number::New(ISOLATE, (double)work->s));
	obj->Set(CONTEXT, to_string(V("d")), v8::Number::New(ISOLATE, (double)work->d));
	obj->Set(CONTEXT, to_string(V("f")), v8::Number::New(ISOLATE, (double)work->f));
	obj->Set(CONTEXT, to_string(V("e")), v8::Number::New(ISOLATE, (double)work->e));

	work->promise.Get(ISOLATE)->Resolve(CONTEXT, obj);
	work->promise.Reset();

	delete work;
}

void get_directory_size(const v8::FunctionCallbackInfo<v8::Value>& info)
{
	v8::Local<v8::Promise::Resolver> promise = v8::Promise::Resolver::New(CONTEXT).ToLocalChecked();
	info.GetReturnValue().Set(promise->GetPromise());

	if (info.Length() != 1 || !info[0]->IsString()) {
		promise->Reject(CONTEXT, v8::Undefined(ISOLATE));
		return;
	}

	get_directory_size_work* work = new get_directory_size_work();
	work->request.data = work;

	work->promise.Reset(ISOLATE, promise);

	work->wd = boost::filesystem::path(to_string(info[0]->ToString(CONTEXT).ToLocalChecked())).generic_path();

	work->dp = 1024;
	work->s = 0;
	work->d = 0;
	work->f = 0;

	work->e = 0;

	uv_queue_work(uv_default_loop(), &work->request, get_directory_size_async, get_directory_size_complete);
}

#endif // include guard
