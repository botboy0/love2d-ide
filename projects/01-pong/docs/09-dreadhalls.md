# Lecture 9: Dreadhalls

> Source: [CS50G Lecture Notes](https://cs50.harvard.edu/games/2018/notes/9/)
>
> **Note**: Unity/C# lecture.

## Today's Topics

- **Texturing** - Applying textures and materials to objects
- **Materials and Lighting** - Unity's material and light options
- **3D Maze Generation** - Using a 2D array for 3D mazes
- **First-Person Controllers** - First-person perspective gameplay
- **Multiple Scenes** - Scene management (similar to state machines)
- **Fog** - Atmosphere through fog and global lighting
- **UI Components and Unity2D** - 2D interfaces for 3D games

## Texturing

Apply textures through Unity's Albedo component. For small textures on large surfaces:
- **Stretch** for low-resolution look
- **Tile** for higher resolution coverage

**UV Mapping**: Maps 3D models to flat 2D surfaces for texturing. Unity has a built-in mapping algorithm. UV maps don't auto-update when 3D objects change.

## Materials and Lighting

Resources:
- catlikecoding.com/unity/tutorials/rendering/part-9 (Materials)
- catlikecoding.com/unity/tutorials/rendering/part-15 (Lighting)

## Normal (Bump) Mapping

Simulates 3D contours on flat surfaces without actual geometry. Makes walls appear realistic without expensive computation.

## 3D Maze Generation

Uses a 2D boolean array (`true` = wall, `false` = space):

1. Select random interior starting point
2. "Carve" paths via random direction choices
3. Progress using random step counts
4. Outer elements = `true` for boundary walls

Adjust lighting and fog at Window > Lighting > Settings.

## Character Controllers

Unity Standard Assets FPS Controller:
- Kinematic capsule collider + camera at top
- WASD movement, mouse look
- Customizable: walk/run speed, jump, footsteps, mouse sensitivity, head bob

## Multiple Scenes

- `SceneManager.LoadScene` from `UnityEngine.SceneManagement`
- `DontDestroyOnLoad` preserves GameObjects across scene transitions
- Singleton pattern prevents duplicate audio instances on reload

## Unity2D

2D development alongside 3D. Example: "DREAD50" title screen as 2D scene within 3D game.
