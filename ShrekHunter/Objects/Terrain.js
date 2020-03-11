import { tiny, defs } from "../project-resources.js";
import TerrainShader from "../Shaders/TerrainShader.js";
import TerrainShape from "../Shapes/Terrain.js";

const { Vec, Mat4, Material, Texture } = tiny;

class Terrain {
  constructor(position, size) {
    this.position = Vec.of(
      position[0] * size,
      position[1] * size,
      position[2] * size
    );

    this.size = size;
    this.height_map = new Image();
    this.height_map.src = "assets/map4.jpg";
    this.height_map.onload = () => {
      this.shape = new TerrainShape(size, this.height_map);
    };
    this.material = new Material(new TerrainShader(10), {
      texture: new Texture("assets/grass.jpg"),
      ambient: 0.8,
      diffusivity: 1.0,
      specularity: 0
    });
  }

  update(program_state) {
    if (program_state.is_day) {
      this.material.ambient = Math.min(
        0.8,
        this.material.ambient + program_state.dt
      );
    } else {
      this.material.ambient = Math.max(
        0.1,
        this.material.ambient - program_state.dt
      );
    }
  }

  get_height(x_world, z_world) {
    if (!this.shape) return 0;
    let x_ter = this.position[0] - x_world;
    let z_ter = this.position[2] - z_world;

    let grid_size = this.size / (this.shape.heights.length - 1);
    let x_grid = Math.floor(x_ter / grid_size);
    let z_grid = Math.floor(z_ter / grid_size);

    if (
      x_grid >= this.shape.heights.length - 1 ||
      z_grid >= this.shape.heights.length - 1 ||
      x_grid < 0 ||
      z_grid < 0
    )
      return 0;

    let x_coord = (x_ter % grid_size) / grid_size;
    let z_coord = (z_ter % grid_size) / grid_size;

    var val;
    if (x_coord <= 1 - z_coord) {
      val = this.boundary(
        Vec.of(0, this.shape.heights[x_grid][z_grid], 0),
        Vec.of(1, this.shape.heights[x_grid + 1][z_grid], 0),
        Vec.of(0, this.shape.heights[x_grid][z_grid + 1], 1),
        Vec.of(x_coord, z_coord)
      );
    } else {
      val = this.boundary(
        Vec.of(1, this.shape.heights[x_grid + 1][z_grid], 0),
        Vec.of(1, this.shape.heights[x_grid + 1][z_grid + 1], 1),
        Vec.of(0, this.shape.heights[x_grid][z_grid + 1], 1),
        Vec.of(x_coord, z_coord)
      );
    }

    return val;
  }

  boundary(v1, v2, v3, pos) {
    let denominator =
      (v2[2] - v3[2]) * (v1[0] - v3[0]) + (v3[0] - v2[0]) * (v1[2] - v3[2]);
    let ret1 =
      ((v2[2] - v3[2]) * (pos[0] - v3[0]) +
        (v3[0] - v2[0]) * (pos[1] - v3[2])) /
      denominator;
    let ret2 =
      ((v3[2] - v1[2]) * (pos[0] - v3[0]) +
        (v1[0] - v3[0]) * (pos[1] - v3[2])) /
      denominator;
    let ret3 = 1 - ret1 - ret2;
    return ret1 * v1[1] + ret2 * v2[1] + ret3 * v3[1];
  }

  draw(context, program_state) {
    if (!this.shape) return;
    let terrain_transform = Mat4.identity();
    terrain_transform = terrain_transform.times(
      Mat4.translation([this.position[0], this.position[1], this.position[2]])
    );
    this.shape.draw(context, program_state, terrain_transform, this.material);
  }
}

export default Terrain;
