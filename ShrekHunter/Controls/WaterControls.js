import { tiny } from "../tiny-graphics.js";
import WaterShader from "../Shaders/WaterShader.js";

const { Scene, Material, Texture } = tiny;

class WaterControls extends Scene {
  constructor() {
    super();
    this.state = 0;
    this.materials = [
      new Material(new WaterShader(3), {
        dudv_map: new Texture("assets/waterDUDV.png"),
        normal_map: new Texture("assets/waterNormalMap.png"),
        move_factor: 0,
        ambient: 0,
        diffusivity: 0.2,
        specularity: 0.8,
        color: tiny.Color.of(1, 1, 1, 1)
      })

    ];
  }

  make_control_panel() {
    this.control_panel.innerHTML += "These are commands water";
    this.new_line();
    this.key_triggered_button("Water Shader", ["p"], () => {
      this.state = 0;
    });
  }

  display(context, program_state) {
    program_state.water.material = this.materials[this.state];
  }
}

export default WaterControls;

