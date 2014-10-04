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
};

mandelUI.setTip = function(tipID, display){
  document.getElementById(tipID).style.display = display;
    // display on and off and element by ID
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
  mandel.hue = 0;
  mandel.saturation = 1;
}

mandelUI.setUIEvents = function(){

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
      colors.setColorScheme();
      colors.setColorArrays();
        // actualize the color scheme
      canvas.copyArrayToCanvas(mandel.depthArray, savedImgData);
      canvas.ctx.putImageData(savedImgData, 0, 0);
        // actualize the canvas based on the new scheme
    }
  });

  $( "#saturation" ).on( "slide", function( event, ui ) {
    var savedImgData = canvas.ctx.createImageData(canvas.canvasSize, canvas.canvasSize);
    mandel.saturation = ui.value / 100;
    if (mandel.calculationReady) {
      // if drawing the set is finished
      colors.setColorScheme();
      colors.setColorArrays();
        // actualize the color scheme
      canvas.copyArrayToCanvas(mandel.depthArray, savedImgData);
      canvas.ctx.putImageData(savedImgData, 0, 0);
        // actualize the canvas based on the new scheme
    }
  });

  $("input:radio").click(function(e){
    // actualizes color schemes when setting the radio buttons
    var savedImgData = canvas.ctx.createImageData(canvas.canvasSize, canvas.canvasSize);
      // the whole canvas
    if (mandel.calculationReady) {
      // if drawing the set is finished
      colors.setColorScheme();
      colors.setColorArrays();
        // actualize the color scheme
      if (!colors.colorSchemeDemoModeOn) {
        canvas.copyArrayToCanvas(mandel.depthArray, savedImgData);
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
  mandel.setMaxDepth();
    // if Depth input is changed, it must be actualized

  var actualCanvasSize = mandelUI.getInputCanvasSize();
  if (actualCanvasSize !== canvas.canvasSize){ // Canvas size has been changed
    canvas.setCanvasSize(actualCanvasSize);
    mandel.setMouseCoordinatesToCanvas();
    // drawing is based on mouse coordinates
    // in order to enlargement;
    mandel.setStep();
    canvas.setImgData();
  }

  colors.setColorScheme();
  colors.setColorArrays();
}