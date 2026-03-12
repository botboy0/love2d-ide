-- main.lua — Verification test: display + audio
-- Kept permanently for sanity checks after system updates
local beep

function love.load()
    -- Generate a 440Hz sine wave beep (0.3 seconds)
    local sampleRate = 44100
    local duration = 0.3
    local data = love.sound.newSoundData(
        math.floor(sampleRate * duration), sampleRate, 16, 1
    )
    for i = 0, data:getSampleCount() - 1 do
        local t = i / sampleRate
        data:setSample(i, 0.5 * math.sin(2 * math.pi * 440 * t))
    end
    beep = love.audio.newSource(data)
    beep:play()
end

function love.draw()
    love.graphics.setBackgroundColor(0.2, 0.6, 1)
    love.graphics.setColor(1, 1, 1)
    local major, minor, revision = love.getVersion()
    local version = major .. "." .. minor .. "." .. revision
    love.graphics.printf(
        "Love2D " .. version .. " OK",
        0, 250, love.graphics.getWidth(), "center"
    )
    love.graphics.printf(
        "If you hear a beep, audio works.",
        0, 290, love.graphics.getWidth(), "center"
    )
    love.graphics.printf(
        "Press ESC to close.",
        0, 330, love.graphics.getWidth(), "center"
    )
end

function love.keypressed(key)
    if key == "escape" then
        love.event.quit()
    end
end
