#ifndef NATIVE_COMMON_PATH
#define NATIVE_COMMON_PATH

boost::filesystem::path generic_path(const boost::filesystem::path& path)
{
	return boost::filesystem::path(path.generic_string<_char_t>());
}

boost::filesystem::path generic_path(const _string_t& str)
{
	return generic_path(boost::filesystem::path(str));
}

#endif // include guard
