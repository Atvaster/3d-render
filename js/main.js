//import functions
import { Screen, makeArray, loadFile, splitByLine } from "./func.js";

window.addEventListener("DOMContentLoaded", ()=>{
  const canvas = document.querySelector("canvas")
  const size = Math.min(document.documentElement.clientWidth, document.documentElement.clientHeight)
  canvas.width = size
  canvas.height = size
});

window.addEventListener("load", async () => {
  const {cube} = await import('./load.js');

  //Initializing canvas vars
  const c = document.getElementById("canvas");
  const ctx = c.getContext('2d');
  //Simpler height and width
  const width = c.width;
  const height = c.height;
  let vic = new Victor(41, 1337);
  //Per-pixel control of canvas
  let imageData = ctx.createImageData(width, height);

  //2d array that I will write to.
  let pixels = makeArray(height, width, 0); //width and height swapped for [x][y] to be the syntax

  //Screen init object
  const s = new Screen(pixels);
  //Color presets
  const black = [  0,   0,   0];
  const red   = [255,   0,   0];
  const green = [  0, 255,   0];
  const blue  = [  0,   0, 255];
  const white = [255, 255, 255];

  //Function for all logic
  function main(curTime) {
    let rot = curTime * 30/1000
    s.screenFill(black);

    s.drawRotCube([0, 0, -5], 1, rot%360, rot%360, rot%360, white);

    calcFrame += 1;
    s.zClear();
  }

  //Frame init
  let drawFrame = 1;
  let calcFrame = 1;

  //Function to push frames to screen
  function push() {
    //C:\Users\1653371\Personal\Code\JS\3d render\Resources\Meshes\Cube\cube.obj

    //Calc ms from start of main loop to now
    let time = window.performance.now() - startTime;

    //Run main logic function and see the time it takes to run it
    let t0 = window.performance.now();
    main(time);
    let t1 = window.performance.now();

    //Convert 2d array to 1d array
    s.convertData(imageData);
    //s.convertzbuff(imageData);
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
  let startTime = window.performance.now();
  push(0, startTime);
});

