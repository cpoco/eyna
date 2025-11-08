# https://gyp.gsrc.io/docs/InputFormatReference.md
{
	"targets": [
		{
			"target_name": "native",

			"sources": [
				"./src/main.cpp",
			],

			"conditions": [
				# win
				["OS=='win'", {
					"msvs_settings": {
						"VCCLCompilerTool": {
							"AdditionalOptions": [
								"/EHa",
								"/std:c++20",
								"/utf-8",
							],
						},
					},
				}],
				# mac
				["OS=='mac'", {
					"link_settings": {
						"libraries": [
							"$(SDKROOT)/System/Library/Frameworks/Foundation.framework",
							"$(SDKROOT)/System/Library/Frameworks/AppKit.framework",
						],
					},
					"xcode_settings": {
						"MACOSX_DEPLOYMENT_TARGET": "11.0",
						"CLANG_CXX_LANGUAGE_STANDARD": "c++20",
						"CLANG_CXX_LIBRARY": "libc++",
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