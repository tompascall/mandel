// backup.js

"use strict";

var backup = {
      states : []
      // this object will contain the former state of
      // the object values to step back
};

backup.back = function(){
  var state;
  if (backup.states.length > 1) {
    // if it is not the first state
    state = backup.states.pop();
    backup.restoreState(state);
    bigManager.handleBignumberWarning();
    colors.setColorArrays();
    mandelUI.setDepthInput(mandelUI.maxDepth);
    mandelUI.setInputCanvasSize(canvas.canvasSize);
    canvas.setCanvasSize(canvas.canvasSize);
    canvas.setImgData();
    mandelUI.setMouseCoordinatesToCanvas();
    mandel.drawer("from_back");
  }
}
  
backup.saveState = function(state){

    state.UI = {
      inputCanvasSize : mandelUI.getInputCanvasSize(),
      depthInput : mandelUI.getDepthInput()
      // get UI canvas size and max. iteration
    };

    if (backup.states.length > 0){
      if (modifiedUI() || mandel.enlargement){
        state.bigNumberMode = bigManager.bigNumberMode;
        state.canvasSize = canvas.canvasSize;
        state.maxDepth = mandelUI.maxDepth;
        state.aStartInActualRange = complexPlane.aStartInActualRange;
        state.bStartInActualRange = complexPlane.bStartInActualRange;
        state.aComplexIterated = complexPlane.aStartInActualRange;
        state.bComplexIterated = complexPlane.bStartInActualRange;
        state.step = complexPlane.step;
        state.range = complexPlane.range;

        backup.states.push(state);
      }
    }
    else {
      backup.states.push(state);
    }

    function modifiedUI(){
      var previousUI = backup.states[backup.states.length - 1].UI;
      var UIkeys = Object.keys(previousUI);
        // returns the keys of the UI object
      var modified = false;
      UIkeys.forEach(function(key){
        if (previousUI[key] !== state.UI[key]) modified = true;
      });
      return modified;
    }
  }

  backup.restoreState = function(state){
    bigManager.bigNumberMode = state.bigNumberMode;
    canvas.canvasSize = state.canvasSize;
    mandelUI.maxDepth = state.maxDepth;
    complexPlane.aStartInActualRange = state.aStartInActualRange;
    complexPlane.bStartInActualRange = state.bStartInActualRange;
    complexPlane.aComplexIterated = state.aComplexIterated;
    complexPlane.bComplexIterated = state.bComplexIterated;
    complexPlane.step = state.step;
    complexPlane.range = state.range;
  }

  backup.clearBackup = function(){
    backup.states = [];
  }

  backup.updateBackup = function(){
    var state = {};
    backup.saveState(state);
  }
