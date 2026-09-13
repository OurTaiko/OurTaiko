#include "entry_overlay.h"
#include "../../libs/fanmade.h"

EntryOverlay::EntryOverlay() {
    if (!load("EntryOverlay", "entry_overlay", fanmade::client().online())) return;
    fn_update = lua_object["update"];
    fn_draw   = lua_object["draw"];
}

void EntryOverlay::update(double current_ms) {
    online = fanmade::client().online();
    call(fn_update, "EntryOverlay:update", current_ms, online);
}
void EntryOverlay::draw(float x, float y)    { call(fn_draw,   "EntryOverlay:draw", x, y); }
