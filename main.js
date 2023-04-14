//import functions
import { Screen, Object, makeArray } from "./func.js";

window.addEventListener("DOMContentLoaded", ()=>{
  const canvas = document.querySelector("canvas");
  const size = Math.min(document.documentElement.clientWidth, document.documentElement.clientHeight);
  canvas.width = size - 10;
  canvas.height = size - 10;
});

window.addEventListener("load", async () => {
  //
  let { cube } = await import('./models.js');
  //cube.printData();

  //Initializing canvas vars
  const c = document.getElementById("canvas");
  const ctx = c.getContext('2d');
  //Simpler height and width
  const width = c.width;
  const height = c.height;
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


  let objects = [];
  let faces = [];



  //Main run loop
  function main(curTime) {
    let rot = curTime * 30/1000
    s.screenFill(black);
    cube.setPos([0, 0, -5]);
    cube.setRot([rot%360, rot%360, rot%360]);
    //cube.addRot([rot, rot, rot]);
    cube.addObject(faces);
    for(let i = 0; i < faces.length; i++) {
      faces[i].drawFace(s);
    }
    s.zClear();
    faces = [];
  }



  //Frame init
  let drawFrame = 1;
  //Function to push frames to screen
  function push() {
    //Run main logic function and see the time it takes to run it
    let t0 = window.performance.now();
    main(t0);
    let t1 = window.performance.now();

    //Convert 2d array to 1d array
    s.convertData(imageData);
    //Waits until screen is ready to be refreshed
    window.requestAnimationFrame(push);
    //Puts 1d array onto canvas
    ctx.putImageData(imageData, 0, 0);

    //Determine calc fps and update it on screen every 5 draw frames
    if(drawFrame%10 == 0) {
      let timecalc = t1-t0;
      let fps = Math.round(1000/timecalc);
      document.getElementById("fps").innerHTML = "fps: " + fps;
    }

    //console.log("frame" + drawFrame);
    drawFrame += 1;
  }
  //Init
  push();
});

