#ifndef NATIVE_GET_DIRECTORY_SIZE
#define NATIVE_GET_DIRECTORY_SIZE

#include "common.hpp"

struct get_directory_size_work
{
	uv_work_t request;

	v8::Persistent<v8::Promise::Resolver> promise;

	std::filesystem::path wd; // generic_path
	int32_t dp;
	int64_t s;
	int32_t d;
	int32_t f;
	int32_t e;
};

static void get_directory_size(get_directory_size_work* work, const std::filesystem::path& wd, int32_t dp)
{
	try {
		std::error_code ec;
		std::for_each(std::filesystem::directory_iterator(wd, ec), std::filesystem::directory_iterator(),
			[&](const std::filesystem::path& path)
			{
				_attribute attr = {};
				attr.full = generic_path(path);
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
		if (ec) {
			work->e++;
		}
	}
	catch (std::filesystem::filesystem_error& e) {
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
	v8::HandleScope handleScope(ISOLATE);

	get_directory_size_work* work = static_cast<get_directory_size_work*>(req->data);

	v8::Local<v8::Object> obj = v8::Object::New(ISOLATE);
	obj->Set(CONTEXT, to_string(V("wd")), to_string(work->wd));
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
	v8::HandleScope handleScope(ISOLATE);

	v8::Local<v8::Promise::Resolver> promise = v8::Promise::Resolver::New(CONTEXT).ToLocalChecked();
	info.GetReturnValue().Set(promise->GetPromise());

	if (info.Length() != 1 || !info[0]->IsString()) {
		promise->Reject(CONTEXT, v8::Undefined(ISOLATE));
		return;
	}

	get_directory_size_work* work = new get_directory_size_work();
	work->request.data = work;

	work->promise.Reset(ISOLATE, promise);

	work->wd = generic_path(std::filesystem::path(to_string(info[0]->ToString(CONTEXT).ToLocalChecked())));

	work->dp = 1024;
	work->s = 0;
	work->d = 0;
	work->f = 0;

	work->e = 0;

	uv_queue_work(uv_default_loop(), &work->request, get_directory_size_async, get_directory_size_complete);
}

#endif // include guard
