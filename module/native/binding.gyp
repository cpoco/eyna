# https://gyp.gsrc.io/docs/InputFormatReference.md
{
	"targets": [
		{
			"target_name": "native",

			"include_dirs": [
				"../boost",
				"../boost/libs/atomic/src",
			],

			# common
			"sources": [
				"./src/main.cpp",
				"../boost/libs/atomic/src/find_address_sse2.cpp",
				"../boost/libs/atomic/src/find_address_sse41.cpp",
				"../boost/libs/atomic/src/lock_pool.cpp",
				"../boost/libs/filesystem/src/codecvt_error_category.cpp",
				"../boost/libs/filesystem/src/directory.cpp",
				"../boost/libs/filesystem/src/exception.cpp",
				"../boost/libs/filesystem/src/operations.cpp",
				"../boost/libs/filesystem/src/path.cpp",
				"../boost/libs/filesystem/src/path_traits.cpp",
				"../boost/libs/filesystem/src/portability.cpp",
				"../boost/libs/filesystem/src/unique_path.cpp",
				"../boost/libs/filesystem/src/utf8_codecvt_facet.cpp",
			],
			"defines": [
				"BOOST_ALL_NO_LIB",
				"BOOST_FILESYSTEM_NO_CXX20_ATOMIC_REF",
			],

			"conditions": [
				# win
				["OS=='win'", {
					"sources": [
						"../boost/libs/atomic/src/wait_ops_windows.cpp",
						"../boost/libs/filesystem/src/windows_file_codecvt.cpp",
					],
					"defines": [
					],
					"msvs_settings": {
						"VCCLCompilerTool": {
							"ExceptionHandling": "2", # /EHa
							"DisableSpecificWarnings": [
								"4819",
								"4101",
								"4996",
							],
						},
					},
				}],
				# mac
				["OS=='mac'", {
					"sources": [
					],
					"defines": [
					],
					"link_settings": {
						"libraries": [
							"$(SDKROOT)/System/Library/Frameworks/Foundation.framework",
							"$(SDKROOT)/System/Library/Frameworks/AppKit.framework",
						],
					},
					"xcode_settings": {
						# "MACOSX_DEPLOYMENT_TARGET": "10.15",
						# "CLANG_CXX_LANGUAGE_STANDARD": "c++17",
						# "CLANG_CXX_LIBRARY": "libc++",
						"GCC_ENABLE_CPP_EXCEPTIONS": "YES",
						"OTHER_CFLAGS": [
							"-ObjC++",
						],
						"WARNING_CFLAGS": [
							"-Wno-unused-result",
						],
					},
				}],
			],
		}
	]
}