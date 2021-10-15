#ifndef NATIVE_GET_DIRECTORY
#define NATIVE_GET_DIRECTORY

#include "common.hpp"

struct get_directory_work
{
	uv_work_t request;

	v8::Persistent<v8::Promise::Resolver> promise;

	boost::filesystem::path wd; // generic_path
	boost::filesystem::path bs; // generic_path
	bool md; // last parent directory
	int32_t dp;
	_string_t pt;
	std::vector<boost::filesystem::path> ls; // generic_path
	int32_t e;
};

static void get_directory(get_directory_work* work, const boost::filesystem::path& wd, int32_t dp)
{
	try {
		std::vector<boost::filesystem::path> sort; // generic_path

		std::for_each(boost::filesystem::directory_iterator(wd), boost::filesystem::directory_iterator(),
			[&sort](const boost::filesystem::path& path)
			{
				sort.push_back(path.generic_path());
			}
		);

		std::sort(sort.begin(), sort.end(),
			[](const boost::filesystem::path& a, const boost::filesystem::path& b)
			{
				return a < b;
			}
		);

		std::for_each(sort.begin(), sort.end(),
			[&](const boost::filesystem::path& path)
			{
				_attribute attr = {};
				attr.full = path;
				attribute(attr);

				if (work->md == false && (work->pt.empty() || std::regex_search(attr.full.lexically_relative(work->wd).generic_path().c_str(), _regex_t(work->pt)))) {
					work->ls.push_back(attr.full);
				}
				if (dp < work->dp && attr.file_type == FILE_TYPE::FILE_TYPE_DIRECTORY) {
					get_directory(work, attr.full, dp + 1);
				}
				if (work->md == true && (work->pt.empty() || std::regex_search(attr.full.lexically_relative(work->wd).generic_path().c_str(), _regex_t(work->pt)))) {
					work->ls.push_back(attr.full);
				}
			}
		);
	}
	catch (boost::filesystem::filesystem_error& e) {
		if (dp == 0) {
			work->e = -1;
		}
		else {
			work->e++;
		}
	}
}

static void get_directory_async(uv_work_t* req)
{
	get_directory_work* work = static_cast<get_directory_work*>(req->data);

	get_directory(work, work->wd, 0);
}

static void get_directory_complete(uv_work_t* req, int status)
{
	get_directory_work* work = static_cast<get_directory_work*>(req->data);

	v8::Local<v8::Object> array = v8::Array::New(ISOLATE);
	uint32_t index = 0;
	for (boost::filesystem::path& p : work->ls) {
		if (work->bs.size() == 0) {
			array->Set(CONTEXT, index++, path_to_string(p));
		}
		else {
			array->Set(CONTEXT, index++, path_to_string(p.lexically_relative(work->bs).generic_path()));
		}
	}

	v8::Local<v8::Object> obj = v8::Object::New(ISOLATE);
	obj->Set(CONTEXT, to_string(V("wd")), path_to_string(work->wd));
	obj->Set(CONTEXT, to_string(V("ls")), array);
	obj->Set(CONTEXT, to_string(V("e")), v8::Number::New(ISOLATE, (double)work->e));

	work->promise.Get(ISOLATE)->Resolve(CONTEXT, obj);
	work->promise.Reset();

	delete work;
}

void get_directory(const v8::FunctionCallbackInfo<v8::Value>& info)
{
	v8::Local<v8::Promise::Resolver> promise = v8::Promise::Resolver::New(CONTEXT).ToLocalChecked();
	info.GetReturnValue().Set(promise->GetPromise());

	if (info.Length() != 5
			|| !info[0]->IsString()
			|| !info[1]->IsString()
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

	work->wd = boost::filesystem::path(to_string(info[0]->ToString(CONTEXT).ToLocalChecked())).generic_path();

	work->bs = boost::filesystem::path(to_string(info[1]->ToString(CONTEXT).ToLocalChecked())).generic_path();

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
