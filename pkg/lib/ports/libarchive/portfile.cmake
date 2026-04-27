vcpkg_from_github(
    OUT_SOURCE_PATH SOURCE_PATH
    REPO            libarchive/libarchive
    REF             v3.8.7
    SHA512          de485dbca636803fce6720dede7d0a6c3315cb209489c94167dd9388ebe56ba8819d3118045308f05b935c954950202d0adb0485bc074bc04ca8c47877f1fe60
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
