# https://github.com/libgit2/libgit2/blob/main/CMakeLists.txt


set(BUILD_SHARED_LIBS       OFF         CACHE BOOL   "")
set(BUILD_TESTS             OFF         CACHE BOOL   "")
set(BUILD_BENCHMARKS        OFF         CACHE BOOL   "")
set(BUILD_CLI               OFF         CACHE BOOL   "")
set(BUILD_EXAMPLES          OFF         CACHE BOOL   "")
set(BUILD_FUZZERS           OFF         CACHE BOOL   "")

set(USE_THREADS             OFF         CACHE STRING "")
set(USE_SSH                 OFF         CACHE STRING "")
set(USE_HTTP                OFF         CACHE STRING "")
set(USE_HTTPS               OFF         CACHE STRING "")
set(USE_SHA1         CollisionDetection CACHE STRING "")
set(USE_SHA256              builtin     CACHE STRING "")
set(USE_REGEX               builtin     CACHE STRING "")
set(USE_COMPRESSION         builtin     CACHE STRING "")
set(USE_NSEC                ON          CACHE STRING "")
