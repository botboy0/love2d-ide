-- main.lua
-- Standard skeleton for Love2D game projects

function love.load()
    -- Initialize game state here
end

function love.update(dt)
    -- Update game logic (dt = delta time in seconds)
end

function love.draw()
    -- Render everything here
end

function love.keypressed(key)
    if key == "escape" then
        love.event.quit()
    end
end
