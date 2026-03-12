vcpkg_from_github(
    OUT_SOURCE_PATH SOURCE_PATH
    REPO            libarchive/libarchive
    REF             v3.8.6
    SHA512          33c8173e6a1bb28b1bd131400b64a618c8984efd9287adb54b5133927bd4268184e7e0fa23a81ada4a8de831ef9f4a35973cc4b795ee885eb927b4c73433b889
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
