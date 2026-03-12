# Lecture 10: Portal

> Source: [CS50G Lecture Notes](https://cs50.harvard.edu/games/2018/notes/10/)
>
> **Note**: Unity/C# lecture.

## Today's Topics

1. **Holding a Weapon** - First-Person Controller with parenting
2. **Raycasting** - Shooting rays from weapons via Unity physics API
3. **RenderTexture** - Rendering cameras to textures for portal effects
4. **Texture Masking** - Creating oval portals from rectangular textures
5. **Decals** - Attaching portal surfaces to geometry
6. **Teleporting** - Moving players between portals
7. **ProBuilder and ProGrids** - In-engine level design tools

## Holding a Weapon

Make weapon a child object of the character. The weapon's Transform mirrors the character's Transform (translations, rotations, etc.).

## Raycasting

Uses `Physics.Raycast` and `RaycastHit` struct. `Debug.DrawRay` for visual debugging.

## RenderTexture

Cameras render to RenderTexture assets via "Target Texture" in the inspector.

## Texture Masking

Portals are circular but textures are rectangular. Use a shader to make edges invisible, displaying only an oval-shaped interior.

## Teleporting

Mesh Collider as trigger on portal mesh. `OnTriggerEnter` callback with `portalActive` flag prevents infinite loops.

## Level Design Tools

ProBuilder and ProGrids enable rapid prototyping within the Unity editor, eliminating external modeling dependencies.
