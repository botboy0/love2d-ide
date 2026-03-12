# Lecture 11: Portal Problems

> Source: [CS50G Lecture Notes](https://cs50.harvard.edu/games/2018/notes/11/)
>
> **Note**: Unity/C# lecture. Deep dive into portal rendering and design.

## What is a Portal?

A discontinuity in 3D space where the back face of a 2D rectangle is defined to be the front face of another 2D rectangle located elsewhere. Functions as a doorway enabling traversal across game maps without actual geometry modification.

## Rendering: Texture vs Stencil Tradeoffs

### Texture Method
- Creates separate textures per portal view
- Employs Painter's Algorithm (deepest portals first)
- Limits effective antialiasing
- Simplest implementation for single-depth portals

### Stencil Method
- Renders full frame in back buffer without texture memory overhead
- Recurses from main view as needed
- Provides homogeneous visual quality
- Requires recursion after opaque objects but before transparencies

## Rendering: Duplicate Models

Objects partially spanning portals need special handling:
- Replicate rendering geometry and teleport it to the appropriate portal frame by frame
- Portals function as "Clip Planes" to prevent rendering duplication on both sides

## Rendering: Recursion

Infinite portal recursion is impractical. Solution: trigger recursion once for portals-within-portals. First two layers are legitimate; subsequent layers replicate the second.

## Design: Prototyping in 2D

Create a 2D prototype first to validate whether core portal mechanics can sustain a full game.

## Design: Levels and Game Mechanics

Key principles:
- Test mechanics with actual players during development
- Introduce individual elements separately, then combine gradually
- Distinguish implementable features from those creating excessive complications
- Teach mechanics through gameplay (portal placement, teleportation, object interaction)

## Combining Elements

Introduce game elements progressively. Players practice each component separately before encountering complex multi-element levels.

## Physics: Volumes, Vectors, and Planes

- **Volumes** track nearby objects (green = small region before portal, yellow = larger encompassing region)
- **Vectors and Planes** implement raycasting, splitting vectors at portal entry/exit points
