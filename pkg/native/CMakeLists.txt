cmake_minimum_required(VERSION 3.31)

project(native)

if(NOT DEFINED NODE_RUNTIME_NAME)
  message(FATAL_ERROR "NODE_RUNTIME_NAME is required.")
endif()
if(NOT DEFINED NODE_RUNTIME_VERSION)
  message(FATAL_ERROR "NODE_RUNTIME_VERSION is required.")
endif()

message(STATUS "----------------------------------------")
message(STATUS "NODE_RUNTIME_NAME:    ${NODE_RUNTIME_NAME}")
message(STATUS "NODE_RUNTIME_VERSION: ${NODE_RUNTIME_VERSION}")
message(STATUS "----------------------------------------")

add_library(${PROJECT_NAME} MODULE
  ${CMAKE_SOURCE_DIR}/src/main.cpp
)

set_target_properties(${PROJECT_NAME} PROPERTIES
  PREFIX ""
  SUFFIX ".node"
  LIBRARY_OUTPUT_DIRECTORY_RELEASE "${CMAKE_SOURCE_DIR}/bin"
)

target_include_directories(${PROJECT_NAME} PRIVATE
  ${CMAKE_SOURCE_DIR}/../../cache/${NODE_RUNTIME_NAME}-${NODE_RUNTIME_VERSION}/include/node
)

target_compile_definitions(${PROJECT_NAME} PRIVATE
  USING_UV_SHARED=1
  USING_V8_SHARED=1
  V8_DEPRECATION_WARNINGS=1
  BUILDING_NODE_EXTENSION
)

if(NODE_RUNTIME_NAME STREQUAL "electron")
  target_compile_definitions(${PROJECT_NAME} PRIVATE
    ELECTRON_BUILD=1
  )
endif()

if(WIN32)
  target_compile_definitions(${PROJECT_NAME} PRIVATE
    LIBARCHIVE_STATIC
  )

  target_compile_options(${PROJECT_NAME} PRIVATE
    /std:c++20
    /utf-8
    /Zc:__cplusplus

    /EHa
    /MT

    /O2
    /GL
  )

  target_link_options(${PROJECT_NAME} PRIVATE
    /DELAYLOAD:node.exe
    /ignore:4199

    /LTCG
  )

  target_link_libraries(${PROJECT_NAME} PRIVATE
    ${CMAKE_SOURCE_DIR}/../../cache/${NODE_RUNTIME_NAME}-${NODE_RUNTIME_VERSION}/win-x64/node.lib
  )
  target_link_libraries(${PROJECT_NAME} PRIVATE
    kernel32.lib
    user32.lib
    gdi32.lib
    advapi32.lib
    shell32.lib
    ole32.lib
    delayimp.lib
  )
endif()

if(APPLE)
  target_compile_options(${PROJECT_NAME} PRIVATE
    -mmacosx-version-min=11.0
    -ObjC++

    -std=c++20
    -stdlib=libc++

    -fno-strict-aliasing
    -fexceptions

    -O3
    -flto

    -Wall
    -Wextra
    -Wno-unused-parameter
    -Wno-unused-result
  )

  target_link_options(${PROJECT_NAME} PRIVATE
    -stdlib=libc++

    -bundle
    -undefined dynamic_lookup

    -flto
  )

  target_link_libraries(${PROJECT_NAME} PRIVATE
    "-framework Foundation"
    "-framework AppKit"
  )
endif()
