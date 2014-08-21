// mandel.js


	"use strict";

	var c = document.getElementById("mandelCanvas");
	var DEFAULT_CANVAS_SIZE = 350;
	document.getElementById("canvasSize").value = DEFAULT_CANVAS_SIZE;

	var CANVAS_WIDTH = c.width = DEFAULT_CANVAS_SIZE;
	var CANVAS_HEIGHT = c.height = DEFAULT_CANVAS_SIZE;
	// the canvas is a square

	var ctx = c.getContext("2d");
	var imgData = ctx.createImageData(CANVAS_WIDTH, 1); // a simple line
	
	var DEFAULT_DEPTH = 20;
	var maxDepth;
	var actualDepth;
	// maxDepth devides the color-scale of the color scheme into equal parts
	// if maxDepth is 1, we have 2 parts, if 2, we have 3 parts etc.  
	
	var depthArray;
	// an array that contains the depths of all the point in the canvas
	// for setting the color schemes immediately, and
	// may be later for saving the datas to files
	
	var colorScheme = getRadioValue("schemes");
	
	var colorArrays;

	var mandelClear;
	// reference for setInerval that stops the drawing 

	var range = 4;
	// range is the width (and heigth) of the complex area
	// the actual range is based on the enlargement
	// at the beginning, it is equal to 4

	var step = range / CANVAS_WIDTH; 
	// the X (and Y) step in the complex plane
	// it must be recalculate if range is changed
	
	var mouseDownX = 0;
	var mouseDownY = 0;
	var mouseUpX = CANVAS_WIDTH;
	var mouseUpY = CANVAS_HEIGHT;
	// if we marked out the whole canvas at the beginning

	var leftClick = false;
	// it will be false if in is not clicked with left mouse button
	
	var mandelReady = true;
	// it will be false, when the calculation is progressing
	
	var colorSchemeDemoModeOn = false;
	// it will be true, while demoScheme is active

	var demoSchemeRuns = false;
	// it is true while demoScheme() is running;

	var aStart = -2;
	var bStart = 2;
	var aComplex = aStart;
	var bComplex = bStart;
	// we need the upper-left point of the complex area
	// at the beginning, it is equal to -2, 2	
	// a is the complex part, 
	// b is the imaginary part of the complex number
	// see more: http://en.wikipedia.org/wiki/Complex_number
	
	// demoScheme(CANVAS_WIDTH, CANVAS_HEIGHT, ctx, imgData, colorArrays);
	// to demo the colorscheme comment out the upper line, 
	// and comment on the mandel(range, maxDepth); line
	// and you need colorArrays = createColorArrays(DEFAULT_DEPTH, colorScheme);
		
	//var m = mandel(range, DEFAULT_DEPTH);
	//var m = mandel();

		var initCanvas = function(){
			for (var row = 0; row < CANVAS_HEIGHT; row++) {
				for (var column = 0; column < CANVAS_WIDTH; column++) {
					imgData.data[column * 4 + 0] = 255;
					imgData.data[column * 4 + 1] = 255;
					imgData.data[column * 4 + 2] = 255;
					imgData.data[column * 4 + 3] = 255;

				}				
				ctx.putImageData(imgData, 0, row);
			}
		}

		var initDepth = function(){ // init depth-input HTML element
			document.getElementById("depthInput").value = 
				DEFAULT_DEPTH.toString();
		}

		//initCanvas(); // clear the canvas
		initDepth(); // initialize the depth input values
		mandel();

		//touch click helper
		// (function ($) {
  //   	$.fn.tclick = function (onclick) {
  //       this.bind("touchstart", function (e) { onclick.call(this, e); e.stopPropagation(); e.preventDefault(); });
  //       this.bind("click", function (e) { onclick.call(this, e); });        
  //       return this;
  //   	};
		// })(jQuery);

		// (function ($) {
  //   	$.fn.tclick = function (onclick) {
  //       this.bind("touchend", function (e) { onclick.call(this, e); e.stopPropagation(); e.preventDefault(); });
  //       this.bind("click", function (e) { onclick.call(this, e); });         
  //       return this;
  //   	};
		// })(jQuery);

		$("#mandelCanvas").mousedown(function(e){
  		if (e.which ===1){
  			mouseDownX = e.pageX - this.offsetLeft;
  			mouseDownY = e.pageY - this.offsetTop;
  			leftClick = true; // if pushed left button
  		}
 		});	
		// this function gets the coordinates of  
		// mouse pointer within the canvas

		$('#mandelCanvas').mouseup(function(e){
  		
  		if (leftClick) {
  			mouseUpX = e.pageX - this.offsetLeft;
  			mouseUpY = e.pageY - this.offsetTop;
  			if (mouseUpX !== mouseDownX && mouseUpY !== mouseDownY){
  				mandel();
  			}  			
  			leftClick = false;
  		}	
  
		});

		$("input:radio").click(function(e){
			var savedImgData = ctx.createImageData(CANVAS_WIDTH, CANVAS_HEIGHT); // the whole canvas
			if (mandelReady) { // drawing of the set is finished
				colorScheme = getRadioValue("schemes");
				colorArrays = createColorArrays(maxDepth, colorScheme);
				if (!colorSchemeDemoModeOn) {
					copyDepthArrayDataToCanvas();
					setTimeout(function(){
						ctx.putImageData(savedImgData, 0, 0);
					}, 1);	
				}
				else if (!demoSchemeRuns) {
					demoScheme();
				}
			}
			function copyDepthArrayDataToCanvas(){
				var depthArrayLenght = depthArray.length;
				var savedDepth;
				for (var i = 0; i < depthArrayLenght; i ++) {
					savedDepth = depthArray[i];
					savedImgData.data[i * 4] = colorArrays.arrays[savedDepth][0];
					savedImgData.data[i * 4 + 1] = colorArrays.arrays[savedDepth][1];
					savedImgData.data[i * 4 + 2] = colorArrays.arrays[savedDepth][2];
					savedImgData.data[i * 4 + 3] = 255;
				}
			} 
		});
		function getRadioValue(divId){
			var radioDiv = document.getElementById(divId);
			for (var i = 0; i < radioDiv.childElementCount; i++){
				if (radioDiv.children[i].checked) {
					return radioDiv.children[i].value;
				}
			}
		}
			
	
	// -------------- functions ------------------------

	function restart(){
		range = 4;
		document.getElementById("canvasSize").value = DEFAULT_CANVAS_SIZE;
		CANVAS_WIDTH = CANVAS_HEIGHT = DEFAULT_CANVAS_SIZE;
		c.width = c.height = CANVAS_WIDTH;	
		step = range / CANVAS_WIDTH; 
		mouseDownX = 0;
		mouseDownY = 0;
		mouseUpX = CANVAS_WIDTH;
		mouseUpY = CANVAS_HEIGHT;
		aStart = -2;
		bStart = 2;
		aComplex = aStart;
		bComplex = bStart;
		document.getElementById("depthInput").value = DEFAULT_DEPTH.toString();
	
		mandel();
	}

	

	function mandel(){ // entry point for the calculation and drawing
		
		if (!depthInput) { 
			// depthInput is a local variable, and 
			// has already been defined if putMandelLine() is running
			// in this case it must be stopped
			clearInterval(mandelClear);
		}

		var depthInput = Number(document.getElementById("depthInput").value);
		// get the depth number from HTML imput line

		maxDepth = depthInput ? depthInput : DEFAULT_DEPTH;
		// if depthInput is undefined then comes the default value
		
		depthArray = []; // set/reset the array
		mandelReady = false; // drawing is progressing
		colorSchemeDemoModeOn = false; // if demo mode was on, it is finished
		
		var actualCanvasSize = document.getElementById("canvasSize").value;
		
		if (actualCanvasSize !== CANVAS_WIDTH){ // Canvas size has been changed
			CANVAS_WIDTH = CANVAS_HEIGHT = actualCanvasSize;
			c.width = c.height = CANVAS_WIDTH;
			mouseUpX = CANVAS_WIDTH; 
			mouseUpY = CANVAS_HEIGHT;
			// drawing is based on mouse coordinates
			// in order to enlargement;
			step = range / CANVAS_WIDTH;
			imgData = ctx.createImageData(CANVAS_WIDTH, 1);
		}

		colorScheme = getRadioValue("schemes");
					
		var row = 0; 
		// we want to show the image line per line
		// row is the Y coordinate of the actual line	of the canvas

		colorArrays = createColorArrays(maxDepth, colorScheme);
		// Create colorArrays based on the scheme and maxDepth
		// It's length is maxDepth
		// The createColorArrays function is located in colorarrays.js
		// it returns an object: {arrays, sheme};
		// the arrays is an array with RGBA codes, e.g. [255, 255, 255, 255], 
		// the scheme is an object: {schemeName, RGBColorNumbers, calculatorFunction}

		//initCanvas();
		initFromMouseCoordinates();
		mandelClear = setInterval(putMandelLine, 1);
		return;

		function putMandelLine(){
			mandelLine();
			ctx.putImageData(imgData, 0, row);
			row += 1;
			bComplex -= step;
			if (row > CANVAS_HEIGHT) {
				clearInterval(mandelClear);
				mandelReady = true;
			}
		}

		function getRadioValue(divId){
			var radioDiv = document.getElementById(divId);
			for (var i = 0; i < radioDiv.childElementCount; i++){
				if (radioDiv.children[i].checked) {
					return radioDiv.children[i].value;
				}
			}
		}

		function initFromMouseCoordinates(){

			var aLeftUpper = aStart + mouseDownX * step;
			var bLeftUpper = bStart - mouseDownY * step;
			var aRightBottom = aStart + mouseUpX * step;
			var bRightBottom = bStart - mouseUpY * step;

			var changer;
			if (aLeftUpper > aRightBottom) {
				changer = aLeftUpper;
				aLeftUpper = aRightBottom;
				aRightBottom = changer;
				// if you create the new area from right to left
			}
			if (bLeftUpper < bRightBottom) {
					changer = bLeftUpper;
					bLeftUpper = bRightBottom;
					bRightBottom = changer;
					// if you create the new area from right to left
			}

			changer = aRightBottom - aLeftUpper; // new range
			// if (!changer) {
			// 	// if you mousedown and mouseup at the same point
			// 	aLeftUpper = aStart;
			// 	bLeftUpper = bStart;
			// 	// set back to original values
			// }
			// else {
				range = changer;

				aStart = aLeftUpper;
				bStart = bLeftUpper;
				aComplex = aStart;
				bComplex = bStart;

				step = range / CANVAS_WIDTH; // new step
			//}

			mouseDownX = mouseDownY = 0;
			mouseUpX = CANVAS_WIDTH;
			mouseUpY = CANVAS_HEIGHT;
			// the original values must be reset 
			// in case there is no enlargement the next session
		}

		function mandelLine() {
			// we will generate the picture from single lines
			// cStartNumber is the complex number, with which we start counting the actual point
			var cStartNumber = {a : aComplex, b : bComplex};
				
			for (var lineX = 0; lineX < CANVAS_WIDTH; lineX++) {
				actualDepth = 0;
				mandelCalc(cStartNumber); // modifies actualDepth
	
				//if (actualDepth < maxDepth) {
					imgData.data[lineX * 4 + 0] = colorArrays.arrays[actualDepth][0];
					imgData.data[lineX * 4 + 1] = colorArrays.arrays[actualDepth][1];
					imgData.data[lineX * 4 + 2] = colorArrays.arrays[actualDepth][2];
					imgData.data[lineX * 4 + 3] = colorArrays.arrays[actualDepth][3];
			//	}
				// else {
				// 	imgData.data[ lineX * 4 + 0] = 0;
				// 	imgData.data[lineX * 4 + 1] = 0;
				// 	imgData.data[lineX * 4 + 2] = 0;
				// 	imgData.data[lineX * 4 + 3] = 255;
				// }
				cStartNumber.a += step;
				depthArray.push(actualDepth);
				// saving the depth data of the point
				// for later color manipulation
				// and saving the data to files (TODO)
			}
	
			function mandelCalc(cNumber){

				if ((cLength(cNumber) > 2) || (actualDepth === maxDepth)) {
					return;
				}
				else {				
					cNumber = iterate(cNumber);
					mandelCalc(cNumber);
					return;
				}
				
				function cLength(cNumber) {
					return Math.sqrt(Math.pow(cNumber.a, 2) + 
						Math.pow(cNumber.b, 2));
				}

				function iterate(cNumber) {
					
					var z = {};
					z.a = Math.pow(cNumber.a, 2) - Math.pow(cNumber.b, 2);
					z.b = 2 * cNumber.a * cNumber.b;
					z.a += cStartNumber.a;
					z.b += cStartNumber.b;
					actualDepth++;
					return z;
				}
			}		
		}
	}

function demoScheme() {
		// this function shows the actual color scheme
		 
		
		if (mandelReady) {
			colorSchemeDemoModeOn = true;
			demoSchemeRuns = true;

			var actualDepthInput = Number(document.getElementById("depthInput").value);
			if (maxDepth !== actualDepthInput) { // if the depth input has been set
				maxDepth = actualDepthInput;
			}
			colorArrays = createColorArrays(maxDepth, colorScheme);

			var actualCanvasSize = document.getElementById("canvasSize").value;
			if (actualCanvasSize !== CANVAS_WIDTH){ // Canvas size has been changed
				CANVAS_WIDTH = CANVAS_HEIGHT = actualCanvasSize;
				c.width = c.height = CANVAS_WIDTH;
				mouseUpX = CANVAS_WIDTH; 
				mouseUpY = CANVAS_HEIGHT;
				// drawing is based on mouse coordinates
				// in order to enlargement;
				step = range / CANVAS_WIDTH;
				imgData = ctx.createImageData(CANVAS_WIDTH, 1);
			}
	
	
			var sectionNumber = colorArrays.arrays.length;
			var ratio = CANVAS_WIDTH / colorArrays.scheme.RGBColorNumbers;
			var sectionLength = (colorArrays.scheme.RGBColorNumbers / sectionNumber);
			var colorArraysIndex;
		
			

			for (var lineY = 0; lineY < CANVAS_HEIGHT; lineY++) {
				for (var lineX = 0; lineX < CANVAS_WIDTH; lineX++){
					colorArraysIndex = Math.floor(lineX / ratio / sectionLength);
					imgData.data[lineX * 4] = colorArrays.arrays[colorArraysIndex][0];
					imgData.data[lineX * 4 + 1] = colorArrays.arrays[colorArraysIndex][1];
					imgData.data[lineX * 4 + 2] = colorArrays.arrays[colorArraysIndex][2];
					imgData.data[lineX * 4 + 3] = 255;

				}
				ctx.putImageData(imgData, 0, lineY);
			}
			demoSchemeRuns = false;
		}
		
	}

	