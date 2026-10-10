#ifndef NATIVE_GET_ARCHIVE_ENTRY
#define NATIVE_GET_ARCHIVE_ENTRY

#include "common.hpp"

struct get_archive_entry_async
{
	uv_async_t handle;
	std::atomic<int> ref;

	v8::Global<v8::Promise::Resolver> promise;
	v8::Global<v8::Object> reader; // readable
	v8::Global<v8::Function> push; // readable.push
	bool resolved;

	std::filesystem::path abst; // generic_path
	std::filesystem::path path; // generic_path
	int64_t seek;

	std::mutex mtx;
	std::deque<std::vector<uint8_t>> queue;
	int64_t size;
	bool ready;
	bool error;
	bool finished;
};

// uv_close_cb
void get_archive_entry_close(uv_handle_t* handle)
{
	get_archive_entry_async* async = static_cast<get_archive_entry_async*>(handle->data);

	async->promise.Reset();
	async->reader.Reset();
	async->push.Reset();

	if (--async->ref == 0) {
		delete async;
	}
}

// uv_async_cb
void get_archive_entry_callback(uv_async_t* handle)
{
	v8::HandleScope _(ISOLATE);

	get_archive_entry_async* async = static_cast<get_archive_entry_async*>(handle->data);

	v8::Local<v8::Object> stream = async->reader.Get(ISOLATE);
	v8::Local<v8::Function> push = async->push.Get(ISOLATE);

	std::deque<std::vector<uint8_t>> local;
	int64_t size;
	bool ready;
	bool error;
	bool finished;
	{
		std::lock_guard<std::mutex> lock(async->mtx);
		local.swap(async->queue);
		size = async->size;
		ready = async->ready;
		error = async->error;
		finished = async->finished;
	}

	if (ready && !async->resolved) {
		async->resolved = true;

		v8::Local<v8::Object> obj = v8::Object::New(ISOLATE);
		obj->Set(CONTEXT, to_string(V("size")), v8::BigInt::New(ISOLATE, size));
		obj->Set(CONTEXT, to_string(V("reader")), stream);

		async->promise.Get(ISOLATE)->Resolve(CONTEXT, obj);
	}

	for (std::vector<uint8_t>& block : local) {
		v8::Local<v8::Object> chunk = node::Buffer::Copy(
			ISOLATE,
			reinterpret_cast<char*>(block.data()),
			block.size()
		).ToLocalChecked();

		// push(chunk)
		v8::Local<v8::Value> argv[1] = {chunk};
		push->Call(CONTEXT, stream, 1, argv);
	}

	if (!finished) {
		return;
	}

	if (!error) {
		// push(null)
		v8::Local<v8::Value> argv[1] = {v8::Null(ISOLATE)};
		push->Call(CONTEXT, stream, 1, argv);
	}
	else if (!async->resolved) {
		async->promise.Get(ISOLATE)->Reject(CONTEXT, to_string(ERROR_FAILED));
	}
	else {
		// reader.destroy(ERROR_FAILED)
		v8::Local<v8::Function> destroy = stream->Get(CONTEXT, to_string("destroy")).ToLocalChecked().As<v8::Function>();
		v8::Local<v8::Value> argv[1] = {to_string(ERROR_FAILED)};
		destroy->Call(CONTEXT, stream, 1, argv);
	}

	uv_close((uv_handle_t*)&async->handle, get_archive_entry_close);
}

static void get_archive_entry_thread(get_archive_entry_async* async)
{
	bool found = false;
	bool error = false;

	int it = archive_iterator(
		async->abst,
		[&](struct archive* a, struct archive_entry* entry) -> int
		{
			_entry ent = {};
			populate_entry(ent, entry);

			if (ent.full != async->path || ent.file_type != FILE_TYPE::FILE_TYPE_FILE) {
				archive_read_data_skip(a);
				return IT_CB_NEXT;
			}

			found = true;
			{
				std::lock_guard<std::mutex> lock(async->mtx);
				async->size = ent.size;
				async->ready = true;
			}
			uv_async_send(&async->handle);

			size_t seek = static_cast<size_t>(async->seek);

			const void* buff;
			size_t size;
			la_int64_t offset;

			while (true) {
				int r = archive_read_data_block(a, &buff, &size, &offset);

				if (r == ARCHIVE_EOF) {
					break;
				}
				else if (r == ARCHIVE_FAILED || r == ARCHIVE_FATAL) {
					error = true;
					break;
				}

				if (size <= seek) {
					seek -= size;
					continue;
				}

				std::vector<uint8_t> block((uint8_t*)buff + seek, (uint8_t*)buff + size);
				seek = 0;

				{
					std::lock_guard<std::mutex> lock(async->mtx);
					async->queue.push_back(std::move(block));
				}
				uv_async_send(&async->handle);
			}

			return IT_CB_STOP;
		}
	);

	{
		std::lock_guard<std::mutex> lock(async->mtx);
		async->error = it != IT_SUCCESS || !found || error;
		async->finished = true;
		uv_async_send(&async->handle);
	}

	if (--async->ref == 0) {
		delete async;
	}
}

void get_archive_entry(const v8::FunctionCallbackInfo<v8::Value>& info)
{
	v8::HandleScope _(ISOLATE);

	v8::Local<v8::Promise::Resolver> promise = v8::Promise::Resolver::New(CONTEXT).ToLocalChecked();
	info.GetReturnValue().Set(promise->GetPromise());

	if (info.Length() != 4
		|| !info[0]->IsFunction()
		|| !info[1]->IsString()
		|| !info[2]->IsString()
		|| !info[3]->IsBigInt())
	{
		promise->Reject(CONTEXT, to_string(ERROR_INVALID_ARGUMENT));
		return;
	}

	get_archive_entry_async* async = new get_archive_entry_async();
	async->handle.data = async;
	async->ref = 2;

	async->promise.Reset(ISOLATE, promise);

	async->abst = generic_path(to_string<_char_t>(info[1].As<v8::String>()));
	if (is_relative(async->abst) || is_traversal(async->abst)) {
		promise->Reject(CONTEXT, to_string(ERROR_INVALID_PATH));
		delete async;
		return;
	}
	async->path = generic_path(to_string<_char_t>(info[2].As<v8::String>()));
	if (is_traversal(async->path)) {
		promise->Reject(CONTEXT, to_string(ERROR_INVALID_T_PATH));
		delete async;
		return;
	}

	async->seek = info[3].As<v8::BigInt>()->Int64Value();
	if (async->seek < 0) {
		promise->Reject(CONTEXT, to_string(ERROR_INVALID_ARGUMENT));
		delete async;
		return;
	}

	v8::Local<v8::Function> readable = info[0].As<v8::Function>();

	// const options: stream.ReadableOptions = { read: () => {} }
	v8::Local<v8::Object> options = v8::Object::New(ISOLATE);
	v8::Local<v8::Function> read = v8::Function::New(
		CONTEXT,
		[](const v8::FunctionCallbackInfo<v8::Value>&) {}
	).ToLocalChecked();
	options->Set(CONTEXT, to_string("read"), read);

	// const reader: stream.Readable = new stream.Readable(options)
	constexpr int argc = 1;
	v8::Local<v8::Value> argv[argc] = {options};
	v8::Local<v8::Object> reader = readable->NewInstance(CONTEXT, argc, argv).ToLocalChecked();
	v8::Local<v8::Function> push = reader->Get(CONTEXT, to_string("push")).ToLocalChecked().As<v8::Function>();

	// reader.pause()
	v8::Local<v8::Function> pause = reader->Get(CONTEXT, to_string("pause")).ToLocalChecked().As<v8::Function>();
	pause->Call(CONTEXT, reader, 0, nullptr);

	async->reader.Reset(ISOLATE, reader);
	async->push.Reset(ISOLATE, push);

	async->resolved = false;

	async->size = 0;
	async->ready = false;
	async->error = false;
	async->finished = false;

	uv_async_init(uv_default_loop(), &async->handle, get_archive_entry_callback);
	std::thread(get_archive_entry_thread, async).detach();
}

#endif // include guard
