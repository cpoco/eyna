#ifndef NATIVE_GET_DIRECTORY
#define NATIVE_GET_DIRECTORY

#include "common.hpp"

struct get_directory_work
{
	uv_work_t request;

	v8::Persistent<v8::Promise::Resolver> promise;

	std::filesystem::path wd; // generic_path
	bool rl; // result relative
	bool md; // last parent directory
	int32_t dp;
	_string_t pt;
	std::vector<std::filesystem::path> ls; // generic_path
	int32_t e;
};

static void get_directory(get_directory_work* work, const std::filesystem::path& wd, int32_t dp)
{
	try {
		std::vector<std::filesystem::path> sort; // generic_path

		std::error_code ec;
		std::for_each(std::filesystem::directory_iterator(wd, ec), std::filesystem::directory_iterator(),
			[&sort](const std::filesystem::path& path)
			{
				sort.push_back(generic_path(path));
			}
		);
		if (ec) {
			work->e++;
		}

		std::sort(sort.begin(), sort.end(),
			[](const std::filesystem::path& a, const std::filesystem::path& b)
			{
				return a < b;
			}
		);

		std::for_each(sort.begin(), sort.end(),
			[&](const std::filesystem::path& path)
			{
				_attribute attr = {};
				attr.full = path;
				attribute(attr);

				if (work->md == false && (work->pt.empty() || std::regex_search(generic_path(attr.full.lexically_relative(work->wd)).c_str(), _regex_t(work->pt)))) {
					work->ls.push_back(attr.full);
				}
				if (dp < work->dp && attr.file_type == FILE_TYPE::FILE_TYPE_DIRECTORY) {
					get_directory(work, attr.full, dp + 1);
				}
				if (work->md == true && (work->pt.empty() || std::regex_search(generic_path(attr.full.lexically_relative(work->wd)).c_str(), _regex_t(work->pt)))) {
					work->ls.push_back(attr.full);
				}
			}
		);
	}
	catch (std::filesystem::filesystem_error& e) {
		work->e++;
	}
}

static void get_directory_async(uv_work_t* req)
{
	get_directory_work* work = static_cast<get_directory_work*>(req->data);

	get_directory(work, work->wd, 0);
}

static void get_directory_complete(uv_work_t* req, int status)
{
	v8::HandleScope _(ISOLATE);

	get_directory_work* work = static_cast<get_directory_work*>(req->data);

	v8::Local<v8::Object> array = v8::Array::New(ISOLATE);
	uint32_t index = 0;
	for (std::filesystem::path& p : work->ls) {
		if (!work->rl) {
			array->Set(CONTEXT, index++, to_string(p));
		}
		else {
			array->Set(CONTEXT, index++, to_string(generic_path(p.lexically_relative(work->wd))));
		}
	}

	v8::Local<v8::Object> obj = v8::Object::New(ISOLATE);
	obj->Set(CONTEXT, to_string(V("wd")), to_string(work->wd));
	obj->Set(CONTEXT, to_string(V("ls")), array);
	obj->Set(CONTEXT, to_string(V("e")), v8::Number::New(ISOLATE, (double)work->e));

	work->promise.Get(ISOLATE)->Resolve(CONTEXT, obj);
	work->promise.Reset();

	delete work;
}

void get_directory(const v8::FunctionCallbackInfo<v8::Value>& info)
{
	v8::HandleScope _(ISOLATE);

	v8::Local<v8::Promise::Resolver> promise = v8::Promise::Resolver::New(CONTEXT).ToLocalChecked();
	info.GetReturnValue().Set(promise->GetPromise());

	if (info.Length() != 5
			|| !info[0]->IsString()
			|| !info[1]->IsBoolean()
			|| !info[2]->IsBoolean()
			|| !info[3]->IsNumber()
			|| !(info[4]->IsNull() || info[4]->IsRegExp()))
	{
		promise->Reject(CONTEXT, v8::Undefined(ISOLATE));
		return;
	}

	get_directory_work* work = new get_directory_work();
	work->request.data = work;

	work->promise.Reset(ISOLATE, promise);

	work->wd = generic_path(std::filesystem::path(to_string(info[0]->ToString(CONTEXT).ToLocalChecked())));

	work->rl = info[1]->BooleanValue(ISOLATE);

	work->md = info[2]->BooleanValue(ISOLATE);

	work->dp = info[3]->Int32Value(CONTEXT).ToChecked();

	if (info[4]->IsNull()) {
		work->pt = V("");
	}
	else if (info[4]->IsRegExp()) {
		work->pt = to_string(v8::Local<v8::RegExp>::Cast(info[4])->GetSource());
	}

	work->ls.clear();

	work->e = 0;

	uv_queue_work(uv_default_loop(), &work->request, get_directory_async, get_directory_complete);
}

#endif // include guard
