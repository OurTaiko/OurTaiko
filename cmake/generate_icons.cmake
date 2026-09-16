# The icon catalog and RC inputs must exist before project generation.
find_package(Python3 REQUIRED COMPONENTS Interpreter)
set_property(DIRECTORY APPEND PROPERTY CMAKE_CONFIGURE_DEPENDS
  "${CMAKE_SOURCE_DIR}/assets/branding/icon.png"
  "${CMAKE_SOURCE_DIR}/tools/generate_icons.py"
  "${CMAKE_SOURCE_DIR}/tools/requirements-icons.txt")
execute_process(
  COMMAND "${Python3_EXECUTABLE}" "${CMAKE_SOURCE_DIR}/tools/generate_icons.py" --ensure
  RESULT_VARIABLE _icons_result
  OUTPUT_VARIABLE _icons_output
  ERROR_VARIABLE _icons_error)
if(NOT _icons_result EQUAL 0)
  message(FATAL_ERROR "Application icon generation failed:\n${_icons_output}${_icons_error}")
endif()
string(STRIP "${_icons_output}" _icons_output)
message(STATUS "${_icons_output}")
