// complex-plane.js

"use strict";

var complexPlane = {
  range : 0,
    // range is the width (and heigth) of the complex area
    // the actual range is based on the enlargement
    // at the beginning, it is equal to 4
  step : 0,
    // the X (and Y) step in the complex plane
    // it must be recalculate if range is changed
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
};

 complexPlane.setStep = function(){
  if (!bigManager.bigNumberMode) {
    complexPlane.step = complexPlane.range / canvas.canvasSize;
  }
  else {
    complexPlane.step = math.divide(complexPlane.range, canvas.canvasSize);
  }
}

complexPlane.setComplexScopeToChanges = function(){
    var complexScope = {};

    if (!bigManager.bigNumberMode) {
      complexScope.aLeftUpper = complexPlane.aStartInActualRange + mandelUI.mouseDownX * complexPlane.step;
      complexScope.bLeftUpper = complexPlane.bStartInActualRange - mandelUI.mouseDownY * complexPlane.step;
      complexScope.aRightBottom = complexPlane.aStartInActualRange + mandelUI.mouseUpX * complexPlane.step;
      complexScope.bRightBottom = complexPlane.bStartInActualRange - mandelUI.mouseUpY * complexPlane.step;

      handleReversedCoordinates();

      complexPlane.range = complexScope.aRightBottom - complexScope.aLeftUpper; // new range

      bigManager.switchToBignumberModeIfNeed();
    };

    if (bigManager.bigNumberMode) {
      // it is not in a simple else, because switchToBignumberModeIfNeed()
      // may switch bignumber mode on
      complexScope.aLeftUpper = math.add(complexPlane.aStartInActualRange, math.multiply(mandelUI.mouseDownX, complexPlane.step));
      complexScope.bLeftUpper = math.subtract(complexPlane.bStartInActualRange, math.multiply(mandelUI.mouseDownY, complexPlane.step));
      complexScope.aRightBottom = math.add(complexPlane.aStartInActualRange, math.multiply(mandelUI.mouseUpX, complexPlane.step));
      complexScope.bRightBottom = math.subtract(complexPlane.bStartInActualRange, math.multiply(mandelUI.mouseUpY, complexPlane.step));

      handleReversedCoordinates()

      complexPlane.range = math.subtract(complexScope.aRightBottom, complexScope.aLeftUpper); // new range
    }

    complexPlane.aStartInActualRange = complexScope.aLeftUpper;
    complexPlane.bStartInActualRange = complexScope.bLeftUpper;
    complexPlane.aComplexIterated = complexPlane.aStartInActualRange;
    complexPlane.bComplexIterated = complexPlane.bStartInActualRange;

    complexPlane.setStep(); // new step based on the enlargement

    mandelUI.setMouseCoordinatesToCanvas();
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