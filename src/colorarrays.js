// colorarrays.js

// These are helper functions for using color schemes in mandel.js
// The Colorarrays's length is depth
// The array is a color scale divided to 'depth' section
// Colors of each section are represented in an array of RGBA codes [R, G, B, A]
// the colorArrays[n] is the nth color of the color scale
// the createColorArrays function returns an object:
// {arrays : colorArrays, scheme: colorScheme};

"use strict";

var colors = {
	colorScheme : 0,
    // the index of the colorscheme
  colorArrays : null,
    // the colorscheme based on the colorscheme index
  colorSchemeDemoModeOn : false,
    // it will be true, while we are in colorScheme Demo
  demoSchemeIsRunning : false,
    // it is true while demoScheme() is running
};

colors.setColorScheme = function(){
 	colors.colorScheme = mandelUI.getRadioValue("schemes");
}

colors.setColorArrays = function(){
  colors.colorArrays = colors.createColorArrays(mandelUI.maxDepth, colors.colorScheme, mandelUI.hue, mandelUI.saturation);
    // the createColorArrays function is in colorarrays.js     
    // colorArrays based on the scheme and mandelUI.maxDepth
    // It's length is mandelUI.maxDepth
    // The createColorArrays function is located in colorarrays.js
    // it returns an object: {arrays, sheme};
    // the arrays is an array with RGBA codes, e.g. [255, 255, 255, 255],
    // the scheme is an object: {schemeName, RGBColorNumbers, calculatorFunction}
}

colors.createColorArrays = function(depth, colorSchemeIndex, hue, saturation){

	var ENDLESS_RED = 255;
	var ENDLESS_GREEN = 255;
	var ENDLESS_BLUE = 255;



	var colorSchemesArrays = [
		// schemeName, RGBColorNumbers, depthToArray()
		["RGBLines", 765, RGBLinesDepthToArray],
		["colorToBlack", 255, colorToBlackDepthToArray],
		["whiteToColor", 255, whiteToColorDepthToArray],
		["Shift", parseInt("FFFF", 16), shiftDepthToArray],
		["smallShift", parseInt("FFF", 16), smallShiftDepthToArray],
		["spiral", parseInt("FFFF", 16), spiralDepthToArray],
		["smallSpiral", parseInt("4E20", 16), smallSpiralDepthToArray], // 20000
		["hslColors", 20000, hslColorsDepthToArray],
	]

	var actualColorSchemeArray = colorSchemesArrays[colorSchemeIndex];
	var colorScheme = createColorArrayObject(actualColorSchemeArray);

	function createColorArrayObject(schemeArray){
		var colorArrayObject = {
			schemeName: schemeArray[0],
			RGBColorNumbers: schemeArray[1], // the numbers of colors in the scheme
			depthToArray: schemeArray[2] // the function that makes scheme-specific RGBA arrays
		}
		return colorArrayObject;
	}

	var colorArrays = {arrays : [], scheme : colorScheme};

	var sectionLength = colorScheme.RGBColorNumbers / depth;

	var colorCoord;

	for (var i = 0; i <=  depth; i++) {
	 	colorCoord = Math.round(i * sectionLength);
	 	if (colorCoord < 0) {
			throw new Error("Minus coordinate is not allowed");
		}
		else if (colorCoord === colorScheme.RGBColorNumbers) {
			colorArrays.arrays[i] = [ENDLESS_RED, ENDLESS_GREEN, ENDLESS_BLUE, 255];
			// the color of the eye of the set
		}
		else if (colorCoord < colorScheme.RGBColorNumbers) {
		 		colorArrays.arrays[i] = hslTransform(colorScheme.depthToArray(colorCoord));
		}
		else {
			throw new Error("Coordinate is not allowed higher than " +
				colorScheme.RGBColorNumbers + " in this color scheme");
		}
	}

	return colorArrays;


  function hslTransform(color){
  	var hsl;
  	var rgb = [];
  	var rgbFromHsl;

  	if (colorScheme.schemeName !== "hslColors") {
  		hsl = chroma(color[0], color[1], color[2]).hsl();
  		hsl[0] = (hsl[0] + hue) % 360;
  		hsl[1] = saturation;

  		rgbFromHsl = chroma(hsl, 'hsl').rgb();
  		color[0] = rgbFromHsl[0];
  		color[1] = rgbFromHsl[1];
  		color[2] = rgbFromHsl[2];
  		color[3] = 255;
  		return color;
  	}
  	else {
  		// color is in hsl format
  		// there is no need rgb conversion to hsl

  		color[0] = (color[0] + hue) % 360;
  		color[1] = saturation;

  		rgbFromHsl = chroma(color, 'hsl').rgb();
  		color[0] = rgbFromHsl[0];
  		color[1] = rgbFromHsl[1];
  		color[2] = rgbFromHsl[2];
  		color[3] = 255;
  		return color;
  	}
  }

	function RGBLinesDepthToArray(coord){ //between 0-765

		if (coord <= 255) { // to be on the Red section (RGBLine/3)
			return [255, 255, 255 - coord, 255]; // I don't want to screw the alpha channel
		}
		else if (coord <= 510) { // to be on the Green section (RGBLine/3*2)
			return [255, 510 - coord, 0, 255];
		}
		else { // to be on the Blue section
			return [colorScheme.RGBColorNumbers - coord, 0, 0, 255];
		}
	}

	function colorToBlackDepthToArray(coord){ //between 0-255
		return [colorScheme.RGBColorNumbers - coord, colorScheme.RGBColorNumbers -
				coord, 0, 255];
	}

	function whiteToColorDepthToArray(coord){ //between 0-255
		return [colorScheme.RGBColorNumbers, colorScheme.RGBColorNumbers -
				coord, colorScheme.RGBColorNumbers - coord, 255];
	}

	function shiftDepthToArray(coord){ // between 0-Math.pow(255, 3)
			var red, green, blue;

			green = coord & parseInt("00FF", 16);
			red = (coord & parseInt("0FF0", 16)) >>> 4;
			blue = (coord & parseInt("FF00", 16)) >>> 8;
			return [red, green, blue, 255];
		}

	function smallShiftDepthToArray(coord){
		var red, green, blue;

		red = coord & parseInt("0FF", 16);
		green = (coord & parseInt("FF0", 16)) >>> 4;
		blue = coord & parseInt("0FF", 16);
		return [red, green, blue, 255];
	}

	function spiralDepthToArray(coord){
		var red, green, blue;
		var deg = Math.PI/360;
			// this turns around a vector that is of 255/2 length,
			// and its fixed point is the middle of the red-green plane of the RGB color space
			// the other point is on a circle, and continually go along paralelly the blue axix,
			// so its route is a spiral
		red = (255 >>> 1) + Math.cos(deg * coord) * (255 >>> 1); // x coordinste of the vector
		green = (255 >>> 1) + Math.sin(deg * coord) * (255 >>> 1); // y coordinate of the vector
		blue = Math.floor(255 / colorScheme.RGBColorNumbers * coord);
		return [red, green, blue, 255];
	}
	function smallSpiralDepthToArray(coord){
		var red, green, blue;
		var deg = Math.PI/360;

		red = (255 >>> 1) + Math.cos(deg * coord) * (255 >>> 1);
		green = (255 >>> 1) + Math.sin(deg * coord) * (255 >>> 1);
		blue =  Math.floor(255 / colorScheme.RGBColorNumbers * coord);
		return [red, green, blue, 255];
	}

	function hslColorsDepthToArray(coord){
		var deg = 360 / colorScheme.RGBColorNumbers;
		var hsl;
		var rgbFromHsl;

		hsl = chroma("red").hsl();
		hsl[0] = hsl[0] + deg * coord;
		hsl[1] = 1;

		return hsl;
	}
}

colors.demoScheme = function() {
    // this function shows the actual color scheme

    if (mandel.calculationReady) {
      colors.colorSchemeDemoModeOn = true;
        // it is true while mandelbrot is not in progress
      colors.demoSchemeIsRunning = true;
        // it is true while demoScheme() is in progress
      canvas.depthArray = [];
      var actualDepthInput = mandelUI.getDepthInput();
      if (mandelUI.maxDepth !== actualDepthInput) {
        // if the depth input has been set
        mandelUI.maxDepth = actualDepthInput;
      }
      colors.setColorArrays();
      canvas.setCanvasSize();
      mandelUI.setMouseCoordinatesToCanvas();
      complexPlane.setStep();
      canvas.setImgData();

      var sectionNumber = colors.colorArrays.arrays.length;
      var ratio = canvas.canvasSize / colors.colorArrays.scheme.RGBColorNumbers;
      var sectionLength = (colors.colorArrays.scheme.RGBColorNumbers / sectionNumber);
      var colorArraysIndex;

      for (var lineY = 0; lineY < canvas.canvasSize; lineY++) {
        for (var lineX = 0; lineX < canvas.canvasSize; lineX++){
          colorArraysIndex = Math.floor(lineX / ratio / sectionLength);
          canvas.imgData.data[lineX * 4] = colors.colorArrays.arrays[colorArraysIndex][0];
          canvas.imgData.data[lineX * 4 + 1] = colors.colorArrays.arrays[colorArraysIndex][1];
          canvas.imgData.data[lineX * 4 + 2] = colors.colorArrays.arrays[colorArraysIndex][2];
          canvas.imgData.data[lineX * 4 + 3] = 255;

          canvas.depthArray.push(colorArraysIndex);
        }
        canvas.ctx.putImageData(canvas.imgData, 0, lineY);
      }
      colors.demoSchemeIsRunning = false;
    }
  }
