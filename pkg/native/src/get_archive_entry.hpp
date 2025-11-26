#ifndef NATIVE_GET_ARCHIVE_ENTRY
#define NATIVE_GET_ARCHIVE_ENTRY

#include "common.hpp"

struct get_archive_entry_async
{
	uv_async_t handle;

	v8::Global<v8::Object> reader;
	v8::Global<v8::Function> push;

	std::filesystem::path abst; // generic_path
	std::filesystem::path path; // generic_path

	std::mutex mtx;
	std::deque<std::vector<uint8_t>> queue;
	bool done = false;
};

// uv_close_cb
void get_archive_entry_close(uv_handle_t* handle)
{
	get_archive_entry_async* async = static_cast<get_archive_entry_async*>(handle->data);
	delete async;
}

// uv_async_cb
void get_archive_entry_callback(uv_async_t* handle)
{
	v8::HandleScope _(ISOLATE);

	get_archive_entry_async* async = static_cast<get_archive_entry_async*>(handle->data);

	v8::Local<v8::Object> stream = async->reader.Get(ISOLATE);
	v8::Local<v8::Function> push = async->push.Get(ISOLATE);

	std::deque<std::vector<uint8_t>> local;
	{
		std::lock_guard<std::mutex> lock(async->mtx);
		local.swap(async->queue);
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

	if (async->done) {
		// push(null)
		v8::Local<v8::Value> argv[1] = {v8::Null(ISOLATE)};
		push->Call(CONTEXT, stream, 1, argv);

		uv_close((uv_handle_t*)&async->handle, get_archive_entry_close);
	}
}

void get_archive_entry_worker(uv_async_t* handle)
{
	get_archive_entry_async* async = static_cast<get_archive_entry_async*>(handle->data);

	archive_iterator(
		async->abst,
		[&async](struct archive* a, struct archive_entry* entry) -> int
		{
			_entry ent = {};
			populate_entry(ent, entry);

			if (ent.full != async->path || ent.file_type != FILE_TYPE::FILE_TYPE_FILE) {
				archive_read_data_skip(a);
				return IT_CB_NEXT;
			}

			const void* buff;
			size_t size;
			la_int64_t offset;

			while (true) {
				int r = archive_read_data_block(a, &buff, &size, &offset);

				if (r == ARCHIVE_EOF) {
					break;
				}
				else if (r == ARCHIVE_FAILED || r == ARCHIVE_FATAL) {
					break;
				}

				std::vector<uint8_t> block((uint8_t*)buff, (uint8_t*)buff + size);
				{
					std::lock_guard<std::mutex> lock(async->mtx);
					async->queue.push_back(std::move(block));
				}
				uv_async_send(&async->handle);
			}

			return IT_CB_STOP;
		}
	);

	async->done = true;
	uv_async_send(&async->handle);
}

void get_archive_entry(const v8::FunctionCallbackInfo<v8::Value>& info)
{
	v8::HandleScope _(ISOLATE);

	if (info.Length() != 3 || !info[0]->IsObject() || !info[1]->IsString() || !info[2]->IsString()) {
		ISOLATE->ThrowException(to_string(ERROR_INVALID_ARGUMENT));
		return;
	}

	get_archive_entry_async* async = new get_archive_entry_async();
	async->handle.data = async;

	async->abst = generic_path(to_string(info[1].As<v8::String>()));
	if (is_relative(async->abst) || is_traversal(async->abst)) {
		ISOLATE->ThrowException(to_string(ERROR_INVALID_PATH));
		delete async;
		return;
	}
	async->path = generic_path(to_string(info[2].As<v8::String>()));
	if (is_traversal(async->path)) {
		ISOLATE->ThrowException(to_string(ERROR_INVALID_T_PATH));
		delete async;
		return;
	}

	v8::Local<v8::Object> readable = info[0].As<v8::Object>();

	// const options: stream.ReadableOptions = { read: () => {} }
	v8::Local<v8::Object> options = v8::Object::New(ISOLATE);
	v8::Local<v8::Function> read = v8::Function::New(
		CONTEXT,
		[](const v8::FunctionCallbackInfo<v8::Value>&) {}
	).ToLocalChecked();
	options->Set(CONTEXT, c_string("read"), read);

	// const reader: stream.Readable = new stream.Readable(options)
	constexpr int argc = 1;
	v8::Local<v8::Value> argv[argc] = {options};
	v8::Local<v8::Object> reader = readable->CallAsConstructor(CONTEXT, argc, argv).ToLocalChecked().As<v8::Object>();
	v8::Local<v8::Function> push = reader->Get(CONTEXT, c_string("push")).ToLocalChecked().As<v8::Function>();

	async->reader.Reset(ISOLATE, reader);
	async->push.Reset(ISOLATE, push);

	uv_async_init(uv_default_loop(), &async->handle, get_archive_entry_callback);

	std::thread(get_archive_entry_worker, &async->handle).detach();

	info.GetReturnValue().Set(reader);
}

#endif // include guard
