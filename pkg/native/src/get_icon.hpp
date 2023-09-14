#ifndef NATIVE_GET_ICON
#define NATIVE_GET_ICON

#include "common.hpp"

struct get_icon_work
{
	uv_work_t request;

	v8::Persistent<v8::Promise::Resolver> promise;

	_string_t abst;
	int8_t* data;
	size_t size;
};

static void get_icon_async(uv_work_t* req)
{
	get_icon_work* work = static_cast<get_icon_work*>(req->data);

	#if _OS_WIN_

		std::replace(work->abst.begin(), work->abst.end(), L'/', L'\\');

		SHFILEINFOW file = {};
		HIMAGELIST list = reinterpret_cast<HIMAGELIST>(SHGetFileInfoW(work->abst.c_str(), 0, &file, sizeof(SHFILEINFOW), SHGFI_SYSICONINDEX));
		HICON icon = ImageList_GetIcon(list, file.iIcon, ILD_NORMAL);

		ICONINFO info = {};
		GetIconInfo(icon, &info);

		CoInitialize(NULL);

		IStream* stream = NULL;
		CreateStreamOnHGlobal(NULL, TRUE, &stream);

		IWICImagingFactory* factory = NULL;
		CoCreateInstance(CLSID_WICImagingFactory, NULL, CLSCTX_INPROC_SERVER, IID_PPV_ARGS(&factory));

		IWICBitmapEncoder* encoder = NULL;
		factory->CreateEncoder(GUID_ContainerFormatPng, NULL, &encoder);
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
		work->data = new int8_t[work->size];

		LARGE_INTEGER zero = {};
		stream->Seek(zero, STREAM_SEEK_SET, NULL);
		stream->Read(work->data, work->size, NULL);

		flame->Release();
		bitmap->Release();
		encoder->Release();
		factory->Release();
		stream->Release();

		CoUninitialize();

		DestroyIcon(file.hIcon);

	#elif _OS_MAC_

		NSImage* img = [[NSWorkspace sharedWorkspace] iconForFile:[NSString stringWithCString:work->abst.c_str() encoding:NSUTF8StringEncoding]];
		NSData* png = [[NSBitmapImageRep imageRepWithData:[img TIFFRepresentation]] representationUsingType:NSBitmapImageFileTypePNG properties:@{}];

		work->size = png.length;
		work->data = new int8_t[work->size];

		memcpy(work->data, [png bytes], png.length);

	#endif
}

static void get_icon_complete(uv_work_t* req, int status)
{
	v8::HandleScope _(ISOLATE);

	get_icon_work* work = static_cast<get_icon_work*>(req->data);

	std::shared_ptr<v8::BackingStore> backing =
		v8::ArrayBuffer::NewBackingStore(
			work->data,
			work->size,
			[](void* data, size_t size, void* work)
			{
				delete[] static_cast<int8_t*>(data);
				delete static_cast<get_icon_work*>(work);
			},
			work);  

	v8::Local<v8::ArrayBuffer> buff = v8::ArrayBuffer::New(ISOLATE, std::move(backing));

	work->promise.Get(ISOLATE)->Resolve(CONTEXT, buff);
	work->promise.Reset();
}

void get_icon(const v8::FunctionCallbackInfo<v8::Value>& info)
{
	v8::HandleScope _(ISOLATE);

	v8::Local<v8::Promise::Resolver> promise = v8::Promise::Resolver::New(CONTEXT).ToLocalChecked();
	info.GetReturnValue().Set(promise->GetPromise());

	if (info.Length() != 1 || !info[0]->IsString()) {
		promise->Reject(CONTEXT, v8::Undefined(ISOLATE));
		return;
	}

	get_icon_work* work = new get_icon_work();
	work->request.data = work;

	work->promise.Reset(ISOLATE, promise);

	work->abst = to_string(info[0]->ToString(CONTEXT).ToLocalChecked());
	work->data = nullptr;
	work->size = 0;

	uv_queue_work(uv_default_loop(), &work->request, get_icon_async, get_icon_complete);
}

#endif // include guard
