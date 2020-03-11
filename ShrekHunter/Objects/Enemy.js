import { tiny, defs } from "../project-resources.js";

const { Vec, Mat4, Material, Texture } = tiny;
const { Cube } = defs;

class Enemy {
    constructor(position = Vec.of(0, 0, 70)) {
        this.shape = new Cube();
        this.material = new Material(new defs.Textured_Phong(3), {
            texture: new Texture("assets/skin.jpg"),
            ambient: 1
        });
        this.position = position;
        this.rotation = Vec.of(0, 180, 0);
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

        //restriction 
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
        if (t%2) {
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
        transforms.push(Mat4.identity().times(Mat4.scale([2, 1.5, 3])));

        // head
        transforms.push(
            Mat4.identity()
                .times(Mat4.translation([0, 2.5, 3]))
                .times(Mat4.scale([1.5,1,1.5]))
                .times(Mat4.rotation(this.limb_angle / 6, [0, 1, 0]))
        );

        //left horn
        transforms.push(
            Mat4.identity()
                .times(Mat4.translation([1, 4.5, 3.5]))
                .times(Mat4.scale([.5,1,.5]))
                .times(Mat4.rotation(this.limb_angle / 6, [0, 1, 0]))
        );

        //right horn
        transforms.push(
            Mat4.identity()
                .times(Mat4.translation([-1, 4.5, 3.5]))
                .times(Mat4.scale([.5,1,.5]))
                .times(Mat4.rotation(this.limb_angle / 6, [0, 1, 0]))
        );

        // left leg front
        transforms.push(
            Mat4.identity()
                .times(Mat4.translation([1, -3, 2]))
                .times(Mat4.translation([0, 1.5, 0]))
                .times(Mat4.rotation(-this.limb_angle, [1, 0, 0]))
                .times(Mat4.translation([0, -1.5, 0]))
                .times(Mat4.scale([0.5, 1.5, 1]))
        );

        // right leg front
        transforms.push(
            Mat4.identity()
                .times(Mat4.translation([-1, -3, 2]))
                .times(Mat4.translation([0, 1.5, 0]))
                .times(Mat4.rotation(this.limb_angle, [1, 0, 0]))
                .times(Mat4.translation([0, -1.5, 0]))
                .times(Mat4.scale([0.5, 1.5, 1]))
        );

        // left leg back
        transforms.push(
            Mat4.identity()
                .times(Mat4.translation([1, -3, -2]))
                .times(Mat4.translation([0, 1.5, 0]))
                .times(Mat4.rotation(this.limb_angle, [1, 0, 0]))
                .times(Mat4.translation([0, -1.5, 0]))
                .times(Mat4.scale([0.5, 1.5, 1]))
        );

        // right leg back
        transforms.push(
            Mat4.identity()
                .times(Mat4.translation([-1, -3, -2]))
                .times(Mat4.translation([0, 1.5, 0]))
                .times(Mat4.rotation(-this.limb_angle, [1, 0, 0]))
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

export default Enemy;
