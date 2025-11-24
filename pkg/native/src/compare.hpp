#ifndef NATIVE_COMPARE
#define NATIVE_COMPARE

#include "common.hpp"

struct compare_work
{
	uv_work_t handle;

	v8::Persistent<v8::Promise::Resolver> promise;

	std::filesystem::path abst1; // generic_path
	std::filesystem::path abst2; // generic_path
	bool equal;
	bool error;
};

static void compare_async(uv_work_t* req)
{
	compare_work* work = static_cast<compare_work*>(req->data);

	_attribute f1 = {};
	f1.full = work->abst1;
	attribute(f1);
	_attribute f2 = {};
	f2.full = work->abst2;
	attribute(f2);

	if (f1.file_type != FILE_TYPE::FILE_TYPE_FILE || f2.file_type != FILE_TYPE::FILE_TYPE_FILE) {
		work->error = true;
		return;
	}
	if(f1.size == 0 && f2.size == 0) {
		work->equal = true;
		return;
	}
	if (f1.size != f2.size) {
		work->equal = false;
		return;
	}

	std::ifstream file1(work->abst1, std::ios::binary);
	std::ifstream file2(work->abst2, std::ios::binary);

	if (!file1.is_open() || !file2.is_open()) {
		work->error = true;
		return;
	}

	constexpr size_t KB = 1024;
	constexpr size_t MB = 1024 * KB;
	size_t size =
		static_cast<size_t>(f1.size) <=   1 * MB ?  4 * KB :
		static_cast<size_t>(f1.size) <=  10 * MB ? 16 * KB :
		static_cast<size_t>(f1.size) <= 100 * MB ? 64 * KB : 256 * KB;

	std::vector<char> buffer1(size);
	std::vector<char> buffer2(size);

	while (1) {
		file1.read(buffer1.data(), size);
		file2.read(buffer2.data(), size);

		if (std::memcmp(buffer1.data(), buffer2.data(), size) != 0) {
			work->equal = false;
			return;
		}
		if (file1.eof() != file2.eof()) {
			work->error = true;
			return;
		}
		if (file1.eof() || file2.eof()) {
			break;
		}
	}

	work->equal = true;
}

static void compare_complete(uv_work_t* req, int status)
{
	v8::HandleScope _(ISOLATE);

	compare_work* work = static_cast<compare_work*>(req->data);

	if (work->error) {
		work->promise.Get(ISOLATE)->Reject(CONTEXT, to_string(ERROR_FAILED));
		work->promise.Reset();
	}
	else {
		work->promise.Get(ISOLATE)->Resolve(CONTEXT, v8::Boolean::New(ISOLATE, work->equal));
		work->promise.Reset();
	}

	delete work;
}

void compare(const v8::FunctionCallbackInfo<v8::Value>& info)
{
	v8::HandleScope _(ISOLATE);

	v8::Local<v8::Promise::Resolver> promise = v8::Promise::Resolver::New(CONTEXT).ToLocalChecked();
	info.GetReturnValue().Set(promise->GetPromise());

	if (info.Length() != 2 || !info[0]->IsString() || !info[1]->IsString()) {
		promise->Reject(CONTEXT, to_string(ERROR_INVALID_ARGUMENT));
		return;
	}

	compare_work* work = new compare_work();
	work->handle.data = work;

	work->promise.Reset(ISOLATE, promise);

	work->abst1 = generic_path(to_string(info[0].As<v8::String>()));
	if (is_relative(work->abst1) || is_traversal(work->abst1)) {
		promise->Reject(CONTEXT, to_string(ERROR_INVALID_PATH));
		delete work;
		return;
	}

	work->abst2 = generic_path(to_string(info[1].As<v8::String>()));
	if (is_relative(work->abst2) || is_traversal(work->abst2)) {
		promise->Reject(CONTEXT, to_string(ERROR_INVALID_PATH));
		delete work;
		return;
	}

	if (work->abst1 == work->abst2) {
		promise->Reject(CONTEXT, to_string(ERROR_FAILED));
		delete work;
		return;
	}

	work->equal = false;
	work->error = false;

	uv_queue_work(uv_default_loop(), &work->handle, compare_async, compare_complete);
}

#endif // include guard