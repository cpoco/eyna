#ifndef NATIVE_GET_ICON_TYPE
#define NATIVE_GET_ICON_TYPE

#include "common.hpp"

struct get_icon_type_work
{
	uv_work_t handle;

	v8::Global<v8::Promise::Resolver> promise;

	_string_t exte;
	char* data;
	size_t size;
};

static void get_icon_type_async(uv_work_t* req)
{
	get_icon_type_work* work = static_cast<get_icon_type_work*>(req->data);

	#if OS_WIN64

		SHFILEINFOW file = {};
		if (work->exte.size() == 0) {
			if (SHGetFileInfoW(L"file", FILE_ATTRIBUTE_NORMAL, &file, sizeof(SHFILEINFOW), SHGFI_ICON | SHGFI_USEFILEATTRIBUTES) == 0) {
				return;
			}
		}
		else if (work->exte.size() == 1 && work->exte[0] == V('/')) {
			if (SHGetFileInfoW(L"folder", FILE_ATTRIBUTE_DIRECTORY, &file, sizeof(SHFILEINFOW), SHGFI_ICON | SHGFI_USEFILEATTRIBUTES) == 0) {
				return;
			}
		}
		else {
			work->exte.insert(0, L".");
			if (SHGetFileInfoW(work->exte.c_str(), FILE_ATTRIBUTE_NORMAL, &file, sizeof(SHFILEINFOW), SHGFI_ICON | SHGFI_USEFILEATTRIBUTES) == 0) {
				return;
			}
		}

		ICONINFO info = {};
		if (GetIconInfo(file.hIcon, &info) == 0) {
			DestroyIcon(file.hIcon);
			return;
		}

		IWICImagingFactory* factory = NULL;
		CoCreateInstance(CLSID_WICImagingFactory, NULL, CLSCTX_INPROC_SERVER, IID_PPV_ARGS(&factory));

		IWICBitmapEncoder* encoder = NULL;
		factory->CreateEncoder(GUID_ContainerFormatPng, NULL, &encoder);

		IStream* stream = NULL;
		CreateStreamOnHGlobal(NULL, TRUE, &stream);
		encoder->Initialize(stream, WICBitmapEncoderNoCache);

		IWICBitmap* bitmap = NULL;
		factory->CreateBitmapFromHBITMAP(info.hbmColor, NULL, WICBitmapUseAlpha, &bitmap);

		IWICBitmapFrameEncode* flame = NULL;
		encoder->CreateNewFrame(&flame, NULL);
		flame->Initialize(NULL);
		flame->WriteSource(bitmap, NULL);
		flame->Commit();
		encoder->Commit();

		STATSTG stat = {};
		stream->Stat(&stat, STATFLAG_NONAME);

		work->size = static_cast<size_t>(stat.cbSize.QuadPart);
		work->data = new char[work->size];

		LARGE_INTEGER zero = {};
		stream->Seek(zero, STREAM_SEEK_SET, NULL);
		stream->Read(work->data, work->size, NULL);

		flame->Release();
		bitmap->Release();
		stream->Release();
		encoder->Release();
		factory->Release();

		DeleteObject(info.hbmColor);
		DeleteObject(info.hbmMask);

		DestroyIcon(file.hIcon);

	#elif OS_MAC64

		NSImage* src = nil;
		if (work->exte.size() == 0) {
			src = [[NSWorkspace sharedWorkspace] iconForFileType:NSFileTypeForHFSTypeCode(kGenericDocumentIcon)];
		}
		else if (work->exte.size() == 1 && work->exte[0] == V('/')) {
			src = [[NSWorkspace sharedWorkspace] iconForFileType:NSFileTypeForHFSTypeCode(kGenericFolderIcon)];
		}
		else {
			src = [[NSWorkspace sharedWorkspace] iconForFileType:[NSString stringWithCString:work->exte.c_str() encoding:NSUTF8StringEncoding]];
		}
		NSImage* dst = [[NSImage alloc] initWithSize:NSMakeSize(32, 32)];
		[dst lockFocus];
		[src drawInRect:NSMakeRect(0, 0, dst.size.width, dst.size.height) fromRect:NSMakeRect(0, 0, src.size.width, src.size.height) operation:NSCompositingOperationCopy fraction:1.0];
		[dst unlockFocus];

		NSData* png = [[NSBitmapImageRep imageRepWithData:[dst TIFFRepresentation]] representationUsingType:NSBitmapImageFileTypePNG properties:@{}];

		work->size = png.length;
		work->data = new char[work->size];

		memcpy(work->data, [png bytes], png.length);

	#endif
}

static void get_icon_type_complete(uv_work_t* req, int status)
{
	v8::HandleScope _(ISOLATE);

	get_icon_type_work* work = static_cast<get_icon_type_work*>(req->data);

	work->promise.Get(ISOLATE)->Resolve(CONTEXT, node::Buffer::Copy(ISOLATE, work->data, work->size).ToLocalChecked());

	delete[] work->data;
	delete work;
}

void get_icon_type(const v8::FunctionCallbackInfo<v8::Value>& info)
{
	v8::HandleScope _(ISOLATE);

	v8::Local<v8::Promise::Resolver> promise = v8::Promise::Resolver::New(CONTEXT).ToLocalChecked();
	info.GetReturnValue().Set(promise->GetPromise());

	if (info.Length() != 1 || !info[0]->IsString()) {
		promise->Reject(CONTEXT, to_string(ERROR_INVALID_ARGUMENT));
		return;
	}

	get_icon_type_work* work = new get_icon_type_work();
	work->handle.data = work;

	work->promise.Reset(ISOLATE, promise);

	work->exte = to_string(info[0].As<v8::String>());

	work->data = nullptr;

	work->size = 0;

	uv_queue_work(uv_default_loop(), &work->handle, get_icon_type_async, get_icon_type_complete);
}

#endif // include guard
