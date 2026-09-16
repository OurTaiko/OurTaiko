# Keep runtime window icons inside the binary, independent of skins and cwd.
if(NOT ANDROID AND NOT IOS AND NOT EMSCRIPTEN)
  set(_window_icon "${CMAKE_SOURCE_DIR}/assets/branding/icon-256.png")
  set_property(DIRECTORY APPEND PROPERTY CMAKE_CONFIGURE_DEPENDS "${_window_icon}")
  file(READ "${_window_icon}" _icon_hex HEX)
  string(REGEX REPLACE "([0-9a-f][0-9a-f])" "0x\\1," _icon_bytes "${_icon_hex}")
  file(MAKE_DIRECTORY "${CMAKE_BINARY_DIR}/generated")
  file(WRITE "${CMAKE_BINARY_DIR}/generated/app_icon_data.h"
    "#pragma once\ninline constexpr unsigned char OURTAIKO_ICON_PNG[] = {${_icon_bytes}};\n")
endif()

if(APPLE AND NOT IOS)
  # Finder launcher for the existing portable distribution. Keep the executable,
  # writable player data and dylibs in their established sibling locations.
  configure_file("${CMAKE_SOURCE_DIR}/macos/Info.plist.in"
    "${CMAKE_BINARY_DIR}/generated/macos-Info.plist" @ONLY)
  add_custom_target(desktop_icons ALL
    COMMAND ${CMAKE_COMMAND} -E make_directory
      "$<TARGET_FILE_DIR:${PROJECT_NAME}>/OurTaiko.app/Contents/MacOS"
      "$<TARGET_FILE_DIR:${PROJECT_NAME}>/OurTaiko.app/Contents/Resources"
    COMMAND ${CMAKE_COMMAND} -E copy_if_different
      "${CMAKE_BINARY_DIR}/generated/macos-Info.plist"
      "$<TARGET_FILE_DIR:${PROJECT_NAME}>/OurTaiko.app/Contents/Info.plist"
    COMMAND ${CMAKE_COMMAND} -E copy_if_different
      "${CMAKE_SOURCE_DIR}/macos/OurTaiko.icns"
      "$<TARGET_FILE_DIR:${PROJECT_NAME}>/OurTaiko.app/Contents/Resources/OurTaiko.icns"
    COMMAND ${CMAKE_COMMAND} -E copy_if_different
      "${CMAKE_SOURCE_DIR}/macos/launch.sh"
      "$<TARGET_FILE_DIR:${PROJECT_NAME}>/OurTaiko.app/Contents/MacOS/OurTaiko"
    VERBATIM)
  add_dependencies(desktop_icons ${PROJECT_NAME})
elseif(UNIX AND NOT ANDROID AND NOT IOS AND NOT EMSCRIPTEN)
  add_custom_target(desktop_icons ALL
    COMMAND ${CMAKE_COMMAND} -E make_directory "$<TARGET_FILE_DIR:${PROJECT_NAME}>"
    COMMAND ${CMAKE_COMMAND} -E copy_if_different
      "${CMAKE_SOURCE_DIR}/assets/branding/icon-256.png"
      "$<TARGET_FILE_DIR:${PROJECT_NAME}>/OurTaiko.png"
    COMMAND ${CMAKE_COMMAND} -E copy_if_different
      "${CMAKE_SOURCE_DIR}/linux/install-desktop-entry.py"
      "$<TARGET_FILE_DIR:${PROJECT_NAME}>/install-desktop-entry.py"
    VERBATIM)
  add_dependencies(desktop_icons ${PROJECT_NAME})
endif()

if(EMSCRIPTEN)
  target_link_options(${PROJECT_NAME} PRIVATE
    "SHELL:--pre-js ${CMAKE_SOURCE_DIR}/assets/branding/web-icon.js")
  set_property(TARGET ${PROJECT_NAME} APPEND PROPERTY LINK_DEPENDS
    "${CMAKE_SOURCE_DIR}/assets/branding/web-icon.js")
endif()
