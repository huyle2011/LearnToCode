
import { tiny, defs } from "../project-resources.js";

const { Vec, Mat4, Material, Texture } = tiny;
const { Cube, Subdivision_Sphere } = defs;

class Bullet {
    constructor(position = Vec.of(0, 0, 80), rotation = Vec.of(0,180,0)) {
        this.shape = new Subdivision_Sphere(1);
        this.material = new Material(new defs.Textured_Phong(3), {
            texture: new Texture("assets/fireball1.png"),
            ambient: 1
        });
        this.position = position;
        this.rotation = rotation;
        this.run = 200;
        this.gravity = -50;
        this.curr_speed = 0;
        this.curr_turn = 0;
        this.curr_look = 0;
        this.look_angle = 0;
        this.upwards_speed = 0;
        this.height_ground = 4.5;
        this.curr_zoom = 0;
        this.zoom_factor = 7;
    }

    update(program_state) {
        const dt = program_state.dt;

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
            this.position[1] = terrain_height + this.height_ground;
        }
    }

    draw(context, program_state) {
        this.curr_speed = this.run;
        this.shape.draw(context, program_state,
            Mat4.identity()

                .times(
                    Mat4.translation([
                        this.position[0],
                        this.position[1],
                        this.position[2]
                    ]))
                .times(Mat4.scale([1, 1, 1]))
                .times(
                    Mat4.rotation(((2 * Math.PI) / 360) * this.rotation[1], [0, 1, 0])
                ),
            this.material);
    }
}

export default Bullet;

