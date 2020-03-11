import { tiny, defs } from "../project-resources.js";
import SkyboxShader from "../Shaders/SkyboxShader.js";

const { Vec, Mat4, Cube_Map, Material } = tiny;
const { Cube } = defs;

class SkyBox {
  constructor() {
    this.size = 500;
    this.day_images = [
      "assets/day/right.png",
      "assets/day/left.png",
      "assets/day/top.png",
      "assets/day/bottom.png",
      "assets/day/back.png",
      "assets/day/front.png"
    ];
    this.night_images = [
      "assets/night/right.png",
      "assets/night/left.png",
      "assets/night/top.png",
      "assets/night/bottom.png",
      "assets/night/back.png",
      "assets/night/front.png"
    ];
    this.shape = new Cube();

    this.shape.arrays.position.forEach(
      (position, index) =>
        (this.shape.arrays.position[index] = position.times(this.size))
    );

    this.shader = new SkyboxShader();
    this.material = new Material(this.shader, {
      cube_map: new Cube_Map(this.day_images),
      cube_map2: new Cube_Map(this.night_images),
      blend_factor: 0
    });
  }

  update(program_state) {
    if (program_state.is_day) {
      this.material.blend_factor = Math.max(
        0,
        this.material.blend_factor - program_state.dt
      );
    } else {
      this.material.blend_factor = Math.min(
        1,
        this.material.blend_factor + program_state.dt
      );
    }
  }



  draw(context, program_state) 
  {
    this.shape.draw(context, program_state, Mat4.identity(), this.material);

  }
}

export default SkyBox;
