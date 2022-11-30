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


class Triangle {
  point1 = [];
  point2 = [];
  point3 = [];

  color = [];

  A = 0;
  B = 0;
  C = 0;
  D = 0;

  constructor(point1, point2, point3) {
    this.point1 = point1;
    this.point2 = point2;
    this.point3 = point3;
  }
}


//Main class
class Screen {
  //Main array
  array = [];

  //Depth buffer
  zbuff = [];

  //Size of screen
  width;
  height;

  //Misc stuff
  farclip = -999;

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

    //Turn pixel data into 1d array for use in canvas
  convertzbuff(imgd) {
    let zbuff = this.zbuff;
    for(let x = 0; x < this.width - 1; x++) {
      for(let y = 0; y < this.height - 1; y++) {
        let grayCol = (1 - zbuff[x][y]/this.farclip) * 255;
        let pixelIndex = (y * this.width + x) * 4;
        imgd.data[pixelIndex] = grayCol;
        imgd.data[pixelIndex + 1] = grayCol;
        imgd.data[pixelIndex + 2] = grayCol;
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
    if(x >= 0 && y >= 0 && x < this.width && y < this.height) {
      this.array[Math.floor(x)][Math.floor(y)] = value;
    }
  }

  //Only draw pixel if it is in front.
  zpixel(x, y, z, value) {
    x = Math.floor(x);
    y = Math.floor(y);
    if(z > this.zbuff[x][y]) {
      this.pixel(x, y, value);
      this.zbuff[x][y] = z;
    }
  }


  //Find maximum value in array
  max(arr) {
    let top = arr[0];
    for(let i = 0; i < arr.length; i++) {
      if(arr[i] > top) {
        top = arr[i]
      }
    }
    return top;
  }

  //Find minimum value in array
  min(arr) {
    let bot = arr[0];
    for(let i = 0; i < arr.length; i++) {
      if(arr[i] < bot) {
        bot = arr[i]
      }
    }
    return bot;
  }

  //Find distance between two points
  distance(point1, point2) {
    return Math.sqrt(Math.pow((point2[1] - point1[1]), 2) + Math.pow((point2[0] - point1[1]), 2));
  }

  //Clamp values to between 0 and 1
  clamp(value, min, max) {
    if(typeof min === "undefined") {
      min = 0;
    }
    if(typeof max === "undefined") {
      max = 1;
    }
    return Math.max(min, Math.min(value, max));
  }

  //Interpolate between two points with min starting, max ending and gradient being percent
  interpolate(min, max, gradient) {
    return min + (max - min) * this.clamp(gradient);
  }

  //Draws line from one point to another
  drawLine(point1, point2, color) {
    if(point1[0] > point2[0]) {
      let temp = point1;
      point1 = point2;
      point2 = temp;
    }
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


  //Check if point is above line that goes through two other points
  pointAbove(seg, point) {
    let m = (seg[1][1] - seg[0][1])/(seg[1][0] - seg[0][0]);
    let b = seg[1][1] - m * seg[1][0];
    let linecheck = m * point[0] + b;
    if(point[1] < linecheck) {
      return true;
    } else {
      return false;
    }
  }


  //Draws a triangle between three points
  lineTrig(point1, point2, point3, color) {
    this.drawLine(point1, point2, color);
    this.drawLine(point2, point3, color);
    this.drawLine(point3, point1, color);
  }

  //Bubble sort points in array based on y value
  orderYPoints(points) {
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


  //Compute gradient to find other values like startX and endX to draw between.
  scanLine(y, pointA, pointB, pointC, pointD, color) {
    //If pa.Y == pb.Y or pc.Y == pd.Y gradient is forced to 1
    var gradient1 = pointA[1] != pointB[1] ? (y - pointA[1]) / (pointB[1] - pointA[1]) : 1;
    var gradient2 = pointC[1] != pointD[1] ? (y - pointC[1]) / (pointD[1] - pointC[1]) : 1;

    var startX = this.interpolate(pointA[0], pointB[0], gradient1) >> 0;
    var endX = this.interpolate(pointC[0], pointD[0], gradient2) >> 0;

    var z1 = this.interpolate(pointA[2], pointB[2], gradient1);
    var z2 = this.interpolate(pointC[2], pointD[2], gradient2);

    //Swap start and end for loop to work properly
    if(startX > endX) {
      let temp = startX;
      startX = endX;
      endX = temp;
    }

    //Drawing line from startX to endX
    for(var x = startX; x < endX; x++) {
      var gradient = (x - startX) / (endX - startX);
      var z = this.interpolate(z1, z2, gradient);
      this.zpixel(x, y, z, color);
    }
  }

  //Draw a triangle using alternate method
  drawTrig(point1, point2, point3, color) {
    let points = this.orderYPoints([point1, point2, point3]);
    point1 = points[0];
    point2 = points[1];
    point3 = points[2];
    //Inverse slopes
    var invSlope1; //dP1P2
    var invSlope2; //dP1P3

    //Compute slopes
    if(point2[1] - point1[1] > 0) {
      invSlope1 = (point2[0] - point1[0]) / (point2[1] - point1[1]);
    } else {
      invSlope1 = 0;
    }
    if(point3[1] - point1[1] > 0) {
      invSlope2 = (point3[0] - point1[0]) / (point3[1] - point1[1]);
    } else {
      invSlope2 = 0;
    }

    if(invSlope1 > invSlope2) {
      //First case where point2 is to the right of point1 and point3
      for(var y = point1[1] >> 0; y <= point3[1] >> 0; y++) {
        if(y < point2[1]) {
          this.scanLine(y, point1, point3, point1, point2, color);
        } else {
          this.scanLine(y, point1, point3, point2, point3, color);
        }
      }
    } else {
      //First case where p2 is to the left of point1 and point3
      for(var y = point1[1] >> 0; y <= point3[1] >> 0; y++) {
        if(y < point2[1]) {
          this.scanLine(y, point1, point2, point1, point3, color);
        } else {
          this.scanLine(y, point2, point3, point1, point3, color);
        }
      }
    }
  }

  //Fill quads by splitting into two triangles
  drawQuad(points, color) {
    //Diagonal 1, 2
    if((this.pointAbove([points[0], points[1]], points[2]) == true && this.pointAbove([points[0], points[1]], points[3]) == false)
    || (this.pointAbove([points[0], points[1]], points[2]) == false && this.pointAbove([points[0], points[1]], points[3]) == true)) {
      this.drawTrig(points[0], points[1], points[2], color);
      this.drawTrig(points[0], points[1], points[3], color);
    }

    //Diagonal 1, 3
    if((this.pointAbove([points[0], points[2]], points[1]) == true && this.pointAbove([points[0], points[2]], points[3]) == false)
    || (this.pointAbove([points[0], points[2]], points[1]) == false && this.pointAbove([points[0], points[2]], points[3]) == true)) {
      this.drawTrig(points[0], points[2], points[1], color);
      this.drawTrig(points[0], points[2], points[3], color);
    }

    //Diagonal 1, 4
    if((this.pointAbove([points[0], points[3]], points[1]) == true && this.pointAbove([points[0], points[3]], points[2]) == false)
    || (this.pointAbove([points[0], points[3]], points[1]) == false && this.pointAbove([points[0], points[3]], points[2]) == true)) {
      this.drawTrig(points[0], points[3], points[1], color);
      this.drawTrig(points[0], points[3], points[2], color);
    }
  }


  //Project points from 3d area onto 2d plane to display them
  projectPoints(points) {
    let proj_points = [];
    for(let i = 0; i < points.length; i++) {
      proj_points[i] = [(points[i][0]/(-1 * points[i][2])), (points[i][1]/(1 * points[i][2]))];
      proj_points[i][0] = this.width * (1 + proj_points[i][0])/2;
      proj_points[i][1] = this.height * (1 + proj_points[i][1])/2;
      if(points[i][2] > this.farclip) {
        proj_points[i][2] = points[i][2];
      } else {
        proj_points[i][2] = this.farclip;
      }
    }
    return proj_points;
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

  //Draws cube with differently colored faces
  drawColoredCube(points) {
    //console.log(points); //for debugging fact clipping
    this.drawQuad([points[0], points[1], points[2], points[3]], this.red);
    this.drawQuad([points[4], points[5], points[6], points[7]], this.red);

    this.drawQuad([points[0], points[1], points[4], points[5]], this.blue);
    this.drawQuad([points[3], points[2], points[7], points[6]], this.blue);

    this.drawQuad([points[3], points[0], points[7], points[4]], this.green);
    this.drawQuad([points[1], points[2], points[5], points[6]], this.green);
  }

  //Draws cube given all coordinates
  drawCoordCube(points, color) {
    let proj_points = this.projectPoints(points);
    //this.drawProjectedCube(proj_points, color);
    this.drawColoredCube(proj_points);
  }


  //Draws cube given center and side length
  drawCube(center, side, color) {
    this.drawRotCube(center, side, 0, 0, 0, color);
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