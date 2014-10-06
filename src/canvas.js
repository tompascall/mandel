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
  depthArray : [],
    // an array that contains the depths of all the point in the canvas
    // for setting the color schemes immediately, and
    // may be later for saving the datas to files
  leftClick : false,
    // it will be false if in is not clicked with left mouse button
};


canvas.setCanvasEvents = function(){
  $("#mandelCanvas").mousedown(function(e){
    // this function gets the coordinates of
    // mouse pointer over the canvas
    // when you push down the left mouse button
    if (e.which === 1){
      mandelUI.mouseDownX = e.pageX - this.offsetLeft;
      mandelUI.mouseDownY = e.pageY - this.offsetTop;
      canvas.leftClick = true;
        // this is a flag, that the left button pushed
    }
  });

  $('#mandelCanvas').mouseup(function(e){
    // this function gets the coordinates of
    // mouse pointer over the canvas
    // when you release the left mouse button
    if (canvas.leftClick) {
      mandelUI.mouseUpX = e.pageX - this.offsetLeft;
      mandelUI.mouseUpY = e.pageY - this.offsetTop;
      if (mandelUI.mouseUpX !== mandelUI.mouseDownX || mandelUI.mouseUpY !== mandelUI.mouseDownY){
        // if you didn't click in the same point
        if (!colors.colorSchemeDemoModeOn) {
          if (mandelUI.tipMouseDisplay){
            mandelUI.setTip("tip_mouse", "none");
            mandelUI.tipMouseDisplay = false;
              // let's take the mouse-tip away
            mandelUI.setTip("tip_iteration", "block");
            mandelUI.tipIterationDisplay = true;
              // let's show the next tip about the iteration
          }
          calculator.enlargement = true;
          mandel.drawer("enlargement");
        }
      }
      else {
        console.log("you clicked down and up in the same point");
        // this can be a possible breakpoint
        // it executes when you click down and up in the same point
      }
      canvas.leftClick = false;
    }
  });

  canvas.c.addEventListener("touchstart", (function(e) {
      // this function is for mobile devices to handle the touch event
    mandelUI.mouseDownX = e.changedTouches[0].pageX - this.offsetLeft;
    mandelUI.mouseDownY = e.changedTouches[0].pageY  - this.offsetTop;
    e.preventDefault();
  }), false);

  canvas.c.addEventListener("touchend", (function(e) {
      // this function is for mobile devices to handle the touch event
    mandelUI.mouseUpX = e.changedTouches[0].pageX - this.offsetLeft;
    mandelUI.mouseUpY = e.changedTouches[0].pageY  - this.offsetTop;
    e.preventDefault();
    if (Math.abs(mandelUI.mouseDownX - mandelUI.mouseUpX) > 40) {
        // if you only want to swipe, then there need no enlargement
        // we suppose that you want to swipe if the difference between
        // the down and up X coord. <= 40px
      if (mandelUI.mouseUpX !== mandelUI.mouseDownX){
        if (mandelUI.tipMouseDisplay){
          mandelUI.setTip("tip_mouse", "none");
          mandelUI.tipMouseDisplay = false;
          mandelUI.setTip("tip_iteration", "block");
          mandelUI.tipIterationDisplay = true;
            // let's show the next tip about the iteration
        }
        calculator.enlargement = true;
        mandel.drawer("enlargement");
      }
    }
  }), false);
    // source: http://www.javascriptkit.com/javatutors/touchevents.shtml
}

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
      imgData.data[lineX * 4 + 0] = colors.colorArrays.arrays[depth][0];
      imgData.data[lineX * 4 + 1] = colors.colorArrays.arrays[depth][1];
      imgData.data[lineX * 4 + 2] = colors.colorArrays.arrays[depth][2];
      imgData.data[lineX * 4 + 3] = 255;

      if (!calculator.calculationReady) {
        canvas.depthArray.push(depth);
        // saving the depth data of the point
        // for later color manipulation
      }
    }
  }
