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
    if (mandel.range <= 1e-11 && mandel.range >= 5e-13) {
      mandelUI.setTip("tip_bignumber", "block");
      // show warning about the limit of the standard js numbers
    }
    else if (mandel.range < 5e-13 || mandel.range > 1e-11) {
      mandelUI.setTip("tip_bignumber", "none");
        // there is no need for the tip any more
    }
  }

bigManager.switchToBignumberModeIfNeed = function(){
  bigManager.handleBignumberWarning();

  if (mandel.range < 5e-13) {
    bigManager.bigNumberMode = true;
    mandel.aStartInActualRange = math.eval(mandel.aStartInActualRange.toString());
    mandel.bStartInActualRange = math.eval(mandel.bStartInActualRange.toString());
    mandel.step = math.eval(mandel.step.toString());
    mandel.mouseDownY = math.eval(mandel.mouseDownY.toString());
    mandel.mouseDownX = math.eval(mandel.mouseDownX.toString());
    mandel.mouseUpY = math.eval(mandel.mouseUpY.toString());
    mandel.mouseUpX = math.eval(mandel.mouseUpX.toString());
      // this turns the numbers into math.js bignumbers
      // after this you cannot calculate with these properties
      // as before, but you have to apply the math.js functions
      // e.g. add(x, y)
  }
}