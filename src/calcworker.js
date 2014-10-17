// worker.js
// generic methods for managing workers

"use strict";

var calcWorker = {};

calcWorker.setupWorker = function(workerPath, messageProcessor){
  calcWorker.worker = new Worker(workerPath);
  calcWorker.worker.addEventListener('message', messageProcessor, false);
}

calcWorker.terminateWorker = function(messageProcessor){
  calcWorker.worker.removeEventListener('message', messageProcessor, false);
  calcWorker.worker.terminate();
}

calcWorker.sendMessageToWorker = function(){

    calcWorker.worker.postMessage(preparedMessage());

    function preparedMessage(){
      // we need to send some data to the worker
      // in order that it can calculate the actual line
      // the problem is that if we are in bigNumberMode
      // we need to transform the bignumber types to a function-less object
      // that can be re-form to bignumbers in the web worker
      var aComplexIterated;
      var bComplexIterated;
      var step;
      var message;

      if (!bigManager.bigNumberMode){
        aComplexIterated = complexPlane.aComplexIterated;
        bComplexIterated = complexPlane.bComplexIterated;
        step = complexPlane.step;
      }
      else {
        aComplexIterated = bigManager.bigNumberToBigObject(complexPlane.aComplexIterated);
        bComplexIterated = bigManager.bigNumberToBigObject(complexPlane.bComplexIterated);
        step = bigManager.bigNumberToBigObject(complexPlane.step);
      }
      var message = { aComplexIterated : aComplexIterated,
                      bComplexIterated : bComplexIterated,
                      canvasSize : canvas.canvasSize,
                      bigNumberMode : bigManager.bigNumberMode,
                      step : step,
                      maxDepth : mandelUI.maxDepth
                    };
      return JSON.stringify(message);
    }
  }
