import { tiny } from "../project-resources.js";

const { Vec } = tiny;

class Camera {
  constructor(player) {
    this.player = player;
    this.look = 20;
    this.distance = 25;
    this.zoom = 1
    this.curr_zoom =0;
    this.look_speed = 1;
    this.curr_look =0;
    this.angle = 0;
    this.position = Vec.of(0, 0, 0);

  }

  x_distance() {
    return (
      this.distance * Math.cos(((2 * Math.PI) / 360) * this.look)
    );
  }

  z_distance() {
    return (
      this.distance * Math.sin(((2 * Math.PI) / 360) * this.look)
    );
  }

  cam_position(x_distance, z_distance) {
    const theta = this.player.rotation[1] + this.angle;
    const offset_x =
      x_distance * Math.sin(((2 * Math.PI) / 360) * theta);
    const offset_z =
      x_distance * Math.cos(((2 * Math.PI) / 360) * theta);
    this.position[0] = this.player.position[0] - offset_x;
    this.position[2] = this.player.position[2] - offset_z;
    this.position[1] = this.player.position[1] + z_distance;
  }

  update_position() {
    this.cam_position(
      this.x_distance(),
      this.z_distance()
    );
  }

  update(program_state) {
    this.update_position();
    this.distance = Math.max(
      5,
      Math.min(300, this.distance - this.curr_zoom)
    );

    this.pitch = Math.max(
      -89,
      Math.min(89, this.pitch + this.curr_look)
    );
  }

  invert_look() {
    this.look = -this.look;
  }
}

export default Camera;
