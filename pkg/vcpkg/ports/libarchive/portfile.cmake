# SHA512
# curl -L https://github.com/libarchive/libarchive/archive/v3.8.11.tar.gz | shasum -a 512

vcpkg_from_github(
    OUT_SOURCE_PATH SOURCE_PATH
    REPO            libarchive/libarchive
    REF             v3.8.11
    SHA512          6dba1d8899865304dc848b1ed43cfd2ee0d546084e6bb9ab1d6f693b048e54886e7323e92f19e164ef183afc785f7696c4010b81e63fe951ea9f07a267079d2f
)

vcpkg_cmake_configure(
    SOURCE_PATH "${SOURCE_PATH}"
    OPTIONS
        -C "${CMAKE_CURRENT_LIST_DIR}/options.cmake"
)

vcpkg_cmake_build()

vcpkg_cmake_install()

vcpkg_fixup_pkgconfig()

file(
    REMOVE_RECURSE
    "${CURRENT_PACKAGES_DIR}/share/man"
)

file(
    INSTALL     "${SOURCE_PATH}/COPYING"
    DESTINATION "${CURRENT_PACKAGES_DIR}/share/${PORT}"
    RENAME      copyright
)
