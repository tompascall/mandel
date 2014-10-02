// bignumber-manager.js

"use strict";

 var bigManager = {};

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
      mandel.setTip("tip_bignumber", "block");
      // show warning about the limit of the standard js numbers
    }
    else if (mandel.range < 5e-13 || mandel.range > 1e-11) {
      mandel.setTip("tip_bignumber", "none");
        // there is no need for the tip any more
    }
  }
