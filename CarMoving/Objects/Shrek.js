import { tiny, defs } from "../project-resources.js";
import Bullet from "./Bullet.js";

const { Vec, Mat4, Material, Texture } = tiny;
const { Cube } = defs;

class Shrek {
    constructor(position = Vec.of(0, 0, 60)) {
        this.shape = new Cube();
        this.material = new Material(new defs.Textured_Phong(3), {
            texture: new Texture("assets/green_boi.jpg"),
            ambient: 1
        });
        this.life = 3;
        this.position = position;
        this.rotation = Vec.of(0, 180, 0);
        this.RUN_SPEED = 30;
        this.TURN_SPEED = 160;
        this.GRAVITY = -50;
        this.JUMP_POWER = 30;
        this.current_speed = 0;
        this.current_turn_speed = 0;
        this.current_look_up_spped = 0;
        this.look_up_angle = 0;
        this.upwards_speed = 0;
        this.is_in_air = false;
        this.HEIGHT_TO_GROUND = 4.5;
        this.limb_angle = 0;
        this.ZOOM_SPEED = 50;
        this.current_zoom_speed = 0;
        this.current_zoom_factor = 7;
        this.HEIGHT_TO_EYES = 2.5;
        //this.bullet = new Bullet();
        //this.shot = false;
        this.sounds = {
            walk: new Audio("assets/walk.wav"),
            jump: new Audio("assets/jump.wav"),
            // walk_in_water: new Audio("assets/water_footstep.wav")
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
            this.current_zoom_factor *
            Math.cos(((2 * Math.PI) / 360) * this.look_up_angle);
        const height =
            this.current_zoom_factor *
            Math.sin(((2 * Math.PI) / 360) * this.look_up_angle);
        const dx = distance * Math.sin(((2 * Math.PI) / 360) * this.rotation[1]);
        const dz = distance * Math.cos(((2 * Math.PI) / 360) * this.rotation[1]);

        return this.position.plus(Vec.of(dx, this.HEIGHT_TO_EYES + height, dz));
    }

    look_at_position() {
        const distance =
            this.current_zoom_factor *
            Math.cos(((2 * Math.PI) / 360) * this.look_up_angle) +
            1;

        const height =
            this.current_zoom_factor *
            Math.sin(((2 * Math.PI) / 360) * this.look_up_angle);

        const dx1 = distance * Math.sin(((2 * Math.PI) / 360) * this.rotation[1]);
        const dz1 = distance * Math.cos(((2 * Math.PI) / 360) * this.rotation[1]);

        const reference_position = this.position.plus(
            Vec.of(dx1, this.HEIGHT_TO_EYES + height, dz1)
        );

        const distance2 = 1 * Math.sin(((2 * Math.PI) / 360) * this.look_up_angle);
        const distance3 = 1 * Math.cos(((2 * Math.PI) / 360) * this.look_up_angle);
        const dx2 = distance3 * Math.sin(((2 * Math.PI) / 360) * this.rotation[1]);
        const dz2 = distance3 * Math.cos(((2 * Math.PI) / 360) * this.rotation[1]);

        return reference_position.plus(Vec.of(dx2, distance2, dz2));
    }

    invert_look_up_angle() {
        this.look_up_angle = -this.look_up_angle;
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
        //this.bullet.update(program_state);
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
            Vec.of(0, this.current_turn_speed * dt, 0)
        );

        this.look_up_angle = this.look_up_angle + this.current_look_up_spped * dt;

        this.current_zoom_factor = Math.max(
            2,
            this.current_zoom_factor + this.current_zoom_speed * dt
        );

        const distance = this.current_speed * dt;
        const dx = distance * Math.sin(((2 * Math.PI) / 360) * this.rotation[1]);
        const dz = distance * Math.cos(((2 * Math.PI) / 360) * this.rotation[1]);
        this.position = this.position.plus(Vec.of(dx, 0, dz));

        this.upwards_speed += this.GRAVITY * dt;
        this.position = this.position.plus(Vec.of(0, this.upwards_speed * dt, 0));

        let terrain_height = program_state.current_terrain.get_height(
            this.position[0],
            this.position[2]
        );

        if (this.position[1] < terrain_height + this.HEIGHT_TO_GROUND) {
            this.upwards_speed = 0;
            this.is_in_air = false;
            this.position[1] = terrain_height + this.HEIGHT_TO_GROUND;
        }
        //
        // if (!this.is_in_air && this.current_speed) {
        //   if (this.is_in_water) {
        //     this.play_sound("walk_in_water");
        //     this.pause_sound("walk");
        //   } else {
        //     this.play_sound("walk");
        //     this.pause_sound("walk_in_water");
        //   }
        // } else {
        //   if (this.is_in_water) {
        //     this.pause_sound("walk_in_water");
        //   } else {
        //     this.pause_sound("walk");
        //   }
        // }

        if (this.position[0]  > 100 )
        {
            this.position[0] = this.position[0] - 3;
        }
        else if (this.position[0] < -100)
        {
            this.position[0] = this.position[0] + 3;
        }
        if (this.position[2] > 100 )
        {
            this.position[2] = this.position[2] - 3;
        }
        else if (this.position[2] < -100)
        {
            this.position[2] = this.position[2] + 3;
        }
    }
    move_right() {
        this.current_turn_speed = this.TURN_SPEED;
        this.current_speed = this.RUN_SPEED;
        this.current_turn_speed = -this.TURN_SPEED;

    }

    /*
    shoot() {
      //this.shot = true;
      this.pause_sound("jump");
      this.play_sound("jump");
      //this.bullet = new Bullet(this.position);
    }
    */

    jump() {
        if (!this.is_in_air) {
            this.pause_sound("jump");
            this.play_sound("jump");
            this.upwards_speed = this.JUMP_POWER;
            this.is_in_air = true;
        }
    }

    draw(context, program_state) {
        //program_state.bullet = this.bullet;
        //this.bullet.draw(context, program_state.bullet);
        this.limb_angle = this.current_speed
            ? (Math.PI / 3) * Math.sin(program_state.animation_time / 150)
            : 0;
        let transforms = [];

        let t = program_state.animation_time / 1000;
        //let move_time = t % 5;

        if(t%5) {
            this.movement = Math.floor((Math.random() * 7));
        }

        switch(this.movement) {
            case 0:
                this.current_speed = this.RUN_SPEED;
                break;
            case 1:
                this.current_speed = -this.RUN_SPEED;
                break;
            case 2:
                this.current_turn_speed = this.TURN_SPEED;
                this.current_speed = this.RUN_SPEED;
                break;
            case 3:
                this.current_turn_speed = -this.TURN_SPEED;
                this.current_speed = this.RUN_SPEED;
                break;
            case 4:
                break;
            case 5:
                this.current_speed = 2.0 * this.RUN_SPEED;
                break;
            case 6:
                break;
            case 7:
                break;
        }


      // body
      transforms.push(
        Mat4.identity()
        .times(Mat4.translation([0, 40, 0]))
        .times(Mat4.scale([15, 20, 15]))
        
        
        );

    // head
    
    transforms.push(
        Mat4.identity()
            .times(Mat4.translation([0, 70, 0]))
           // .times(Mat4.rotation(this.limb_angle / 6, [0, 1, 0]))
            .times(Mat4.scale([10,10,10]))
    );

    // life
    
    let i = 0;
    for(i = 0; i < this.life; i++)
    {
        transforms.push(
            Mat4.identity()
                .times(Mat4.translation([-35, 40 + 5 * i, 0]))
                //.times(Mat4.rotation(this.limb_angle / 6, [0, 1, 0]))
                .times(Mat4.scale([2, 2, 2]))
        );
    }


    // left arm
    transforms.push(
        Mat4.identity()
            .times(Mat4.translation([17, 50, 0]))
            .times(Mat4.translation([0, 1.5, 0]))
            .times(Mat4.rotation(this.limb_angle / 2, [1, 0, 0]))
            .times(Mat4.translation([0, -10, 0]))
            .times(Mat4.scale([5, 14, 5]))
    );

    // right arm
    transforms.push(
        Mat4.identity()
            .times(Mat4.translation([-17, 50, 0]))
            .times(Mat4.translation([0, 1.5, 0]))
            .times(Mat4.rotation(-this.limb_angle / 2, [1, 0, 0]))
            .times(Mat4.translation([0, -10, 0]))
            .times(Mat4.scale([5, 14, 5]))
    );

    // left leg
    transforms.push(
        Mat4.identity()
            .times(Mat4.translation([7,18.5,0])
            .times(Mat4.rotation(-this.limb_angle/2, [1, 0, 0]))
            .times(Mat4.translation([0, -10, 0]))
            .times(Mat4.scale([5, 15, 5])))
    );

    // right leg
    transforms.push(
        Mat4.identity()
            .times(Mat4.translation([-7, 18.5, 0]))
            .times(Mat4.rotation(this.limb_angle/2, [1, 0, 0]))
            .times(Mat4.translation([0, -10, 0]))
            .times(Mat4.scale([5, 15, 5]))
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

export default Shrek;
