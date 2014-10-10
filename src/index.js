// index.js

"use strict";

if (Modernizr.canvas){
  mandel.init();
}
else {
  mandelUI.setDisplay("panel", "none");
}





