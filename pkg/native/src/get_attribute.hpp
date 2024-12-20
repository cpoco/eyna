#ifndef NATIVE_GET_ATTRIBUTE
#define NATIVE_GET_ATTRIBUTE

#include "common.hpp"

struct get_attribute_work
{
	uv_work_t request;

	v8::Persistent<v8::Promise::Resolver> promise;

	std::filesystem::path abst; // generic_path
	std::filesystem::path base; // generic_path
	std::vector<_attribute> v;
};

static void get_attribute_async(uv_work_t* req)
{
	get_attribute_work* work = static_cast<get_attribute_work*>(req->data);

	attribute(work->abst, work->v);
}

static void get_attribute_complete(uv_work_t* req, int status)
{
	v8::HandleScope _(ISOLATE);

	get_attribute_work* work = static_cast<get_attribute_work*>(req->data);

	v8::Local<v8::Array> array = v8::Array::New(ISOLATE);

	for (_attribute& a : work->v) {
		if (a.full.empty()) {
			array->Set(CONTEXT, array->Length(), v8::Null(ISOLATE));
			break;
		}

		v8::Local<v8::Object> obj = v8::Object::New(ISOLATE);

		obj->Set(CONTEXT, to_string(V("file_type")), v8::Number::New(ISOLATE, a.file_type));
		obj->Set(CONTEXT, to_string(V("full")),      to_string(a.full));

		obj->Set(CONTEXT, to_string(V("base")), to_string(work->base));
		obj->Set(CONTEXT, to_string(V("rltv")),
			work->base.empty()
				? to_string(a.full)
				: to_string(generic_path(a.full.lexically_relative(work->base)))
		);

		obj->Set(CONTEXT, to_string(V("name")), to_string(a.full.filename()));
		obj->Set(CONTEXT, to_string(V("stem")), to_string(a.full.stem()));
		obj->Set(CONTEXT, to_string(V("exte")),  to_string(a.full.extension()));

		obj->Set(CONTEXT, to_string(V("link_type")), v8::Number::New(ISOLATE, a.link_type));
		if (a.link_type == LINK_TYPE::LINK_TYPE_NONE) {
			obj->Set(CONTEXT, to_string(V("link")), v8::Null(ISOLATE));
		}
		else {
			obj->Set(CONTEXT, to_string(V("link")), to_string(a.link));
		}

		obj->Set(CONTEXT, to_string(V("size")), v8::BigInt::New(ISOLATE, a.size));
		obj->Set(CONTEXT, to_string(V("time")), v8::Number::New(ISOLATE, (double)a.time));
		obj->Set(CONTEXT, to_string(V("nsec")), v8::Number::New(ISOLATE, (double)a.nsec));

		obj->Set(CONTEXT, to_string(V("readonly")), v8::Boolean::New(ISOLATE, a.readonly));
		obj->Set(CONTEXT, to_string(V("hidden")), v8::Boolean::New(ISOLATE, a.hidden));
		obj->Set(CONTEXT, to_string(V("system")), v8::Boolean::New(ISOLATE, a.system));
		obj->Set(CONTEXT, to_string(V("cloud")), v8::Boolean::New(ISOLATE, a.cloud));

		array->Set(CONTEXT, array->Length(), obj);
	}

	work->promise.Get(ISOLATE)->Resolve(CONTEXT, array);
	work->promise.Reset();

	delete work;
}

void get_attribute(const v8::FunctionCallbackInfo<v8::Value>& info)
{
	v8::HandleScope _(ISOLATE);

	v8::Local<v8::Promise::Resolver> promise = v8::Promise::Resolver::New(CONTEXT).ToLocalChecked();
	info.GetReturnValue().Set(promise->GetPromise());

	if (info.Length() != 2 || !info[0]->IsString() || !info[1]->IsString()) {
		promise->Reject(CONTEXT, to_string(ERROR_INVALID_ARGUMENT));
		return;
	}

	get_attribute_work* work = new get_attribute_work();
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

	work->v.clear();

	uv_queue_work(uv_default_loop(), &work->request, get_attribute_async, get_attribute_complete);
}

#endif // include guard
