#ifndef NATIVE_GET_ICON
#define NATIVE_GET_ICON

#include "common.hpp"

struct get_icon_work
{
	uv_work_t request;

	v8::Persistent<v8::Promise::Resolver> promise;

	_string_t abst; // generic_path
	char* data;
	size_t size;
};

static void get_icon_async(uv_work_t* req)
{
	get_icon_work* work = static_cast<get_icon_work*>(req->data);

	#if _OS_WIN_

		std::replace(work->abst.begin(), work->abst.end(), L'/', L'\\');

		SHFILEINFOW file = {};
		if (SHGetFileInfoW(work->abst.c_str(), 0, &file, sizeof(SHFILEINFOW), SHGFI_ICON) == 0) {
			return;
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

	#elif _OS_MAC_

		NSImage* src = [[NSWorkspace sharedWorkspace] iconForFile:[NSString stringWithCString:work->abst.c_str() encoding:NSUTF8StringEncoding]];
		NSBitmapImageRep* dst =
			[[NSBitmapImageRep alloc]
				initWithBitmapDataPlanes:NULL
				pixelsWide:32
				pixelsHigh:32
				bitsPerSample:8
				samplesPerPixel:4
				hasAlpha:YES
				isPlanar:NO
				colorSpaceName:NSCalibratedRGBColorSpace
				bitmapFormat:0
				bytesPerRow:0
				bitsPerPixel:0];

		[NSGraphicsContext setCurrentContext:[NSGraphicsContext graphicsContextWithBitmapImageRep:dst]];
		[src drawInRect:NSMakeRect(0, 0, dst.size.width, dst.size.height) fromRect:NSMakeRect(0, 0, src.size.width, src.size.height) operation:NSCompositingOperationCopy fraction:1.0];

		NSData* png = [dst representationUsingType:NSBitmapImageFileTypePNG properties:@{}];

		work->size = png.length;
		work->data = new char[work->size];

		memcpy(work->data, [png bytes], png.length);
	#endif
}

static void get_icon_complete(uv_work_t* req, int status)
{
	v8::HandleScope _(ISOLATE);

	get_icon_work* work = static_cast<get_icon_work*>(req->data);

	work->promise.Get(ISOLATE)->Resolve(CONTEXT, node::Buffer::Copy(ISOLATE, work->data, work->size).ToLocalChecked());
	work->promise.Reset();

	delete[] work->data;
	delete work;
}

void get_icon(const v8::FunctionCallbackInfo<v8::Value>& info)
{
	v8::HandleScope _(ISOLATE);

	v8::Local<v8::Promise::Resolver> promise = v8::Promise::Resolver::New(CONTEXT).ToLocalChecked();
	info.GetReturnValue().Set(promise->GetPromise());

	if (info.Length() != 1 || !info[0]->IsString()) {
		promise->Reject(CONTEXT, to_string(V("invalid argument")));
		return;
	}

	get_icon_work* work = new get_icon_work();
	work->request.data = work;

	work->promise.Reset(ISOLATE, promise);

	work->abst = generic_path(std::filesystem::path(to_string(info[0]->ToString(CONTEXT).ToLocalChecked())));
	if (is_relative(work->abst) || is_traversal(work->abst)) {
		promise->Reject(CONTEXT, to_string(V("relative or traversal paths are not allowed")));
		delete work;
		return;
	}

	work->data = nullptr;

	work->size = 0;

	uv_queue_work(uv_default_loop(), &work->request, get_icon_async, get_icon_complete);
}

#endif // include guard
