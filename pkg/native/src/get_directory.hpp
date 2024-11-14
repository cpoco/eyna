#ifndef NATIVE_GET_DIRECTORY
#define NATIVE_GET_DIRECTORY

#include "common.hpp"

struct get_directory_work
{
	uv_work_t request;

	v8::Persistent<v8::Promise::Resolver> promise;

	std::filesystem::path abst; // generic_path
	std::filesystem::path base; // generic_path
	bool md; // last parent directory
	int32_t dp;
	_string_t pt;
	std::vector<_attribute> v;
	int64_t s; // size
	int32_t d; // directory count
	int32_t f; // file count
	int32_t e; // error count
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

				if (work->md == false && (work->pt.empty() || std::regex_search(generic_path(attr.full.lexically_relative(work->abst)).c_str(), _regex_t(work->pt)))) {
					work->v.push_back(attr);
				}

				if (attr.file_type == FILE_TYPE::FILE_TYPE_DIRECTORY) {
					work->d++;
					if (dp < work->dp) {
						get_directory(work, attr.full, dp + 1);
					}
				}
				else {
					work->s += attr.size;
					work->f++;
				}

				if (work->md == true && (work->pt.empty() || std::regex_search(generic_path(attr.full.lexically_relative(work->abst)).c_str(), _regex_t(work->pt)))) {
					work->v.push_back(attr);
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

	get_directory(work, work->abst, 0);
}

static void get_directory_complete(uv_work_t* req, int status)
{
	v8::HandleScope _(ISOLATE);

	get_directory_work* work = static_cast<get_directory_work*>(req->data);

	v8::Local<v8::Object> array = v8::Array::New(ISOLATE);
	uint32_t index = 0;
	for (_attribute& attr : work->v) {
		v8::Local<v8::Object> obj = v8::Object::New(ISOLATE);
		obj->Set(CONTEXT, to_string(V("type")), v8::Number::New(ISOLATE, (double)attr.file_type));
		obj->Set(CONTEXT, to_string(V("rltv")),
			work->base.empty()
				? to_string(attr.full)
				: to_string(generic_path(attr.full.lexically_relative(work->base)))
		);
		array->Set(CONTEXT, index++, obj);
	}

	v8::Local<v8::Object> obj = v8::Object::New(ISOLATE);
	obj->Set(CONTEXT, to_string(V("full")), to_string(work->abst));
	obj->Set(CONTEXT, to_string(V("base")), to_string(work->base));
	obj->Set(CONTEXT, to_string(V("list")), array);
	obj->Set(CONTEXT, to_string(V("s")), v8::BigInt::New(ISOLATE, work->s));
	obj->Set(CONTEXT, to_string(V("d")), v8::Number::New(ISOLATE, (double)work->d));
	obj->Set(CONTEXT, to_string(V("f")), v8::Number::New(ISOLATE, (double)work->f));
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
			|| !info[1]->IsString()
			|| !info[2]->IsBoolean()
			|| !info[3]->IsNumber()
			|| !(info[4]->IsNull() || info[4]->IsRegExp()))
	{
		promise->Reject(CONTEXT, to_string(ERROR_INVALID_ARGUMENT));
		return;
	}

	get_directory_work* work = new get_directory_work();
	work->request.data = work;

	work->promise.Reset(ISOLATE, promise);

	work->abst = generic_path(to_string(info[0]->ToString(CONTEXT).ToLocalChecked()));
	if (is_relative(work->abst) || is_traversal(work->abst)) {
		promise->Reject(CONTEXT, to_string(ERROR_INVALID_PATH));
		delete work;
		return;
	}

	work->base = generic_path(to_string(info[1]->ToString(CONTEXT).ToLocalChecked()));
	if (!work->base.empty() && (is_relative(work->base) || is_traversal(work->base))) {
		promise->Reject(CONTEXT, to_string(ERROR_INVALID_PATH));
		delete work;
		return;
	}

	work->md = info[2]->BooleanValue(ISOLATE);

	work->dp = info[3]->Int32Value(CONTEXT).ToChecked();

	if (info[4]->IsNull()) {
		work->pt = V("");
	}
	else if (info[4]->IsRegExp()) {
		work->pt = to_string(v8::Local<v8::RegExp>::Cast(info[4])->GetSource());
	}

	work->v.clear();

	work->s = 0;
	work->d = 0;
	work->f = 0;
	work->e = 0;

	uv_queue_work(uv_default_loop(), &work->request, get_directory_async, get_directory_complete);
}

#endif // include guard
