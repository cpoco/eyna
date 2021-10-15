# https://gyp.gsrc.io/docs/InputFormatReference.md
{
	"targets": [
		{
			"target_name": "native",

			"include_dirs": [
				"../boost",
			],

			# common
			"sources": [
				"./src/main.cpp",
				"../boost/libs/filesystem/src/codecvt_error_category.cpp",
				"../boost/libs/filesystem/src/directory.cpp",
				"../boost/libs/filesystem/src/exception.cpp",
				"../boost/libs/filesystem/src/operations.cpp",
				"../boost/libs/filesystem/src/path.cpp",
				"../boost/libs/filesystem/src/path_traits.cpp",
				"../boost/libs/filesystem/src/portability.cpp",
				"../boost/libs/filesystem/src/unique_path.cpp",
				"../boost/libs/filesystem/src/utf8_codecvt_facet.cpp",
				"../boost/libs/filesystem/src/windows_file_codecvt.cpp",
			],
			"defines": [
				"BOOST_FILESYSTEM_NO_LIB",
				"BOOST_SYSTEM_NO_LIB",
			],

			"conditions": [
				# win
				["OS=='win'", {
					"sources": [
					],
					"defines": [
					],
					"msvs_settings": {
						"VCCLCompilerTool": {
							"ExceptionHandling": "2", # /EHa
							'DisableSpecificWarnings': [
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
						"GCC_ENABLE_CPP_EXCEPTIONS": "YES",
						"OTHER_CFLAGS": [
							"-ObjC++",
							"-Wno-unused-result"
						],
					},
				}],
			],
		}
	]
}