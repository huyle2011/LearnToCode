# Shrek Hunter

# Diffuculties
The most difficult part of this project is creating the water (complicated and expensive computation).

# Team's members
- Cody Pham 205359993
- Junya Honda 305180773
- Huy Le 705148583

# Contribution
Cody Pham:
- Skybox
- Objects (Player, Donkeys, Aliens, and Shrek)
Junya Honda:
- Terrain 
- Collision
Huy Le:
- Water
- 1st / 3rd person view camera

# Introduction

We created an virtual field (Terrain) surrounded by the big box (Skybox) with webGL and tiny-graphics.
On the field, there will be some visualized things like Donkeys, Aliens, Lake of Water, Mountain,
and Shrek which will be appeared after you clear out all the Donkeys and Aliens. 
As a player, you can walk around the field, and see something like this on the screen.

# Advanced Graphics Features

Here’s the list of advanced graphics features we implemented

[x] [Skybox]
[x] [Object View] or [1st Person View]
[x] [Audience View] or [3rd Person View]
[x] [Water]
[x] [Objects]
[x] [Terrain]
[x] [Collision]

# Skybox
The idea to make the skybox is that we create the big box and apply sky texture on each side of the box.
In order to make a better looking, we apply different texture on each side of the box.

We apply all the transformations except translation of the camera to make the sky moves with the player.

Also, we have 2 sets of textures to create the daytime and nighttime effects.
So that, we can make the transition between day and night.

# Object View (1st person) / Audience View (3rd person)
The idea to make those view is that the camera always translate and rotate with respect to its current orientation.

# Objects
Player, Donkeys, Aliens, Bullets, and Shrek are created by some basic polygon (cube and sphere).

By applying those transformations (translation, rotating, scaling), texture, and the angle,
we can create those objects and make them moving within the field.

# Terrain
The idea to make the terrain is creating a bunch of squares.

To assign the heights to each vertex of the terrain, we apply the interpolation.

Based on the value of the pixels on source image (map4.jpg) the heights of each vertex will be different.
The darker pixel gets the value closer to zero, so that its height is low.
The whiter pixel gets the value closer to one, so that its height is high.
The gray pixel gets the value between zero and one, so that its height is somewhere in between low and high.

# Water
The obvious idea to create the water is drawing the flat square and coloring it with blue.
However, it will give no interesting effect by doing that so we have to take reflection and refraction into account.

In order to apply the reflection and refraction to the water, we need to draw the scene from different camera position
and take the snap shot of the scene. By doing that we can see the reflection and refraction on the water.

But there is a problem of this approach. The ratio of reflection and refraction will be the same despite the position
of the camera. In theory, the water will refract more when the camera is on top of the water, also the water will
reflect more when the camera is on the side.

To solve this problem, we are taking the dot product of the normal vector of the water (at a particular point) and
the vector (from this particular point) to the camera. By doing that, we can change the ratio of the reflection and 
refraction based on the camera position.

In order to make the water even more real, we have to think about the distortion. We apply the DuDv map on the water.
DuDv map stores the directional information. It can tell how much and which way we want to distort our texture.
The color of DuDv map is mostly red, green, yellow. We are going to apply the red for distortion in x-direction,
the green for distortion in y-direction. The magnitude of those distortions will be defined by the value of those pixels
(how red/green the pixel is).

Finally, we apply normal map to the water to see the diffuse and specular lightning.
