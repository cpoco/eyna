# SHA512
# curl -L https://github.com/libgit2/libgit2/archive/v1.9.7.tar.gz | shasum -a 512

vcpkg_from_github(
    OUT_SOURCE_PATH SOURCE_PATH
    REPO            libgit2/libgit2
    REF             v1.9.7
    SHA512          96924a4fd87669ad91d40669946cd249b646f3ce85380fc12b553b6c20338ff3c1df5faa6f168b2ca12ed20c8309116a05021f9710ee7ff61e5b8a249172b0ba
)

vcpkg_cmake_configure(
    SOURCE_PATH "${SOURCE_PATH}"
    OPTIONS
        -C "${CMAKE_CURRENT_LIST_DIR}/options.cmake"
)

vcpkg_cmake_build()

vcpkg_cmake_install()

vcpkg_fixup_pkgconfig()

vcpkg_cmake_config_fixup(CONFIG_PATH "lib/cmake/${PORT}")

file(
    REMOVE_RECURSE
    "${CURRENT_PACKAGES_DIR}/share/man"
)

file(
    INSTALL     "${SOURCE_PATH}/COPYING"
    DESTINATION "${CURRENT_PACKAGES_DIR}/share/${PORT}"
    RENAME      copyright
)
