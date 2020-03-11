import { tiny, defs } from "./project-resources.js";
import Player from "./Objects/Player.js";
import Shrek from "./Objects/Shrek.js";
import Enemy from "./Objects/Enemy.js";
import Alien from "./Objects/Alien.js";
import Camera from "./Objects/Camera.js";
import SkyBox from "./Objects/SkyBox.js";
import Terrain from "./Objects/Terrain.js";
import Water from "./Objects/Water.js";
import Bullet from "./Objects/Bullet.js";
import MovementControls from "./Controls/MovementControls.js";
import CameraControls from "./Controls/CameraControls.js";
import ImageControls from "./Controls/ImageControls.js";
import WaterControls from "./Controls/WaterControls.js";

const { Vec, Mat4, Color, Light, Material, Scene,
  Canvas_Widget, Code_Widget, Text_Widget } = tiny;

const { Cube, Subdivision_Sphere, Triangle} = defs;

const Main_Scene = class Shrek_Hunter extends Scene {
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
    this.is_day = false;
    this.almost = true;
    // reflection / refraction
    this.scratchpad = document.createElement("canvas");
    this.scratchpad_context = this.scratchpad.getContext("2d");

    //entitity initializations
    this.bullet = new Bullet();
    this.shrek = new Shrek();
    this.shrek_spawned = false;
    this.shot = false;
    this.bam;
    this.last_hit = 0;
    this.sky_box = new SkyBox();
    this.terrain = new Terrain(Vec.of(0.5, 0, 0.5), 800);
    this.player = new Player();
    this.camera = new Camera(this.player);
    // this is for setting up the location of the lake of water
    //this.water = new Water(Vec.of(-220, -45, -180));
    this.water = new Water(Vec.of(170, -45, -170), 140);

    this.lights = [ new Light( Vec.of( 0, 0, 0, 1 ), Color.of( 0.5, 0.4, 0.3,1 ), 100000 ),
                    new Light( Vec.of(-200, 0, -200, 1), Color.of(0.5, 0.4, 0.3, 1), 100000 ),
                    new Light( Vec.of(200, 0, 200, 1), Color.of(0.5, 0.4, 0.3, 1), 100000 ),
                    new Light( Vec.of(-200, 0, 200, 1), Color.of(0.5, 0.4, 0.3, 1), 100000 ),
                    new Light( Vec.of(200, 0, -200, 1), Color.of(0.5, 0.4, 0.3, 1), 100000 )];

    // set up donkeys
    this.enemy = new Enemy();
    let a = Math.floor((Math.random() * 200) - 100);
    let b = 0;
    let c = Math.floor((Math.random() * 200) - 100);
    let d = Vec.of(a,b,c);
    this.enemy1 = new Enemy(d);
    a = Math.floor((Math.random() * 200) - 100);
    c = Math.floor((Math.random() * 200) - 100);
    d = Vec.of(a,b,c);
    this.enemy2 = new Enemy(d);
    a = Math.floor((Math.random() * 200) - 100);
    c = Math.floor((Math.random() * 200) - 100);
    d = Vec.of(a,b,c);
    this.enemy3 = new Enemy(d);
    a = Math.floor((Math.random() * 200) - 100);
    c = Math.floor((Math.random() * 200) - 100);
    d = Vec.of(a,b,c);
    this.enemy4 = new Enemy(d);
    a = Math.floor((Math.random() * 200) - 100);
    c = Math.floor((Math.random() * 200) - 100);
    d = Vec.of(a,b,c);
    this.enemy5 = new Enemy(d);
    a = Math.floor((Math.random() * 200) - 100);
    c = Math.floor((Math.random() * 200) - 100);
    d = Vec.of(a,b,c);
    this.enemy6 = new Enemy(d);
    a = Math.floor((Math.random() * 200) - 100);
    c = Math.floor((Math.random() * 200) - 100);
    d = Vec.of(a,b,c);
    this.enemy7 = new Enemy(d);
    a = Math.floor((Math.random() * 200) - 100);
    c = Math.floor((Math.random() * 200) - 100);
    d = Vec.of(a,b,c);
    this.enemy8 = new Enemy(d);
    a = Math.floor((Math.random() * 200) - 100);
    c = Math.floor((Math.random() * 200) - 100);
    d = Vec.of(a,b,c);
    this.enemy9 = new Enemy(d);

    // set up aliens
    this.alien = new Alien();
    this.alien1 = new Alien(d);
    a = Math.floor((Math.random() * 200) - 100);
    c = Math.floor((Math.random() * 200) - 100);
    d = Vec.of(a,b,c);
    this.alien2 = new Alien(d);
    a = Math.floor((Math.random() * 200) - 100);
    c = Math.floor((Math.random() * 200) - 100);
    d = Vec.of(a,b,c);
    this.alien3 = new Alien(d);
    a = Math.floor((Math.random() * 200) - 100);
    c = Math.floor((Math.random() * 200) - 100);
    d = Vec.of(a,b,c);
    this.alien4 = new Alien(d);
    a = Math.floor((Math.random() * 200) - 100);
    c = Math.floor((Math.random() * 200) - 100);
    d = Vec.of(a,b,c);

    // this array will hold donkey and alien objects
    this.enem_array = [ this.enemy, this.enemy1, this.enemy2, this.enemy3, this.enemy4, this.enemy5, this.enemy6, this.enemy7, this.enemy8, this.enemy9,
                        this.alien, this.alien1, this.alien2, this.alien3, this.alien4 ];

    // get the length of enem_array
    this.count = this.enem_array.length;
    this.count_down = 30;

    // sound effects
    this.sounds = {
      bam: new Audio("assets/gunshot.wav"),
      shrek_voice: new Audio("assets/shrek_voice.wav"),
      ending: new Audio("assets/ending.wav")


    };
  }

  make_control_panel() {
    this.key_triggered_button("Day", ["0"], () => (this.is_day = true));
    this.key_triggered_button("Night", ["9"], () => (this.is_day = false));
    this.key_triggered_button("Shoot", ["i"], () => this.shoot());

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

  check_first_time()
  {
    if(!this.shrek_spawned)
    {
      this.camera.curr_zoom = -3 * this.camera.zoom;
      this.play_sound("shrek_voice");
      setTimeout(() => { this.pause_sound("shrek_voice"); }, 3000);
    }
    else if(!this.count_down)
      this.camera.curr_zoom = 0;
    else
      this.count_down--;
  }

  check_collide_all(t)
  {
    let debounce = t - this.last_hit;
    let i = 0;
    for(i = 0; i < this.enem_array.length; i++)
    {
      // bullet vs donkeys
      if((Math.pow(this.bullet.position[0] - this.enem_array[i].position[0], 2) < 25) && (Math.pow(this.bullet.position[2] - this.enem_array[i].position[2], 2) < 25))
      {
        this.bullet.position = Vec.of(999,999,999);
        this.enem_array[i].position = Vec.of(0,-999,); //change
        this.count--;
      }


      // player vs donkey
      if((Math.pow(this.player.position[0] - this.enem_array[i].position[0], 2) < 25) && (Math.pow(this.player.position[2] - this.enem_array[i].position[2], 2) < 25))
      {
        if(debounce > 2)
        {
          this.player.life--;
          this.last_hit = t;
        }
      }

    }
    // player vs shrek
    if(this.shrek_spawned)
    {
      if((Math.pow(this.player.position[0] - this.shrek.position[0], 2) < 25) && (Math.pow(this.player.position[2] - this.shrek.position[2], 2) < 25))
      {
        if(debounce > 2)
        {
          this.player.life--;
          this.last_hit = t;
        }
      }
    }

    // bullet vs shrek
    if((Math.pow(this.bullet.position[0] - this.shrek.position[0], 2) < 100) && (Math.pow(this.bullet.position[2] - this.shrek.position[2], 2) < 100))
    {
      if(this.shrek_spawned)
      {
        this.bullet.position = Vec.of(999, 999, 999);
        this.shrek.life--;
        if(!this.shrek.life)
        {
          this.shrek.position = Vec.of(-999,-999,-999);
          this.shrek_spawned = false;
          this.count++;
          this.is_day = true;
          this.play_sound("ending");
          setTimeout(() => { this.pause_sound("ending"); }, 7000);
        }
      }
    }

    if(!this.count)
    {
      this.check_first_time();
      this.shrek_spawned = true;
    }
  }

  shoot() {
    this.shot = true;
    this.bam = true;
    this.bullet.position = this.player.position;
    this.bullet.rotation = this.player.rotation;
  }


  display(context, program_state) {

    const t = program_state.animation_time / 1000;
    const dt = program_state.animation_delta_time / 1000;

    this.check_collide_all(t);
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

      this.children.push( (this.camera_controls = new CameraControls(this.camera)),
          // this is for the lake of water and controlling image reflection and refraction
          (this.water_controls = new WaterControls()),
          (this.water_reflection_image_control = new ImageControls("Reflection",context,
              this.scratchpad, this.scratchpad_context, 256)),
          (this.water_refraction_image_control = new ImageControls("Refraction", context,
              this.scratchpad, this.scratchpad_context, 256))
    );
    }

    program_state.t = t;
    program_state.dt = dt;

    program_state.is_day = this.is_day;
    program_state.current_terrain = this.terrain;
    program_state.camera = this.camera;
    program_state.player = this.player;
    program_state.shrek = this.shrek;
    program_state.enemy = this.enemy;
    program_state.water = this.water;

    // donkeys
    program_state.enemy1 = this.enemy1;
    program_state.enemy2 = this.enemy2;
    program_state.enemy3 = this.enemy3;
    program_state.enemy4 = this.enemy4;
    program_state.enemy5 = this.enemy5;
    program_state.enemy6 = this.enemy6;
    program_state.enemy7 = this.enemy7;
    program_state.enemy8 = this.enemy8;
    program_state.enemy9 = this.enemy9;

    // aliens
    program_state.alien = this.alien;
    program_state.alien1 = this.alien1;
    program_state.alien2 = this.alien2;
    program_state.alien3 = this.alien3;
    program_state.alien4 = this.alien4;

    /********************
      Starting here!!!!
     *******************/
    program_state.lights = this.lights;

    // add water
    this.prepare_water(context, program_state);

    // set up camera
    this.camera_controls.object_view = Mat4.look_at(
      this.player.eye_position(),
      this.player.look_at_position(),
      Vec.of(0, 1, 0)
    );
    this.camera_controls.audience_view = Mat4.look_at(
      this.camera.position,
      this.player.position,
      Vec.of(0, 1, 0)
    );

    // update and render things on map
    this.update(program_state);
    program_state.clip_plane = Vec.of(0, -1, 0, 100000);
    this.render(context, program_state);
  }

  update(program_state) {
    this.bullet.update(program_state);

    // shot sound
    if (this.shot && this.bam) {
      this.bam = false;
      this.play_sound("bam");
      setTimeout(() => { this.pause_sound("bam"); }, 400);
    }

    // it will make the automatic transition between day and night
    // if (this.is_day) {
    //   if (this.almost) {
    //     setTimeout(() => {
    //       this.is_day = false;
    //       this.almost = !this.almost;
    //     }, 20000);
    //   }
    // } else {
    //   if (this.almost) {
    //     setTimeout(() => { this.is_day = true; this.almost = !this.almost; }, 20000);
    //   }
    // }

    // update elements on the map
    this.sky_box.update(program_state);
    this.terrain.update(program_state);
    this.player.update(program_state);
    this.shrek.update(program_state);
    this.enemy.update(program_state);
    this.camera.update(program_state);
    this.water.update(program_state);

    // update donkeys
    this.enemy1.update(program_state);
    this.enemy2.update(program_state);
    this.enemy3.update(program_state);
    this.enemy4.update(program_state);
    this.enemy5.update(program_state);
    this.enemy6.update(program_state);
    this.enemy7.update(program_state);
    this.enemy8.update(program_state);
    this.enemy9.update(program_state);

    // update aliens
    this.alien.update(program_state);
    this.alien1.update(program_state);
    this.alien2.update(program_state);
    this.alien3.update(program_state);
    this.alien4.update(program_state);
  }

  render(context, program_state, check = true) {
    // draw map and sky
    this.terrain.draw(context, program_state);
    this.sky_box.draw(context, program_state);

    // draw the bullet
    if(this.shot)
    {
      this.bullet.draw(context, program_state);
    }

    // draw player
    this.player.draw(context, program_state);

    // draw shrek
    if(this.shrek_spawned)
    {
      this.shrek.draw(context, program_state);
    }

    // draw water
    if (check) {
      this.water.draw(context, program_state);
    }

    // draw donkeys
    this.enemy.draw(context, program_state);
    this.enemy1.draw(context, program_state);
    this.enemy2.draw(context, program_state);
    this.enemy3.draw(context, program_state);
    this.enemy4.draw(context, program_state);
    this.enemy5.draw(context, program_state);
    this.enemy6.draw(context, program_state);
    this.enemy7.draw(context, program_state);
    this.enemy8.draw(context, program_state);
    this.enemy9.draw(context, program_state);

    // draw aliens
    this.alien.draw(context, program_state);
    this.alien1.draw(context, program_state);
    this.alien2.draw(context, program_state);
    this.alien3.draw(context, program_state);
    this.alien4.draw(context, program_state);
  }

  // those helper functions for setting up the water as well as its reflection and refraction
  prepare_water(context, program_state) {
    // water reflection / refraction
    if (this.player.is_near_object(this.water.position, 20000)) {
      // reflection
      program_state.clip_plane = Vec.of(0, 1, 0, -this.water.get_height());
      let distance = this.invert_view(program_state, this.water.get_height());

      this.render(context, program_state, false);

      this.water_reflection_image_control.take_a_screen_shot();
      program_state.water_reflection_texture = this.water_reflection_image_control.texture;

      context.context.clear(context.context.COLOR_BUFFER_BIT | context.context.DEPTH_BUFFER_BIT);
      this.invert_view_back(program_state, distance);

      // refraction
      program_state.clip_plane = Vec.of(0, -1, 0, this.water.get_height());
      this.render(context, program_state, false);
      this.water_refraction_image_control.take_a_screen_shot();
      program_state.water_refraction_texture = this.water_refraction_image_control.texture;

      context.context.clear(context.context.COLOR_BUFFER_BIT | context.context.DEPTH_BUFFER_BIT);
    }
  }

  invert_view(program_state, height) {
      var distance;
      if (this.camera_controls.state == 0) {
        // first person view camera
        distance = 2 * (this.player.position[1] - height);
        this.player.position[1] -= distance;
        this.player.invert_look_up_angle();
        program_state.set_camera(
          Mat4.look_at(
            this.player.eye_position(),
            this.player.look_at_position(),
            Vec.of(0, 1, 0)
          )
        );
      } else {
        distance = 2 * (this.camera.position[1] - height);
        this.camera.position[1] -= distance;
        this.camera.invert_look();
        this.camera.update_position();
        program_state.set_camera(
          Mat4.look_at(
            this.camera.position,
            this.player.position,
            Vec.of(0, 1, 0)
          )
        );
      }

      return distance;
    }

    invert_view_back(program_state, distance) {
      if (this.camera_controls.state == 0) {
        // first person view camera
        this.player.position[1] += distance;
        this.player.invert_look_up_angle();
        program_state.set_camera(
          Mat4.look_at(
            this.player.eye_position(),
            this.player.look_at_position(),
            Vec.of(0, 1, 0)
          )
        );
      } else {
        this.camera.position[1] += distance;
        this.camera.invert_look();
        this.camera.update_position();
        program_state.set_camera(
          Mat4.look_at(
            this.camera.position,
            this.player.position,
            Vec.of(0, 1, 0)
          )
        );
      }
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

