#ifndef NATIVE_COMMON_ICON
#define NATIVE_COMMON_ICON

struct icon_queue_entry
{
	uv_work_t*       handle;
	uv_work_cb       work_cb;
	uv_after_work_cb after_work_cb;
};

static bool                         icon_busy             = false;
static std::queue<icon_queue_entry> icon_queue;
static uv_after_work_cb             icon_current_complete = nullptr;

static void icon_queue_complete(uv_work_t* req, int status)
{
	icon_current_complete(req, status);

	icon_busy = false;

	if (!icon_queue.empty()) {
		icon_queue_entry entry = icon_queue.front();
		icon_queue.pop();

		icon_busy             = true;
		icon_current_complete = entry.after_work_cb;
		uv_queue_work(uv_default_loop(), entry.handle, entry.work_cb, icon_queue_complete);
	}
}

static void icon_queue_work(uv_work_t* handle, uv_work_cb work_cb, uv_after_work_cb after_work_cb)
{
	if (icon_busy) {
		icon_queue_entry entry;
		entry.handle        = handle;
		entry.work_cb       = work_cb;
		entry.after_work_cb = after_work_cb;
		icon_queue.push(entry);
	}
	else {
		icon_busy             = true;
		icon_current_complete = after_work_cb;
		uv_queue_work(uv_default_loop(), handle, work_cb, icon_queue_complete);
	}
}

#endif // include guard
