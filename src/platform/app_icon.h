#pragma once

#include "../libs/ray.h"
#include "app_icon_data.h"
#include <SDL3/SDL.h>

inline void set_app_icon() {
    ray::Image icon = ray::LoadImageFromMemory(".png", OURTAIKO_ICON_PNG,
                                              static_cast<int>(sizeof(OURTAIKO_ICON_PNG)));
    if (!icon.data) return;

    // Use byte-order-independent RGBA32. raylib's SDL icon masks currently
    // interpret RGB image bytes as BGR on little-endian desktop platforms.
    ray::ImageFormat(&icon, ray::PIXELFORMAT_UNCOMPRESSED_R8G8B8A8);
    SDL_Surface* surface = SDL_CreateSurfaceFrom(icon.width, icon.height,
        SDL_PIXELFORMAT_RGBA32, icon.data, icon.width * 4);
    if (surface) {
        int count = 0;
        SDL_Window** windows = SDL_GetWindows(&count);
        for (int i = 0; windows && i < count; ++i) {
            SDL_SetWindowIcon(windows[i], surface);
        }
        SDL_free(windows);
        SDL_DestroySurface(surface);
    }
    ray::UnloadImage(icon);
}
