// manage-UI.js

"use strict";

var mandelUI = {
  inputCanvasSize : document.getElementById("inputCanvasSize")
    // the canvas size input field of the UI
};

mandelUI.setInputCanvasSize = function(x){
    mandelUI.inputCanvasSize.value = x;
  }

mandelUI.getInputCanvasSize = function(){
  return Number(mandelUI.inputCanvasSize.value);
}

mandelUI.setDepthInput = function(depth){
  document.getElementById("depthInput").value = depth.toString();
}

mandelUI.getDepthInput = function(){
  return Number(document.getElementById("depthInput").value);
}
