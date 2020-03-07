import { tiny, defs } from "./project-resources.js";
import Player from "./Objects/Player.js";
import Enemy from "./Objects/Enemy.js";
import Camera from "./Objects/Camera.js";
import SkyBox from "./Objects/SkyBox.js";
import Terrain from "./Objects/Terrain.js";
import Water from "./Objects/Water.js";
import MovementControls from "./Controls/MovementControls.js";
//import EnemyMovementControls from "./Controls/EnemyMovement";
import CameraControls from "./Controls/CameraControls.js";


const { Vec, Mat4, Color, Light, Material, Scene,
  Canvas_Widget, Code_Widget, Text_Widget } = tiny;

const { Cube, Subdivision_Sphere, Triangle} = defs;

const Main_Scene = class Car_Moving extends Scene {
  constructor() {
    super();
    this.shapes = {
      ball: new Subdivision_Sphere(6),
      box: new Cube()
    };

    this.materials = {
      sun: new Material(new defs.Phong_Shader(2), {
        ambient: 1,
        diffusivity: 0,
        specularity: 1,
        color: Color.of(1, 1, 0, 1)
      })
    };

    // state
    this.is_day = true;

    // reflection / refraction
    this.scratchpad = document.createElement("canvas");
    this.scratchpad_context = this.scratchpad.getContext("2d");

    //entitity initializations
    this.sky_box = new SkyBox();
    this.terrain = new Terrain(Vec.of(0.5, 0, 0.5), 800);
    this.player = new Player();
    this.enemy = new Enemy();
    this.camera = new Camera(this.player);
    this.water = new Water(Vec.of(-20, -45, 0));

    this.lights = [ new Light( Vec.of( 0, 0, 0, 1 ), Color.of( 0.5, 0.4, 0.3,1 ), 100000 ),
                    new Light( Vec.of(-200, 0, -200, 1), Color.of(0.5, 0.4, 0.3, 1), 100000 ),
                    new Light( Vec.of(200, 0, 200, 1), Color.of(0.5, 0.4, 0.3, 1), 100000 ),
                    new Light( Vec.of(-200, 0, 200, 1), Color.of(0.5, 0.4, 0.3, 1), 100000 ),
                    new Light( Vec.of(200, 0, -200, 1), Color.of(0.5, 0.4, 0.3, 1), 100000 )];
    let a = Math.floor((Math.random() * 20) - 10);
    let b = Math.floor((Math.random() * 20) - 10);
    let c = 70;
    let d = Vec.of(a,b,c);
    this.enemy1 = new Enemy(d);
    a = Math.floor((Math.random() * 20) - 10);
    b = Math.floor((Math.random() * 20) - 10);
    d = Vec.of(a,b,c);
    this.enemy2 = new Enemy(d);
    a = Math.floor((Math.random() * 20) - 10);
    b = Math.floor((Math.random() * 20) - 10);
    d = Vec.of(a,b,c);
    this.enemy3 = new Enemy(d);
    a = Math.floor((Math.random() * 20) - 10);
    b = Math.floor((Math.random() * 20) - 10);
    d = Vec.of(a,b,c);
    this.enemy4 = new Enemy(d);
    a = Math.floor((Math.random() * 20) - 10);
    b = Math.floor((Math.random() * 20) - 10);
    d = Vec.of(a,b,c);
    this.enemy5 = new Enemy(d);
    a = Math.floor((Math.random() * 20) - 10);
    b = Math.floor((Math.random() * 20) - 10);
    d = Vec.of(a,b,c);
    this.enemy6 = new Enemy(d);
    a = Math.floor((Math.random() * 20) - 10);
    b = Math.floor((Math.random() * 20) - 10);
    d = Vec.of(a,b,c);
    this.enemy7 = new Enemy(d);
    a = Math.floor((Math.random() * 20) - 10);
    b = Math.floor((Math.random() * 20) - 10);
    d = Vec.of(a,b,c);
    this.enemy8 = new Enemy(d);
    a = Math.floor((Math.random() * 20) - 10);
    b = Math.floor((Math.random() * 20) - 10);
    d = Vec.of(a,b,c);
    this.enemy9 = new Enemy(d);
  }

  make_control_panel() {
    this.key_triggered_button("Day", ["0"], () => (this.is_day = true));
    this.key_triggered_button("Night", ["9"], () => (this.is_day = false));
  }

  display(context, program_state) {
    if (!context.scratchpad.controls) {
      // Add a movement controls panel to the page:
      this.children.push(
        (context.scratchpad.controls = new MovementControls(this.player)),
          //(context.scratchpad.controls = new EnemyMovementControls(this.enemy))

      );

      program_state.projection_transform = Mat4.perspective(
        ((2 * Math.PI) / 360) * 70,
        context.width / context.height,
        1,
        1000
      );


      this.children.push( (this.camera_controls = new CameraControls(this.camera)) );
    }

    const t = program_state.animation_time / 1000;
    const dt = program_state.animation_delta_time / 1000;

    program_state.t = t;
    program_state.dt = dt;
    program_state.is_day = this.is_day;
    program_state.current_terrain = this.terrain;
    program_state.camera = this.camera;
    program_state.player = this.player;
    program_state.enemy = this.enemy;
    program_state.water = this.water;

    program_state.enemy1 = this.enemy1;
    program_state.enemy2 = this.enemy2;
    program_state.enemy3 = this.enemy3;
    program_state.enemy4 = this.enemy4;
    program_state.enemy5 = this.enemy5;
    program_state.enemy6 = this.enemy6;
    program_state.enemy7 = this.enemy7;
    program_state.enemy8 = this.enemy8;
    program_state.enemy9 = this.enemy9;


    /********************
      Starting here!!!!
     *******************/
    //     console.log(this.mySystem);


    let model_transform = Mat4.identity();

    program_state.lights = this.lights;

    this.camera_controls.first_person_view_camera = Mat4.look_at(
      this.player.eye_position(),
      this.player.look_at_position(),
      Vec.of(0, 1, 0)
    );
    this.camera_controls.third_person_view_camera = Mat4.look_at(
      this.camera.position,
      this.player.position,
      Vec.of(0, 1, 0)
    );

    this.update(program_state);
    program_state.clip_plane = Vec.of(0, -1, 0, 100000);
    this.render(context, program_state);
  }

  update(program_state) {
    this.sky_box.update(program_state);
    this.terrain.update(program_state);
    this.player.update(program_state);
    this.enemy.update(program_state);
    this.camera.update(program_state);
    this.water.update(program_state);

    this.enemy1.update(program_state);
    this.enemy2.update(program_state);
    this.enemy3.update(program_state);
    this.enemy4.update(program_state);
    this.enemy5.update(program_state);
    this.enemy6.update(program_state);
    this.enemy7.update(program_state);
    this.enemy8.update(program_state);
    this.enemy9.update(program_state);
  }

  render(context, program_state) {
    this.terrain.draw(context, program_state);
    this.sky_box.draw(context, program_state);
    this.player.draw(context, program_state);
    this.enemy.draw(context, program_state);
    this.water.draw(context, program_state);

    this.enemy1.draw(context, program_state);
    this.enemy2.draw(context, program_state);
    this.enemy3.draw(context, program_state);
    this.enemy4.draw(context, program_state);
    this.enemy5.draw(context, program_state);
    this.enemy6.draw(context, program_state);
    this.enemy7.draw(context, program_state);
    this.enemy8.draw(context, program_state);
    this.enemy9.draw(context, program_state);
  }
};

const Additional_Scenes = [];

export {
  Main_Scene,
  Additional_Scenes,
  Canvas_Widget,
  Code_Widget,
  Text_Widget,
  defs
};
