#ifndef NATIVE_RESOLVE
#define NATIVE_RESOLVE

#include "common.hpp"

struct _resolve
{
	std::filesystem::path full; // generic_path
	std::filesystem::path real; // generic_path
};

struct resolve_work
{
	uv_work_t request;

	v8::Persistent<v8::Promise::Resolver> promise;

	std::filesystem::path abst; // generic_path
	std::vector<_resolve> v;
};

static void resolve_async(uv_work_t* req)
{
	resolve_work* work = static_cast<resolve_work*>(req->data);

	work->v.push_back(_resolve());
	_resolve& top = work->v.back();
	top.full = work->abst.root_path();
	top.real = work->abst.root_path();

	for (const std::filesystem::path& p : work->abst) {
		if (p.empty() || p == work->abst.root_name() || p == work->abst.root_directory()) {
			continue;
		}

		work->v.push_back(_resolve());
		_resolve& pre = work->v[work->v.size() - 2];
		_resolve& now = work->v[work->v.size() - 1];

		now.full = generic_path(pre.full / p);

		std::vector<_attribute> attr;
		attribute(generic_path(pre.real / p, true), attr);
		_attribute& a = attr.back();
		now.real = a.full;
	}
}

static void resolve_complete(uv_work_t* req, int status)
{
	v8::HandleScope _(ISOLATE);

	resolve_work* work = static_cast<resolve_work*>(req->data);

	v8::Local<v8::Array> array = v8::Array::New(ISOLATE);

	for (_resolve& r : work->v) {
		v8::Local<v8::Object> obj = v8::Object::New(ISOLATE);

		obj->Set(CONTEXT, to_string(V("full")), to_string(r.full));
		if (r.real.empty()) {
			obj->Set(CONTEXT, to_string(V("real")), v8::Null(ISOLATE));
		}
		else {
			obj->Set(CONTEXT, to_string(V("real")), to_string(r.real));
		}

		array->Set(CONTEXT, array->Length(), obj);
	}

	work->promise.Get(ISOLATE)->Resolve(CONTEXT, array);
	work->promise.Reset();

	delete work;
}

void resolve(const v8::FunctionCallbackInfo<v8::Value>& info)
{
	v8::HandleScope _(ISOLATE);

	v8::Local<v8::Promise::Resolver> promise = v8::Promise::Resolver::New(CONTEXT).ToLocalChecked();
	info.GetReturnValue().Set(promise->GetPromise());

	if (info.Length() != 1 || !info[0]->IsString()) {
		promise->Reject(CONTEXT, to_string(V("invalid argument")));
		return;
	}

	resolve_work* work = new resolve_work();
	work->request.data = work;

	work->promise.Reset(ISOLATE, promise);

	work->abst = generic_path(std::filesystem::path(to_string(info[0]->ToString(CONTEXT).ToLocalChecked())));
	if (is_relative(work->abst) || is_traversal(work->abst)) {
		promise->Reject(CONTEXT, to_string(V("relative or traversal paths are not allowed")));
		delete work;
		return;
	}

	work->v.clear();

	uv_queue_work(uv_default_loop(), &work->request, resolve_async, resolve_complete);
}

#endif // include guard
