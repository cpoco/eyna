#ifndef NATIVE_GET_ATTRIBUTE
#define NATIVE_GET_ATTRIBUTE

#include "common.hpp"

struct get_attribute_work
{
	uv_work_t request;

	v8::Persistent<v8::Promise::Resolver> promise;

	boost::filesystem::path abst;
	boost::filesystem::path base;
	std::vector<_attribute> attributes;
};

void get_attribute(const boost::filesystem::path& path, std::vector<_attribute>& vector)
{
	vector.push_back(_attribute());

	for (_attribute& a : vector) {
		if (a.full == path) {
			return;
		}
	}

	_attribute& attr = vector.back();

	attr.full = path;

	attribute(attr);

	if (attr.link_type != LINK_TYPE::LINK_TYPE_NONE) {
		if (attr.link.is_absolute()) {
			get_attribute(boost::filesystem::path(attr.link), vector);
		}
		else if (attr.link.is_relative()) {
			get_attribute((attr.full.parent_path() / attr.link).generic_path().lexically_normal().generic_path(), vector);
		}
		else {
			vector.push_back(_attribute());
		}
	}
}

static void get_attribute_async(uv_work_t* req)
{
	get_attribute_work* work = static_cast<get_attribute_work*>(req->data);

	get_attribute(work->abst, work->attributes);
}

static void get_attribute_complete(uv_work_t* req, int status)
{
	get_attribute_work* work = static_cast<get_attribute_work*>(req->data);

	v8::Local<v8::Array> array = v8::Array::New(ISOLATE);

	for (_attribute& a : work->attributes) {
		if (a.full.empty()) {
			array->Set(CONTEXT, array->Length(), v8::Null(ISOLATE));
			break;
		}

		v8::Local<v8::Object> obj = v8::Object::New(ISOLATE);

		obj->Set(CONTEXT, to_string(V("file_type")), v8::Number::New(ISOLATE, a.file_type));
		obj->Set(CONTEXT, to_string(V("full")),      path_to_string(a.full));

		if (work->base.empty()) {
			obj->Set(CONTEXT, to_string(V("rltv")), path_to_string(a.full.filename()));
		}
		else {
			obj->Set(CONTEXT, to_string(V("rltv")), path_to_string(a.full.lexically_relative(work->base).generic_path()));
		}

		if (a.full.stem().empty()) {
			obj->Set(CONTEXT, to_string(V("name")), path_to_string(a.full.filename()));
			obj->Set(CONTEXT, to_string(V("stem")), path_to_string(a.full.filename()));
			obj->Set(CONTEXT, to_string(V("ext")),  v8::String::Empty(ISOLATE));
		}
		else {
			obj->Set(CONTEXT, to_string(V("name")), path_to_string(a.full.filename()));
			obj->Set(CONTEXT, to_string(V("stem")), path_to_string(a.full.stem()));
			obj->Set(CONTEXT, to_string(V("ext")),  path_to_string(a.full.extension()));
		}

		obj->Set(CONTEXT, to_string(V("link_type")), v8::Number::New(ISOLATE, a.link_type));
		if (a.link_type == 0) {
			obj->Set(CONTEXT, to_string(V("link")), v8::Null(ISOLATE));
		}
		else {
			obj->Set(CONTEXT, to_string(V("link")), path_to_string(a.link));
		}

		obj->Set(CONTEXT, to_string(V("size")), v8::Number::New(ISOLATE, (double)a.size));
		obj->Set(CONTEXT, to_string(V("time")), v8::Number::New(ISOLATE, (double)a.time));
		obj->Set(CONTEXT, to_string(V("nsec")), v8::Number::New(ISOLATE, (double)a.nsec));

		obj->Set(CONTEXT, to_string(V("readonly")), v8::Boolean::New(ISOLATE, a.readonly));
		obj->Set(CONTEXT, to_string(V("hidden")), v8::Boolean::New(ISOLATE, a.hidden));
		obj->Set(CONTEXT, to_string(V("system")), v8::Boolean::New(ISOLATE, a.system));

		array->Set(CONTEXT, array->Length(), obj);
	}

	work->promise.Get(ISOLATE)->Resolve(CONTEXT, array);
	work->promise.Reset();

	delete work;
}

void get_attribute(const v8::FunctionCallbackInfo<v8::Value>& info)
{
	v8::Local<v8::Promise::Resolver> promise = v8::Promise::Resolver::New(CONTEXT).ToLocalChecked();
	info.GetReturnValue().Set(promise->GetPromise());

	if (info.Length() != 2 || !info[0]->IsString() || !info[1]->IsString()) {
		promise->Reject(CONTEXT, v8::Undefined(ISOLATE));
		return;
	}

	get_attribute_work* work = new get_attribute_work();
	work->request.data = work;

	work->promise.Reset(ISOLATE, promise);

	work->abst = boost::filesystem::path(to_string(info[0]->ToString(CONTEXT).ToLocalChecked())).generic_path();
	work->base = boost::filesystem::path(to_string(info[1]->ToString(CONTEXT).ToLocalChecked())).generic_path();
	work->attributes.clear();

	uv_queue_work(uv_default_loop(), &work->request, get_attribute_async, get_attribute_complete);
}

#endif // include guard
