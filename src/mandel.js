// mandel.js

  "use strict";

  var mandel = {};

  mandel.init = function(){
    calculator.init();
    mandelUI.initSliders();
    mandel.setEvents();
    mandel.setDefaultValues();
    mandel.drawer();
  };

  mandel.setEvents = function(){
    mandelUI.setUIEvents();
    canvas.setCanvasEvents();
  };

  mandel.restart = function(){
    mandel.setDefaultValues();
    mandel.drawer();
  };

  mandel.setDefaultValues = function(){
    canvas.setCanvasSize(canvas.DEFAULT_CANVAS_SIZE);
    canvas.setCanvasContext();
    canvas.setImgData();

    colors.setColorSchemeByRadio();

    bigManager.bigNumberMode = false;

    complexPlane.range = 5;
      // if you only want to test bignumber,
      // add this value to complexPlane.range: 3.377631507817114e-11;
    complexPlane.aStartInActualRange = -2.5;
      // if you only want to test bignumber,
      // add this value to complexPlane.aStartInActualRange: -1.2555621711060319;
    complexPlane.bStartInActualRange = 2.5;
      // if you only want to test bignumber,
      // add this value to complexPlane.bStartInActualRange: -0.40098714274827146;
    complexPlane.aComplexIterated = complexPlane.aStartInActualRange;
    complexPlane.bComplexIterated = complexPlane.bStartInActualRange;
    complexPlane.setStep();

    mandelUI.setDisplay("tip_bignumber", "none");
    mandelUI.setInputCanvasSize(canvas.DEFAULT_CANVAS_SIZE);
    mandelUI.setMouseCoordinatesToCanvas();
    mandelUI.setDepthInput(calculator.DEFAULT_DEPTH);
    mandelUI.setMaxDepth();
    mandelUI.setSliderValues();

    backup.clearBackup();
  };


  mandel.drawer = function(controller){ // entry point for drawing the set
    mandelbrotIntro();
    calcWorker.sendMessageToWorker();
    return;

    function mandelbrotIntro(){
      checkCalculationReady();
      initValuesToDraw();

      function checkCalculationReady(){
        if (!calculator.calculationReady) {
        // if calculation is already active, it must be stopped
        calcWorker.terminateWorker(calculator.processCalculatorData);
          // the worker must be terminate if we want to start an
          // other event cycle while the current event cycle is running
        calcWorker.setupWorker("src/mandel_worker.js", calculator.processCalculatorData);
          // start a new worker and set up event again
        };
      }
      function initValuesToDraw(){
        calculator.calculationReady = false;
          // the show is being started; it is a status flag
          // it will be set true by the worker event handler, when drawing is ready
        canvas.depthArray = [];
          // set/reset the depth array that contains all the depth values of
          // the points of the canvas
        colors.colorSchemeDemoModeOn = false;
        // if demo mode is on, it must be finished
        calculator.row = 0;
          // set/reset the value of the row
        checkController();

        function checkController(){
          if (controller !== "enlargement") {
            // if drawer is not called after enlargement
            calculator.enlargement = false;
          };
          if (controller !== "from_back"){
            // if calling the drawer is not from backup.back()
            // because in that case there is no need to updating based on UI changes
            backup.updateBackup();
              // create backup from the state of the set
            mandelUI.updateUIChanges();
            complexPlane.setComplexScopeToChanges();
          };
        }
      }
    }
  };








