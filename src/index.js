// mandel.js

  "use strict";

  math.config({
    number: 'bignumber',  // Default type of number: 'number' (default) or 'bignumber'
    precision: 64         // Number of significant digits for BigNumbers
  });
    // configuring math.js for bignumbers

  var mandel = {

    DEFAULT_DEPTH : 20,   
    actualDepth : 0,
      // when we calculte a point, the actualDepth is
      // continually incremented

    calculationReady : true,
      // when we are not in between calculation
 
    actualDepthArray : [],
      // an arry for saving the values of actualDepth, when
      // we finished the calculation of a point
      // so as we will able to change fast the color scheme
    row : 0,
      // the actual row of the calculation
      // this needs because we draw lines

    enlargement : false,
      // a flag that signs if there is an enlargement
  };


  mandel.init = function(){
    calcWorker.setupWorker("src/mandel_worker.js", mandel.processCalculatorData);
      // located in calculator-worker.js
    mandelUI.initSliders();
    mandel.setEvents();
    mandel.setDefaultValues();
  };

  mandel.setEvents = function(){
    mandelUI.setUIEvents();
    canvas.setCanvasEvents();        
  }

  mandel.restart = function(){
    mandel.setDefaultValues();
    mandel.drawer();
  }

  mandel.processCalculatorData = function(e) {
    mandel.actualDepthArray = e.data;
      // the worker sent back the array of depths, that
      // we need to put it to the canvas
    canvas.copyArrayToCanvas(mandel.actualDepthArray, canvas.imgData);
    canvas.ctx.putImageData(canvas.imgData, 0, mandel.row);
    mandel.row += 1;
    if (mandel.row > canvas.canvasSize) {
      mandel.calculationReady = true;
        // the canvas is full, we have to stop drawing the lines
    }
    else {
      // step next line
      if (!bigManager.bigNumberMode) {
        complexPlane.bComplexIterated -= complexPlane.step;
      }
      else {
        complexPlane.bComplexIterated = math.subtract(complexPlane.bComplexIterated, complexPlane.step);
      }
      calcWorker.sendMessageToWorker();
        // this will an event, when the worker finishes the calculatons
        // and sends back the result;
        // and the circle starts againg
    }
  }

  mandel.setDefaultValues = function(){
    complexPlane.range = 5;
      // if you only want to test bignumber,
      // add this value to complexPlane.range: 3.377631507817114e-11;
    complexPlane.aStartInActualRange = -2.5;
      // if you only want to test bignumber,
      // add this value to complexPlane.aStartInActualRange: -1.2555621711060319;
    complexPlane.bStartInActualRange = 2.5;
      // if you only want to test bignumber,
      // add this value to complexPlane.bStartInActualRange: -0.40098714274827146;
    bigManager.bigNumberMode = false;
    mandelUI.setTip("tip_bignumber", "none");
    complexPlane.aComplexIterated = complexPlane.aStartInActualRange;
    complexPlane.bComplexIterated = complexPlane.bStartInActualRange;
    mandelUI.setInputCanvasSize(canvas.DEFAULT_CANVAS_SIZE);
    canvas.setCanvasSize(canvas.DEFAULT_CANVAS_SIZE);
    canvas.setCanvasContext();
    canvas.setImgData();
    complexPlane.setStep();
    mandelUI.setMouseCoordinatesToCanvas();
    colors.setColorScheme();
    mandelUI.setDepthInput(mandel.DEFAULT_DEPTH);
    mandelUI.setMaxDepth();
    mandelUI.setSliderValues();
    backup.clearBackup();
  }

  mandel.drawer = function(controller){ // entry point for the calculation and drawing
    mandelbrotIntro();
    calcWorker.sendMessageToWorker();
    return;

    function mandelbrotIntro(){
      if (!mandel.calculationReady) {
        // if calculation is already active, it must be stopped
        calcWorker.terminateWorker(mandel.processCalculatorData);
          // the worker must be terminate if we want to start an
          // other event cycle while the current event cycle is running
        calcWorker.setupWorker("src/mandel_worker.js", mandel.processCalculatorData);
          // start a new worker and set up event again
      }
      else {
        mandel.calculationReady = false;
      }
        // the show is being started; it is a status flag
        // it will be set true by the worker event handler, when drawing is ready
      canvas.depthArray = [];
        // set/reset the depth array that contains all the depth values of
        // the points of the canvas
      colors.colorSchemeDemoModeOn = false;
      // if demo mode is on, it must be finished
      mandel.row = 0;
        // set/reset the value of the row

      if (controller !== "enlargement") {
        mandel.enlargement = false;
      };
      if (controller !== "from_back"){
        // if calling the drawer is not from backup.back()
        // because in that case there is no need to udating based on UI changes

        backup.updateBackup();
        mandelUI.updateUIChanges();
          // create backup from the state of the set
        complexPlane.setComplexScopeToChanges();
      };
    }
  }

  // ----------- end functions -----------------------------------------------------------


  mandel.init();
  mandel.drawer();




