#ifndef NATIVE_COMMON_ITERATOR
#define NATIVE_COMMON_ITERATOR

constexpr size_t BLOCK_SIZE = 0x10000;

#define IT_SUCCESS 0
#define IT_INIT_FAILURE -1
#define IT_OPEN_FAILURE -2
#define IT_READ_FAILURE -3
#define IT_EXCEPTION -10

#define IT_CB_NEXT 0
#define IT_CB_STOP 1
#define IT_CB_FAILURE 2

typedef std::function<int(struct archive*, struct archive_entry*)> archive_iterator_callback;

struct archive_deleter {
	void operator()(struct archive* a) const noexcept {
		if (a) {
			archive_read_close(a);
			archive_read_free(a);
		}
	}
};

int archive_iterator(const std::filesystem::path& path, const archive_iterator_callback& callback) noexcept
{
	std::unique_ptr<struct archive, archive_deleter> a(archive_read_new());
	if (!a) {
		return IT_INIT_FAILURE;
	}

	archive_read_support_format_all(a.get());
	archive_read_support_filter_all(a.get());
	archive_read_set_options(a.get(), "!mac-ext");
	archive_read_set_options(a.get(), "hdrcharset=UTF-8");

	std::u8string p = path.u8string();
	int open = archive_read_open_filename(a.get(), reinterpret_cast<const char*>(p.c_str()), BLOCK_SIZE);

	if (open != ARCHIVE_OK) {
		return IT_OPEN_FAILURE;
	}

	try {
		while (true) {
			struct archive_entry* entry;
			int next = archive_read_next_header(a.get(), &entry);

			if (next == ARCHIVE_EOF) {
				return IT_SUCCESS;
			}
			else if (next == ARCHIVE_FAILED || next == ARCHIVE_FATAL) {
				return IT_READ_FAILURE;
			}

			int cb = callback(a.get(), entry);
			if (cb == IT_CB_STOP) {
				return IT_SUCCESS;
			} else if (cb != IT_CB_NEXT) {
				return cb;
			}
		}
	}
	catch (...) {
		return IT_EXCEPTION;
	}
}

#endif // include guard