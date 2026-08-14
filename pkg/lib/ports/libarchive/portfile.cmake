vcpkg_from_github(
    OUT_SOURCE_PATH SOURCE_PATH
    REPO            libarchive/libarchive
    REF             v3.8.9
    SHA512          c5d85564b70e3af24edc69f34829c70ba3abcaf042ba444e9344e54e594ac88a9cc22dcd21c806e2650f1ffde71e16aeaf70e9748d7ba124207ee832938656da
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
