#ifndef NATIVE_GET_ARCHIVE
#define NATIVE_GET_ARCHIVE

#include "common.hpp"

struct get_archive_work
{
	uv_work_t handle;

	v8::Global<v8::Promise::Resolver> promise;

	std::filesystem::path abst; // generic_path
	std::filesystem::path base; // generic_path
	int min_depth;
	int max_depth;

	std::vector<_entry> v;
	int64_t s; // size
	int32_t d; // directory count
	int32_t f; // file count
	int32_t e; // error count
};

// uv_work_cb
static void get_archive_async(uv_work_t* req)
{
	get_archive_work* work = static_cast<get_archive_work*>(req->data);

	archive_iterator(
		work->abst,
		[&work](struct archive* a, struct archive_entry* entry) -> int
		{
			_entry ent = {};
			populate_entry(ent, entry);

			if (work->min_depth <= ent.depth && ent.depth <= work->max_depth && compare_path(work->min_depth, work->base, ent.full)) {
				if (ent.file_type == FILE_TYPE::FILE_TYPE_DIRECTORY) {
					work->d++;
				}
				else if (ent.file_type == FILE_TYPE::FILE_TYPE_FILE || ent.file_type == FILE_TYPE::FILE_TYPE_LINK) {
					work->s += ent.size;
					work->f++;
				}
				work->v.push_back(ent);
			}

			archive_read_data_skip(a);

			return IT_CB_NEXT;
		}
	);
}

// uv_after_work_cb
static void get_archive_complete(uv_work_t* req, int status)
{
	v8::HandleScope _(ISOLATE);

	get_archive_work* work = static_cast<get_archive_work*>(req->data);

	v8::Local<v8::Object> array = v8::Array::New(ISOLATE);
	uint32_t index = 0;
	for (_entry& ent : work->v) {
		v8::Local<v8::Object> obj = v8::Object::New(ISOLATE);

		obj->Set(CONTEXT, to_string(V("file_type")), v8::Number::New(ISOLATE, (double)ent.file_type));
		obj->Set(CONTEXT, to_string(V("full")),      to_string(ent.full));

		ent.full = generic_path(ent.full); // without trailing slash

		obj->Set(CONTEXT, to_string(V("base")), to_string(work->base));
		obj->Set(CONTEXT, to_string(V("rltv")),
			work->base.empty()
				? to_string(ent.full)
				: to_string(generic_path(ent.full.lexically_relative(work->base)))
		);

		obj->Set(CONTEXT, to_string(V("name")), to_string(ent.full.filename()));
		obj->Set(CONTEXT, to_string(V("stem")), to_string(ent.full.stem()));
		obj->Set(CONTEXT, to_string(V("exte")), to_string(ent.full.extension()));

		obj->Set(CONTEXT, to_string(V("link_type")), v8::Number::New(ISOLATE, ent.link_type));
		if (ent.link_type == LINK_TYPE::LINK_TYPE_NONE) {
			obj->Set(CONTEXT, to_string(V("link")), v8::Null(ISOLATE));
		}
		else {
			obj->Set(CONTEXT, to_string(V("link")), to_string(ent.link));
		}

		obj->Set(CONTEXT, to_string(V("size")), v8::BigInt::New(ISOLATE, ent.size));
		obj->Set(CONTEXT, to_string(V("time")), v8::Number::New(ISOLATE, (double)ent.time));
		obj->Set(CONTEXT, to_string(V("nsec")), v8::Number::New(ISOLATE, (double)ent.nsec));

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

	delete work;
}

void get_archive(const v8::FunctionCallbackInfo<v8::Value>& info)
{
	v8::HandleScope _(ISOLATE);

	v8::Local<v8::Promise::Resolver> promise = v8::Promise::Resolver::New(CONTEXT).ToLocalChecked();
	info.GetReturnValue().Set(promise->GetPromise());

	if (info.Length() != 3
			|| !info[0]->IsString()
			|| !info[1]->IsString()
			|| !info[2]->IsNumber())
	{
		promise->Reject(CONTEXT, to_string(ERROR_INVALID_ARGUMENT));
		return;
	}

	get_archive_work* work = new get_archive_work();
	work->handle.data = work;

	work->promise.Reset(ISOLATE, promise);

	work->abst = generic_path(to_string(info[0].As<v8::String>()));
	if (is_relative(work->abst) || is_traversal(work->abst)) {
		promise->Reject(CONTEXT, to_string(ERROR_INVALID_PATH));
		delete work;
		return;
	}
	work->base = generic_path(to_string(info[1].As<v8::String>()));
	if (is_traversal(work->base)) {
		promise->Reject(CONTEXT, to_string(ERROR_INVALID_T_PATH));
		delete work;
		return;
	}
	work->min_depth = std::ranges::distance(work->base);
	work->max_depth = work->min_depth + info[2]->Int32Value(CONTEXT).ToChecked();

	work->v.clear();

	work->d = 0;
	work->f = 0;
	work->e = 0;

	uv_queue_work(uv_default_loop(), &work->handle, get_archive_async, get_archive_complete);
}

#endif // include guard
