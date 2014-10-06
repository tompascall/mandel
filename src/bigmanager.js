// bignumber-manager.js

"use strict";

var bigManager = {
  bigNumberMode : false,
    // this is a flag if we are in bigNumber mode
 };

 bigManager.bigNumberToBigObject = function(bignumber){
    var bigObject = {};
    bigObject.c = bignumber.c;
    bigObject.e = bignumber.e;
    bigObject.s = bignumber.s;
    return bigObject;
      // a helper object, that transforms math.bignumber object
      // to a function-less object,
      // so you can send it to the web worker (in JSON object format)
      // it has its complementer in mandel_worker.js
  }

bigManager.handleBignumberWarning = function(){
    if (complexPlane.range <= 1e-11 && complexPlane.range >= 5e-13) {
      mandelUI.setTip("tip_bignumber", "block");
      // show warning about the limit of the standard js numbers
    }
    else if (complexPlane.range < 5e-13 || complexPlane.range > 1e-11) {
      mandelUI.setTip("tip_bignumber", "none");
        // there is no need for the tip any more
    }
  }

bigManager.switchToBignumberModeIfNeed = function(){
  bigManager.handleBignumberWarning();

  if (complexPlane.range < 5e-13) {
    bigManager.bigNumberMode = true;
    complexPlane.aStartInActualRange = math.eval(complexPlane.aStartInActualRange.toString());
    complexPlane.bStartInActualRange = math.eval(complexPlane.bStartInActualRange.toString());
    complexPlane.step = math.eval(complexPlane.step.toString());
    mandelUI.mouseDownY = math.eval(mandelUI.mouseDownY.toString());
    mandelUI.mouseDownX = math.eval(mandelUI.mouseDownX.toString());
    mandelUI.mouseUpY = math.eval(mandelUI.mouseUpY.toString());
    mandelUI.mouseUpX = math.eval(mandelUI.mouseUpX.toString());
      // this turns the numbers into math.js bignumbers
      // after this you cannot calculate with these properties
      // as before, but you have to apply the math.js functions
      // e.g. add(x, y)
  }
}