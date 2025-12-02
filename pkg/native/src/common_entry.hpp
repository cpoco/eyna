#ifndef NATIVE_COMMON_ENTRY
#define NATIVE_COMMON_ENTRY

struct _entry
{
	FILE_TYPE file_type = FILE_TYPE::FILE_TYPE_NONE;
	std::filesystem::path full; // raw data

	LINK_TYPE link_type = LINK_TYPE::LINK_TYPE_NONE;
	std::filesystem::path link; // raw data

	int64_t size = 0;
	int64_t time = 0;
	int64_t nsec = 0;

	int depth = 0;
};

void populate_entry(_entry& out, struct archive_entry* entry)
{
	uint16_t mode = AE_IFMT & archive_entry_mode(entry);
	if (mode == AE_IFDIR) {
		out.file_type = FILE_TYPE::FILE_TYPE_DIRECTORY;
		out.link_type = LINK_TYPE::LINK_TYPE_NONE;
	}
	else if (mode == AE_IFREG) {
		out.file_type = FILE_TYPE::FILE_TYPE_FILE;
		out.link_type = LINK_TYPE::LINK_TYPE_NONE;
	}
	else if (mode == AE_IFLNK) {
		out.file_type = FILE_TYPE::FILE_TYPE_LINK;
		out.link_type = LINK_TYPE::LINK_TYPE_SYMBOLIC;
	}

	const char8_t* path = (char8_t*)archive_entry_pathname_utf8(entry);
	if (path != nullptr) {
		out.full = path;
		out.depth = std::ranges::distance(out.full) - 1;
		if (!out.full.has_filename()) {
			out.depth--;
		}
	}
	const char8_t* link = (char8_t*)archive_entry_symlink_utf8(entry);
	if (link != nullptr) {
		out.link = link;
	}

	out.size = archive_entry_size(entry);
	out.time = archive_entry_mtime(entry);
	out.nsec = archive_entry_mtime_nsec(entry);
}

#endif // include guard