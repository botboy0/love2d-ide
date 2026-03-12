# Lecture 7: Pokemon

> Source: [CS50G Lecture Notes](https://cs50.harvard.edu/games/2018/notes/7/)

## Today's Topics

- **StateStacks** - Running multiple states in parallel
- **Turn-Based Systems** - Sequential action mechanics
- **GUIs** - Panels, textboxes, selection menus
- **RPG Mechanics** - Leveling, experience, damage calculations

## StateStack Architecture

Allows multiple states to render simultaneously while updating only the topmost state.

```lua
function StateStack:update(dt)
    self.states[#self.states]:update(dt)  -- only top state
end

function StateStack:render()
    for i, state in ipairs(self.states) do  -- all states render
        state:render()
    end
end

function StateStack:push(state)
    table.insert(self.states, state)
    state:enter()
end

function StateStack:pop()
    self.states[#self.states]:exit()
    table.remove(self.states)
end
```

**Advantage**: "Pauses" previous state rather than destroying it. DialogueState renders atop PlayState, preserving game state.

## FadeInState

Transitions with opacity tweening:

```lua
function FadeInState:init(color, time, onFadeComplete)
    self.opacity = 0
    Timer.tween(self.time, { [self] = {opacity = 1} })
    :finish(function()
        gStateStack:pop()
        onFadeComplete()
    end)
end
```

## PlayState

Grid-aligned movement with tweened transitions:

```lua
function EntityWalkState:attemptMove()
    -- Calculate target tile
    -- Boundary check
    -- Tween movement over 0.5 seconds
    Timer.tween(0.5, {
        [self.entity] = {x = (toX - 1) * TILE_SIZE, y = (toY - 1) * TILE_SIZE - self.entity.height / 2}
    }):finish(function()
        -- Check for continued input or idle
    end)
end
```

## Pokemon Encounters

1-in-10 probability when stepping in tall grass:

```lua
if self.level.grassLayer.tiles[y][x].id == TILE_IDS['tall-grass'] and math.random(10) == 1 then
    -- Fade in, push BattleState, fade out
end
```

## GUI Components

### Panel
Two stacked rectangles (white outer, dark inner) creating a bordered frame.

### Textbox
Multi-page text divided based on container dimensions. Advances with Enter/Space.

### Selection
Text items with callbacks, navigable via arrow keys:

```lua
function Selection:update(dt)
    if love.keyboard.wasPressed('up') then
        self.currentSelection = self.currentSelection == 1 and #self.items or self.currentSelection - 1
    elseif love.keyboard.wasPressed('down') then
        self.currentSelection = self.currentSelection == #self.items and 1 or self.currentSelection + 1
    elseif love.keyboard.wasPressed('return') then
        self.items[self.currentSelection].onSelect()
    end
end
```

### Menu
Combines Panel + Selection for complete UI component.

## Pokemon Stats

```lua
function Pokemon:init(def, level)
    self.baseHP = def.baseHP
    self.baseAttack = def.baseAttack
    self.baseDefense = def.baseDefense
    self.baseSpeed = def.baseSpeed

    self.HPIV = def.HPIV        -- Individual Values (variation)
    self.attackIV = def.attackIV
    self.defenseIV = def.defenseIV
    self.speedIV = def.speedIV

    self.level = level
    self.expToLevel = self.level * self.level * 5 * 0.75
    self:calculateStats()
    self.currentHP = self.HP
end
```

**Level-up**: Rolls a 6-sided die 3 times per stat. Rolls <= IV value = +1 stat.

## Battle System

### BattleState
Manages sprites, health bars, exp bars, and battle flow with slide-in animations.

### TakeTurnState
- Turn order based on speed stat
- Attack sequence: message -> animation -> damage -> health bar update -> death check
- Victory: experience earned, possible level-up
- Defeat: Pokemon healed, return to field

### BattleSprite
Includes a white shader for damage flash effects:

```glsl
extern float WhiteFactor;
vec4 effect(vec4 vcolor, Image tex, vec2 texcoord, vec2 pixcoord) {
    vec4 outputcolor = Texel(tex, texcoord) * vcolor;
    outputcolor.rgb += vec3(WhiteFactor);
    return outputcolor;
}
```

## Resources

- [How to Make an RPG](https://howtomakeanrpg.com)
