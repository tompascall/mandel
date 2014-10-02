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

    colorScheme : 0,
      // the index of the colorscheme
    colorArrays : null,
      // the colorscheme based on the colorscheme index

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
    colorSchemeDemoModeOn : false,
      // it will be true, while we are in colorScheme Demo
    demoSchemeIsRunning : false,
      // it is true while demoScheme() is running
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
    tipMouseDisplay : true,
      // when document loads, there is a tip about the enlargement,
      // but after the first enlargement, there is no need for
      // this tip any more, so this is an indicator
      // if the enlargement has already happended
    tipIterationDisplay: false,
      // it is also a tip flag for the iteration tip
    bigNumberMode : false,
      // this is a flag if we are in bigNumber mode
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



  mandel.back = function(){
    var state;
    if (backup.states.length > 1) {
      // if it is not the first state
      state = backup.states.pop();
      backup.restoreState(state);
      bigManager.handleBignumberWarning();
      this.setColorArrays();
      mandelUI.setDepthInput(this.maxDepth);
      mandelUI.setInputCanvasSize(canvas.canvasSize);
      canvas.setCanvasSize(canvas.canvasSize);
      canvas.setImgData();
      this.setMouseCoordinatesToCanvas();
      this.drawer("from_back");
    }
  }


  mandel.setStep = function(){
    if (!this.bigNumberMode) {
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

  mandel.setColorScheme = function(){
    this.colorScheme = this.getRadioValue("schemes");
  }

  mandel.setColorArrays = function(){
    this.colorArrays = colors.createColorArrays(this.maxDepth, this.colorScheme, this.hue, this.saturation);
      // the createColorArrays function is in colorarrays.js
  }


  mandel.setMaxDepth = function(){
    var d = mandelUI.getDepthInput();
    this.maxDepth = d ? d : this.DEFAULT_DEPTH;
      // if depthInput cannot be interpreted, then comes the default value
    if (d !== this.DEFAULT_DEPTH && this.tipIterationDisplay) {
      this.setTip("tip_iteration", "none");
      this.tipIterationDisplay = false;
        // if the value of the iteration has already been set,
        // there is no need for the tip about the iteration
    }
  }

  mandel.setTip = function(tipID, display){
      document.getElementById(tipID).style.display = display;
        // display on and off and element by ID
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

    if (!mandel.bigNumberMode){
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
                    bigNumberMode : mandel.bigNumberMode,
                    step : step,
                    maxDepth : this.maxDepth
                  };
    var jsonMessage = JSON.stringify(message);

    worker.sendMessage(mandel, jsonMessage);
  }


  mandel.initSliders = function(){
    $( "#hue" ).slider({ min: 0, max: 360, step: 1});

    $( "#saturation" ).slider({ min: 0, max: 100, step: 1 });
  }

  mandel.setEvents = function(){

    $(document).keypress(function(e) {
      if(e.which == 13) {
        mandel.drawer("enter");
      }
    });

    $( "#hue" ).on( "slide", function( event, ui ) {
      var savedImgData = canvas.ctx.createImageData(canvas.canvasSize, canvas.canvasSize);
      mandel.hue = ui.value;
      if (mandel.calculationReady) {
        // if drawing the set is finished
        mandel.setColorScheme();
        mandel.setColorArrays();
          // actualize the color scheme
        //if (!mandel.colorSchemeDemoModeOn) {
          canvas.copyArrayToCanvas(mandel.depthArray, savedImgData);
            canvas.ctx.putImageData(savedImgData, 0, 0);
            // actualize the canvas based on the new scheme
        //}
      }
    } );

    $( "#saturation" ).on( "slide", function( event, ui ) {
      var savedImgData = canvas.ctx.createImageData(canvas.canvasSize, canvas.canvasSize);
      mandel.saturation = ui.value / 100;
      if (mandel.calculationReady) {
        // if drawing the set is finished
        mandel.setColorScheme();
        mandel.setColorArrays();
          // actualize the color scheme
        //if (!mandel.colorSchemeDemoModeOn) {
          canvas.copyArrayToCanvas(mandel.depthArray, savedImgData);
            canvas.ctx.putImageData(savedImgData, 0, 0);
            // actualize the canvas based on the new scheme
        //}
      }
    } );


    $("#mandelCanvas").mousedown(function(e){
      // this function gets the coordinates of
      // mouse pointer over the canvas
      // when you push down the left mouse button
      if (e.which === 1){
        mandel.mouseDownX = e.pageX - this.offsetLeft;
        mandel.mouseDownY = e.pageY - this.offsetTop;
        mandel.leftClick = true;
          // this is a flag, that the left button pushed
      }
    });

    $('#mandelCanvas').mouseup(function(e){
      // this function gets the coordinates of
      // mouse pointer over the canvas
      // when you release the left mouse button
      if (mandel.leftClick) {
        mandel.mouseUpX = e.pageX - this.offsetLeft;
        mandel.mouseUpY = e.pageY - this.offsetTop;
        if (mandel.mouseUpX !== mandel.mouseDownX || mandel.mouseUpY !== mandel.mouseDownY){
          // if you didn't click in the same point
          if (!mandel.colorSchemeDemoModeOn) {
            if (mandel.tipMouseDisplay){
              mandel.setTip("tip_mouse", "none");
              mandel.tipMouseDisplay = false;
                // let's take the mouse-tip away
              mandel.setTip("tip_iteration", "block");
              mandel.tipIterationDisplay = true;
                // let's show the next tip about the iteration
            }
            mandel.enlargement = true;
            mandel.drawer("enlargement");
          }
        }
        else {
          console.log("you clicked down and up in the same point");
          // this can be a possible breakpoint
          // it executes when you click down and up in the same point
        }
        mandel.leftClick = false;
      }
    });

    canvas.c.addEventListener("touchstart", (function(e) {
        // this function is for mobile devices to handle the touch event
      mandel.mouseDownX = e.changedTouches[0].pageX - this.offsetLeft;
      mandel.mouseDownY = e.changedTouches[0].pageY  - this.offsetTop;
      e.preventDefault();
    }), false);

    canvas.c.addEventListener("touchend", (function(e) {
        // this function is for mobile devices to handle the touch event
      mandel.mouseUpX = e.changedTouches[0].pageX - this.offsetLeft;
      mandel.mouseUpY = e.changedTouches[0].pageY  - this.offsetTop;
      e.preventDefault();
      if (Math.abs(mandel.mouseDownX - mandel.mouseUpX) > 40) {
          // if you only want to swipe, then there need no enlargement
          // we suppose that you want to swipe if the difference between
          // the down and up X coord. <= 40px
        if (mandel.mouseUpX !== mandel.mouseDownX){
          if (mandel.tipMouseDisplay){
            mandel.setTip("tip_mouse", "none");
            mandel.tipMouseDisplay = false;
            mandel.setTip("tip_iteration", "block");
            mandel.tipIterationDisplay = true;
              // let's show the next tip about the iteration
          }
          mandel.enlargement = true;
          mandel.drawer("enlargement");
        }
      }

    }), false);
      // source: http://www.javascriptkit.com/javatutors/touchevents.shtml

    $("input:radio").click(function(e){
      // actualizes color schemes when setting the radio buttons
      var savedImgData = canvas.ctx.createImageData(canvas.canvasSize, canvas.canvasSize);
        // the whole canvas
      if (mandel.calculationReady) {
        // if drawing the set is finished
        mandel.setColorScheme();
        mandel.setColorArrays();
          // actualize the color scheme
        if (!mandel.colorSchemeDemoModeOn) {
          canvas.copyArrayToCanvas(mandel.depthArray, savedImgData);
            canvas.ctx.putImageData(savedImgData, 0, 0);
            // actualize the canvas based on the new scheme
        }
        else if (!mandel.demoSchemeIsRunning) {
          // if not just right in the middle of actualizing color schemes
          // in demoScheme mode
          mandel.demoScheme();
        }
      }
    });
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
      if (!mandel.bigNumberMode) {
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

  mandel.setSliderValues = function(){
    $( "#hue" ).slider( "option", "value", 0 );
    $( "#saturation" ).slider( "option", "value", 100 );
    mandel.hue = 0;
    mandel.saturation = 1;
  }
  mandel.getRadioValue = function(divId){
    var radioDiv = document.getElementById(divId);
    for (var i = 0; i < radioDiv.childElementCount; i++){
      if (radioDiv.children[i].checked) {
        return radioDiv.children[i].value;
      }
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
    this.bigNumberMode = false;
    this.setTip("tip_bignumber", "none");
    this.aComplexIterated = this.aStartInActualRange;
    this.bComplexIterated = this.bStartInActualRange;
    mandelUI.setInputCanvasSize(canvas.DEFAULT_CANVAS_SIZE);
    canvas.setCanvasSize(canvas.DEFAULT_CANVAS_SIZE);
    canvas.setCanvasContext();
    canvas.setImgData();
    this.setStep();
    this.setMouseCoordinatesToCanvas();
    this.setColorScheme();
    mandelUI.setDepthInput(this.DEFAULT_DEPTH);
    this.setMaxDepth();
    this.setSliderValues();
    backup.clearBackup();
  }
  mandel.restart = function(){
    this.setDefaultValues();
    this.drawer();
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
      mandel.colorSchemeDemoModeOn = false;
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
        mandel.updateUIChanges();
          // create backup from the state of the set
        mandel.setComplexScopeToChanges();
      };
    }
  }

  mandel.updateUIChanges = function(){
    mandel.setMaxDepth();
        // if Depth input is changed, it must be actualized

      var actualCanvasSize = mandelUI.getInputCanvasSize();
      if (actualCanvasSize !== canvas.canvasSize){ // Canvas size has been changed
        canvas.setCanvasSize();
        mandel.setMouseCoordinatesToCanvas();
        // drawing is based on mouse coordinates
        // in order to enlargement;
        mandel.setStep();
        canvas.setImgData();
      }

      mandel.setColorScheme();
      mandel.setColorArrays();

      // Create mandel.colorArrays based on the scheme and mandel.maxDepth
      // It's length is mandel.maxDepth
      // The createColorArrays function is located in colorarrays.js
      // it returns an object: {arrays, sheme};
      // the arrays is an array with RGBA codes, e.g. [255, 255, 255, 255],
      // the scheme is an object: {schemeName, RGBColorNumbers, calculatorFunction}
  }
  mandel.setComplexScopeToChanges = function(){
    var complexScope = {};

    if (!mandel.bigNumberMode) {
      complexScope.aLeftUpper = mandel.aStartInActualRange + mandel.mouseDownX * mandel.step;
      complexScope.bLeftUpper = mandel.bStartInActualRange - mandel.mouseDownY * mandel.step;
      complexScope.aRightBottom = mandel.aStartInActualRange + mandel.mouseUpX * mandel.step;
      complexScope.bRightBottom = mandel.bStartInActualRange - mandel.mouseUpY * mandel.step;

      handleReversedCoordinates();

      mandel.range = complexScope.aRightBottom - complexScope.aLeftUpper; // new range

      switchToBignumberModeIfNeed();
    };

    if (mandel.bigNumberMode) {
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
    function switchToBignumberModeIfNeed(){
        bigManager.handleBignumberWarning();

        if (mandel.range < 5e-13) {
          mandel.bigNumberMode = true;
          mandel.aStartInActualRange = math.eval(mandel.aStartInActualRange.toString());
          mandel.bStartInActualRange = math.eval(mandel.bStartInActualRange.toString());
          mandel.step = math.eval(mandel.step.toString());
          mandel.mouseDownY = math.eval(mandel.mouseDownY.toString());
          mandel.mouseDownX = math.eval(mandel.mouseDownX.toString());
          mandel.mouseUpY = math.eval(mandel.mouseUpY.toString());
          mandel.mouseUpX = math.eval(mandel.mouseUpX.toString());
            // this turns the numbers into math.js bignumbers
            // after this you cannot calculate with these properties
            // as before, but you have to apply the math.js functions
            // e.g. add(x, y)

        }
      }
  }


  mandel.demoScheme = function() {
    // this function shows the actual color scheme

    if (mandel.calculationReady) {
      mandel.colorSchemeDemoModeOn = true;
        // it is true while mandelbrot is not in progress
      mandel.demoSchemeIsRunning = true;
        // it is true while demoScheme() is in progress
      mandel.depthArray = [];
      var actualDepthInput = mandelUI.getDepthInput();
      if (mandel.maxDepth !== actualDepthInput) {
        // if the depth input has been set
        mandel.maxDepth = actualDepthInput;
      }
      mandel.setColorArrays();
      canvas.setCanvasSize();
      mandel.setMouseCoordinatesToCanvas();
      mandel.setStep();
      canvas.setImgData();

      var sectionNumber = mandel.colorArrays.arrays.length;
      var ratio = canvas.canvasSize / mandel.colorArrays.scheme.RGBColorNumbers;
      var sectionLength = (mandel.colorArrays.scheme.RGBColorNumbers / sectionNumber);
      var colorArraysIndex;

      for (var lineY = 0; lineY < canvas.canvasSize; lineY++) {
        for (var lineX = 0; lineX < canvas.canvasSize; lineX++){
          colorArraysIndex = Math.floor(lineX / ratio / sectionLength);
          canvas.imgData.data[lineX * 4] = mandel.colorArrays.arrays[colorArraysIndex][0];
          canvas.imgData.data[lineX * 4 + 1] = mandel.colorArrays.arrays[colorArraysIndex][1];
          canvas.imgData.data[lineX * 4 + 2] = mandel.colorArrays.arrays[colorArraysIndex][2];
          canvas.imgData.data[lineX * 4 + 3] = 255;

          mandel.depthArray.push(colorArraysIndex);
        }
        canvas.ctx.putImageData(canvas.imgData, 0, lineY);
      }
      mandel.demoSchemeIsRunning = false;
    }
  }

  // ----------- end functions -----------------------------------------------------------


    worker.setupWorker(mandel, "src/mandel_worker.js", mandel.processCalculatorData);
      // sits in calculator-worker.js

    mandel.initSliders();
    mandel.setEvents();
    mandel.setDefaultValues();
    mandel.drawer();




