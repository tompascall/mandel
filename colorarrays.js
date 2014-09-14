// colorarrays.js

// These are helper functions for using color schemes in mandel.js
// The Colorarrays's length is depth
// The array is a color scale divided to 'depth' section
// Colors of each section are represented in an array of RGBA codes [R, G, B, A]
// the colorArrays[n] is the nth color of the color scale
// the createColorArrays function returns an object: 
// {arrays : colorArrays, scheme: colorScheme};

"use strict";

function createColorArrays(depth, colorSchemeIndex, hue, saturation, lightness){

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
		hsl[2] = lightness;

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
		color[2] = lightness;

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

	// function hslColorsDepthToArray(coord){
	// 	var deg = 360 / colorScheme.RGBColorNumbers;
	// 	var hsl; 
	// 	var rgbFromHsl;
	// 	var rgba = [];

	// 	hsl = chroma("red").hsl();
	// 	hsl[0] = hsl[0] + deg * coord;
	// 	hsl[1] = 1;

	// 	rgbFromHsl = chroma(hsl, 'hsl').rgb();
	// 	rgba[0] = rgbFromHsl[0];
	// 	rgba[1] = rgbFromHsl[1];
	// 	rgba[2] = rgbFromHsl[2];
	// 	rgba[3] = 255;
	// 	return rgba;
	// }

	function hslColorsDepthToArray(coord){
		var deg = 360 / colorScheme.RGBColorNumbers;
		var hsl; 
		var rgbFromHsl;

		hsl = chroma("red").hsl();
		hsl[0] = hsl[0] + deg * coord;
		hsl[1] = 1;

		return hsl;
	}
	// function greyDepthToArray(coord){ //between 0-255
	// 	return [colorScheme.RGBColorNumbers - coord, colorScheme.RGBColorNumbers - 
	// 			coord, colorScheme.RGBColorNumbers - coord, 255]; 
	// }

	// function redToBlackDepthToArray(coord){ //between 0-255
	// 	return [colorScheme.RGBColorNumbers - coord, 0, 0, 255]; 
	// }

	// function greenToBlackDepthToArray(coord){ //between 0-255
	// 	return [0, colorScheme.RGBColorNumbers - coord, 0, 255]; 
	// }
	// function whiteToGreenDepthToArray(coord){ //between 0-255
	// 	return [colorScheme.RGBColorNumbers - 
	// 		coord, colorScheme.RGBColorNumbers, colorScheme.RGBColorNumbers - coord, 255]; 
	// }
	// function millionDepthToArray(coord){ // between 0-Math.pow(255, 3)
	// 	var red, green, blue;
		
	// 	red = coord & 255;
	// 	green = (coord & parseInt("00FF00", 16)) >>> 8;
	// 	blue = (coord & parseInt("FF0000", 16)) >>> 16;
	// 	return [red, green, blue, 255];			 
	// }

	// function rainbowDepthToArray(coord){ // between 0-Math.pow(255, 3)
	// 	var red, green, blue;
		
	// 	red = coord & 255;
	// 	green = (coord & parseInt("0FF00", 16)) >>> 8; //8 -> two hexa digits
	// 	blue = (coord & parseInt("FF000", 16)) >>> 12;
	// 	return [red, green, blue, 255]; 
	// }
	// function goldenAgeDepthToArray(coord){
	// 	var red, green, blue;
		
	// 	red = coord & parseInt("0FF", 16);
	// 	green = coord & parseInt("0FF", 16);
	// 	blue = (coord & parseInt("FF0", 16)) >>> 4;
	// 	return [red, green, blue, 255]; 
	// }

	// function hellfireDepthToArray(coord){
	// 	var red, green, blue;

	// 	red = (coord & parseInt("FF0", 16)) >>> 4;
	// 	green = coord & parseInt("0FF", 16);
	// 	blue = coord & parseInt("0FF", 16);
	// 	return [red, green, blue, 255]; 	
	// }

	// function greenThunderDepthToArray(coord){
	// 	var red, green, blue;
		
	// 	red = (coord & parseInt("FF0", 16)) >>> 4;
	// 	green = coord & parseInt("0FF", 16);
	// 	blue = (coord & parseInt("FF0", 16)) >>> 4;
	// 	return [red, green, blue, 255]; 
	// }

	// function bloodyDuskDepthToArray(coord){
	// 	var red, green, blue;
		
	// 	red = coord & parseInt("0FF", 16);
	// 	green = (coord & parseInt("FF0", 16)) >>> 4;
	// 	blue = (coord & parseInt("FF0", 16)) >>> 4;
	// 	return [red, green, blue, 255]; 
	// }
	// function bluesDepthToArray(coord){
	// 	var red, green, blue;
		
	// 	red = (coord & parseInt("FF0", 16)) >>> 4;
	// 	green = (coord & parseInt("FF0", 16)) >>> 4;
	// 	blue = coord & parseInt("0FF", 16);
	// 	return [red, green, blue, 255]; 
	// }
	// function pinkFireDepthToArray(coord){
	// 	var red, green, blue;
	// 	var deg = Math.PI/360;
		
	// 	red = (255 >>> 1) + Math.cos(deg * coord) * (255 >>> 1); 
	// 	blue = (255 >>> 1) + Math.sin(deg * coord) * (255 >>> 1);
	// 	green = Math.floor(255 / colorScheme.RGBColorNumbers * coord);
	// 	return [red, green, blue, 255]; 
	// }
	// function greenIceDepthToArray(coord){
	// 	var red, green, blue;
	// 	var deg = Math.PI/360;
			
	// 	blue = (255 >>> 1) + Math.cos(deg * coord) * (255 >>> 1); 
	// 	green = (255 >>> 1) + Math.sin(deg * coord) * (255 >>> 1); 
	// 	red = Math.floor(255 / colorScheme.RGBColorNumbers * coord);
	// 	return [red, green, blue, 255]; 
	// }
}
