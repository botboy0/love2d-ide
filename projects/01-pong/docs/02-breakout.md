# Lecture 2: Breakout

> Source: [CS50G Lecture Notes](https://cs50.harvard.edu/games/2018/notes/2/)

## Today's Topics

1. **Sprite Sheets** - Consolidating multiple sprites into a single texture file
2. **Procedural Layouts** - Dynamically generating brick patterns
3. **Managing State** - Improving state machine architecture
4. **Levels** - Implementing progression mechanics
5. **Player Health** - Tracking lives with a heart-based visual system
6. **Particle Systems** - Creating visual effects for collisions
7. **Collision Detection Revisited** - Advanced detection for multiple object types
8. **Persistent Save Data** - Storing high scores across sessions

## Breakout State Flow

StartState -> PaddleSelectState -> ServeState <-> PlayState -> VictoryState (next level) or GameOverState -> EnterHighScoreState -> HighScoreState

## Development Stages

### breakout0: Day-0 Update
- Code organized into subdirectories (sounds, fonts, graphics, states)
- Related values grouped into global tables: `gFonts`, `gTextures`, `gSounds`

### breakout1: Quad Update

Introduces sprite sheet functionality. Sprite sheets contain smaller images (sprites) within a single bitmap.

**Key Functions:**
- `love.graphics.newQuad(x, y, width, height, dimensions)` - Defines rectangular sprite boundaries
- `love.graphics.draw(texture, quad, x, y)` - Renders specific quad section

**Utility Functions:**
- `GenerateQuads(atlas, tilewidth, tileheight)` - Creates quads from atlas
- `GenerateQuadsPaddles(atlas)` - Manual extraction for variable-sized paddles

### breakout2: Bounce Update

Implements ball physics and AABB collision detection.

**Paddle Collision Formula:** Take the difference between the Ball's x value and the Paddle's center to scale ball velocity based on impact location.

### breakout3: Brick Update

Renders destructible brick objects with `inPlay` flag. `LevelMaker.createMap(level)` generates random brick layouts.

### breakout4: Collision Update

Refined collision physics:

```lua
-- Paddle collision - influence ball direction based on hit position
if self.ball.x < self.paddle.x + (self.paddle.width / 2) and self.paddle.dx < 0 then
    self.ball.dx = -50 + -(8 * (self.paddle.x + self.paddle.width / 2 - self.ball.x))
elseif self.ball.x > self.paddle.x + (self.paddle.width / 2) and self.paddle.dx > 0 then
    self.ball.dx = 50 + (8 * math.abs(self.paddle.x + self.paddle.width / 2 - self.ball.x))
end
```

**Brick Collision Algorithm:**
- If left edge of ball is outside brick and dx is positive: left-side collision
- If right edge of ball is outside brick and dx is negative: right-side collision
- If top edge of ball is outside brick: top-side collision
- Else: bottom-side collision

Ball velocity increases slightly after collision: `self.ball.dy = self.ball.dy * 1.02`

### breakout5: Hearts Update

Health tracking with state parameter passing:

```lua
gStateMachine:change('serve', {
    paddle = self.paddle,
    bricks = self.bricks,
    health = self.health,
    score = self.score
})
```

Health rendering with filled/empty hearts. Game over when health reaches 0.

### breakout6: Pretty Colors Update

Adds visual variety through brick color and layout differentiation in `LevelMaker.lua`.

### breakout7: Tier Update

Multi-tier bricks requiring multiple hits. Tiered scoring: `self.score = self.score + (brick.tier * 200 + brick.color * 25)`

### breakout8: Particle Update

Visual effects using LOVE2D's particle system:

```lua
self.psystem = love.graphics.newParticleSystem(gTextures['particle'], 64)
self.psystem:setParticleLifetime(0.5, 1)
self.psystem:setLinearAcceleration(-15, 0, 15, 80)
self.psystem:setEmissionArea('normal', 10, 10)
```

Particles match brick color with brightness scaling by tier.

### breakout9: Progression Update

Level advancement after clearing all bricks. `PlayState:checkVictory()` verifies all bricks have `inPlay == false`.

### breakout10: High Scores Update

Persistent score storage:
- `love.filesystem.setIdentity(identity)` - Sets save subdirectory
- `love.filesystem.exists(path)` - Checks file presence
- `love.filesystem.write(path, data)` - Writes string data
- `love.filesystem.lines(path)` - Iterates over file lines

### breakout11: Entry Update

3-character name input for high score entries using ASCII-based toggling.

### breakout12: Paddle Select Update

Paddle sprite selection interface before gameplay.

### breakout13: Music Update

Background music with `gSounds['music']:setLooping(true)`.
