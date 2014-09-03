// mandel.js


	"use strict";

	math.config({
  	number: 'bignumber',  // Default type of number: 'number' (default) or 'bignumber'
  	precision: 64         // Number of significant digits for BigNumbers
	});
		// configuring math.js
	
	var mandel = {
		c : document.getElementById("mandelCanvas"),
		inputCanvasSize : document.getElementById("inputCanvasSize"),
		DEFAULT_CANVAS_SIZE : 350, 
			// the canvas is a square
		canvasSize : 0,
			// actual canvas size
		ctx : null,
			// canvas context
		imgData : null,
		DEFAULT_DEPTH : 50,
		maxDepth : 0,
			// mandel.maxDepth devides the color-scale of the color scheme into equal parts
			// if mandel.maxDepth is 1, we have 2 parts, if 2, we have 3 parts etc.  
		actualDepth : 0,
		depthArray : [],
			// an array that contains the depths of all the point in the canvas
			// for setting the color schemes immediately, and
			// may be later for saving the datas to files
		colorScheme : 0,
		colorArrays : null,
		mandelClear : null,
			// reference for setInerval that stops the drawing
		range : 0,
			// range is the width (and heigth) of the complex area
			// the actual range is based on the enlargement
			// at the beginning, it is equal to 4
		step : 0,
			// the X (and Y) step in the complex plane
			// it must be recalculate if range is changed
		mouseDownX : 0,
		mouseDownY : 0,
		mouseUpX : 0,
		mouseUpY : 0,
		leftClick : false,
			// it will be false if in is not clicked with left mouse button
		ready : true,
			// it will be false, when the mandel calculation is progressing
		colorSchemeDemoModeOn : false,
			// it will be true, while demoScheme is active
		demoSchemeIsRunning : false,
			// it is true while demoScheme() is running
		aStartInActualRange : 0,
		bStartInActualRange : 0,
		aComplexIterated : 0,
		bComplexIterated : 0,
			// we need the upper-left point of the complex area
			// at the beginning, it is equal to (-2 + 2i)
			// aStartInActualRange and bStartInActualRange need for enlargement,
			// aComplexIterated and bComplexIterated are the actual point we counting
			// a is the complex part, 
			// b is the imaginary part of the complex number
			// see more: http://en.wikipedia.org/wiki/Complex_number
		tipExist : true,
			// there is an HTML tag (id="tip") about the enlargement, 
			// but when the mouse is used, there is no need for it any more,
			// so this is an indicator if the enlargement has already happended
		bigNumber : false
	};

	mandel.setCanvasSize = function(x){
		this.canvasSize = this.c.width = this.c.height = x;
	}
	mandel.setInputCanvasSize = function(x){
		mandel.inputCanvasSize.value = x;
	}
	mandel.getInputCanvasSize = function(){
		return Number(mandel.inputCanvasSize.value);
	}
	mandel.setCanvasContext = function(){
		this.ctx = this.c.getContext("2d");
	}
	mandel.setImgData = function(){
		this.imgData = this.ctx.createImageData(this.canvasSize, 1); // a simple line
	}
	mandel.setStep = function(){
		if (!this.bigNumber) {
			this.step = this.range / this.canvasSize;
		}
		else {
			this.step = math.divide(this.range, this.canvasSize);
		}
	}
	mandel.setMouseCoordinates = function(){
		this.mouseDownX = this.mouseDownY = 0;
		this.mouseUpX = this.mouseUpY = this.canvasSize;
	}
	mandel.setColorScheme = function(){
		this.colorScheme = this.getRadioValue("schemes");
	}
	mandel.setColorArrays = function(){
		this.colorArrays = createColorArrays(this.maxDepth, this.colorScheme);
		  // the createColorArrays function is in colorarrays.js
	}
	mandel.setDepthInputToDefault = function(){ // init depth-input HTML element
			document.getElementById("depthInput").value = 
				this.DEFAULT_DEPTH.toString();
	}
	mandel.getDepthInput = function(){
		 return Number(document.getElementById("depthInput").value);
	}
	mandel.setMaxDepth = function(){
		var d = this.getDepthInput();
		this.maxDepth = d ? d : this.DEFAULT_DEPTH;
			// if depthInput cannot be interpreted, then comes the default value
	}
	mandel.delTip = function(){
		var parent = document.getElementById("upper_panel");
		var child = document.getElementById("tip");
		parent.removeChild(child);
		this.tipExist = false;
			// it deletes the tip tag from the DOM, when there is no need for this any more
	}
	mandel.setEvents = function(){
		$("#mandelCanvas").mousedown(function(e){
		if (e.which === 1){
			mandel.mouseDownX = e.pageX - this.offsetLeft;
			mandel.mouseDownY = e.pageY - this.offsetTop;
			mandel.leftClick = true; // if pushed left button
		}
		});	
			// this function gets the coordinates of  
			// mouse pointer over the canvas
			// when you push down the left mouse button

		$('#mandelCanvas').mouseup(function(e){			
			if (mandel.leftClick) {
				mandel.mouseUpX = e.pageX - this.offsetLeft;
				mandel.mouseUpY = e.pageY - this.offsetTop;
				if (mandel.mouseUpX !== mandel.mouseDownX && mandel.mouseUpY !== mandel.mouseDownY){
					if (!mandel.colorSchemeDemoModeOn) {
						if (mandel.tipExist){
							mandel.delTip();
						}
						mandel.mandelbrot();
					}
				}
				else {
					console.log("hello");
				}  			
				mandel.leftClick = false;
			}	  
		});
			// this function gets the coordinates of  
			// mouse pointer over the canvas
			// when you release the left mouse button
	
		mandel.c.addEventListener("touchstart", (function(e) {
	    mandel.mouseDownX = e.changedTouches[0].pageX - this.offsetLeft;
	    mandel.mouseDownY = e.changedTouches[0].pageY  - this.offsetTop;	
	    e.preventDefault();	 
		}), false);

		mandel.c.addEventListener("touchend", (function(e) {
	    mandel.mouseUpX = e.changedTouches[0].pageX - this.offsetLeft;
	    mandel.mouseUpY = e.changedTouches[0].pageY  - this.offsetTop;
	   	e.preventDefault();
	    if (mandel.mouseUpX !== mandel.mouseDownX && mandel.mouseUpY !== mandel.mouseDownY){
					if (mandel.tipExist){
						mandel.delTip();
					}
					mandel.mandelbrot();
			}  	    
		}), false);
			// snippets for mobile devices
			// source: http://www.javascriptkit.com/javatutors/touchevents.shtml


		$("input:radio").click(function(e){
			var savedImgData = mandel.ctx.createImageData(mandel.canvasSize, mandel.canvasSize); // the whole canvas
			if (mandel.ready) { // drawing of the set is finished
				mandel.setColorScheme();
				mandel.setColorArrays();
				if (!mandel.colorSchemeDemoModeOn) {
					copyDepthArrayDataToCanvas();
					setTimeout(function(){
						mandel.ctx.putImageData(savedImgData, 0, 0);
					}, 1);	
				}
				else if (!mandel.demoSchemeIsRunning) {
					mandel.demoScheme(); // actualizes color schemes when setting the radio buttons
				}
			}
			function copyDepthArrayDataToCanvas(){
				var depthArrayLenght = mandel.depthArray.length;
				var savedDepth;
				for (var i = 0; i < depthArrayLenght; i ++) {
					savedDepth = mandel.depthArray[i];
					savedImgData.data[i * 4] = mandel.colorArrays.arrays[savedDepth][0];
					savedImgData.data[i * 4 + 1] = mandel.colorArrays.arrays[savedDepth][1];
					savedImgData.data[i * 4 + 2] = mandel.colorArrays.arrays[savedDepth][2];
					savedImgData.data[i * 4 + 3] = 255;
				}
			} 
		});
	}
	// -------------- functions -----------------------------------------------------------

	mandel.getRadioValue = function(divId){
		var radioDiv = document.getElementById(divId);
		for (var i = 0; i < radioDiv.childElementCount; i++){
			if (radioDiv.children[i].checked) {
				return radioDiv.children[i].value;
			}
		}		
	}
	mandel.initialize = function(){
		this.range = 4;//9.321363125813775e-14; //4
		this.aStartInActualRange = -2;//-0.017355275925516306; //-2
		this.bStartInActualRange = 2;//1.0043295723343555; //2
		this.aComplexIterated = this.aStartInActualRange;
		this.bComplexIterated = this.bStartInActualRange;
		this.setInputCanvasSize(this.DEFAULT_CANVAS_SIZE);
		this.setCanvasSize(this.DEFAULT_CANVAS_SIZE);
		this.setCanvasContext();
		this.setImgData();
		this.setStep();
		this.setMouseCoordinates(); 
		this.setColorScheme();
		this.setDepthInputToDefault();
		this.setMaxDepth();
		this.setEvents();
	}
	mandel.restart = function(){
		this.initialize();
		this.mandelbrot();
	}

	mandel.mandelbrotIntro = function(){
		if (!this.ready) { 
			clearInterval(this.mandelClear);
				// if putMandelLine() has been arleady running via setInterval, it must be stopped
		}
		this.ready = false; 
			// the show is being started; it is a status flag
		this.setMaxDepth();
			// if Depth input is changed, it must be actualized	
		this.depthArray = []; 
			// set/reset the depth array that contains all the depth values of
			// the points of the canvas
		this.colorSchemeDemoModeOn = false; // if demo mode is on, it must be finished
	
		var actualCanvasSize = this.getInputCanvasSize();
		
		if (actualCanvasSize !== this.canvasSize){ // Canvas size has been changed
			this.setCanvasSize(actualCanvasSize);
			this.setMouseCoordinates();
			// drawing is based on mouse coordinates
			// in order to enlargement;
			this.setStep();
			this.setImgData();
		}
		this.setColorScheme();
		this.setColorArrays();
		// Create mandel.colorArrays based on the scheme and mandel.maxDepth
		// It's length is mandel.maxDepth
		// The createColorArrays function is located in colorarrays.js
		// it returns an object: {arrays, sheme};
		// the arrays is an array with RGBA codes, e.g. [255, 255, 255, 255], 
		// the scheme is an object: {schemeName, RGBColorNumbers, calculatorFunction}
	}

	mandel.mandelbrot = function(){ // entry point for the calculation and drawing
		
		this.mandelbrotIntro();
	
		var row = 0; 
		// we want to show the image line per line
		// row is the Y coordinate of the actual line	of the canvas

		initFromMouseCoordinates();
		this.mandelClear = setInterval(putMandelLine, 1); // to start drawing the lines
		return;

		function putMandelLine(){
			mandelLine();
			mandel.ctx.putImageData(mandel.imgData, 0, row); // put a line
			row += 1;
			if (!mandel.bigNumber) {
				mandel.bComplexIterated -= mandel.step;
			} 
			else {
				mandel.bComplexIterated = math.subtract(mandel.bComplexIterated, mandel.step);
			}
			if (row > mandel.canvasSize) {
				clearInterval(mandel.mandelClear); // stop drawing the lines
				mandel.ready = true;
			}
		}

		function initFromMouseCoordinates(){

			var aLeftUpper;
			var bLeftUpper;
			var aRightBottom;
			var bRightBottom;
			var changer;

			if (!mandel.bigNumber) {
				aLeftUpper = mandel.aStartInActualRange + mandel.mouseDownX * mandel.step;
				bLeftUpper = mandel.bStartInActualRange - mandel.mouseDownY * mandel.step;
				aRightBottom = mandel.aStartInActualRange + mandel.mouseUpX * mandel.step;
				bRightBottom = mandel.bStartInActualRange - mandel.mouseUpY * mandel.step;
				
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
				mandel.range = aRightBottom - aLeftUpper; // new range
				if (mandel.range < 1e-11) {
					document.getElementById("bignumber").style.display = "block";
				}
				if (mandel.range < 1e-13) {
					mandel.bigNumber = true;
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
					document.getElementById("bignumber").style.display = "none";
				}				
			};

			if (mandel.bigNumber) {
				aLeftUpper = math.add(mandel.aStartInActualRange, math.multiply(mandel.mouseDownX, mandel.step));
				bLeftUpper = math.subtract(mandel.bStartInActualRange, math.multiply(mandel.mouseDownY, mandel.step));
				aRightBottom = math.add(mandel.aStartInActualRange, math.multiply(mandel.mouseUpX, mandel.step));
				bRightBottom = math.subtract(mandel.bStartInActualRange, math.multiply(mandel.mouseUpY, mandel.step));

				if (math.larger(aLeftUpper, aRightBottom)) {
					changer = aLeftUpper;
					aLeftUpper = aRightBottom;
					aRightBottom = changer;
						// if you create the new area from right to left
				}
				if (math.smaller(bLeftUpper, bRightBottom)) {
					changer = bLeftUpper;
					bLeftUpper = bRightBottom;
					bRightBottom = changer;
					// if you create the new area from right to left
				}
				mandel.range = math.subtract(aRightBottom, aLeftUpper); // new range
			}

			mandel.aStartInActualRange = aLeftUpper;
			mandel.bStartInActualRange = bLeftUpper;
			mandel.aComplexIterated = mandel.aStartInActualRange;
			mandel.bComplexIterated = mandel.bStartInActualRange;

			mandel.setStep(); // new step

			mandel.setMouseCoordinates();
			// the original values must be reset 
			// in case there is no enlargement the next session
		}

		function mandelLine() {
			// we will generate the picture from single lines
			// cStartNumber is the complex number, with which we start counting the actual point
			var cStartNumber = {a : mandel.aComplexIterated, b : mandel.bComplexIterated};
				
			for (var lineX = 0; lineX < mandel.canvasSize; lineX++) {
				mandel.actualDepth = 0;
				
				if (!mandel.bigNumber) {
					mandelCalcNotBigNumber(cStartNumber); // modifies mandel.actualDepth
				}
				else {
					mandelCalcBigNumber(cStartNumber);
				}
				
	
					mandel.imgData.data[lineX * 4 + 0] = mandel.colorArrays.arrays[mandel.actualDepth][0];
					mandel.imgData.data[lineX * 4 + 1] = mandel.colorArrays.arrays[mandel.actualDepth][1];
					mandel.imgData.data[lineX * 4 + 2] = mandel.colorArrays.arrays[mandel.actualDepth][2];
					mandel.imgData.data[lineX * 4 + 3] = mandel.colorArrays.arrays[mandel.actualDepth][3];

				if (!mandel.bigNumber) {
					cStartNumber.a = cStartNumber.a + mandel.step;
				}
				else {
					cStartNumber.a = math.add(cStartNumber.a, mandel.step);
				}
				mandel.depthArray.push(mandel.actualDepth);
				// saving the depth data of the point
				// for later color manipulation
				// and saving the data to files (TODO)
			}
	
			function mandelCalcNotBigNumber(cNumber){

				if ((cLength(cNumber) > 4) || (mandel.actualDepth === mandel.maxDepth)) {
						// if the square of the lenght larger than 4, 
						// it will escape to infinity
					return;
				}
				else {				
					cNumber = iterate(cNumber);
					mandelCalcNotBigNumber(cNumber);
					return;
				}
				
				function cLength(cNumber) {
				
						return Math.pow(cNumber.a, 2) + Math.pow(cNumber.b, 2);
							// calculate the length of the complex number,
							// more precisely the square of the length, thus we
							// don't need to calculate the square root
					
				}

				function iterate(cNumber) {
					
					var z = {};
	
						z.a = Math.pow(cNumber.a, 2) - Math.pow(cNumber.b, 2);
						z.b = 2 * cNumber.a * cNumber.b;
						z.a += cStartNumber.a;
						z.b += cStartNumber.b;
					
					mandel.actualDepth++;
					return z;
				}
			}

			function mandelCalcBigNumber(cNumber){

				if (math.larger(cLength(cNumber), 4) || (mandel.actualDepth === mandel.maxDepth)) {
						// if the square of the lenght larger than 4, 
						// it will escape to infinity
					return;
				}
				else {				
					cNumber = iterate(cNumber);
					mandelCalcBigNumber(cNumber);
					return;
				}
				
				function cLength(cNumber) {
						return math.add(math.square(cNumber.a), math.square(cNumber.b));
							// calculate the length of the complex number
							// more precisely the square of the length, thus we
							// don't need to calculate the square root					
				}

				function iterate(cNumber) {
					
					var z = {};
					
						z.a = math.subtract(math.square(cNumber.a), math.square(cNumber.b));
						z.b = math.multiply(cNumber.a, cNumber.b);
						z.b = math.multiply(2, z.b);
						z.a = math.add(z.a, cStartNumber.a);
						z.b = math.add(z.b, cStartNumber.b);
									
					mandel.actualDepth++;
					return z;
				}
			}			
		}
	}

	mandel.demoScheme = function() {
		// this function shows the actual color scheme
		 
		
		if (this.ready) {
			this.colorSchemeDemoModeOn = true;
				// it is true while mandelbrot is not in progress
			this.demoSchemeIsRunning = true;
				// it is true while demoScheme() is in progress

			var actualDepthInput = this.getDepthInput();
			if (this.maxDepth !== actualDepthInput) { // if the depth input has been set
				this.maxDepth = actualDepthInput;
			}
			this.setColorArrays();

			var actualCanvasSize = this.getInputCanvasSize();
			if (actualCanvasSize !== this.canvasSize){ // Canvas size has been changed
				this.setCanvasSize(actualCanvasSize);
				this.setMouseCoordinates();
				this.setStep();
				this.setImgData();
			}
	
	
			var sectionNumber = this.colorArrays.arrays.length;
			var ratio = this.canvasSize / this.colorArrays.scheme.RGBColorNumbers;
			var sectionLength = (this.colorArrays.scheme.RGBColorNumbers / sectionNumber);
			var colorArraysIndex;
		
			

			for (var lineY = 0; lineY < this.canvasSize; lineY++) {
				for (var lineX = 0; lineX < this.canvasSize; lineX++){
					colorArraysIndex = Math.floor(lineX / ratio / sectionLength);
					this.imgData.data[lineX * 4] = this.colorArrays.arrays[colorArraysIndex][0];
					this.imgData.data[lineX * 4 + 1] = this.colorArrays.arrays[colorArraysIndex][1];
					this.imgData.data[lineX * 4 + 2] = this.colorArrays.arrays[colorArraysIndex][2];
					this.imgData.data[lineX * 4 + 3] = 255;

				}
				this.ctx.putImageData(this.imgData, 0, lineY);
			}
			this.demoSchemeIsRunning = false;
		}
		
	}

	// ----------- end functions -----------------------------------------------------------
	
	mandel.initialize();
	mandel.mandelbrot();

	