# Lecture 3: Match 3

> Source: [CS50G Lecture Notes](https://cs50.harvard.edu/games/2018/notes/3/)

## Today's Topics

- **Anonymous Functions**: Defining functions as data types
- **Tweening**: Interpolating values within a range over time
- **Timers**: Scheduling events within specific timeframes
- **Solving Matches**: Core Match 3 gameplay mechanics
- **Procedural Grids**: Randomly generating game levels
- **Sprite Art and Palettes**: 2D game development fundamentals

## Timer Implementation

### timer0: The Simple Way

Basic timer counting up from 0 at one-second intervals:

```lua
function love.update(dt)
    secondTimer = secondTimer + dt
    if secondTimer > 1 then
        currentSecond = currentSecond + 1
        secondTimer = secondTimer % 1
    end
end
```

### timer1: The Ugly Way

Multiple timers = duplicated code blocks. Doesn't scale.

### timer2: The Clean Way

Uses the `Timer` class from the **Knife** library:

- `Timer.every(interval, callback)` - Calls function repeatedly at set intervals
- `Timer.after(interval, callback)` - Calls function once after a delay

```lua
for i = 1, 6 do
    Timer.every(intervals[i], function()
        counters[i] = counters[i] + 1
    end)
end
```

## Tweening

Tweening (in-betweening) creates smooth motion by generating intermediate frames between two positions.

### tween0: The Simple Way

Linear interpolation: `flappyX = math.min(endX, endX * (timer / MOVE_DURATION))`

### tween1: A Better Way

Animates 100 sprites with individual rates.

### tween2: The Timer.tween Way

Automated tweening with `Timer.tween(duration, definition)`:

```lua
for k, bird in pairs(birds) do
    Timer.tween(bird.rate, {
        [bird] = { x = endX, opacity = 255 }
    })
end
```

## Chaining Animations

### chain0: The Hard Way
Manual destination tracking and interpolation.

### chain1: The Better Way

`Timer:finish(callback)` for chaining:

```lua
Timer.tween(MOVEMENT_TIME, {
    [flappy] = {x = VIRTUAL_WIDTH - flappySprite:getWidth(), y = 0}
})
:finish(function()
    Timer.tween(MOVEMENT_TIME, {
        [flappy] = {x = VIRTUAL_WIDTH - flappySprite:getWidth(),
                    y = VIRTUAL_HEIGHT - flappySprite:getHeight()}
    })
    :finish(function()
        -- Continue chaining...
    end)
end)
```

Creates "Callback Hell" with deep nesting, but avoids reinventing the wheel.

## Match 3 Implementation

### swap0: Just a Board

Creates an 8x8 tile grid:

```lua
function generateBoard()
    local tiles = {}
    for y = 1, 8 do
        table.insert(tiles, {})
        for x = 1, 8 do
            table.insert(tiles[y], {
                x = (x - 1) * 32,
                y = (y - 1) * 32,
                tile = math.random(#tileQuads)
            })
        end
    end
    return tiles
end
```

### swap1: The Static Swap

Arrow keys navigate, Enter selects/swaps tiles.

### swap2: The Tween Swap

Animated swaps:

```lua
Timer.tween(0.2, {
    [tile2] = {x = tile1.x, y = tile1.y},
    [tile1] = {x = tempX, y = tempY}
})
```

## Match Calculation Algorithm

Scans the board twice: once horizontally, once vertically.

1. Start from top-left, set `colorToMatch` to current tile color
2. Check adjacent tiles; if matching, increment counter
3. When non-matching tile appears or row ends, save matches if counter >= 3
4. Repeat for all columns top-to-bottom
5. Return table of all match groups

## Match Removal and Tile Falling

1. Set matched tiles to `nil`
2. For each column, find `nil` slots
3. Tween non-nil tiles downward into empty spaces
4. Generate new tiles to fill remaining gaps
5. Tween new tiles from top to final position
6. Check for newly-created matches recursively (cascading)

## Palettes and Sprite Art

- **Color Palette**: A defined color set (e.g., DB32 - DawnBringer's 32 Color Palette)
- **Palette Swapping**: Reusing sprites with different color palettes for visual variety
- **Dithering**: Approximating additional colors at pixel level with limited palette
