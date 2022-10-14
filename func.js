//Function I stole off the internet to make 2d arrays of a given size
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

//Fills the whole array with one solid color
function screenFill(array, color) {
  for(let x = 0; x < array.length - 1; x++) {
    for(let y = 0; y < array[x].length - 1; y++) {
      array[x][y] = color;
    }
  }
}

//Draws line from one point to another
function drawLine(array, point1, point2, color) {
  let accuracy = 2;
  var m = (point2[1] - point1[1])/(point2[0] - point1[0]);
  var b = point1[1] - (m * point1[0]);
  
  //Case for vertical line
  if(m == Infinity || m == -Infinity) {
    if(point1[1] > point2[1]) {
      let temp = point1;
      point1 = point2;
      point2 = temp;
    }
    for(let y = point1[1]; y <= point2[1]; y+=1) {
      let yfin = Math.round(y);
      let xfin = Math.round(point1[0]);
      array[xfin][yfin] = color;
    }
  //Case for y being iterated variable
  } else if(m > 1 || m < -1) {
    if(point1[1] > point2[1]) {
      let temp = point1;
      point1 = point2;
      point2 = temp;
    }
    for(let y = point1[1]; y <= point2[1]; y+= (1/accuracy)) {
      let x;
      x = (y - b)/m
      let yfin = Math.round(y);
      let xfin = Math.round(x);
      array[xfin][yfin] = color;
    }
  //Case for x being iterated variable
  } else {
    if(point1[0] > point2[0]) {
      let temp = point1;
      point1 = point2;
      point2 = temp;
    }
    for(let x = point1[0]; x <= point2[0]; x+= (1/accuracy)) {
      let y;
      y = (m * x) + b
      let yfin = Math.round(y);
      let xfin = Math.round(x);
      array[xfin][yfin] = color;
    }
  }
}


//Draws a triangle between three points
function lineTrig(array, point1, point2, point3, color) {
  drawLine(array, point1, point2, color);
  drawLine(array, point2, point3, color);
  drawLine(array, point3, point1, color);
}


//Order three points based on their y value
function orderTrig(point1, point2, point3) {
  if(point1[1] <= point2[1] && point1[1] <= point3[1]) {
    if(point2[1] > point3[1]) {
      let temp = point2;
      point2 = point3;
      point3 = temp;
    }
  } else if(point2[1] <= point3[1]){
    let temp = point2;
    point2 = point1;
    point1 = temp;
    if(point2[1] > point3[1]) {
      let temp2 = point3;
      point3 = point2;
      point2 = temp2;
    }
  }
  return [point1, point2, point3];
}


//Fill a triangle with a flat bottom edge
function fillBottomTrig(array, point1, point2, point3, color) {
  let newp = orderTrig(point1, point2, point3);
  point1 = newp[0];
  point2 = newp[1];
  point3 = newp[2];

  let invSlope1 = (point2[0] - point1[0])/(point2[1] - point1[1]);
  let invSlope2 = (point3[0] - point1[0])/(point3[1] - point1[1]);

  let curx1 = point1[0];
  let curx2 = point1[0];
  
  for(let scanY = point1[1]; scanY <= point2[1]; scanY++) {
    drawLine(array, [curx1, scanY], [curx2, scanY], color);
    curx1 += invSlope1;
    curx2 += invSlope2;
  }
}


//Fill a triangle with a flat top edge
function fillTopTrig(array, point1, point2, point3, color) {
  let newp = orderTrig(point1, point2, point3);
  point1 = newp[0];
  point2 = newp[1];
  point3 = newp[2];

  let invSlope1 = (point3[0] - point1[0])/(point3[1] - point1[1]);
  let invSlope2 = (point3[0] - point2[0])/(point3[1] - point2[1]);

  let curx1 = point3[0];
  let curx2 = point3[0];
  
  for(let scanY = point3[1]; scanY > point1[1]; scanY--) {
    drawLine(array, [curx1, scanY], [curx2, scanY], color);
    curx1 -= invSlope1;
    curx2 -= invSlope2;
  }
}


//Fill any triangle
function fillTrig(array, point1, point2, point3, color) {
  let temppoints = orderTrig(point1, point2, point3);
  point1 = temppoints[0];
  point2 = temppoints[1];
  point3 = temppoints[2];

  if(point2[1] == point3[1]) {
    fillBottomTrig(array, point1, point2, point3, color);
  }else if(point1[1] == point2[1]) {
    fillTopTrig(array, point1, point2, point3, color);
  } else {
    let m = (point3[1] - point1[1])/(point3[0] - point1[0]);
    let b = point1[1] - m * point1[0];
    let point4 = [(point2[1] - b)/m, point2[1]];
    fillBottomTrig(array, point1, point2, point4, color);
    fillTopTrig(array, point2, point4, point3, color);
  }
}


//Complete triangle drawing function
function makeTrig(array, point1, point2, point3, color1, color2) {
  if(color1 != "none") {
    lineTrig(array, point1, point2, point3, color1);
  }
  if(color2 != "none") {
    fillTrig(array, point1, point2, point3, color2);
  }
}


//Project points from 3d area onto 2d plane to display them
function projectPoints(points, width, height) {
  let proj_points = [];
  for(let i = 0; i < points.length; i++) {
    proj_points[i] = [(points[i][0]/(-1 * points[i][2])), (points[i][1]/(1 * points[i][2]))];
    proj_points[i][0] = width * (1 + proj_points[i][0])/2;
    proj_points[i][1] = height * (1 + proj_points[i][1])/2;
  }
  return proj_points;
}


//Draws cube given projected coordinates
function drawProjectedCube(array, points, color) {
  //Bottom face's edges
  drawLine(array, points[0], points[1], color);
  drawLine(array, points[1], points[2], color);
  drawLine(array, points[2], points[3], color);
  drawLine(array, points[3], points[0], color);
  //Side edges
  drawLine(array, points[0], points[4], color);
  drawLine(array, points[1], points[5], color);
  drawLine(array, points[2], points[6], color);
  drawLine(array, points[3], points[7], color);
  //Top face's edges
  drawLine(array, points[4], points[5], color);
  drawLine(array, points[5], points[6], color);
  drawLine(array, points[6], points[7], color);
  drawLine(array, points[7], points[4], color);
}


//Draws cube given all coordinates
function drawCoordCube(array, points, color) {
  let width = array.length;
  let height = array[0].length;
  let proj_points = projectPoints(points, width, height);
  drawProjectedCube(array, proj_points, color);
}


//Draws cube given center and side length
function drawCube(array, center, side, color) {
  let points = [];
  
  points[0] = [center[0] - side/2, center[1] - side/2, center[2] + side/2];
  points[1] = [center[0] + side/2, center[1] - side/2, center[2] + side/2];
  points[2] = [center[0] + side/2, center[1] - side/2, center[2] - side/2];
  points[3] = [center[0] - side/2, center[1] - side/2, center[2] - side/2];
  points[4] = [center[0] - side/2, center[1] + side/2, center[2] + side/2];
  points[5] = [center[0] + side/2, center[1] + side/2, center[2] + side/2];
  points[6] = [center[0] + side/2, center[1] + side/2, center[2] - side/2];
  points[7] = [center[0] - side/2, center[1] + side/2, center[2] - side/2];

  drawCoordCube(array, points, color);
}


//Draw cube function with added rotational parameters
function drawRotCube(array, center, side, rotx, roty, rotz, color) {
  let points = [];
  
  points[0] = [center[0] - side/2, center[1] - side/2, center[2] + side/2];
  points[1] = [center[0] + side/2, center[1] - side/2, center[2] + side/2];
  points[2] = [center[0] + side/2, center[1] - side/2, center[2] - side/2];
  points[3] = [center[0] - side/2, center[1] - side/2, center[2] - side/2];
  points[4] = [center[0] - side/2, center[1] + side/2, center[2] + side/2];
  points[5] = [center[0] + side/2, center[1] + side/2, center[2] + side/2];
  points[6] = [center[0] + side/2, center[1] + side/2, center[2] - side/2];
  points[7] = [center[0] - side/2, center[1] + side/2, center[2] - side/2];

  //Rot x
  for(let j = 0; j < 8; j++) {
    let dist = Math.sqrt((points[j][1] - center[1])**2 + (points[j][2] - center[2])**2);
    let ang = Math.atan2(((points[j][2] - center[2])), ((points[j][1] - center[1])))* 180/Math.PI;
    points[j][1] = center[1] + (dist * (Math.cos((roty + ang) * Math.PI/180)));
    points[j][2] = center[2] + (dist * (Math.sin((roty + ang) * Math.PI/180)));
  }

  //Rot y
  for(let j = 0; j < 8; j++) {
    let dist = Math.sqrt((points[j][0] - center[0])**2 + (points[j][2] - center[2])**2);
    let ang = Math.atan2(((points[j][2] - center[2])), ((points[j][0] - center[0])))* 180/Math.PI;
    points[j][0] = center[0] + (dist * (Math.cos((roty + ang) * Math.PI/180)));
    points[j][2] = center[2] + (dist * (Math.sin((roty + ang) * Math.PI/180)));
  }

  //Rot z
  for(let i = 0; i < 8; i++) {
    let dist = Math.sqrt((points[i][0] - center[0])**2 + (points[i][1] - center[1])**2);
    let ang = Math.atan2(((points[i][1] - center[1])), ((points[i][0] - center[0])))*180/Math.PI;
    points[i][0] = center[0] + (dist * (Math.cos((rotz + ang) * Math.PI/180)));
    points[i][1] = center[1] + (dist * (Math.sin((rotz + ang) * Math.PI/180)));
  }
  drawCoordCube(array, points, color);
}


//Export all functions
export{ makeArray, screenFill, drawLine, lineTrig, fillTrig, makeTrig, projectPoints, drawCube, drawRotCube }