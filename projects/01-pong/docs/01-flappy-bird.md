# Lecture 1: Flappy Bird

> Source: [CS50G Lecture Notes](https://cs50.harvard.edu/games/2018/notes/1/)

## Today's Topics

- **Images (Sprites)**: Loading images from memory and rendering them to screen
- **Infinite Scrolling**: Creating endless map scrolling while conserving memory
- **"Games Are Illusions"**: Camera manipulation as a foundational technique
- **Procedural Generation**: Generating sprites dynamically as the map scrolls
- **State Machines**: Managing game state transitions cleanly
- **Mouse Input**: Processing mouse button presses and cursor position
- **Music**: Adding background music with looping functionality

## Bird0: The Day-0 Update

Renders two static images: a background and foreground.

### Important Functions

- `love.graphics.newImage(path)` - Loads image files into drawable objects
- `love.graphics.draw(drawable, x, y)` - Renders an image at specified coordinates

```lua
local background = love.graphics.newImage('background.png')
local ground = love.graphics.newImage('ground.png')
```

## Bird1: The Parallax Update

Implements scrolling to simulate motion through parallax effects.

**Parallax Scrolling**: The illusion of movement given two frames of reference moving at different rates. Objects closer to the observer appear to move faster than distant objects.

```lua
local backgroundScroll = 0
local groundScroll = 0
local BACKGROUND_SCROLL_SPEED = 30
local GROUND_SCROLL_SPEED = 60
local BACKGROUND_LOOPING_POINT = 413

function love.update(dt)
    backgroundScroll = (backgroundScroll + BACKGROUND_SCROLL_SPEED * dt) % BACKGROUND_LOOPING_POINT
    groundScroll = (groundScroll + GROUND_SCROLL_SPEED * dt) % VIRTUAL_WIDTH
end
```

## Bird2: The Bird Update

Introduces a Bird sprite class rendered at screen center.

```lua
Bird = Class{}

function Bird:init()
    self.image = love.graphics.newImage('bird.png')
    self.width = self.image:getWidth()
    self.height = self.image:getHeight()
    self.x = VIRTUAL_WIDTH / 2 - (self.width / 2)
    self.y = VIRTUAL_HEIGHT / 2 - (self.height / 2)
end

function Bird:render()
    love.graphics.draw(self.image, self.x, self.y)
end
```

## Bird3: The Gravity Update

Applies gravitational physics to the bird.

```lua
local GRAVITY = 20
function Bird:update(dt)
    self.dy = self.dy + GRAVITY * dt
    self.y = self.y + self.dy
end
```

## Bird4: The Anti-Gravity Update

Enables jumping mechanics allowing the bird to counteract gravity.

```lua
love.keyboard.keysPressed = {}

function love.keypressed(key)
    love.keyboard.keysPressed[key] = true
    if key == 'escape' then love.event.quit() end
end

function love.keyboard.wasPressed(key)
    return love.keyboard.keysPressed[key]
end

function Bird:update(dt)
    self.dy = self.dy + GRAVITY * dt
    if love.keyboard.wasPressed('space') then
        self.dy = -5
    end
    self.y = self.y + self.dy
end
```

## Bird5: The Infinite Pipe Update

Spawns repeating pipe obstacles efficiently.

```lua
Pipe = Class{}
local PIPE_IMAGE = love.graphics.newImage('pipe.png')
local PIPE_SCROLL = -60

function Pipe:init()
    self.x = VIRTUAL_WIDTH
    self.y = math.random(VIRTUAL_HEIGHT / 4, VIRTUAL_HEIGHT - 10)
    self.width = PIPE_IMAGE:getWidth()
end

function Pipe:update(dt)
    self.x = self.x + PIPE_SCROLL * dt
end
```

Pipes spawn on a timer and are removed when they scroll off-screen.

## Bird6: The PipePair Update

Groups pipes in pairs with configurable gaps.

```lua
PipePair = Class{}
local GAP_HEIGHT = 90

function PipePair:init(y)
    self.x = VIRTUAL_WIDTH + 32
    self.y = y
    self.pipes = {
        ['upper'] = Pipe('top', self.y),
        ['lower'] = Pipe('bottom', self.y + PIPE_HEIGHT + GAP_HEIGHT)
    }
    self.remove = false
end
```

## Bird7: The Collision Update

Detects collisions between the bird and pipes using AABB with leniency margins:

```lua
function Bird:collides(pipe)
    if (self.x + 2) + (self.width - 4) >= pipe.x and self.x + 2 <= pipe.x + PIPE_WIDTH then
        if (self.y + 2) + (self.height - 4) >= pipe.y and self.y + 2 <= pipe.y + PIPE_HEIGHT then
            return true
        end
    end
    return false
end
```

## Bird8: The State Machine Update

Refactors code using a state machine architecture with BaseState, TitleScreenState, and PlayState.

```lua
gStateMachine = StateMachine {
    ['title'] = function() return TitleScreenState() end,
    ['play'] = function() return PlayState() end,
    ['score'] = function() return ScoreState() end
}
gStateMachine:change('title')
```

## Bird9: The Score Update

Tracks score when bird passes through pipe pairs:

```lua
for k, pair in pairs(self.pipePairs) do
    if not pair.scored then
        if pair.x + PIPE_WIDTH < self.bird.x then
            self.score = self.score + 1
            pair.scored = true
        end
    end
end
```

## Bird10: The Countdown Update

Introduces a countdown before gameplay begins:

```lua
CountdownState = Class{__includes = BaseState}
COUNTDOWN_TIME = 0.75

function CountdownState:init()
    self.count = 3
    self.timer = 0
end

function CountdownState:update(dt)
    self.timer = self.timer + dt
    if self.timer > COUNTDOWN_TIME then
        self.timer = self.timer % COUNTDOWN_TIME
        self.count = self.count - 1
        if self.count == 0 then
            gStateMachine:change('play')
        end
    end
end
```

State flow: TitleScreenState -> CountdownState -> PlayState -> ScoreState -> CountdownState (loop).

## Bird11: The Audio Update

Adds background music and sound effects:

```lua
sounds = {
    ['jump'] = love.audio.newSource('jump.wav', 'static'),
    ['explosion'] = love.audio.newSource('explosion.wav', 'static'),
    ['hurt'] = love.audio.newSource('hurt.wav', 'static'),
    ['score'] = love.audio.newSource('score.wav', 'static'),
    ['music'] = love.audio.newSource('marios_way.mp3', 'static')
}

sounds['music']:setLooping(true)
sounds['music']:play()
```

## Bird12: The Mouse Update

Adds mouse interactivity via `love.mousepressed(x, y, button)` for touch-like jumping.

## Optional Reading

- **How to Make an RPG** by Dan Schuller (howtomakeanrpg.com)
- **Game Programming Patterns** by Robert Nystrom (gameprogrammingpatterns.com)
