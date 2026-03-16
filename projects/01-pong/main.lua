-- main.lua
-- Pong rebuild — pong-0 baseline
-- "The Day-0 Update": bare window with centered text

push = require("lib/push")

WINDOW_WIDTH = 1280
WINDOW_HEIGHT = 720

VIRTUAL_WIDTH = 432
VIRTUAL_HEIGHT = 243

local paddleWidth = 5
local paddleHeight = 50
local paddlespeed = 200

local paddle1y = VIRTUAL_HEIGHT / 2 - paddleHeight / 2

local paddle2y = paddle1y

local ballsize = 5
local ballx = VIRTUAL_WIDTH / 2 - ballsize / 2
local bally = VIRTUAL_HEIGHT / 2 - ballsize / 2

local ballspdx = math.random(2) == 1 and -1 or 1

local ballspdy = math.random(2) == 1 and -1 or 1

function love.update(dt)
	ballx = ballx + ballspdx * dt * 100
	bally = bally + ballspdy * dt * 100

	if ballx <= paddleWidth then
		if bally + ballsize > paddle1y and bally < paddle1y + paddleHeight then
			ballspdx = ballspdx * -1
			ballx = paddleWidth
		else
			ballx = VIRTUAL_WIDTH / 2 - ballsize / 2
			bally = VIRTUAL_HEIGHT / 2 - ballsize / 2
		end
	end

	if ballx + ballsize >= VIRTUAL_WIDTH - paddleWidth then
		if bally + ballsize > paddle2y and bally < paddle2y + paddleHeight then
			ballspdx = ballspdx * -1
			ballx = VIRTUAL_WIDTH - paddleWidth - ballsize
		else
			ballx = VIRTUAL_WIDTH / 2 - ballsize / 2
			bally = VIRTUAL_HEIGHT / 2 - ballsize / 2
		end
	end

	if bally < 0 or bally + ballsize > VIRTUAL_HEIGHT then
		ballspdy = ballspdy * -1
	end

	if love.keyboard.isDown("w") and paddle1y > 0 then
		paddle1y = paddle1y - paddlespeed * dt
	end

	if love.keyboard.isDown("s") and paddle1y + paddleHeight < VIRTUAL_HEIGHT then
		paddle1y = paddle1y + paddlespeed * dt
	end

	if love.keyboard.isDown("up") and paddle2y > 0 then
		paddle2y = paddle2y - paddlespeed * dt
	end

	if love.keyboard.isDown("down") and paddle2y + paddleHeight < VIRTUAL_HEIGHT then
		paddle2y = paddle2y + paddlespeed * dt
	end
end

function love.load()
	love.window.setTitle("Pong")
	love.graphics.setDefaultFilter("nearest", "nearest")

	push:setupScreen(VIRTUAL_WIDTH, VIRTUAL_HEIGHT, WINDOW_WIDTH, WINDOW_HEIGHT, {
		fullscreen = false,
		resizable = false,
		vsync = true,
	})

	local smallFont = love.graphics.newFont("assets/fonts/font.ttf", 30)
	love.graphics.setFont(smallFont)
	print("hello")
end

function love.draw()
	push:start()

	-- Debug: arena border
	love.graphics.rectangle("line", 0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT)

	love.graphics.rectangle("fill", 0, paddle1y, paddleWidth, paddleHeight)

	love.graphics.rectangle("fill", VIRTUAL_WIDTH - paddleWidth, paddle2y, paddleWidth, paddleHeight)

	love.graphics.rectangle("fill", ballx, bally, ballsize, ballsize)

	push:finish()
end

function love.keypressed(key)
	if key == "escape" then
		love.event.quit()
	end
end
