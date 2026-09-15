#include "timer.h"
#include "../../libs/global_data.h"

Timer::Timer(int time, double current_time_ms, std::function<void()> confirm_func) : last_update_ms(current_time_ms) {
    bool is_frozen = global_data.config->general.timer_frozen;
    if (!load("Timer", "timer", time, current_time_ms, confirm_func, is_frozen)) return;
    fn_update = lua_object["update"];
    fn_draw   = lua_object["draw"];
}

void Timer::update(double current_ms, bool paused) {
    if (paused || was_paused) paused_ms += current_ms - last_update_ms;
    last_update_ms = current_ms;
    was_paused = paused;
    if (!paused) call(fn_update, "Timer:update", current_ms - paused_ms);
}
void Timer::draw(float x, float y)    { call(fn_draw,   "Timer:draw", x, y); }
int Timer::time() const {
    if (!lua_object.valid()) return -1;
    sol::optional<int> t = lua_object["time"];
    return t ? *t : -1;
}
