# Lecture 6: Angry Birds

> Source: [CS50G Lecture Notes](https://cs50.harvard.edu/games/2018/notes/6/)

## Today's Topics

- **Box2D** - Physics engine integrated with LOVE that simulates realistic object interactions
- **Mouse Input** - Capturing mouse clicks and drags for launch mechanics

## Physics Foundation: The World

Box2D requires a physics world as the foundational system:

- `love.physics.newWorld(gravX, gravY, [sleep])` - Creates simulation environment

The world performs calculations on all Bodies, applies global gravity, and handles collision detection.

## Bodies

Abstract position and velocity containers:

- `love.physics.newBody(world, x, y, type)` - Instantiates a body

## Fixtures

Attach shapes to Bodies, defining density, friction, and restitution (bounciness):

- `love.physics.newFixture(body, shape)` - Attaches shapes for collision

**Shape Functions:**
- `love.physics.newCircleShape(radius)`
- `love.physics.newRectangleShape(width, height)`
- `love.physics.newEdgeShape(x, y, width, height)`
- `love.physics.newChainShape(loop, x1, y1, x2...)`
- `love.physics.newPolygonShape(x1, y1, x2, y2...)`

## Body Types

- **Static**: Cannot move via forces, but influence dynamic bodies (ground, walls)
- **Dynamic**: Standard physics bodies with full interaction (projectiles, obstacles)
- **Kinematic**: Move without being influenced by collisions (moving platforms)

## Mouse Input

- `love.mousepressed(x, y, key)` - Fires on click with coordinates and button
- `love.mousereleased(x, y, key)` - Fires on release

## Collision Callbacks

Four callbacks during collisions:

- **beginContact** - Collision starts
- **endContact** - Collision ends
- **preSolve** - Before collision resolution
- **postSolve** - After collision with impulse data

`World:setCallbacks(f1, f2, f3, f4)` registers these handlers.

**Critical**: Never delete bodies/fixtures within collision callbacks. Flag entities for deletion and destroy after `world:update()`:

```lua
function Level:update(dt)
    self.world:update(dt)

    for k, body in pairs(self.destroyedBodies) do
        if not body:isDestroyed() then
            body:destroy()
        end
    end

    self.destroyedBodies = {}
end
```

## AlienLaunchMarker

Manages the launch mechanic:
- Tracks base and shifted coordinates for launch vector
- Monitors mouse interactions for aiming preview
- On release, instantiates projectile with velocity: `(baseX - shiftedX) * 10`
- Renders trajectory visualization using physics calculations

## Resources

- [LOVE Physics Documentation](https://love2d.org/wiki/love.physics)
- [Physics Tutorial](https://love2d.org/wiki/Tutorial:Physics)
- [Box2D Introduction](http://www.iforce2d.net/b2dtut/introduction)
- [Trajectory Calculation](http://www.iforce2d.net/b2dtut/projected-trajectory)
