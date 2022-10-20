class Screen {
  //Colors
  black = [  0,   0,   0];
  red   = [255,   0,   0];
  green = [  0, 255,   0];
  blue  = [  0,   0, 255];
  white = [255, 255, 255];

  //Function I stole off the internet to make 2d arrays of a given size
  makeArray(w, h, val) {
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
  screenFill(array, color) {
    for(let x = 0; x < array.length - 1; x++) {
      for(let y = 0; y < array[x].length - 1; y++) {
        array[x][y] = color;
      }
    }
  }

  pixel(array, x, y, value) {
    if(x >= 0 && y >= 0 && x < array.length && y < array[0].length) {
      array[x][y] = value;
    }
  }

  //function zpixel(array, x, y, value, zbuf)

  //Draws line from one point to another
  drawLine(array, point1, point2, color) {
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
        this.pixel(array, xfin, yfin, color);
        //array[xfin][yfin] = color;
      }
    //Case for y being iterated variable
    } else if(m > 1 || m < -1) {
      if(point1[1] > point2[1]) {
        let temp = point1;
        point1 = point2;
        point2 = temp;
      }
      for(let y = point1[1]; y <= point2[1]; y+=1) {
        let x;
        x = (y - b)/m
        let yfin = Math.round(y);
        let xfin = Math.round(x);
        this.pixel(array, xfin, yfin, color);
        //array[xfin][yfin] = color;
      }
    //Case for x being iterated variable
    } else {
      if(point1[0] > point2[0]) {
        let temp = point1;
        point1 = point2;
        point2 = temp;
      }
      for(let x = point1[0]; x <= point2[0]; x+=1) {
        let y;
        y = (m * x) + b
        let yfin = Math.round(y);
        let xfin = Math.round(x);
        this.pixel(array, xfin, yfin, color);
        //array[xfin][yfin] = color;
      }
    }
  }


  //Draws a triangle between three points
  lineTrig(array, point1, point2, point3, color) {
    this.drawLine(array, point1, point2, color);
    this.drawLine(array, point2, point3, color);
    this.drawLine(array, point3, point1, color);
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
  fillBottomTrig(array, point1, point2, point3, color) {
    let newp = this.orderPoints([point1, point2, point3]);
    point1 = newp[0];
    point2 = newp[1];
    point3 = newp[2];

    let invSlope1 = (point2[0] - point1[0])/(point2[1] - point1[1]);
    let invSlope2 = (point3[0] - point1[0])/(point3[1] - point1[1]);

    let curx1 = point1[0];
    let curx2 = point1[0];

    for(let scanY = point1[1]; scanY <= point2[1]; scanY++) {
      this.drawLine(array, [curx1, scanY], [curx2, scanY], color);
      curx1 += invSlope1;
      curx2 += invSlope2;
    }
  }


  //Fill a triangle with a flat top edge
  fillTopTrig(array, point1, point2, point3, color) {
    let newp = this.orderPoints([point1, point2, point3]);
    point1 = newp[0];
    point2 = newp[1];
    point3 = newp[2];

    let invSlope1 = (point3[0] - point1[0])/(point3[1] - point1[1]);
    let invSlope2 = (point3[0] - point2[0])/(point3[1] - point2[1]);

    let curx1 = point3[0];
    let curx2 = point3[0];

    for(let scanY = point3[1]; scanY > point1[1]; scanY--) {
      this.drawLine(array, [curx1, scanY], [curx2, scanY], color);
      curx1 -= invSlope1;
      curx2 -= invSlope2;
    }
  }


  //Fill any triangle
  fillTrig(array, point1, point2, point3, color) {
    let temppoints = this.orderPoints([point1, point2, point3]);
    point1 = temppoints[0];
    point2 = temppoints[1];
    point3 = temppoints[2];

    if(point2[1] == point3[1]) {
      this.fillBottomTrig(array, point1, point2, point3, color);
    }else if(point1[1] == point2[1]) {
      this.fillTopTrig(array, point1, point2, point3, color);
    } else {
      let m = (point3[1] - point1[1])/(point3[0] - point1[0]);
      let b = point1[1] - m * point1[0];
      let point4 = [(point2[1] - b)/m, point2[1]];
      this.fillBottomTrig(array, point1, point2, point4, color);
      this.fillTopTrig(array, point2, point4, point3, color);
    }
  }


  //Complete triangle drawing function
  makeTrig(array, point1, point2, point3, color1, color2) {
    if(color1 != "none") {
      this.lineTrig(array, point1, point2, point3, color1);
    }
    if(color2 != "none") {
      this.fillTrig(array, point1, point2, point3, color2);
    }
  }


  //Fill quads by splitting into two triangles
  fillQuad(array, points, color) {
    points = this.orderPoints(points);
    this.fillTrig(array, points[0], points[1], points[2], color);
    this.fillTrig(array, points[1], points[2], points[3], color);
  }


  //Project points from 3d area onto 2d plane to display them
  projectPoints(points, width, height) {
    let proj_points = [];
    for(let i = 0; i < points.length; i++) {
      proj_points[i] = [(points[i][0]/(-1 * points[i][2])), (points[i][1]/(1 * points[i][2]))];
      proj_points[i][0] = width * (1 + proj_points[i][0])/2;
      proj_points[i][1] = height * (1 + proj_points[i][1])/2;
      proj_points[i][2] = points[i][2];
    }
    return proj_points;
  }


  //Draws cube given projected coordinates
  drawProjectedCube(array, points, color) {
    //Bottom face's edges
    this.this.drawLine(array, points[0], points[1], color);
    this.drawLine(array, points[1], points[2], color);
    this.drawLine(array, points[2], points[3], color);
    this.drawLine(array, points[3], points[0], color);
    //Side edges
    this.drawLine(array, points[0], points[4], color);
    this.drawLine(array, points[1], points[5], color);
    this.drawLine(array, points[2], points[6], color);
    this.drawLine(array, points[3], points[7], color);
    //Top face's edges
    this.drawLine(array, points[4], points[5], color);
    this.drawLine(array, points[5], points[6], color);
    this.drawLine(array, points[6], points[7], color);
    this.drawLine(array, points[7], points[4], color);
  }

  drawColoredCube(array, points) {
    this.fillQuad(array, [points[0], points[1], points[2], points[3]], this.red);
    this.fillQuad(array, [points[4], points[5], points[6], points[7]], this.red);

    this.fillQuad(array, [points[0], points[1], points[4], points[5]], this.blue);
    this.fillQuad(array, [points[3], points[2], points[7], points[6]], this.blue);

    this.fillQuad(array, [points[3], points[0], points[7], points[4]], this.green);
    this.fillQuad(array, [points[1], points[2], points[5], points[6]], this.green);
  }


  //Draws cube given all coordinates
  drawCoordCube(array, points, color) {
    let width = array.length;
    let height = array[0].length;
    let proj_points = this.projectPoints(points, width, height);
    //drawProjectedCube(array, proj_points, color);
    this.drawColoredCube(array, proj_points);
  }


  //Draws cube given center and side length
  drawCube(array, center, side, color) {
    this.drawRotCube(array, center, side, 0, 0, 0, color);
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
  drawRotCube(array, center, side, rotx, roty, rotz, color) {
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

    this.drawCoordCube(array, points, color);

  }
}






//Export all functions
export { Screen };