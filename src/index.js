// index.js

"use strict";
$(document).ready(function(){

  if (Modernizr.canvas && Modernizr.webworkers){
    mandelUI.setDisplay("panel", "inline-block");
    mandelUI.setDisplay("mandelCanvas", "inline-block");
    mandelUI.setDisplay("canvasNotSupported", "none");
    mandel.init();
  };
});






