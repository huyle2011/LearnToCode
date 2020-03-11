import { tiny, defs } from "../project-resources.js";
import Bullet from "./Bullet.js";

const { Vec, Mat4, Material, Texture } = tiny;
const { Cube, Subdivision_Sphere } = defs;

class Player {
  constructor(position = Vec.of(0, 0, 60)) {
    //this.shape = new Cube();
    this.shape = new Subdivision_Sphere(3);
    this.material = new Material(new defs.Textured_Phong(3), {
      texture: new Texture("assets/fireball1.png"),
      ambient: 1
    });
    this.life = 3;
    this.position = position;
    this.rotation = Vec.of(0, 180, 0);

    this.run = 30;
    this.turn = 160;
    this.gravity = -50;
    this.jump_power = 30;
    this.curr_speed = 0;
    this.curr_turn = 0;
    this.curr_look = 0;
    this.look_angle = 0;
    this.upwards_speed = 0;
    this.is_in_air = false;
    this.height_ground = 4.5;
    this.limb_angle = 0;
    this.zoom = 50;
    this.curr_zoom = 0;
    this.zoom_factor = 7;
    this.height_eyes = 2.5;

    this.sounds = {
      walk: new Audio("assets/walk.wav"),
      jump: new Audio("assets/jump.wav"),
      in_water: new Audio("assets/water_footstep.wav")
    };
    this.is_in_water = false;
  }

  is_near_object(object_position, distance_square = 10000) {
    const dx = this.position[0] - object_position[0];
    const dz = this.position[2] - object_position[2];

    return dx * dx + dz * dz < distance_square;
  }

  eye_position() {
    const distance =
      this.zoom_factor *
      Math.cos(((2 * Math.PI) / 360) * this.look_angle);
    const height =
      this.zoom_factor *
      Math.sin(((2 * Math.PI) / 360) * this.look_angle);
    const dx = distance * Math.sin(((2 * Math.PI) / 360) * this.rotation[1]);
    const dz = distance * Math.cos(((2 * Math.PI) / 360) * this.rotation[1]);

    return this.position.plus(Vec.of(dx, this.height_eyes + height, dz));
  }

  look_at_position() {
    const distance =
      this.zoom_factor *
        Math.cos(((2 * Math.PI) / 360) * this.look_angle) +
      1;

    const height =
      this.zoom_factor *
      Math.sin(((2 * Math.PI) / 360) * this.look_angle);

    const dx1 = distance * Math.sin(((2 * Math.PI) / 360) * this.rotation[1]);
    const dz1 = distance * Math.cos(((2 * Math.PI) / 360) * this.rotation[1]);

    const reference_position = this.position.plus(
      Vec.of(dx1, this.height_eyes + height, dz1)
    );

    const distance2 = 1 * Math.sin(((2 * Math.PI) / 360) * this.look_angle);
    const distance3 = 1 * Math.cos(((2 * Math.PI) / 360) * this.look_angle);
    const dx2 = distance3 * Math.sin(((2 * Math.PI) / 360) * this.rotation[1]);
    const dz2 = distance3 * Math.cos(((2 * Math.PI) / 360) * this.rotation[1]);

    return reference_position.plus(Vec.of(dx2, distance2, dz2));
  }

  invert_look_up_angle() {
    this.look_angle = -this.look_angle;
  }

  play_sound(name, volume = 0.5) {
    if (!this.sounds[name].paused) return;
    this.sounds[name].currentTime = 0;
    this.sounds[name].volume = volume;
    this.sounds[name].play();
  }

  pause_sound(name) {
    this.sounds[name].pause();
    this.sounds[name].currentTime = 0;
  }

  update(program_state) {
    const dt = program_state.dt;
    if (
      this.is_near_object(
        program_state.water.position,
        program_state.water.size * program_state.water.size
      )
    ) {
      this.is_in_water = true;
    } else {
      this.is_in_water = false;
    }

    this.rotation = this.rotation.plus(
      Vec.of(0, this.curr_turn * dt, 0)
    );

    this.look_angle = this.look_angle + this.curr_look * dt;

    this.zoom_factor = Math.max(
      2,
      this.zoom_factor + this.curr_zoom * dt
    );

    const distance = this.curr_speed * dt;
    const dx = distance * Math.sin(((2 * Math.PI) / 360) * this.rotation[1]);
    const dz = distance * Math.cos(((2 * Math.PI) / 360) * this.rotation[1]);
    this.position = this.position.plus(Vec.of(dx, 0, dz));

    this.upwards_speed += this.gravity * dt;
    this.position = this.position.plus(Vec.of(0, this.upwards_speed * dt, 0));

    let terrain_height = program_state.current_terrain.get_height(
      this.position[0],
      this.position[2]
    );

    if (this.position[1] < terrain_height + this.height_ground) {
      this.upwards_speed = 0;
      this.is_in_air = false;
      this.position[1] = terrain_height + this.height_ground;
    }

    if (!this.is_in_air && this.curr_speed) {
      if (this.is_in_water) {
        this.play_sound("in_water");
        this.pause_sound("walk");
      } else {
        this.play_sound("walk");
        this.pause_sound("in_water");
      }
    } else {
      if (this.is_in_water) {
        this.pause_sound("in_water");
      } else {
        this.pause_sound("walk");
      }
    }
  }

  jump() {
    if (!this.is_in_air) {
      this.pause_sound("jump");
      this.play_sound("jump");
      this.upwards_speed = this.jump_power;
      this.is_in_air = true;
    }
  }

  draw(context, program_state) {
    this.limb_angle = this.curr_speed
      ? (Math.PI / 3) * Math.sin(program_state.animation_time / 150)
      : 0;
    let transforms = [];

    // body
    transforms.push(Mat4.identity().times(Mat4.scale([1, 1.5, 1])));

    // head
    transforms.push(
      Mat4.identity()
        .times(Mat4.translation([0, 2.5, 0]))
        .times(Mat4.rotation(this.limb_angle / 6, [0, 1, 0]))
    );

    // life
    let i = 0;
    for(i = 0; i < this.life; i++)
    {
      transforms.push(
          Mat4.identity()
              .times(Mat4.translation([-4, 2 * i, 0]))
              .times(Mat4.scale([.75, .75, .75]))
      );
    }
    transforms.push(
        Mat4.identity()
            .times(Mat4.translation([0, 2.5, 0]))
            .times(Mat4.rotation(this.limb_angle / 6, [0, 1, 0]))
    );

    // left arm
    transforms.push(
      Mat4.identity()
        .times(Mat4.translation([1.5, 0, 0]))
        .times(Mat4.translation([0, 1.5, 0]))
        .times(Mat4.rotation(this.limb_angle / 2, [1, 0, 0]))
        .times(Mat4.translation([0, -1.5, 0]))
        .times(Mat4.scale([0.5, 1.5, 1]))
    );

    // right arm
    transforms.push(
      Mat4.identity()
        .times(Mat4.translation([-1.5, 0, 0]))
        .times(Mat4.translation([0, 1.5, 0]))
        .times(Mat4.rotation(-this.limb_angle / 2, [1, 0, 0]))
        .times(Mat4.translation([0, -1.5, 0]))
        .times(Mat4.scale([0.5, 1.5, 1]))
    );

    // left leg
    transforms.push(
      Mat4.identity()
        .times(Mat4.translation([0.5, -3, 0]))
        .times(Mat4.translation([0, 1.5, 0]))
        .times(Mat4.rotation(-this.limb_angle, [1, 0, 0]))
        .times(Mat4.translation([0, -1.5, 0]))
        .times(Mat4.scale([0.5, 1.5, 1]))
    );

    // right leg
    transforms.push(
      Mat4.identity()
        .times(Mat4.translation([-0.5, -3, 0]))
        .times(Mat4.translation([0, 1.5, 0]))
        .times(Mat4.rotation(this.limb_angle, [1, 0, 0]))
        .times(Mat4.translation([0, -1.5, 0]))
        .times(Mat4.scale([0.5, 1.5, 1]))
    );

    transforms.forEach((transform, index) => {
      this.shape.draw(
        context,
        program_state,
        Mat4.identity()
          .times(
            Mat4.translation([
              this.position[0],
              this.position[1],
              this.position[2]
            ])
          )
          .times(
            Mat4.rotation(((2 * Math.PI) / 360) * this.rotation[1], [0, 1, 0])
          )
          .times(transform),
        this.material
      );
    });
  }
}

export default Player;
