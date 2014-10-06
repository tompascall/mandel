// manage-UI.js

"use strict";

var mandelUI = {
  inputCanvasSize : document.getElementById("inputCanvasSize"),
    // the canvas size input field of the UI
   tipMouseDisplay : true,
    // when document loads, there is a tip about the enlargement,
    // but after the first enlargement, there is no need for
    // this tip any more, so this is an indicator
    // if the enlargement has already happended
  tipIterationDisplay: false,
    // it is also a tip flag for the iteration tip
  hue : 0,
  saturation: 1,
  maxDepth : 0,
      // the max. iteration number
      // it can be set in the UI
      // mandelUI.maxDepth devides the color-scale of the color scheme into equal parts
      // if mandelUI.maxDepth is 1, we have 2 parts, if 2, we have 3 parts etc.
  mouseDownX : 0,
  mouseDownY : 0,
  mouseUpX : 0,
  mouseUpY : 0,
    // the mouse coordinates when you enlarge an area of the set
    // we use them for enlargement, calculate the new range and step.
};

mandelUI.setTip = function(tipID, display){
  document.getElementById(tipID).style.display = display;
    // display on and off and element by ID
}

mandelUI.setMaxDepth = function(){
  var d = mandelUI.getDepthInput();
  mandelUI.maxDepth = d ? d : calculator.DEFAULT_DEPTH;
    // if depthInput cannot be interpreted, then comes the default value
  if (d !== calculator.DEFAULT_DEPTH && mandelUI.tipIterationDisplay) {
    mandelUI.setTip("tip_iteration", "none");
    mandelUI.tipIterationDisplay = false;
      // if the value of the iteration has already been set,
      // there is no need for the tip about the iteration
  }
}

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

mandelUI.getRadioValue = function(divId){
  var radioDiv = document.getElementById(divId);
  for (var i = 0; i < radioDiv.childElementCount; i++){
    if (radioDiv.children[i].checked) {
      return radioDiv.children[i].value;
    }
  }
}

mandelUI.initSliders = function(){
  $( "#hue" ).slider({ min: 0, max: 360, step: 1});

  $( "#saturation" ).slider({ min: 0, max: 100, step: 1 });
}

mandelUI.setSliderValues = function(){
  $( "#hue" ).slider( "option", "value", 0 );
  $( "#saturation" ).slider( "option", "value", 100 );
  mandelUI.hue = 0;
  mandelUI.saturation = 1;
}

mandelUI.setUIEvents = function(){

  $(document).keypress(function(e) {
    if(e.which == 13) {
      mandel.drawer("enter");
    }
  });

  $( "#hue" ).on( "slide", function( event, ui ) {
    var savedImgData = canvas.ctx.createImageData(canvas.canvasSize, canvas.canvasSize);
    mandelUI.hue = ui.value;
    if (calculator.calculationReady) {
      // if drawing the set is finished
      colors.setColorScheme();
      colors.setColorArrays();
        // actualize the color scheme
      canvas.copyArrayToCanvas(canvas.depthArray, savedImgData);
      canvas.ctx.putImageData(savedImgData, 0, 0);
        // actualize the canvas based on the new scheme
    }
  });

  $( "#saturation" ).on( "slide", function( event, ui ) {
    var savedImgData = canvas.ctx.createImageData(canvas.canvasSize, canvas.canvasSize);
    mandelUI.saturation = ui.value / 100;
    if (calculator.calculationReady) {
      // if drawing the set is finished
      colors.setColorScheme();
      colors.setColorArrays();
        // actualize the color scheme
      canvas.copyArrayToCanvas(canvas.depthArray, savedImgData);
      canvas.ctx.putImageData(savedImgData, 0, 0);
        // actualize the canvas based on the new scheme
    }
  });

  $("input:radio").click(function(e){
    // actualizes color schemes when setting the radio buttons
    var savedImgData = canvas.ctx.createImageData(canvas.canvasSize, canvas.canvasSize);
      // the whole canvas
    if (calculator.calculationReady) {
      // if drawing the set is finished
      colors.setColorScheme();
      colors.setColorArrays();
        // actualize the color scheme
      if (!colors.colorSchemeDemoModeOn) {
        canvas.copyArrayToCanvas(canvas.depthArray, savedImgData);
          canvas.ctx.putImageData(savedImgData, 0, 0);
          // actualize the canvas based on the new scheme
      }
      else if (!colors.demoSchemeIsRunning) {
        // if not just right in the middle of actualizing color schemes
        // in demoScheme mode
        colors.demoScheme();
      }
    }
  });
}

mandelUI.updateUIChanges = function(){
  mandelUI.setMaxDepth();
    // if Depth input is changed, it must be actualized

  var actualCanvasSize = mandelUI.getInputCanvasSize();
  if (actualCanvasSize !== canvas.canvasSize){ // Canvas size has been changed
    canvas.setCanvasSize(actualCanvasSize);
    mandelUI.setMouseCoordinatesToCanvas();
    // drawing is based on mouse coordinates
    // in order to enlargement;
    complexPlane.setStep();
    canvas.setImgData();
  }

  colors.setColorScheme();
  colors.setColorArrays();
}

mandelUI.setMouseCoordinatesToCanvas = function(){
    mandelUI.mouseDownX = mandelUI.mouseDownY = 0;
    mandelUI.mouseUpX = mandelUI.mouseUpY = canvas.canvasSize;
      // the default is that mouse coordinates parallel to canvas size
      // they are modified when enlargement happens
      // after enlargement they must be reset
  }