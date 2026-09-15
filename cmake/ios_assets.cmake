# Clear only generated asset trees so removed source assets do not ship in
# incremental builds. The app's writable Documents directory is unrelated.
file(REMOVE_RECURSE "${DEST_DIR}/Skins" "${DEST_DIR}/Songs" "${DEST_DIR}/shader")
file(MAKE_DIRECTORY "${DEST_DIR}")
file(COPY "${SOURCE_DIR}/LICENSE" "${SOURCE_DIR}/NOTICE" DESTINATION "${DEST_DIR}")
file(COPY "${SOURCE_DIR}/shader" DESTINATION "${DEST_DIR}")
file(COPY "${SKINS_DIR}/" DESTINATION "${DEST_DIR}/Skins"
  PATTERN ".git" EXCLUDE PATTERN ".git*" EXCLUDE)
file(COPY "${SONGS_DIR}/" DESTINATION "${DEST_DIR}/Songs" PATTERN ".git*" EXCLUDE)
file(READ "${SOURCE_DIR}/config.toml" _config)
string(REPLACE "touch_input = false" "touch_input = true" _config "${_config}")
string(REPLACE "vsync = false" "vsync = true" _config "${_config}")
file(WRITE "${DEST_DIR}/config.toml" "${_config}")

# Runtime compares this small token instead of traversing shader files on launch.
file(GLOB_RECURSE _shader_files RELATIVE "${SOURCE_DIR}/shader" "${SOURCE_DIR}/shader/*")
list(SORT _shader_files)
set(_shader_manifest "")
foreach(_shader IN LISTS _shader_files)
  file(SHA256 "${SOURCE_DIR}/shader/${_shader}" _shader_hash)
  string(APPEND _shader_manifest "${_shader}:${_shader_hash}\n")
endforeach()
string(SHA256 _shader_version "${_shader_manifest}")
file(WRITE "${DEST_DIR}/.shader-version" "${_shader_version}\n")
