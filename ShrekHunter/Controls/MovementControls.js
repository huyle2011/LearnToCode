import { tiny } from "../tiny-graphics.js";
// Pull these names into this module's scope for convenience:
const { Vec, Mat4, Scene } = tiny;

class MovementControls extends Scene {

  constructor(player) {
    super();
    const data_members = {
      roll: 0,
      look_around_locked: true,
      thrust: Vec.of(0, 0, 0),
      pos: Vec.of(0, 0, 0),
      z_axis: Vec.of(0, 0, 0),
      radians_per_frame: 1 / 200,
      meters_per_frame: 20,
      speed_multiplier: 1,
      player: player
    };
    Object.assign(this, data_members);

    this.mouse_enabled_canvases = new Set();
    this.will_take_over_graphics_state = true;
  }

  set_recipient(matrix_closure, inverse_closure) {
    // set_recipient(): The camera matrix is not actually stored here inside Movement_Controls;
    // instead, track an external target matrix to modify.  Targets must be pointer references
    // made using closures.
    this.matrix = matrix_closure;
    this.inverse = inverse_closure;
  }
  reset(graphics_state) {
    // reset(): Initially, the default target is the camera matrix that Shaders use, stored in the
    // encountered program_state object.  Targets must be pointer references made using closures.
    this.set_recipient(
      () => graphics_state.camera_transform,
      () => graphics_state.camera_inverse
    );
  }

  make_control_panel() {
    // make_control_panel(): Sets up a panel of interactive HTML elements, including
    // buttons with key bindings for affecting this scene, and live info readouts.
    this.control_panel.innerHTML += "Commands";
    this.new_line();
    this.key_triggered_button(
      "Forward",
      ["w"],
      () => (this.player.curr_speed = this.player.run),
      undefined,
      () => (this.player.curr_speed = 0)
    );

    this.key_triggered_button(
      "Back",
      ["s"],
      () => (this.player.curr_speed = -this.player.run),
      undefined,
      () => (this.player.curr_speed = 0)
    );

    this.key_triggered_button(
      "Left",
      ["a"],
      () => (this.player.curr_turn = this.player.turn),
      undefined,
      () => (this.player.curr_turn = 0)
    );

    this.key_triggered_button(
      "Right",
      ["d"],
      () => (this.player.curr_turn = -this.player.turn),
      undefined,
      () => (this.player.curr_turn = 0)
    );

    this.key_triggered_button(
      "Jump",
      [" "],
      () => this.player.jump(),
      undefined,
      undefined
    );

    this.key_triggered_button(
        "Run",
        ["Shift", "w"],
        () => this.player.curr_speed = 2.0 * this.player.run,
        undefined,
        this.player.curr_speed = 0
    );

    this.new_line();

    this.key_triggered_button(
      "Look Up",
      ["q"],
      () => (this.player.curr_look = this.player.turn),
      undefined,
      () => (this.player.curr_look = 0)
    );

    this.key_triggered_button(
      "Look Down",
      ["e"],
      () => (this.player.curr_look = -this.player.turn),
      undefined,
      () => (this.player.curr_look = 0)
    );

    this.key_triggered_button(
      "Zoom In",
      ["z"],
      () => {
        this.player.curr_zoom = this.player.zoom;
      },
      undefined,
      () => {
        this.player.curr_zoom = 0;
      }
    );

    this.key_triggered_button(
      "Zoom Out",
      ["x"],
      () => {
        this.player.curr_zoom = -this.player.zoom;
      },
      undefined,
      () => {
        this.player.curr_zoom = 0;
      }
    );


  }

  display(
    context,
    graphics_state,
    dt = graphics_state.animation_delta_time / 1000
  ) {
    // The whole process of acting upon controls begins here.
    const m = this.speed_multiplier * this.meters_per_frame,
      r = this.speed_multiplier * this.radians_per_frame;

    if (this.will_take_over_graphics_state) {
      this.reset(graphics_state);
      this.will_take_over_graphics_state = false;
    }
  }
}

export default MovementControls;
