//Color presets
let black = [  0,   0,   0];
let red   = [255,   0,   0];
let green = [  0, 255,   0];
let blue  = [  0,   0, 255];
let white = [255, 255, 255];

//Class to store miscellaneous functions
class Misc {
  //Function to make 2d arrays of a given size
  static makeArray(w, h, val) {
    let arr = [];
    for(let i = 0; i < h; i++) {
      arr[i] = [];
      for(let j = 0; j < w; j++) {
        arr[i][j] = val;
      }
    }
    return arr;
  }

  //Pause processing for x number of milliseconds
  static sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
      if ((new Date().getTime() - start) > milliseconds){
        break;
      }
    }
  }

  //Sum values of array
  static sum(arr) {
    let sumVal = 0;
    for(let i = 0; i < arr.length; i++) {
      sumVal += arr[i];
    }
    return sumVal;
  }

  //Round to decimal place
  static round(num, place) {
    return Math.round(num * Math.pow(10, place))/Math.pow(10, place);
  }
}


//Face class
class Face {
  object; //Used to later get rot and pos of face
  vertices = []; //Values corresponding to indices of vertices of given object
  faceNum;

  constructor(newObject, newVertices, newFaceNum) {
    this.object = newObject;
    this.vertices = newVertices;
    this.faceNum = newFaceNum;
  }

  drawFace(screen) {
    //Split up by indiviual value in order to pass by value rather than by reference
    let points = [
      [
        this.object.vertices[this.vertices[0] - 1][0],
        this.object.vertices[this.vertices[0] - 1][1],
        this.object.vertices[this.vertices[0] - 1][2],
      ],
      [
        this.object.vertices[this.vertices[1] - 1][0],
        this.object.vertices[this.vertices[1] - 1][1],
        this.object.vertices[this.vertices[1] - 1][2],
      ],
      [
        this.object.vertices[this.vertices[2] - 1][0],
        this.object.vertices[this.vertices[2] - 1][1],
        this.object.vertices[this.vertices[2] - 1][2],
      ]
    ];

    //Convert from object space to real space
    for(let i = 0; i < points.length; i++) {
      for(let j = 0; j < points[i].length; j++) {
        points[i][j] = points[i][j] + this.object.pos[j];
      }
    }

    points = screen.rotPoints(points, this.object.pos, this.object.rot); //Apply needed rotations
    points = screen.projectPoints(points); //Project from object space into screen space
    screen.drawTrig(points, this.object.faceCols[this.faceNum]); //Draw triangle
  }
}

//Object class
class Object {
  //Object space data
  vertices = [];
  faces = [];
  vertexNormals = [];

  //World space data
  pos = [];
  rot = [];

  //Extra data
  faceCols = [];


  //Constructor
  constructor(objString, colString) {
    this.parseCol(colString);
    this.parseObj(objString);
    this.pos = [0, 0, 0];
    this.rot = [0, 0, 0];
  }

  //Set pos
  setPos([x, y, z]) {
    this.pos = [x, y, z];
  }

  //Add pos
  addPos([x, y, z]) {
    this.pos = [this.pos[0] + x, this.pos[1] + y, this.pos[2] + z];
  }

  //Set rot
  setRot([x, y, z]) {
    x = x % 360;
    y = y % 360;
    z = z % 360;
    this.rot = [x, y, z];
  }

  //Add rot
  addRot([x, y, z]) {
    this.rot[0] = (this.rot[0] + x) % 360;
    this.rot[1] = (this.rot[1] + y) % 360;
    this.rot[2] = (this.rot[2] + z) % 360;
  }


  //Print object data
  printData() {
    console.log("Object data:");
    console.log("-----------------------------------");
    console.log("Vertices:");
    console.log(this.vertices);
    // console.log("Faces:");
    // console.log(this.faces);
    // console.log("Vertex Normals:");
    // console.log(this.vertexNormals);
    // console.log("World space data:");
    // console.log("-----------------------------------");
    // console.log("Position:");
    // console.log(this.pos);
    // console.log("Rotation:");
    // console.log(this.rot);
    console.log("Colors:");
    console.log(this.faceCols);
  }

  //Parse obj file
  parseObj(lines) {
    lines = lines.split("\n");
    for(let i = 0; i < lines.length; i++) {
      //Split values in line into seperate values
      lines[i] = lines[i].split(" ");
      //Vertex
      if(lines[i][0] == "v") {
        let pos = [parseFloat(lines[i][1]), parseFloat(lines[i][2]), parseFloat(lines[i][3])];
        this.vertices.push(pos);
      }
      //Face
      if(lines[i][0] == "f") {
        let face = [];
        for(let j = 1; j < lines[i].length; j++) {
          lines[i][j] = lines[i][j].split("/");
          face.push(parseInt(lines[i][j][0]));
        }
        this.faces.push(new Face(this, face, this.faces.length));
      }
      //Vertex Normals
      if(lines[i][0] == "vn") {
        let norm = [parseFloat(lines[i][1]), parseFloat(lines[i][2]), parseFloat(lines[i][3])];
        this.vertexNormals.push(norm);
      }
    }
  }

  //Parse colors
  parseCol(lines) {
    lines = lines.split("\n");
    for(let i = 0; i < lines.length; i++) {
      lines[i] = lines[i].split(" ");
      lines[i][1] = lines[i][1].split("\r")[0]; //Removing bad formatting
      //Current only case, a face color
      if(lines[i][0] == "f") {
        this.faceCols.push(lines[i][1]);
      }
    }
  }

  addObject(allFaces) {
    for(let i = 0; i < this.faces.length; i++) {
      allFaces.push(this.faces[i]);
    }
  }

  //End of class
}


//Main class
class Screen {
  //Main array
  array = []; //Main array containing all pixel values

  //Depth buffer
  zbuff = []; //Used to store the depth of every pixel, required in order for proper rendering

  //Size of screen
  width;
  height;

  //Camera properties
  screenDist = 1; //Distance from camera to screen onto which points are projected
  farclip = -999; //Pixels further than this are culled
  nearclip = -1 * this.screenDist; //Pixels closer than this are culled


  //Constructor
  constructor(array, width, height) {
    this.array = array;
    this.width = width;
    this.height = height;
    this.zbuff = Misc.makeArray(this.height, this.width, this.farclip); //width and height swapped for [x][y] to be the syntax
  }

  //Fills the whole array with one solid color
  screenFill(color) {
    let array = this.array;
    for(let x = 0; x < this.width - 1; x++) {
      for(let y = 0; y < this.height - 1; y++) {
        this.pixel(x, y, color);
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


  //Filters out not possible indexes, so that things can be half visible and not crash, also converts form 2d syntax to the canvas 1d array format
  pixel(x, y, value) {
    let pixelIndex = (y * this.width + x) * 4;
    this.array[pixelIndex] = value[0]
    this.array[pixelIndex + 1] = value[1]
    this.array[pixelIndex + 2] = value[2]
    this.array[pixelIndex + 3] = 255;
  }

  //Only draw pixel if it is in front.
  zpixel(x, y, z, value) {
    x = Math.floor(x);
    y = Math.floor(y);
    if(x >= 0 && y >= 0 && x < this.width && y < this.height && z > this.zbuff[x][y] && z < this.nearclip) {
      this.pixel(x, y, value);
      this.zbuff[x][y] = z;
    }
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
  interp(min, max, gradient) {
    return min + (max - min) * this.clamp(gradient);
  }

  //Draws line from one point to another
  drawLine(point1, point2, color) {
    if(point1[0] > point2[0]) {
      let temp = point1;
      point1 = point2;
      point2 = temp;
    }
    let m = (point2[1] - point1[1])/(point2[0] - point1[0]);
    let b = point1[1] - (m * point1[0]);
    //let m2 = (point2[2] - point1[2])/(point2[0] - point1[0]);
    //let b2 = point1[2] - (m2 * point1[0]);

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
    return (point[1] < linecheck);
  }


  //Calculate normal of plane defined by three points
  normal(points) {
    norm = [0, 0, 0];
    norm[0] = (points[1][1] - points[0][1]) * (points[2][2] - points[0][2]) - (points[1][2] - points[0][2]) * (points[2][1] - points[0][1]);
    norm[1] = (points[1][2] - points[0][2]) * (points[2][0] - points[0][0]) - (points[1][0] - points[0][0]) * (points[2][2] - points[0][2]);
    norm[2] = (points[1][0] - points[0][0]) * (points[2][1] - points[0][1]) - (points[1][1] - points[0][1]) * (points[2][0] - points[0][0]);
    return norm;
  }


  //Draws a triangle between three points
  lineTrig(point1, point2, point3, color) {
    this.drawLine(point1, point2, color);
    this.drawLine(point2, point3, color);
    this.drawLine(point3, point1, color);
  }

  //Bubble sort points in array based on y value
  orderYPoints(points) {
    return points.toSorted((a, b) => a[1]-b[1]);
  }

  //Compute gradient to find other values like startX and endX to draw between.
  scanLine(y, pointA, pointB, pointC, pointD, color) {
    //If pa.Y == pb.Y or pc.Y == pd.Y gradient is forced to 1
    let gradient1 = pointA[1] != pointB[1] ? (y - pointA[1]) / (pointB[1] - pointA[1]) : 1;
    let gradient2 = pointC[1] != pointD[1] ? (y - pointC[1]) / (pointD[1] - pointC[1]) : 1;

    let startX = this.interp(pointA[0], pointB[0], gradient1) >> 0;
    let endX = this.interp(pointC[0], pointD[0], gradient2) >> 0;

    let z1 = this.interp(pointA[2], pointB[2], gradient1);
    let z2 = this.interp(pointC[2], pointD[2], gradient2);

    //Swap start and end for loop to work properly
    if(startX > endX) {
      let temp = startX;
      startX = endX;
      endX = temp;
    }

    //Drawing line from startX to endX
    for(let x = startX; x < endX; x++) {
      let gradient = (x - startX) / (endX - startX);
      let z = this.interp(z1, z2, gradient);
      this.zpixel(x, y, z, color);
    }
  }

  //Draw a triangle using alternate method
  drawTrig(points, color) {
    if(color == "red") {
      color = red;
    } else if(color == "green") {
      color = green;
    } else if(color == "blue") {
      color = blue;
    } else {
      color = white;
    }
    points = this.orderYPoints(points);
    let point1 = points[0];
    let point2 = points[1];
    let point3 = points[2];
    //Inverse slopes
    let invSlope1; //dP1P2
    let invSlope2; //dP1P3

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
      for(let y = point1[1] >> 0; y <= point3[1] >> 0; y++) {
        if(y < point2[1]) {
          this.scanLine(y, point1, point3, point1, point2, color);
        } else {
          this.scanLine(y, point1, point3, point2, point3, color);
        }
      }
    } else {
      //First case where p2 is to the left of point1 and point3
      for(let y = point1[1] >> 0; y <= point3[1] >> 0; y++) {
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
    if(!(this.pointAbove([points[0], points[1]], points[2]) == this.pointAbove([points[0], points[1]], points[3]))) {
      //Diagonal 0, 1
      this.drawTrig([points[0], points[1], points[2]], color);
      this.drawTrig([points[0], points[1], points[3]], color);
    } else if(!(this.pointAbove([points[0], points[2]], points[1]) == this.pointAbove([points[0], points[2]], points[3]))) {
      //Diagonal 0, 2
      this.drawTrig([points[0], points[2], points[1]], color);
      this.drawTrig([points[0], points[2], points[3]], color);
    } else if(!(this.pointAbove([points[0], points[3]], points[1]) == this.pointAbove([points[0], points[3]], points[2]))) {
      //Diagonal 0, 3
      this.drawTrig([points[0], points[3], points[1]], color);
      this.drawTrig([points[0], points[3], points[2]], color);
    }
  }


  //Project points from 3d area onto 2d plane to display them
  projectPoints(points) {
    let proj_points = [];
    for(let i = 0; i < points.length; i++) {
      proj_points[i] = [this.screenDist * (points[i][0]/(-1 * points[i][2])), this.screenDist * (points[i][1]/(1 * points[i][2]))];
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
  rotPoints(points, center, rot) {
    let rotx = rot[0];
    let roty = rot[1];
    let rotz = rot[2];
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
  //End of class
}


//Export all functions
export { Screen, Object, Misc };