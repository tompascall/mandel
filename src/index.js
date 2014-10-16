// index.js

"use strict";
$(document).ready(function(){

  if (Modernizr.canvas && Modernizr.webworkers){
    mandelUI.setDisplay("panel", "inline-block");
    mandelUI.setDisplay("mandelCanvas", "inline-block");
    mandel.init();
  }
  else {
    mandelUI.setDisplay("canvasNotSupported", "block");
      // we give some information about the app, if
      // the HTML5 canvas or webworkers API
      // is not supported by the browser.
  };
});






