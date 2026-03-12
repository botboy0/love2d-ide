# Lecture 4: Super Mario Bros.

> Source: [CS50G Lecture Notes](https://cs50.harvard.edu/games/2018/notes/4/)

## Today's Topics

1. **Tile Maps** - Converting numerical tile IDs into visual game worlds
2. **2D Animation** - Creating movement effects through sprite sequences
3. **Procedural Level Generation** - Randomly generating levels
4. **Platformer Physics** - Implementing gravity and collision detection
5. **Basic AI** - Programming enemy behavior
6. **Powerups** - Creating items that modify player abilities

## Tilemaps

A tilemap is a 2D array of numbers representing individual tiles. Each number (tile ID) determines visual appearance and collision properties.

### tiles0: Static Tiles

```lua
for y = 1, mapHeight do
    table.insert(tiles, {})
    for x = 1, mapWidth do
        table.insert(tiles[y], {
            id = y < 5 and SKY or GROUND
        })
    end
end
```

### tiles1: Scrolling Tiles

`love.graphics.translate(x, y)` shifts the coordinate system, simulating camera movement. Use `math.floor()` to prevent floating-point rendering artifacts.

## Character Movement

### character0: The Stationary Hero
Static character sprite on the tilemap.

### character1: The Moving Hero
Horizontal movement with `CHARACTER_MOVE_SPEED * dt`.

### character2: The Tracked Hero
Camera tracking: `cameraScroll = characterX - (VIRTUAL_WIDTH / 2) + (CHARACTER_WIDTH / 2)`

### character3: The Animated Hero

Animation system with frame sequences:

```lua
function Animation:init(def)
    self.frames = def.frames
    self.interval = def.interval
    self.timer = 0
    self.currentFrame = 1
end

function Animation:update(dt)
    if #self.frames > 1 then
        self.timer = self.timer + dt
        if self.timer > self.interval then
            self.timer = self.timer % self.interval
            self.currentFrame = math.max(1, (self.currentFrame + 1) % (#self.frames + 1))
        end
    end
end
```

Animation definitions:
```lua
idleAnimation = Animation { frames = {1}, interval = 1 }
movingAnimation = Animation { frames = {10, 11}, interval = 0.2 }
```

### character4: The Jumping Hero

Jump with gravity:

```lua
if key == 'space' and characterDY == 0 then
    characterDY = JUMP_VELOCITY
    currentAnimation = jumpAnimation
end

-- Physics
characterDY = characterDY + GRAVITY
characterY = characterY + characterDY * dt

if characterY > ((7 - 1) * TILE_SIZE) - CHARACTER_HEIGHT then
    characterY = ((7 - 1) * TILE_SIZE) - CHARACTER_HEIGHT
    characterDY = 0
end
```

## Procedural Level Generation

Column-by-column generation works well for platformers.

### level0: Flat Levels
Random tileset + topper combinations via `GenerateTileSets()`.

### level1: Pillared Levels
1-in-5 probability spawns pillars at rows 4-6:

```lua
local spawnPillar = math.random(5) == 1
if spawnPillar then
    for pillar = 4, 6 do
        tiles[pillar][x] = { id = GROUND, topper = pillar == 4 }
    end
end
```

### level2: Chasmed Levels
1-in-7 chance skips ground generation entirely, creating pits:

```lua
if math.random(7) == 1 then
    goto continue
end
-- ground generation...
::continue::
```

## Tile Collision Detection

Leverage the static coordinate system instead of testing all tiles with AABB:

```lua
function TileMap:pointToTile(x, y)
    if x < 0 or x > self.width * TILE_SIZE or
       y < 0 or y > self.height * TILE_SIZE then
        return nil
    end
    return self.tiles[math.floor(y / TILE_SIZE) + 1][math.floor(x / TILE_SIZE) + 1]
end
```

Check collisions directionally based on state:
- Jumping: check above
- Idle/walking/falling: check below
- Walking/jumping/falling: check left and right

## Entities

Living game objects with state machines and autonomous behavior.
- Contain individual StateMachines managing internal states
- For players: states affect input handling
- For enemies: states affect decision-making and AI
- Support entity-to-entity AABB collision detection

Some engines use Entity-Component Systems (ECS) where entities are containers holding behavior-driving components.

## Game Objects

Objects that don't align with the tile grid (different dimensions, offset positioning).
- Tested for collision via AABB
- Containers of traits and functions

**Powerup examples:**
- Invincible Star: Sets `invincible` flag + `invincibleDuration` timer
- Growth Mushroom: Triggers `huge` flag, modifying dimensions and sprite
