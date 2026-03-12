-- conf.lua
-- CS50G defaults: 1280x720 virtual resolution, vsync enabled
function love.conf(t)
    t.window.title    = "Pong"
    t.window.width    = 1280
    t.window.height   = 720
    t.window.vsync    = 1       -- integer in Love2D 11.x (1 = enabled)
    t.window.resizable = false
    t.console         = true    -- show console on Windows for error output
end
