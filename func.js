//Function to make 2d arrays of a given size
function makeArray(w, h, val) {
  var arr = [];
  for(let i = 0; i < h; i++) {
      arr[i] = [];
      for(let j = 0; j < w; j++) {
          arr[i][j] = val;
      }
  }
  return arr;
}

class Screen {
  //Main array
  array = [];

  //
  zbuff = [];

  //Size of screen
  width;
  height;

  //Misc stuff
  farclip = 99999;

  //Colors
  black = [  0,   0,   0];
  red   = [255,   0,   0];
  green = [  0, 255,   0];
  blue  = [  0,   0, 255];
  white = [255, 255, 255];



  constructor(array) {
    this.array = array;
    this.width = array.length;
    this.height = array[0].length;
    this.zbuff = makeArray(this.height, this.width, this.farclip); //width and height swapped for [x][y] to be the syntax
  }

  //Turn pixel data into 1d array for use in canvas
  convertData(imgd) {
    let array = this.array;
    for(let x = 0; x < this.width - 1; x++) {
      for(let y = 0; y < this.height - 1; y++) {
        let pixelIndex = (y * this.width + x) * 4;
        imgd.data[pixelIndex] = array[x][y][0];
        imgd.data[pixelIndex + 1] = array[x][y][1];
        imgd.data[pixelIndex + 2] = array[x][y][2];
        imgd.data[pixelIndex + 3] = 255;
      }
    }
  }

  //Fills the whole array with one solid color
  screenFill(color) {
    let array = this.array;
    for(let x = 0; x < this.width - 1; x++) {
      for(let y = 0; y < this.height - 1; y++) {
        array[x][y] = color;
      }
    }
  }

  zClear() {
    let zbuff = this.zbuff;
    for(let x = 0; x < this.width - 1; x++) {
      for(let y = 0; y < this.height - 1; y++) {
        zbuff[x][y] = this.farclip;
      }
    }
  }

  //Filters out not possible indexes, so that things can be half visible and not crash
  pixel(x, y, value) {
    let array = this.array;
    if(x >= 0 && y >= 0 && x < this.width && y < this.height) {
      array[Math.round(x)][Math.round(y)] = value;
    }
  }

  //Only draw pixel if it is in front.
  zpixel(x, y, z, value) {
    x = Math.round(x);
    y = Math.round(y);
    if(z < this.zbuff[x][y]) {
      this.pixel(x, y, value);
      this.zbuff[x][y] = z;
    }
  }

  //Draws line from one point to another
  drawLine(point1, point2, color) {
    var m = (point2[1] - point1[1])/(point2[0] - point1[0]);
    var b = point1[1] - (m * point1[0]);
    //var m2 = (point2[2] - point1[2])/(point2[0] - point1[0]);
    //var b2 = point1[2] - (m2 * point1[0]);

    //Case for vertical line
    if(m == Infinity || m == -Infinity) {
      if(point1[1] > point2[1]) {
        let temp = point1;
        point1 = point2;
        point2 = temp;
      }
      for(let y = point1[1]; y <= point2[1]; y+=1) {
        this.pixel(point1[0], y, color);
      }
    //Case for y being iterated variable
    } else if(m > 1 || m < -1) {
      if(point1[1] > point2[1]) {
        let temp = point1;
        point1 = point2;
        point2 = temp;
      }
      for(let y = point1[1]; y <= point2[1]; y+=1) {
        let x = (y - b)/m
        this.pixel(x, y, color);
      }
    //Case for x being iterated variable
    } else {
      if(point1[0] > point2[0]) {
        let temp = point1;
        point1 = point2;
        point2 = temp;
      }
      for(let x = point1[0]; x <= point2[0]; x+=1) {
        let y = (m * x) + b
        this.pixel(x, y, color);
      }
    }
  }

  //Draws horizontal/flat line between two points
  drawFlatLine(point1, point2, color) {
    var zm = (point2[2] - point1[2])/(point2[0] - point1[0]);
    var zb = point1[2] - (zm * point1[0]);
    if(point1[0] > point2[0]) {
      let temp = point1;
      point1 = point2;
      point2 = temp;
    }
    for(let x = point1[0]; x <= point2[0]; x+=1) {
      let z = (zm * x) + zb
      this.zpixel(x, point1[1], z, color);
    }
  }


  //Draws a triangle between three points
  lineTrig(point1, point2, point3, color) {
    this.drawLine(point1, point2, color);
    this.drawLine(point2, point3, color);
    this.drawLine(point3, point1, color);
  }


  //Bubble sort points in array based on y value
  orderPoints(points) {
    for(let i = 0; i < points.length - 1; i++) {
      for(let j = 0; j < points.length - i - 1; j++) {
        if(points[j][1] > points[j+1][1]) {
          let temp = points[j];
          points[j] = points[j+1];
          points[j+1] = temp;
        }
      }
    }
    return points;
  }


  //Fill a triangle with a flat bottom edge
  fillBottomTrig(point1, point2, point3, color) {
    let newp = this.orderPoints([point1, point2, point3]);
    point1 = newp[0];
    point2 = newp[1];
    point3 = newp[2];

    let invSlope1 = (point2[0] - point1[0])/(point2[1] - point1[1]);
    let invSlope2 = (point3[0] - point1[0])/(point3[1] - point1[1]);
    let curx1 = point1[0];
    let curx2 = point1[0];

    let zinvSlope1 = (point2[0] - point1[0])/(point2[2] - point1[2]);
    let zinvSlope2 = (point3[0] - point1[0])/(point3[2] - point1[2]);
    let curz1 = point1[0];
    let curz2 = point1[0];


    for(let scanY = point1[1]; scanY <= point2[1]; scanY++) {
      this.drawFlatLine([curx1, scanY, curz1], [curx2, scanY, curz2], color);
      curx1 += invSlope1;
      curx2 += invSlope2;

      curz1 += zinvSlope1;
      curz2 += zinvSlope2;
    }
  }


  //Fill a triangle with a flat top edge
  fillTopTrig(point1, point2, point3, color) {
    let newp = this.orderPoints([point1, point2, point3]);
    point1 = newp[0];
    point2 = newp[1];
    point3 = newp[2];

    let invSlope1 = (point3[0] - point1[0])/(point3[1] - point1[1]);
    let invSlope2 = (point3[0] - point2[0])/(point3[1] - point2[1]);
    let curx1 = point3[0];
    let curx2 = point3[0];

    let zinvSlope1 = (point3[0] - point1[0])/(point3[2] - point1[2]);
    let zinvSlope2 = (point3[0] - point2[0])/(point3[2] - point2[2]);
    let curz1 = point3[0];
    let curz2 = point3[0];

    for(let scanY = point3[1]; scanY > point1[1]; scanY--) {
      this.drawFlatLine([curx1, scanY, curz1], [curx2, scanY, curz2], color);
      curx1 -= invSlope1;
      curx2 -= invSlope2;

      curz1 -= zinvSlope1;
      curz2 -= zinvSlope2;
    }
  }


  //Fill any triangle
  fillTrig(point1, point2, point3, color) {
    let temppoints = this.orderPoints([point1, point2, point3]);
    point1 = temppoints[0];
    point2 = temppoints[1];
    point3 = temppoints[2];

    if(point2[1] == point3[1]) {
      this.fillBottomTrig(point1, point2, point3, color);
    }else if(point1[1] == point2[1]) {
      this.fillTopTrig(point1, point2, point3, color);
    } else {
      let m = (point3[1] - point1[1])/(point3[0] - point1[0]);
      let m2 = (point3[2] - point1[2])/(point3[0] - point1[0]);
      let b = point1[1] - m * point1[0];
      let b2 = point1[2] - m2 * point1[0];
      let point4 = [(point2[1] - b)/m, point2[1], (point2[2]-b2)/m2];
      this.fillBottomTrig(point1, point2, point4, color);
      this.fillTopTrig(point2, point4, point3, color);
    }
  }


  //Complete triangle drawing function
  makeTrig(point1, point2, point3, color1, color2) {
    if(color1 != "none") {
      this.lineTrig(point1, point2, point3, color1);
    }
    if(color2 != "none") {
      this.fillTrig(point1, point2, point3, color2);
    }
  }


  //Fill quads by splitting into two triangles
  fillQuad(points, color) {
    points = this.orderPoints(points);
    this.fillTrig(points[0], points[1], points[2], color);
    this.fillTrig(points[1], points[2], points[3], color);
  }


  //Project points from 3d area onto 2d plane to display them
  projectPoints(points) {
    let proj_points = [];
    for(let i = 0; i < points.length; i++) {
      proj_points[i] = [(points[i][0]/(-1 * points[i][2])), (points[i][1]/(1 * points[i][2]))];
      proj_points[i][0] = this.width * (1 + proj_points[i][0])/2;
      proj_points[i][1] = this.height * (1 + proj_points[i][1])/2;
      proj_points[i][2] = points[i][2];
    }
    return proj_points;
  }


  //Draws cube given projected coordinates
  drawProjectedCube(points, color) {
    //Bottom face's edges
    this.drawLine(points[0], points[1], color);
    this.drawLine(points[1], points[2], color);
    this.drawLine(points[2], points[3], color);
    this.drawLine(points[3], points[0], color);
    //Side edges
    this.drawLine(points[0], points[4], color);
    this.drawLine(points[1], points[5], color);
    this.drawLine(points[2], points[6], color);
    this.drawLine(points[3], points[7], color);
    //Top face's edges
    this.drawLine(points[4], points[5], color);
    this.drawLine(points[5], points[6], color);
    this.drawLine(points[6], points[7], color);
    this.drawLine(points[7], points[4], color);
  }

  drawColoredCube(points) {
    this.fillQuad([points[0], points[1], points[2], points[3]], this.red);
    this.fillQuad([points[4], points[5], points[6], points[7]], this.red);

    this.fillQuad([points[0], points[1], points[4], points[5]], this.blue);
    this.fillQuad([points[3], points[2], points[7], points[6]], this.blue);

    this.fillQuad([points[3], points[0], points[7], points[4]], this.green);
    this.fillQuad([points[1], points[2], points[5], points[6]], this.green);
  }


  //Draws cube given all coordinates
  drawCoordCube(points, color) {
    let proj_points = this.projectPoints(points);
    //drawProjectedCube(proj_points, color);
    this.drawColoredCube(proj_points);
  }


  //Draws cube given center and side length
  drawCube(center, side, color) {
    this.drawRotCube(center, side, 0, 0, 0, color);
  }


  //Rotate a set of points around center on three axis
  rotPoints(points, center, rotx, roty, rotz) {
    //Rot x
    for(let h = 0; h < points.length; h++) {
      let dist = Math.sqrt((points[h][1] - center[1])**2 + (points[h][2] - center[2])**2);
      let ang = Math.atan2(((points[h][2] - center[2])), ((points[h][1] - center[1])))* 180/Math.PI;
      points[h][1] = center[1] + (dist * (Math.cos((rotx + ang) * Math.PI/180)));
      points[h][2] = center[2] + (dist * (Math.sin((rotx + ang) * Math.PI/180)));
    }

    //Rot y
    for(let j = 0; j < points.length; j++) {
      let dist = Math.sqrt((points[j][0] - center[0])**2 + (points[j][2] - center[2])**2);
      let ang = Math.atan2(((points[j][2] - center[2])), ((points[j][0] - center[0])))* 180/Math.PI;
      points[j][0] = center[0] + (dist * (Math.cos((roty + ang) * Math.PI/180)));
      points[j][2] = center[2] + (dist * (Math.sin((roty + ang) * Math.PI/180)));
    }

    //Rot z
    for(let i = 0; i < points.length; i++) {
      let dist = Math.sqrt((points[i][0] - center[0])**2 + (points[i][1] - center[1])**2);
      let ang = Math.atan2(((points[i][1] - center[1])), ((points[i][0] - center[0])))*180/Math.PI;
      points[i][0] = center[0] + (dist * (Math.cos((rotz + ang) * Math.PI/180)));
      points[i][1] = center[1] + (dist * (Math.sin((rotz + ang) * Math.PI/180)));
    }

    return points;
  }


  //Draw cube function with rotational parameters
  drawRotCube(center, side, rotx, roty, rotz, color) {
    let points = [];

    points[0] = [center[0] - side/2, center[1] - side/2, center[2] + side/2];
    points[1] = [center[0] + side/2, center[1] - side/2, center[2] + side/2];
    points[2] = [center[0] + side/2, center[1] - side/2, center[2] - side/2];
    points[3] = [center[0] - side/2, center[1] - side/2, center[2] - side/2];
    points[4] = [center[0] - side/2, center[1] + side/2, center[2] + side/2];
    points[5] = [center[0] + side/2, center[1] + side/2, center[2] + side/2];
    points[6] = [center[0] + side/2, center[1] + side/2, center[2] - side/2];
    points[7] = [center[0] - side/2, center[1] + side/2, center[2] - side/2];

    points = this.rotPoints(points, center, rotx, roty, rotz);

    this.drawCoordCube(points, color);

  }
}




//Export all functions
export { Screen, makeArray };