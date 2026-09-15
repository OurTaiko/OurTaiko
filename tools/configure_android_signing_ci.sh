#!/usr/bin/env bash
# CI builds without a release key use an explicitly selected test signing key.
set -euo pipefail

names=(ANDROID_KEYSTORE_BASE64 ANDROID_KEYSTORE_PASSWORD ANDROID_KEY_ALIAS ANDROID_KEY_PASSWORD)
configured=0
for name in "${names[@]}"; do
  if [[ -n "${!name:-}" ]]; then configured=$((configured + 1)); fi
done

if [[ "$configured" == 0 ]]; then
  if [[ "${PUBLISH_RELEASE:-false}" == true ]]; then
    echo '::error::Publishing requires all four Android signing secrets. Run without publish_release for a test-signed build.'
    exit 1
  fi
  echo 'debug_signing=true' >> "${GITHUB_OUTPUT:?}"
  echo '### Android signing: test key' >> "${GITHUB_STEP_SUMMARY:?}"
  echo 'This APK uses the Android debug key for testing. Configure release signing secrets before publishing. Test keys may differ between runs.' >> "$GITHUB_STEP_SUMMARY"
elif [[ "$configured" != 4 ]]; then
  echo '::error::Incomplete Android signing configuration. Set all four ANDROID_KEYSTORE_BASE64, ANDROID_KEYSTORE_PASSWORD, ANDROID_KEY_ALIAS, ANDROID_KEY_PASSWORD secrets, or remove all four for test builds.'
  exit 1
else
  umask 077
  printf '%s' "$ANDROID_KEYSTORE_BASE64" | base64 --decode > android/ourtaiko-release.jks
  test -s android/ourtaiko-release.jks
  # Environment variables avoid Java Properties escaping issues in passwords.
  echo 'debug_signing=false' >> "${GITHUB_OUTPUT:?}"
  echo '### Android signing: release key' >> "${GITHUB_STEP_SUMMARY:?}"
fi
