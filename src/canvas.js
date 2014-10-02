// canvas.js

"use strict";

var canvas = {
  c : document.getElementById("mandelCanvas"),
    // the canvas element
  DEFAULT_CANVAS_SIZE : 350,
    // the canvas is a square
  canvasSize : 0,
    // actual canvas size
  ctx : null,
    // canvas context
  imgData : null,
    // canvas image data object, it will contain a line of the set
};

canvas.setCanvasSize = function(x){
    // sets the canvas size based on the parameter, or
    // if parameter is not given, based on the UI changes
    var size;
    if (typeof x !== 'undefined'){
      canvas.canvasSize = canvas.c.width = canvas.c.height = x;
    }
    else {
      size = mandelUI.getInputCanvasSize();
      if (size !== canvas.canvasSize) {
        // Canvas size has been changed
        canvas.canvasSize = canvas.c.width = canvas.c.height = size;
      }
    }
  }

canvas.setCanvasContext = function(){
  canvas.ctx = canvas.c.getContext("2d");
}

canvas.setImgData = function(){
  canvas.imgData = canvas.ctx.createImageData(canvas.canvasSize, 1);
    // a simple line
}

canvas.copyArrayToCanvas = function(array, imgData){
    var depth;
    var length = array.length;
    for (var lineX = 0; lineX < length; lineX++) {
      depth = array[lineX];
      imgData.data[lineX * 4 + 0] = mandel.colorArrays.arrays[depth][0];
      imgData.data[lineX * 4 + 1] = mandel.colorArrays.arrays[depth][1];
      imgData.data[lineX * 4 + 2] = mandel.colorArrays.arrays[depth][2];
      imgData.data[lineX * 4 + 3] = 255;

      if (!mandel.calculationReady) {
        mandel.depthArray.push(depth);
        // saving the depth data of the point
        // for later color manipulation
      }
    }
  }
