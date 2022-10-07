//Function I fucking stole off the internet to make 2d arrays of a given size
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
  let accuracy = 100;
  if(point1[0] > point2[0]) {
    var x1 = point2[0];
    var x2 = point1[0];
    var y1 = point2[1];
    var y2 = point1[1];
  } else {
    var x1 = point1[0];
    var x2 = point2[0];
    var y1 = point1[1];
    var y2 = point2[1];
  }
  var m = (y2 - y1)/(x2 - x1);
  if((m > (array[0].length)/10 || m < -1 * (array.length[0])/10) && m != Infinity) {
    var b = y1 - (m * x1);
    if(point1[1] > point2[1]) {
      var x1 = point2[0];
      var x2 = point1[0];
      var y1 = point2[1];
      var y2 = point1[1];
    } else {
      var x1 = point1[0];
      var x2 = point2[0];
      var y1 = point1[1];
      var y2 = point2[1];
    }
    for(let y = y1; y <= y2; y+= (1/accuracy)) {
      let x;
      x = (y - b)/m
      let yfin = Math.round(y);
      let xfin = Math.round(x);
      array[xfin][yfin] = color;
    }
  } else if(m == Infinity) {
    if(point1[1] > point2[1]) {
      var y1 = point2[1];
      var y2 = point1[1];
    } else {
      var y1 = point1[1];
      var y2 = point2[1];
    }
    for(let y = y1; y <= y2; y+=1) {
      array[point1[0]][y] = color;
    }
  } else {
    var b = y1 - (m * x1);
    for(let x = x1; x <= x2; x+= (1/accuracy)) {
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

function makeTrig(array, point1, point2, point3, color1, color2) {
  if(color1 != "none") {
    lineTrig(array, point1, point2, point3, color1);
  }
  if(color2 != "none") {
    fillTrig(array, point1, point2, point3, color2);
  }
}

export{ makeArray, screenFill, drawLine, lineTrig, fillTrig, makeTrig }