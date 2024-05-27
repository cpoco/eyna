#ifndef NATIVE_COMMON_ATTRIBUTE
#define NATIVE_COMMON_ATTRIBUTE

#if _OS_WIN_
	typedef struct _REPARSE_DATA_BUFFER {
		ULONG  ReparseTag;
		USHORT ReparseDataLength;
		USHORT Reserved;
		union {
			struct {
				USHORT SubstituteNameOffset;
				USHORT SubstituteNameLength;
				USHORT PrintNameOffset;
				USHORT PrintNameLength;
				ULONG  Flags;
				WCHAR  PathBuffer[1];
			} SymbolicLinkReparseBuffer;
			struct {
				USHORT SubstituteNameOffset;
				USHORT SubstituteNameLength;
				USHORT PrintNameOffset;
				USHORT PrintNameLength;
				WCHAR  PathBuffer[1];
			} MountPointReparseBuffer;
			struct {
				UCHAR DataBuffer[1];
			} GenericReparseBuffer;
		} DUMMYUNIONNAME;
	} REPARSE_DATA_BUFFER, *PREPARSE_DATA_BUFFER;
#endif

enum FILE_TYPE {
	FILE_TYPE_NONE = 0,
	FILE_TYPE_DIRECTORY = 1,
	FILE_TYPE_LINK = 2,
	FILE_TYPE_FILE = 3,
	FILE_TYPE_SPECIAL = 10
};

enum LINK_TYPE {
	LINK_TYPE_NONE = 0,
	LINK_TYPE_SYMBOLIC = 1, //           (FILE_TYPE_LINK)
	LINK_TYPE_JUNCTION = 2, // win       (FILE_TYPE_LINK)
	LINK_TYPE_SHORTCUT = 3, // win       (FILE_TYPE_FILE)
	LINK_TYPE_BOOKMARK = 4, // mac alias (FILE_TYPE_FILE)
};

struct _attribute
{
	FILE_TYPE file_type = FILE_TYPE::FILE_TYPE_NONE;

	std::filesystem::path full; // generic_path

	LINK_TYPE link_type = LINK_TYPE::LINK_TYPE_NONE;

	std::filesystem::path link; // generic_path

	int64_t size = 0;
	int64_t time = 0;
	int64_t nsec = 0;

	bool readonly = false;
	bool hidden = false;
	bool system = false;
	bool pseudo = false;

	// https://docs.microsoft.com/ja-jp/windows/desktop/FileIO/file-attribute-constants
	unsigned long win_attribute = 0;
	// https://developer.apple.com/documentation/foundation/nsurlfileresourcetype
	_string_t mac_attribute;
};


void attribute(_attribute& attribute)
{
	#if _OS_WIN_

		WIN32_FILE_ATTRIBUTE_DATA info = {};

		if (0 != GetFileAttributesExW(attribute.full.c_str(), GetFileExInfoStandard, &info)) {

			attribute.size = (int64_t)info.nFileSizeHigh << 32 | info.nFileSizeLow;

			int64_t time = (int64_t)info.ftLastWriteTime.dwHighDateTime << 32 | info.ftLastWriteTime.dwLowDateTime;
			if (time != 0) {
				time -= 116444736000000000;
			}
			attribute.time = time / 10000000;
			attribute.nsec = time % 10000000;

			attribute.win_attribute = info.dwFileAttributes;

			if (attribute.win_attribute & FILE_ATTRIBUTE_DEVICE) {
				attribute.file_type = FILE_TYPE::FILE_TYPE_NONE;
			}
			else if (attribute.win_attribute & FILE_ATTRIBUTE_REPARSE_POINT) {
				attribute.file_type = FILE_TYPE::FILE_TYPE_LINK;
			}
			else if (attribute.win_attribute & FILE_ATTRIBUTE_DIRECTORY) {
				attribute.file_type = FILE_TYPE::FILE_TYPE_DIRECTORY;
			}
			else {
				attribute.file_type = FILE_TYPE::FILE_TYPE_FILE;
			}

			attribute.readonly = 0 != (attribute.win_attribute & FILE_ATTRIBUTE_READONLY);
			attribute.hidden   = 0 != (attribute.win_attribute & FILE_ATTRIBUTE_HIDDEN);
			attribute.system   = 0 != (attribute.win_attribute & FILE_ATTRIBUTE_SYSTEM);
			attribute.pseudo   = 0 != (attribute.win_attribute & FILE_ATTRIBUTE_RECALL_ON_DATA_ACCESS);

			if (attribute.file_type == FILE_TYPE::FILE_TYPE_LINK) {

				HANDLE handle = CreateFileW(attribute.full.c_str(), 0, 0, NULL, OPEN_EXISTING, FILE_FLAG_OPEN_REPARSE_POINT | FILE_FLAG_BACKUP_SEMANTICS, NULL);

				if (handle != NULL) {

					int8_t buffer[MAXIMUM_REPARSE_DATA_BUFFER_SIZE];
					REPARSE_DATA_BUFFER* reparse_data = (REPARSE_DATA_BUFFER*)buffer;
					DWORD bytes;

					if (handle != INVALID_HANDLE_VALUE && DeviceIoControl(handle, FSCTL_GET_REPARSE_POINT, NULL, 0, buffer, sizeof(buffer), &bytes, NULL)) {
						// シンボリック
						if (reparse_data->ReparseTag == IO_REPARSE_TAG_SYMLINK) {
							_string_t str(
								reparse_data->SymbolicLinkReparseBuffer.PathBuffer + (reparse_data->SymbolicLinkReparseBuffer.SubstituteNameOffset / sizeof(_char_t)),
								reparse_data->SymbolicLinkReparseBuffer.SubstituteNameLength / sizeof(_char_t));

							std::replace(str.begin(), str.end(), L'\\', L'/');

							if (std::regex_search(str, std::wregex(L"^/\\?\\?/[a-z]:($|/)", std::regex::flag_type::icase))) {
								str.erase(0, 4);
							}
							else if (std::regex_search(str, std::wregex(L"^/\\?\\?/unc/", std::regex::flag_type::icase))) {
								str.erase(1, 6);
							}

							attribute.link_type = LINK_TYPE::LINK_TYPE_SYMBOLIC;
							attribute.link = std::filesystem::path(str);
						}
						// ジャンクション
						else if (reparse_data->ReparseTag == IO_REPARSE_TAG_MOUNT_POINT) {
							_string_t str(
								reparse_data->MountPointReparseBuffer.PathBuffer + (reparse_data->MountPointReparseBuffer.SubstituteNameOffset / sizeof(_char_t)),
								reparse_data->MountPointReparseBuffer.SubstituteNameLength / sizeof(_char_t));

							std::replace(str.begin(), str.end(), L'\\', L'/');

							if (std::regex_search(str, std::wregex(L"^/\\?\\?/[a-z]:($|/)", std::regex::flag_type::icase))) {
								str.erase(0, 4);
							}
							else {
								str = L"";
							}

							attribute.link_type = LINK_TYPE::LINK_TYPE_JUNCTION;
							attribute.link = std::filesystem::path(str);
						}
					}

					CloseHandle(handle);
				}
			}
			else if (attribute.file_type == FILE_TYPE::FILE_TYPE_FILE) {

				if (std::regex_match(attribute.full.extension().c_str(), std::wregex(L"^\\.lnk$", std::regex::flag_type::icase))) {

					IShellLinkW* shell;
					CoCreateInstance(CLSID_ShellLink, NULL, CLSCTX_INPROC_SERVER, IID_PPV_ARGS(&shell));

					IPersistFile* file;
					shell->QueryInterface(IID_PPV_ARGS(&file));

					file->Load(attribute.full.c_str(), STGM_READ);

					_char_t out[MAX_PATH] = {};
					shell->GetPath(out, MAX_PATH, NULL, SLGP_RAWPATH);

					file->Release();

					shell->Release();

					int len = wcslen(out);
					if (0 < len) {
						attribute.link_type = LINK_TYPE::LINK_TYPE_SHORTCUT;
						attribute.link = generic_path(std::filesystem::path(_string_t(out, len)));
					}
				}
			}
		}

	#elif _OS_MAC_

		struct stat st;

		if (-1 != lstat(attribute.full.c_str(), &st)) {

			NSURL* url = [NSURL fileURLWithPath:[NSString stringWithCString:attribute.full.c_str() encoding:NSUTF8StringEncoding]];

			NSError* error = nil;
			NSDictionary* dic = [url resourceValuesForKeys:@[
				NSURLFileResourceTypeKey,
				NSURLIsAliasFileKey,
				NSURLIsUserImmutableKey,
				NSURLIsHiddenKey,
				NSURLIsSystemImmutableKey
			] error:&error];

			if (error != nil) {
				return;
			}

			attribute.size = st.st_size;
			attribute.time = st.st_mtimespec.tv_sec;
			attribute.nsec = st.st_mtimespec.tv_nsec;

			NSString* type = [dic objectForKey:NSURLFileResourceTypeKey];

			attribute.mac_attribute = _string_t([type UTF8String]);

			if ([type isEqualToString:NSURLFileResourceTypeSymbolicLink]) {
				attribute.file_type = FILE_TYPE::FILE_TYPE_LINK;
			}
			else if ([type isEqualToString:NSURLFileResourceTypeDirectory]) {
				attribute.file_type = FILE_TYPE::FILE_TYPE_DIRECTORY;
			}
			else if ([type isEqualToString:NSURLFileResourceTypeRegular]) {
				attribute.file_type = FILE_TYPE::FILE_TYPE_FILE;
			}
			else {
				attribute.file_type = FILE_TYPE::FILE_TYPE_SPECIAL;
			}

			attribute.readonly = [[dic objectForKey:NSURLIsUserImmutableKey] boolValue];
			attribute.hidden = [[dic objectForKey:NSURLIsHiddenKey] boolValue];
			attribute.system = [[dic objectForKey:NSURLIsSystemImmutableKey] boolValue];

			NSString* pseudo;
			if ([url getResourceValue:&pseudo forKey:NSURLUbiquitousItemDownloadingStatusKey error:&error]) {
				if ([pseudo isEqualToString:NSURLUbiquitousItemDownloadingStatusNotDownloaded]) {
					attribute.pseudo = true;
				}
			}

			if (attribute.file_type == FILE_TYPE::FILE_TYPE_LINK) {
				if ([[dic objectForKey:NSURLIsAliasFileKey] boolValue]) {
					attribute.link_type = LINK_TYPE::LINK_TYPE_SYMBOLIC;

					_char_t link[PATH_MAX] = {};
					if (-1 != readlink(attribute.full.c_str(), link, PATH_MAX)) {
						attribute.link = std::filesystem::path(_string_t(link));
					}
				}
			}
			else if (attribute.file_type == FILE_TYPE::FILE_TYPE_FILE) {
				if ([[dic objectForKey:NSURLIsAliasFileKey] boolValue]) {
					attribute.link_type = LINK_TYPE::LINK_TYPE_BOOKMARK;

					// int options = NSURLBookmarkResolutionWithoutUI | NSURLBookmarkResolutionWithoutMounting; // マウントボリューム先の場合は自動接続を行わない
					// NSURL* bookmark = [NSURL URLByResolvingAliasFileAtURL:url options:options error:&error];
					// if (error == nil) {
					// 	attribute.link = std::filesystem::path(_string_t([[bookmark path] UTF8String]));
					// }
					NSData* data = [NSURL bookmarkDataWithContentsOfURL:url error:&error];
					if (error == nil) {
						NSDictionary* d = [NSURL resourceValuesForKeys:@[NSURLPathKey] fromBookmarkData:data];
						attribute.link = std::filesystem::path(_string_t([[d objectForKey:NSURLPathKey] UTF8String]));
					}
				}
			}
		}

	#endif
}

void attribute(const std::filesystem::path& path, std::vector<_attribute>& vector)
{
	vector.push_back({});

	for (_attribute& a : vector) {
		if (!a.full.empty() && a.full == path) {
			return;
		}
	}

	_attribute& attr = vector.back();

	attr.full = path;

	attribute(attr);

	if (attr.link_type != LINK_TYPE::LINK_TYPE_NONE) {
		if (attr.link.is_absolute()) {
			attribute(generic_path(attr.link, true), vector);
		}
		else if (attr.link.is_relative()) {
			attribute(generic_path(attr.full.parent_path() / attr.link, true), vector);
		}
		else {
			vector.push_back({});
		}
	}
}

#endif // include guard
