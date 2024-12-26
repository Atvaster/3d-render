//import functions
import { Screen, Object, Misc} from "./func.js";

window.addEventListener("DOMContentLoaded", async () => {
  const outer = window.frameElement;
  // console.log(outer);
  let curDoc;

  if ( window !== window.parent ) {
    console.log("Load as embedded");
    curDoc = outer.contentDocument;
    curDoc.getElementById("fps").style.display = 'none';
  } else {
    curDoc = document;
  }

  // if(outer != null) {
  //   console.log("Load as embedded");
  //   curDoc = outer.contentDocument;
  //   curDoc.getElementById("fps").style.display = 'none';
  // } else {
  //   curDoc = document;
  // }

  const canvas = curDoc.querySelector("canvas");
  const size = Math.min(curDoc.documentElement.clientWidth, curDoc.documentElement.clientHeight);
  canvas.width = size;
  canvas.height = size;


  let mouseX = 0;
  let mouseY = 0;

  curDoc.onmousemove = function(event) {
    mouseX = event.pageX;
    mouseY = event.pageY
  }

  //Initializing models
  let { cube, sqrPyr } = await import('./models.js');

  //Initializing canvas vars
  const c = curDoc.getElementById("canvas");
  const ctx = c.getContext('2d');
  //Simpler height and width
  const width = c.width;
  const height = c.height;
  //Per-pixel control of canvas
  let imageData = ctx.createImageData(width, height);

  //Screen init object
  const s = new Screen(imageData.data, width, height);
  //Color presets
  const black = [  0,   0,   0];
  const red   = [255,   0,   0];
  const green = [  0, 255,   0];
  const blue  = [  0,   0, 255];
  const white = [255, 255, 255];

  //Configs
  const FRAME_SMOOTHING = 10; //amount of frames over which to average framerate
  const FRAME_UPDATE_RATE = 10; //measured in frames
  const TARGET_FPS = 1000;


  let objects = [];
  let faces = [];

  let testObj = sqrPyr;

  let mouseRot = 360/height;


  //Main run loop
  function main(curTime, preTime) {
    let t = (curTime-preTime);
    // console.log(t + " ms");
    let tIn = (t+1)/10;
    let rot = tIn;
    // let rot = 2/(t+1);
    s.screenFill(black);
    // testObj.setPos([0, 2, -5]);
    let angleSet = (curTime-tinit)/2000;
    // console.log(angleSet)
    testObj.setPos([0, 2*(Math.sin(angleSet)), -4]);
    //testObj.setRot([0, 135, 0]);
    testObj.setRot([-180-mouseY*mouseRot, -mouseX*mouseRot, 0]);
    // testObj.addRot([0, rot, 0]);
    testObj.addObject(faces);
    for(let i = 0; i < faces.length; i++) {
      faces[i].drawFace(s);
    }
    //testObj.printData();

    s.zClear();
    faces = [];
  }



  //Push func init
  let drawFrame = 1;
  let tinit = performance.now();
  let tprev = performance.now();
  let frametimes = Misc.makeArray(1, FRAME_SMOOTHING, 0); //Collect previous frametiems to average fps and smooth it out
  const TARGET_FRAME_TIME = 1000/TARGET_FPS;
  //Function to push frames to screen
  function push() {
    //Run main logic function and see the time it takes to run it
    let tnow = performance.now();
    main(tnow, tprev);
    tprev = performance.now();

    //Waits until screen is ready to be refreshed
    window.requestAnimationFrame(push);
    //Puts 1d array onto canvas
    ctx.putImageData(imageData, 0, 0);
    let tcheck = performance.now();
    if((tcheck - tnow) < TARGET_FRAME_TIME) {
      Misc.sleep(TARGET_FRAME_TIME - (tcheck - tnow));
    }

    let tafter = performance.now();

    //Determine calc fps and update it on screen every 5 draw frames
    let timediff = tafter-tnow;
    frametimes[drawFrame%(frametimes.length)] = timediff;
    let fps = Math.round((1000*frametimes.length)/Misc.sum(frametimes));
    if(drawFrame%FRAME_UPDATE_RATE == 0) {
      curDoc.getElementById("fps").innerHTML = "FPS: " + fps;
    }

    //console.log("frame" + drawFrame);
    drawFrame += 1;
  }
  //Init
  push();
});
