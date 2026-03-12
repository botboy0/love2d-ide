# Lecture 5: Legend of Zelda

> Source: [CS50G Lecture Notes](https://cs50.harvard.edu/games/2018/notes/5/)

## Today's Topics

1. **Top-down Perspective** - Bird's-eye view affecting visual design (shadows, corners, camera)
2. **Infinite Dungeon Generation** - 2D array where rooms connect adjacently
3. **Hitboxes/Hurtboxes** - Separate collision boxes for dealing and receiving damage
4. **Events** - Broadcasting messages to trigger functions in response
5. **Screen Scrolling** - Tweening room-to-room transitions
6. **Data-Driven Design** - Single Entity class + descriptive data tables

## Dungeon Generation

Dungeons use a 2D array where indices are either empty or contain connected rooms. Transitions occur through doorways by changing room coordinates.

### World Classes (`src/world/`)
- `Doorway.lua` - Individual door definitions
- `Dungeon.lua` - Container managing rooms and transitions
- `Room.lua` - Individual room components

### Dungeon.lua

```lua
function Dungeon:init(player)
    self.player = player
    self.rooms = {}
    self.currentRoom = Room(self.player)
    self.nextRoom = nil
    self.cameraX = 0
    self.cameraY = 0
    self.shifting = false
end
```

Event listeners register shift-direction handlers for room transitions.

### Room.lua

Rooms contain tiles, entities, objects, and doorways:

```lua
function Room:init(player)
    self.tiles = {}
    self:generateWallsAndFloors()
    self.entities = {}
    self:generateEntities()
    self.objects = {}
    self:generateObjects()
    self.doorways = {} -- top, bottom, left, right
    self.player = player
end
```

### generateWallsAndFloors()

Assigns tile IDs: corners first, then edges (with direction-specific variations), then random floor tiles.

### generateEntities()

Five types (skeleton, slime, bat, ghost, spider) via `ENTITY_DEFS`:

```lua
local type = types[math.random(#types)]
table.insert(self.entities, Entity {
    animations = ENTITY_DEFS[type].animations,
    walkSpeed = ENTITY_DEFS[type].walkSpeed or 20,
    x = math.random(...),
    y = math.random(...),
    width = 16, height = 16, health = 1
})
```

### generateObjects()

Interactive objects like switches with collision callbacks:

```lua
switch.onCollide = function()
    if switch.state == 'unpressed' then
        switch.state = 'pressed'
        for k, doorway in pairs(self.doorways) do
            doorway.open = true
        end
        gSounds['door']:play()
    end
end
```

## Hitboxes and Hurtboxes

- **Hitbox**: Registers damage delivery (sword striking enemy)
- **Hurtbox**: Registers damage reception (body being struck)

### PlayerSwingSwordState

Hitbox adjusts based on attack direction:

```lua
if direction == 'left' then
    hitboxX = self.player.x - hitboxWidth
    hitboxY = self.player.y + 2
elseif direction == 'right' then
    hitboxX = self.player.x + self.player.width
    hitboxY = self.player.y + 2
-- ... up and down similar
end

self.swordHitbox = Hitbox(hitboxX, hitboxY, hitboxWidth, hitboxHeight)
```

Checks entity collisions each frame; returns to idle when animation completes.

## Events (Knife Event Library)

- `Event.on(name, callback)` - Registers callback for named events
- `Event.dispatch(name, [params])` - Triggers registered callbacks

### Example: Room Transitions

PlayerWalkState dispatches shift events when colliding with open doorways:
```lua
Event.dispatch('shift-left')
```

Dungeon listens and initiates transitions:
```lua
Event.on('shift-left', function()
    self:beginShifting(-VIRTUAL_WIDTH, 0)
end)
```

## Stenciling

Stencils control pixel rendering like physical stencils:

- `love.graphics.stencil(func, action, value)` - Defines stencil pixels
- `love.graphics.setStencilTest(compare_mode, compare_value)` - Filters rendering

Used at doorways to prevent player rendering outside boundaries during transitions.

## Data-Driven Design

Single Entity class + external data definitions (`ENTITY_DEFS`):
- Reduces code redundancy
- Separates implementation from specifications
- Facilitates adding new entities without modifying core logic
- Enables designer/programmer collaboration
