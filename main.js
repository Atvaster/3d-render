//import simple functions for drawing on screen
import { makeArray, screenFill, drawLine, lineTrig, fillTrig } from "C:/Users/1653371/Downloads/html projects/3d render/simpleFunc.js";

window.onload = function() {
  //Initializing canvas vars
  var c = document.getElementById("canvas");
  var ctx = c.getContext('2d');
  //Simpler height and width
  var width = c.width;
  var height = c.height;
  //Per-pixel control of canvas
  var imageData = ctx.createImageData(width, height);
  //2d array that I will write to.
  var pixels = makeArray(height, width, 0);
  
  //Colors presets
  var black = [  0,   0,   0];
  var white = [255, 255, 255];
  
  screenFill(pixels, black);
  lineTrig(pixels, [100, 300], [200, 600], [300, 300], white);
  fillTrig(pixels, [100, 300], [200, 600], [300, 300], white);
  

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

  //Main loop of draw
  function main() {
    window.requestAnimationFrame(main);
    convertData();
    ctx.putImageData(imageData, 0, 0);
  }
  main(0);
}

