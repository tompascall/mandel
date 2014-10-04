// backup.js

"use strict";

var backup = {
      states : []
      // this object will contain the former state of
      // the object values to step back
};

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
        state.maxDepth = mandel.maxDepth;
        state.aStartInActualRange = mandel.aStartInActualRange;
        state.bStartInActualRange = mandel.bStartInActualRange;
        state.aComplexIterated = mandel.aStartInActualRange;
        state.bComplexIterated = mandel.bStartInActualRange;
        state.step = mandel.step;
        state.range = mandel.range;

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
    mandel.maxDepth = state.maxDepth;
    mandel.aStartInActualRange = state.aStartInActualRange;
    mandel.bStartInActualRange = state.bStartInActualRange;
    mandel.aComplexIterated = state.aComplexIterated;
    mandel.bComplexIterated = state.bComplexIterated;
    mandel.step = state.step;
    mandel.range = state.range;
  }

  backup.clearBackup = function(){
    backup.states = [];
  }

  backup.updateBackup = function(){
    var state = {};
    backup.saveState(state);
  }
