// mandel.js

  "use strict";

  math.config({
    number: 'bignumber',  // Default type of number: 'number' (default) or 'bignumber'
    precision: 64         // Number of significant digits for BigNumbers
  });
    // configuring math.js for bignumbers

  var mandel = {

    DEFAULT_DEPTH : 20,
    maxDepth : 0,
      // the max. iteration number
      // it can be set in the UI
      // mandel.maxDepth devides the color-scale of the color scheme into equal parts
      // if mandel.maxDepth is 1, we have 2 parts, if 2, we have 3 parts etc.
    actualDepth : 0,
      // when we calculte a point, the actualDepth is
      // continually incremented
    depthArray : [],
      // an array that contains the depths of all the point in the canvas
      // for setting the color schemes immediately, and
      // may be later for saving the datas to files

    range : 0,
      // range is the width (and heigth) of the complex area
      // the actual range is based on the enlargement
      // at the beginning, it is equal to 4
    step : 0,
      // the X (and Y) step in the complex plane
      // it must be recalculate if range is changed
    mouseDownX : 0,
    mouseDownY : 0,
    mouseUpX : 0,
    mouseUpY : 0,
      // the mouse coordinates when you enlarge an area of the set
      // we use them for enlargement, calculate the new range, step etc.
    leftClick : false,
      // it will be false if in is not clicked with left mouse button
    calculationReady : true,
      // when we are not in between calculation

    aStartInActualRange : 0,
    bStartInActualRange : 0,
    aComplexIterated : 0,
    bComplexIterated : 0,
      // we need the upper-left point of the complex area
      // (aStartInActualRange and bStartInActualRange),
      // at the beginning, it is equal to (-2 + 2i)
      // aStartInActualRange and bStartInActualRange need for enlargement,
      // aComplexIterated and bComplexIterated are the actual point we counting
      // (a is the complex part,
      // b is the imaginary part of the complex number
      // see more: http://en.wikipedia.org/wiki/Complex_number)
 
    actualDepthArray : [],
      // an arry for saving the values of actualDepth, when
      // we finished the calculation of a point
      // so as we will able to change fast the color scheme
    row : 0,
      // the actual row of the canvas
      // this needs because we draw lines
    hue : 0,
    saturation: 1,

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
    this.setDefaultValues();
    this.drawer();
  }

  mandel.back = function(){
    var state;
    if (backup.states.length > 1) {
      // if it is not the first state
      state = backup.states.pop();
      backup.restoreState(state);
      bigManager.handleBignumberWarning();
      colors.setColorArrays();
      mandelUI.setDepthInput(this.maxDepth);
      mandelUI.setInputCanvasSize(canvas.canvasSize);
      canvas.setCanvasSize(canvas.canvasSize);
      canvas.setImgData();
      this.setMouseCoordinatesToCanvas();
      this.drawer("from_back");
    }
  }

  mandel.setStep = function(){
    if (!bigManager.bigNumberMode) {
      this.step = this.range / canvas.canvasSize;
    }
    else {
      this.step = math.divide(this.range, canvas.canvasSize);
    }
  }

  mandel.setMouseCoordinatesToCanvas = function(){
    this.mouseDownX = this.mouseDownY = 0;
    this.mouseUpX = this.mouseUpY = canvas.canvasSize;
      // the default is that mouse coordinates parallel to canvas size
      // they are modified when enlargement happens
      // after enlargement they must be reset
  }

  mandel.setMaxDepth = function(){
    var d = mandelUI.getDepthInput();
    this.maxDepth = d ? d : this.DEFAULT_DEPTH;
      // if depthInput cannot be interpreted, then comes the default value
    if (d !== this.DEFAULT_DEPTH && mandelUI.tipIterationDisplay) {
      mandelUI.setTip("tip_iteration", "none");
      mandelUI.tipIterationDisplay = false;
        // if the value of the iteration has already been set,
        // there is no need for the tip about the iteration
    }
  }


  mandel.sendMessageToWorker = function(){
    // we need to send some data to the worker
    // in order that it can calculate the actual line
    // the problem is that if we are in bigNumberMode
    // we need to transform the bignumber types to a function-less object
    // that can be re-form to bignumbers in the web worker
    var aComplexIterated;
    var bComplexIterated;
    var step;

    if (!bigManager.bigNumberMode){
      aComplexIterated = this.aComplexIterated;
      bComplexIterated = this.bComplexIterated;
      step = this.step;
    }
    else {
      aComplexIterated = bigManager.bigNumberToBigObject(this.aComplexIterated);
      bComplexIterated = bigManager.bigNumberToBigObject(this.bComplexIterated);
      step = bigManager.bigNumberToBigObject(this.step);
    }
    var message = { aComplexIterated : aComplexIterated,
                    bComplexIterated : bComplexIterated,
                    canvasSize : canvas.canvasSize,
                    bigNumberMode : bigManager.bigNumberMode,
                    step : step,
                    maxDepth : this.maxDepth
                  };
    var jsonMessage = JSON.stringify(message);

    calcWorker.sendMessage(jsonMessage);
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
        mandel.bComplexIterated -= mandel.step;
      }
      else {
        mandel.bComplexIterated = math.subtract(mandel.bComplexIterated, mandel.step);
      }
      mandel.sendMessageToWorker();
        // this will an event, when the worker finishes the calculatons
        // and sends back the result;
        // and the circle starts againg
    }
  }

  mandel.setDefaultValues = function(){
    this.range = 5;
      // if you only want to test bignumber,
      // add this value to this.range: 3.377631507817114e-11;
    this.aStartInActualRange = -2.5;
      // if you only want to test bignumber,
      // add this value to this.aStartInActualRange: -1.2555621711060319;
    this.bStartInActualRange = 2.5;
      // if you only want to test bignumber,
      // add this value to this.bStartInActualRange: -0.40098714274827146;
    bigManager.bigNumberMode = false;
    mandelUI.setTip("tip_bignumber", "none");
    this.aComplexIterated = this.aStartInActualRange;
    this.bComplexIterated = this.bStartInActualRange;
    mandelUI.setInputCanvasSize(canvas.DEFAULT_CANVAS_SIZE);
    canvas.setCanvasSize(canvas.DEFAULT_CANVAS_SIZE);
    canvas.setCanvasContext();
    canvas.setImgData();
    this.setStep();
    this.setMouseCoordinatesToCanvas();
    colors.setColorScheme();
    mandelUI.setDepthInput(this.DEFAULT_DEPTH);
    this.setMaxDepth();
    mandelUI.setSliderValues();
    backup.clearBackup();
  }

  mandel.drawer = function(controller){ // entry point for the calculation and drawing
    mandelbrotIntro();
    mandel.sendMessageToWorker();
    return;

    function mandelbrotIntro(){
      if (!mandel.calculationReady) {
        // if calculation is already active, it must be stopped
        worker.terminateWorker(mandel, mandel.processCalculatorData);
          // the worker must be terminate if we want to start an
          // other event cycle while the current event cycle is running
        worker.setupWorker(mandel, "src/mandel_worker.js", mandel.processCalculatorData);
          // start a new worker and set up event again
      }
      else {
        mandel.calculationReady = false;
      }
        // the show is being started; it is a status flag
        // it will be set true by the worker event handler, when drawing is ready
      mandel.depthArray = [];
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
        // if calling the drawer is not from mandel.back()
        // because in that case there is no need to udating based on UI changes

        backup.updateBackup();
        mandelUI.updateUIChanges();
          // create backup from the state of the set
        mandel.setComplexScopeToChanges();
      };
    }
  }

  mandel.setComplexScopeToChanges = function(){
    var complexScope = {};

    if (!bigManager.bigNumberMode) {
      complexScope.aLeftUpper = mandel.aStartInActualRange + mandel.mouseDownX * mandel.step;
      complexScope.bLeftUpper = mandel.bStartInActualRange - mandel.mouseDownY * mandel.step;
      complexScope.aRightBottom = mandel.aStartInActualRange + mandel.mouseUpX * mandel.step;
      complexScope.bRightBottom = mandel.bStartInActualRange - mandel.mouseUpY * mandel.step;

      handleReversedCoordinates();

      mandel.range = complexScope.aRightBottom - complexScope.aLeftUpper; // new range

      bigManager.switchToBignumberModeIfNeed();
    };

    if (bigManager.bigNumberMode) {
      // it is not in a simple else, because switchToBignumberModeIfNeed()
      // may switch bignumber mode on
      complexScope.aLeftUpper = math.add(mandel.aStartInActualRange, math.multiply(mandel.mouseDownX, mandel.step));
      complexScope.bLeftUpper = math.subtract(mandel.bStartInActualRange, math.multiply(mandel.mouseDownY, mandel.step));
      complexScope.aRightBottom = math.add(mandel.aStartInActualRange, math.multiply(mandel.mouseUpX, mandel.step));
      complexScope.bRightBottom = math.subtract(mandel.bStartInActualRange, math.multiply(mandel.mouseUpY, mandel.step));

      handleReversedCoordinates()

      mandel.range = math.subtract(complexScope.aRightBottom, complexScope.aLeftUpper); // new range
    }

    mandel.aStartInActualRange = complexScope.aLeftUpper;
    mandel.bStartInActualRange = complexScope.bLeftUpper;
    mandel.aComplexIterated = mandel.aStartInActualRange;
    mandel.bComplexIterated = mandel.bStartInActualRange;

    mandel.setStep(); // new step based on the enlargement

    mandel.setMouseCoordinatesToCanvas();
    // the original values must be reset

    function handleReversedCoordinates(){
      if (complexScope.aLeftUpper > complexScope.aRightBottom) {
      complexScope.changer = complexScope.aLeftUpper;
      complexScope.aLeftUpper = complexScope.aRightBottom;
      complexScope.aRightBottom = complexScope.changer;
        // if you create the new area from right to left
      }
      if (complexScope.bLeftUpper < complexScope.bRightBottom) {
        complexScope.changer = complexScope.bLeftUpper;
        complexScope.bLeftUpper = complexScope.bRightBottom;
        complexScope.bRightBottom = complexScope.changer;
        // if you create the new area from right to left
      }
    }  
  }

  // ----------- end functions -----------------------------------------------------------


  mandel.init();
  mandel.drawer();




