# Lecture 0: Pong

> Source: [CS50G Lecture Notes](https://cs50.harvard.edu/games/2018/notes/0/)

## Today's Topics

- **Lua**: A dynamic scripting language similar to Python and JavaScript, popular in game development
- **LOVE2D**: A 2D game framework written in C++ that uses Lua for scripting
- **Drawing Shapes and Text**: Core rendering capabilities for game visualization
- **DeltaTime and Velocity**: Time-based movement for frame-rate independent gameplay
- **Game State**: Managing different game modes (title, play, menu, etc.)
- **Object-Oriented Programming**: Encapsulating game objects with data and methods
- **Box Collision Detection**: Using Axis-Aligned Bounding Boxes (AABB) for collision responses
- **Audio Integration**: Adding sound effects using bfxr

## What is Lua?

Lua, Portuguese for "moon," was created in Brazil in 1993 as an embedded scripting language. It emphasizes flexibility through "tables" (similar to Python dictionaries). The language supports both data and code, making it suitable for data-driven game design.

## What is LOVE2D?

LOVE2D provides a comprehensive 2D framework featuring modules for graphics, input handling, mathematics, audio, physics, and window management. It's free, cross-platform, and excellent for rapid prototyping.

## Game Loop Fundamentals

Every game operates as an infinite loop executing three sequential steps each frame:

1. **Input Processing**: Monitor keyboard, mouse, and joystick events
2. **Update Logic**: Modify game state based on input and physics
3. **Rendering**: Display updated graphics to the screen

## 2D Coordinate System

The standard 2D coordinate system places origin (0,0) at the top-left corner, with positive X extending right and positive Y extending downward. This differs from traditional Cartesian coordinates used in mathematics.

## Project Goal

Recreate Pong as a two-player game where players control paddles to deflect a ball. First player to score 10 points wins by successfully moving the ball past their opponent's paddle.

## Implementation Scope

The project requires:

- Drawing paddles and ball as rectangles
- Implementing paddle movement via keyboard input
- Detecting collisions between ball and paddles
- Detecting collisions with screen boundaries and scoring zones
- Adding sound effects for impacts and scoring
- Displaying score information on-screen

## Key LOVE2D Functions

**Initialization and Core Loop**:
- `love.load()` - Executes once at startup
- `love.update(dt)` - Called each frame with delta time
- `love.draw()` - Called each frame after updates
- `love.keypressed(key)` - Triggered when key is pressed

**Graphics Functions**:
- `love.graphics.printf(text, x, y, [width], [align])` - Renders aligned text
- `love.graphics.rectangle(mode, x, y, width, height)` - Draws filled or outlined rectangles
- `love.graphics.clear(r, g, b, a)` - Clears screen with RGBA color
- `love.graphics.newFont(path, size)` - Loads font files
- `love.graphics.setFont(font)` - Activates font for rendering
- `love.graphics.setDefaultFilter(min, mag)` - Sets texture scaling (use 'nearest' for retro feel)

**Window and Input**:
- `love.window.setMode(width, height, params)` - Initializes window dimensions
- `love.keyboard.isDown(key)` - Tests if key is currently held
- `love.event.quit()` - Terminates application
- `love.window.setTitle(title)` - Sets window title

**Audio**:
- `love.audio.newSource(path, [type])` - Loads sound files as 'static' or 'stream'

**Debugging**:
- `love.timer.getFPS()` - Returns current frames per second
- `love.resize(width, height)` - Handles window resizing

## Development Stages

### pong-0: Basic Text Rendering
Displays "Hello Pong!" centered on screen using fundamental LOVE2D setup with window initialization and text printing.

### pong-1: Virtual Resolution
Implements the `push` library for rendering at low resolution (432x243) while displaying at higher resolution (1280x720) for a retro aesthetic. Adds escape key quit functionality and nearest-neighbor filtering.

### pong-2: Static Game Layout
Draws rectangles for paddles and ball with background color. Introduces custom font loading and establishes the visual foundation for Pong.

### pong-3: Interactive Paddles
Adds paddle movement controlled by W/S keys (left paddle) and up/down arrows (right paddle) at 200 pixels/second. Implements score display and prevents paddles from moving off-screen using `math.min()` and `math.max()`.

### pong-4: Ball Physics
Introduces game states ('start' and 'play'). Ball spawns centered and moves with random velocity when Enter is pressed. Uses `math.randomseed(os.time())` for non-deterministic behavior and `math.random(min, max)` for velocity generation.

### pong-5: Object-Oriented Design
Refactors code into `Ball` and `Paddle` classes, improving code organization and maintainability. Demonstrates that "classes are essentially containers for attributes and methods."

### pong-6: Polish and FPS
Adds window title via `love.window.setTitle()` and displays FPS using `love.timer.getFPS()` for performance monitoring.

### pong-7: Collision Detection

**AABB Collision Algorithm**: Tests collision between axis-aligned rectangles using this logic:

```
collision occurs if:
- rect1.x < rect2.x + rect2.width AND
- rect1.x + rect1.width > rect2.x AND
- rect1.y < rect2.y + rect2.height AND
- rect1.y + rect1.height > rect2.y
```

When collision occurs with a paddle:
- Reverse horizontal velocity (multiply by -1)
- Apply 1.03x speed multiplier for increasing difficulty
- Reposition ball away from paddle to prevent overlap
- Randomize vertical velocity within range

When collision occurs with top/bottom boundaries:
- Reverse vertical velocity
- Clamp position to screen bounds

### pong-8: Score Tracking
Increments player scores when ball exits horizontal screen boundaries. Resets ball and returns to start state after scoring.

### pong-9: Serve State

Introduces three-state system:
- **Start**: Initial state, press Enter to begin
- **Serve**: Player serves without defending, press Enter to put ball in play
- **Play**: Active gameplay

When scoring occurs, game transitions to serve state with the scoring player's opponent serving.

### pong-10: Victory Condition

Adds **done** state triggered when either player reaches 10 points. Displays victory screen and allows restarting with score reset.

### pong-11: Audio Effects

Uses `love.audio.newSource()` to load three sound files stored in a table:
- `paddle_hit`: Plays when ball contacts paddles
- `wall_hit`: Plays when ball contacts boundaries
- `score`: Plays when points are scored

Sound files are generated using **bfxr**, a freely-available program for creating chiptune effects.

### pong-12: Window Resizing

Enables resizable windows by setting `resizable = true` and implementing `love.resize(w, h)` callback to rescale the virtual resolution accordingly.

## Object-Oriented Programming in Lua

Lua classes serve as blueprints containing attributes (data fields) and methods (functions). Objects instantiated from classes encapsulate related data and behavior. For Pong, `Paddle` and `Ball` classes abstract away object-specific logic from main game code, improving readability and flexibility.
