-- main.lua
-- Pong rebuild — pong-0 baseline
-- "The Day-0 Update": bare window with centered text

WINDOW_WIDTH  = 1280
WINDOW_HEIGHT = 720

function love.load()
    love.window.setTitle("Pong")
    love.graphics.setDefaultFilter('nearest', 'nearest')
    smallFont = love.graphics.newFont('assets/fonts/font.ttf', 24)
    love.graphics.setFont(smallFont)
end

function love.draw()
    local w = love.graphics.getWidth()
    local h = love.graphics.getHeight()

    love.graphics.printf(
        'Hello Pong!',
        0,
        h / 2 - 12,
        w,
        'center'
    )
end

function love.keypressed(key)
    if key == "escape" then
        love.event.quit()
    end
end
