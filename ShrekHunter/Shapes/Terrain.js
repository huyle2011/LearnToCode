import { tiny } from "../tiny-graphics.js";
// Pull these names into this module's scope for convenience:
const { Vec, Shape } = tiny;

class Terrain extends Shape {
  constructor(size, height_map, max_height = 50) {
    super("position", "normal", "texture_coord");
    this.size = size;
    this.max_height = max_height;
    this.max_pixel = 256 * 256 * 256;

    let count_vertex = height_map.height;

    this.heights = new Array(count_vertex);
    for (let i = 0; i < count_vertex; i++) {
      this.heights[i] = new Array(count_vertex);
    }

    let data = this.getImageData(height_map);

    for (let i = 0; i < count_vertex; i++) {
      for (let j = 0; j < count_vertex; j++) {
        let height = this.get_height(height_map, data, j, i);

        this.heights[j][i] = height;
        this.arrays.position.push(
          Vec.of(
            (-j / (count_vertex - 1)) * this.size,
            height,
            (-i / (count_vertex - 1)) * this.size
          )
        );
        let normal = this.calculate_normal(j, i, height_map, data);

        this.arrays.normal.push(Vec.of(normal[0], normal[1], normal[2]));
        this.arrays.texture_coord.push(
          Vec.of(j / count_vertex - 1, i / count_vertex - 1)
        );
      }
    }

    for (let gz = 0; gz < count_vertex - 1; gz++) {
      for (let gx = 0; gx < count_vertex - 1; gx++) {
        let top_left = gz * count_vertex + gx;
        let top_right = top_left + 1;
        let bottom_left = (gz + 1) * count_vertex + gx;
        let bottom_right = bottom_left + 1;

        this.indices.push(top_left);
        this.indices.push(bottom_left);
        this.indices.push(top_right);
        this.indices.push(top_right);
        this.indices.push(bottom_left);
        this.indices.push(bottom_right);
      }
    }
  }

  get_height(height_map, data, x, z) {
    if (x < 0 || x >= height_map.height || z < 0 || z >= height_map.height)
      return 0;

    let pixel = this.getPixel(data, x, z);

    let height = pixel.r * pixel.g * pixel.b;
    height -= this.max_pixel / 2;
    height /= this.max_pixel / 2;
    height *= this.max_height;

    return height;
  }

  calculate_normal(x, z, height_map, data) {
    let height_left = this.get_height(height_map, data, x - 1, z);
    let height_right = this.get_height(height_map, data, x + 1, z);
    let height_down = this.get_height(height_map, data, x, z - 1);
    let height_up = this.get_height(height_map, data, x, z + 1);

    let normal = Vec.of(
      height_left - height_right,
      2 * this.size,
      height_down - height_up
    );
    normal.normalize();
    return normal;
  }

  getImageData(image) {
    var canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;

    var context = canvas.getContext("2d");
    context.drawImage(image, 0, 0);

    return context.getImageData(0, 0, image.width, image.height);
  }

  getPixel(image_data, x, y) {
    var position = (x + image_data.width * y) * 4,
      data = image_data.data;
    return {
      r: data[position],
      g: data[position + 1],
      b: data[position + 2],
      a: data[position + 3]
    };
  }
}

export default Terrain;
