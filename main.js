//import simple functions for drawing on screen
import { Screen } from "./func.js";

window.onload = function() {
  //Initializing canvas vars
  var c = document.getElementById("canvas");
  var ctx = c.getContext('2d');
  //Simpler height and width
  var width = c.width;
  var height = c.height;
  //Per-pixel control of canvas
  var imageData = ctx.createImageData(width, height);

  //Screen init object
  const myScreen = new Screen();

  //2d array that I will write to.
  var pixels = myScreen.makeArray(height, width, 0);


  //Turn pixel data into 1d array for use in canvas
  function convertData() {
    for(let x = 0; x < pixels.length - 1; x++) {
      for(let y = 0; y < pixels[x].length - 1; y++) {
        let pixelIndex = (y * width + x) * 4;
        imageData.data[pixelIndex] = pixels[x][y][0];
        imageData.data[pixelIndex + 1] = pixels[x][y][1];
        imageData.data[pixelIndex + 2] = pixels[x][y][2];
        imageData.data[pixelIndex + 3] = 255;
      }
    }
  }


  //Color presets
  var black = [  0,   0,   0];
  var red   = [255,   0,   0];
  var green = [  0, 255,   0];
  var blue  = [  0,   0, 255];
  var white = [255, 255, 255];



  //Function for all logic
  function main(curTime) {
    let rot = curTime * 30/1000
    myScreen.screenFill(pixels, black);
    myScreen.drawRotCube(pixels, [0, 0, -5], 1, rot%360, rot%360, rot%360, white);
    //makeTrig(pixels, [100, 100], [200, 200], [500, 50], white, white);

    calcFrame += 1;
  }

  //Frame init
  var drawFrame = 1;
  var calcFrame = 1;

  //Function to push frames to screen
  function push() {
    //Calc mills from start of main loop to now
    let time = window.performance.now() - startTime;

    //Run main logic function and see the time it takes to run it
    let t0 = window.performance.now();
    main(time);
    let t1 = window.performance.now();

    //Convert 2d array to 1d array
    convertData();
    //Waits until screen is ready to be refreshed
    window.requestAnimationFrame(push);
    //Puts 1d array onto canvas
    ctx.putImageData(imageData, 0, 0);

    //Calculate calc fps and update it on screen every 5 draw frames
    if(drawFrame%5 == 0) {
      let timecalc = t1-t0;
      let fps = Math.round(1000/timecalc);
      document.getElementById("fps").innerHTML = "fps: " + fps;
    }
    //Print frame number in console (useful for debugging)
    //console.log("frame:" + frame);
    drawFrame += 1;
  }
  var startTime = window.performance.now();
  push(0, startTime);
}

