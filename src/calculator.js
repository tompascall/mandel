// calculator.js

var calculator = {
  DEFAULT_DEPTH : 20,   

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

calculator.init = function(){
  calcWorker.setupWorker("src/mandel_worker.js", calculator.processCalculatorData);
      // located in calculator-worker.js
}

calculator.processCalculatorData = function(e) {
  calculator.actualDepthArray = e.data;
    // the worker sent back the array of depths, that
    // we need to put it to the canvas
  canvas.copyArrayToCanvas(calculator.actualDepthArray, canvas.imgData);
  canvas.ctx.putImageData(canvas.imgData, 0, calculator.row);
  calculator.row += 1;
  if (calculator.row > canvas.canvasSize) {
    calculator.calculationReady = true;
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