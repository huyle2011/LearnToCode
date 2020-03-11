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

        this.position = position;
        this.rotation = Vec.of(0, 180, 0);
        this.life = 3;
        this.run = 30;
        this.turn = 160;
        this.gravity = -50;
        this.curr_speed = 0;
        this.curr_turn = 0;
        this.curr_look = 0;
        this.look_angle = 0;
        this.upwards_speed = 0;
        this.height_ground = 4.5;
        this.limb_angle = 0;
        this.zoom = 50;
        this.curr_zoom = 0;
        this.zoom_factor = 7;
        this.movement = 0;
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

    draw(context, program_state) {
        let t = program_state.animation_time / 1000;

        if (t%5) {
            this.movement = Math.floor((Math.random() * 7));
        }

        switch(this.movement) {
            case 0:
                this.curr_speed = this.run;
                break;
            case 1:
                this.curr_speed = -this.run;
                break;
            case 2:
                this.curr_turn = this.turn;
                this.curr_speed = this.run;
                break;
            case 3:
                this.curr_turn = -this.turn;
                this.curr_speed = this.run;
                break;
            case 4:
                break;
            case 5:
                this.curr_speed = 2.0 * this.run;
                break;
            case 6:
                break;
            case 7:
                break;
        }

        this.limb_angle = this.curr_speed
            ? (Math.PI / 3) * Math.sin(program_state.animation_time / 150)
            : 0;
        let transforms = [];

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
                .times(Mat4.scale([10,10,10]))
        );

        // life
        let i = 0;
        for(i = 0; i < this.life; i++) {
            transforms.push(
                Mat4.identity()
                    .times(Mat4.translation([-35, 40 + 5 * i, 0]))
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
