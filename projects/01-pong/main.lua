-- main.lua
-- Pong rebuild — pong-0 baseline
-- "The Day-0 Update": bare window with centered text

WINDOW_WIDTH  = 1280
WINDOW_HEIGHT = 720

function love.load()
    love.window.setTitle("Pong")
end

function love.draw()
    love.graphics.printf(
        'Hello Pong!',
        0,
        WINDOW_HEIGHT / 2 - 6,
        WINDOW_WIDTH,
        'center'
    )
end

function love.keypressed(key)
    if key == "escape" then
        love.event.quit()
    end
end
