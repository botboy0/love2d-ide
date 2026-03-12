# Lecture 8: Helicopter Game 3D

> Source: [CS50G Lecture Notes](https://cs50.harvard.edu/games/2018/notes/8/)
>
> **Note**: This lecture transitions from Lua/LOVE2D to Unity/C#.

## Today's Topics

- **Unity** - 3D and 2D game engine by Unity Technologies
- **C#** - Primary scripting language for Unity
- **Blender** - Free, open-source 3D modeling
- **Components** - Behavior pieces driving object functionality
- **Colliders and Triggers** - Object interactions
- **Prefabs and Spawning** - Pre-fabricated objects spawned programmatically
- **Texture Scrolling** - Infinite scrolling in 3D
- **Audio** - Sound in Unity games

## Unity Overview

Top engine alongside Unreal, Godot, and CryEngine. Free with revenue-based restrictions (paid plans at $100k+ gross revenue). Strong in mobile and VR. Uses C# exclusively (Boo and UnityScript deprecated).

## C#

Statically-typed, object-oriented language by Microsoft. Similar to Java. Used beyond games in GUI apps, .NET, and Mono projects.

## GameObjects and Components

Everything in Unity is a GameObject. GameObjects comprise MonoBehaviours (components) in an Entity-Component System (ECS).

Components appear in the editor (Transform, Camera, etc.) and drive behavior through:
- Position Interaction (Transform)
- Visual Modification (Camera - perspective vs orthographic)
- Flexible Organization (multiple components without inheritance limitations)

## MonoBehaviours

How components manifest in code. Key methods:
- `Update` - Called each frame
- `Start` - Called on initialization
- `OnTrigger` - Collision detection responses

## Colliders and Triggers

- **Colliders** define object shapes for collision detection. Keep them simple (boxes, spheres, cylinders).
- **Triggers** fire `OnTrigger` events when detecting collisions.

Helicopter and coins = colliders. Airplanes and skyscrapers = triggers.

## Prefabs and Spawning

Prefabricated GameObjects assembled in the editor, spawned dynamically at runtime.

**Coroutines**: Functions that yield during execution rather than returning. Spawner scripts use coroutines to asynchronously spawn prefabs:
- Instantiate prefab
- Yield for several seconds
- Loop infinitely

## Texture Scrolling

Associate textures with 3D objects and translate UV coordinates over time. Offsetting UV along the X-axis progressively creates infinite scrolling appearance.

## Audio

- **AudioSource** component triggers playback based on code conditions. Access via `GetComponent()`, call `Play()`.
- **AudioListener** (typically on camera) must exist for audio playback.

## Asset Store

Extensive free and paid resources: projects, models, effects, editor tools.
