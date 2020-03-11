import { tiny } from "../tiny-graphics.js";

const { Scene } = tiny;

class CameraControls extends Scene {
  constructor(camera) {
    super();
    this.camera = camera;
    this.state = 0; // 0: use object_view, 1: use audience_view
    this.object_view = null;
    this.audience_view = null;
  }

  make_control_panel() {
    this.control_panel.innerHTML += "Commands";
    this.new_line();
    this.key_triggered_button("Object View", ["1"], () => (this.state = 0));
    this.key_triggered_button("Audience View", ["3"], () => (this.state = 1));
    this.new_line();
    this.key_triggered_button(
      "Zoom In",
      ["c"],
      () => (this.camera.curr_zoom = this.camera.zoom),
      undefined,
      () => (this.camera.curr_zoom = 0)
    );
    this.key_triggered_button(
      "Zoom Out",
      ["v"],
      () => (this.camera.curr_zoom = -this.camera.zoom),
      undefined,
      () => (this.camera.curr_zoom = 0)
    );
    this.new_line();
    this.key_triggered_button(
      "Roll Up",
      ["b"],
      () => (this.camera.curr_look = this.camera.look_speed),
      undefined,
      () => (this.camera.curr_look = 0)
    );

    this.key_triggered_button(
      "Roll Down",
      ["n"],
      () => (this.camera.curr_look = -this.camera.look_speed),
      undefined,
      () => (this.camera.curr_look = 0)
    );
  }

  display(context, program_state) {
    if (this.state == 0) {
      program_state.set_camera(this.object_view);
      program_state.camera.position = program_state.player.eye_position();
    } else {
      program_state.set_camera(this.audience_view);
    }
  }
}

export default CameraControls;
