# SHA512
# curl -L https://github.com/libarchive/libarchive/archive/v3.8.10.tar.gz | shasum -a 512

vcpkg_from_github(
    OUT_SOURCE_PATH SOURCE_PATH
    REPO            libarchive/libarchive
    REF             v3.8.10
    SHA512          27b65bea66974a7f6279a3ceba77a3d0e2967c47a5ff56d91d3e2522326238bf5eca3965aefaabca830d5b1a0f44e1bad625a9f8d140d6cd6da307bf04881a24
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
