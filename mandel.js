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
		DEFAULT_DEPTH : 20,
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
		tipMouseDisplay : true,
			// when document loads, there is a tip about the enlargement, 
			// but after the first enlargement, there is no need for 
			// this tip any more, so this is an indicator 
			// if the enlargement has already happended
		tipIterationDisplay: false,
		bigNumber : false,
		worker : new Worker("mandel_worker.js"),
		actualDepthArray : [],
		row : 0,
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
		if (d !== this.DEFAULT_DEPTH && this.tipIterationDisplay) {
			this.setTip("tip_iteration", "none");
			this.tipIterationDisplay = false;
				// if the value of the itaration is has been set,
				// there is no need for the tip about the iteration
		}
	}
	mandel.setTip = function(tipID, display){
			document.getElementById(tipID).style.display = display;
	}
	mandel.bigNumberToBigObject = function(bignumber){
		var bigObject = {};
		bigObject.c = bignumber.c; // an array
		bigObject.e = bignumber.e; // 
		bigObject.s = bignumber.s; // 
		return bigObject;
	} 

	mandel.sendMessageToWorker = function(){
		var aComplexIterated;
		var bComplexIterated;
		var step;

		if (!mandel.bigNumber){
			aComplexIterated = this.aComplexIterated;
			bComplexIterated = this.bComplexIterated;
			step = this.step;
		}
		else {
			aComplexIterated = this.bigNumberToBigObject(this.aComplexIterated);
			bComplexIterated = this.bigNumberToBigObject(this.bComplexIterated);
			step = this.bigNumberToBigObject(this.step);
		}
		var message = {aComplexIterated : aComplexIterated,
										bComplexIterated : bComplexIterated,
										canvasSize : this.canvasSize,
										bigNumber : mandel.bigNumber,
										step : step, 
										maxDepth : this.maxDepth
									};
		var jsonMessage = JSON.stringify(message);

		//[mandel.aComplexIterated, mandel.bComplexIterated, mandel.canvasSize, mandel.bigNumber, mandel.step, mandel.maxDepth];
			mandel.worker.postMessage(jsonMessage);
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
				if (mandel.mouseUpX !== mandel.mouseDownX || mandel.mouseUpY !== mandel.mouseDownY){
					if (!mandel.colorSchemeDemoModeOn) {
						if (mandel.tipMouseDisplay){
							mandel.setTip("tip_mouse", "none");
							mandel.tipMouseDisplay = false;
							mandel.setTip("tip_iteration", "block");
							mandel.tipIterationDisplay = true;
								// let's show the next tip about the iteration
						}
						mandel.mandelbrot();
					}
				}
				else {
					// console.log("hello");
					// this can be a possible brakepoint
					// it executes when you click down and up in the same point
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
	   	if (Math.abs(mandel.mouseDownX - mandel.mouseUpX) > 40) {
	   			// if you only want to swipe, then there need no enlargement
	   			// we suppose that you want to swipe if the difference between
	   			// the down and up X coord. <= 40px
		   	if (mandel.mouseUpX !== mandel.mouseDownX){
					if (mandel.tipMouseDisplay){
						mandel.setTip("tip_mouse", "none");
						mandel.tipMouseDisplay = false;
						mandel.setTip("tip_iteration", "block");
						mandel.tipIterationDisplay = true;
							// let's show the next tip about the iteration
					}
					mandel.mandelbrot();
				}  	 	
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



		// ***********************************************************



		mandel.worker.addEventListener('message', function(e) {
  			mandel.actualDepthArray = e.data;
  			afterWorkerSentMessage();

				function afterWorkerSentMessage(){
					var actualDepth;

					for (var lineX = 0; lineX < mandel.canvasSize; lineX++) {
						actualDepth = mandel.actualDepthArray[lineX];
						mandel.imgData.data[lineX * 4 + 0] = mandel.colorArrays.arrays[actualDepth][0];
						mandel.imgData.data[lineX * 4 + 1] = mandel.colorArrays.arrays[actualDepth][1];
						mandel.imgData.data[lineX * 4 + 2] = mandel.colorArrays.arrays[actualDepth][2];
						mandel.imgData.data[lineX * 4 + 3] = mandel.colorArrays.arrays[actualDepth][3];

						mandel.depthArray.push(actualDepth);
					}
			
						// saving the depth data of the point
						// for later color manipulation
						// and saving the data to files (TODO)

					setTimeout(mandel.ctx.putImageData(mandel.imgData, 0, mandel.row),1); 

					mandel.row += 1;
					if (mandel.row > mandel.canvasSize) {
						mandel.row = 0; // stop drawing the lines
						mandel.ready = true;
					}
					else {
						if (!mandel.bigNumber) {
							mandel.bComplexIterated -= mandel.step;
						} 
						else {
							mandel.bComplexIterated = math.subtract(mandel.bComplexIterated, mandel.step);
						}
						mandel.sendMessageToWorker();
					}
				}
			}, false);
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
		this.range = 9.321363125813775e-14;//4; 
			// if you only want to test bignumber, 
			// add this value to this.range: 9.321363125813775e-14;
		this.aStartInActualRange = -0.017355275925516306;//-2;
			// if you only want to test bignumber, 
			// add this value to this.aStartInActualRange: -0.017355275925516306;
		this.bStartInActualRange = 1.0043295723343555;//2; 
			// if you only want to test bignumber, 
			// add this value to this.bStartInActualRange: 1.0043295723343555;
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
			//clearInterval(this.mandelClear);
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
	
		// we want to show the image line per line
		// row is the Y coordinate of the actual line	of the canvas

		initFromMouseCoordinates();
		
		this.sendMessageToWorker();

		//this.mandelClear = setInterval(putMandelLine, 1); // to start drawing the lines
		return;

		// function putMandelLine(){
		// 	//mandelLine();
			

		// 	//mandel.ctx.putImageData(mandel.imgData, 0, row); // put a line
		// 	mandel.row += 1;
		// 	if (!mandel.bigNumber) {
		// 		mandel.bComplexIterated -= mandel.step;
		// 	} 
		// 	else {
		// 		mandel.bComplexIterated = math.subtract(mandel.bComplexIterated, mandel.step);
		// 	}
		// 	if (mandel.row > mandel.canvasSize) {
		// 		clearInterval(mandel.mandelClear); // stop drawing the lines
		// 		mandel.ready = true;
		// 	}
		// }

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
					mandel.setTip("tip_bignumber", "block");
					// show warning about the limit of the standard js numbers
				}
				if (mandel.range < 5e-13) {
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
					mandel.setTip("tip_bignumber", "none");
						// there is no need for the tip any more
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

			// var actualDepthArray = mandelWorker(mandel.aComplexIterated, mandel.bComplexIterated, mandel.canvasSize, mandel.bigNumber, mandel.step, mandel.maxDepth);
			
			
			// function mandelCalcNotBigNumber(cNumber){
			// 	var cLength = cNumber.a * cNumber.a + cNumber.b * cNumber.b;
			// 		// calculate the length of the complex number,
			// 		// more precisely the square of the length, thus we
			// 		// don't need to calculate the square root
			// 	var z;
			// 	while ((cLength <= 4) && (mandel.actualDepth !== mandel.maxDepth)) {
			// 			// if the square of the lenght larger than 4, 
			// 			// it will escape to infinity
			// 		z = {};
			// 		z.a = cNumber.a * cNumber.a - cNumber.b * cNumber.b;
			// 		z.b = 2 * cNumber.a * cNumber.b;
			// 		z.a += cStartNumber.a;
			// 		z.b += cStartNumber.b;
			// 		cNumber = z;
			// 		cLength = cNumber.a * cNumber.a + cNumber.b * cNumber.b;
			// 		mandel.actualDepth++;	
			// 	}
			// }

			// function mandelCalcBigNumber(cNumber){
			// 	var cLength = math.add(math.square(cNumber.a), math.square(cNumber.b));
			// 		// calculate the length of the complex number,
			// 		// more precisely the square of the length, thus we
			// 		// don't need to calculate the square root
			// 	var z;
			// 	while (math.smallerEq(cLength, 4) && (mandel.actualDepth !== mandel.maxDepth)) {
			// 			// if the square of the lenght larger than 4, 
			// 			// it will escape to infinity
			// 		z = {};
			// 		z.a = math.subtract(math.square(cNumber.a), math.square(cNumber.b));
			// 		z.b = math.multiply(cNumber.a, cNumber.b);
			// 		z.b = math.add(z.b, z.b);
			// 		z.a = math.add(z.a, cStartNumber.a);
			// 		z.b = math.add(z.b, cStartNumber.b);
			// 		cNumber = z;
			// 		cLength = math.add(math.square(cNumber.a), math.square(cNumber.b));
			// 		mandel.actualDepth++;	
			// 	}
			// }			
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

	function mandelWorker(aComplexIterated, bComplexIterated, canvasSize, bigNumber, step, maxDepth){
		var cStartNumber = {a : aComplexIterated, b : bComplexIterated};
		var actualDepth;
		var actualDepthArray = [];

		for (var lineX = 0; lineX < canvasSize; lineX++) {
				actualDepth = 0;
				
				if (!bigNumber) {
					mandelCalcNotBigNumber(cStartNumber); // modifies mandel.actualDepth
				}
				else {
					mandelCalcBigNumber(cStartNumber);
				}
				
					actualDepthArray.push(actualDepth);

				if (!bigNumber) {
					cStartNumber.a = cStartNumber.a + step;
				}
				else {
					cStartNumber.a = math.add(cStartNumber.a, step);
				}				
		}
		return actualDepthArray;

		function mandelCalcNotBigNumber(cNumber){
					var cLength = cNumber.a * cNumber.a + cNumber.b * cNumber.b;
						// calculate the length of the complex number,
						// more precisely the square of the length, thus we
						// don't need to calculate the square root
					var z;
					while ((cLength <= 4) && (actualDepth !== maxDepth)) {
							// if the square of the lenght larger than 4, 
							// it will escape to infinity
						z = {};
						z.a = cNumber.a * cNumber.a - cNumber.b * cNumber.b;
						z.b = 2 * cNumber.a * cNumber.b;
						z.a += cStartNumber.a;
						z.b += cStartNumber.b;
						cNumber = z;
						cLength = cNumber.a * cNumber.a + cNumber.b * cNumber.b;
						actualDepth++;	
					}
		}

		function mandelCalcBigNumber(cNumber){
					var cLength = math.add(math.square(cNumber.a), math.square(cNumber.b));
						// calculate the length of the complex number,
						// more precisely the square of the length, thus we
						// don't need to calculate the square root
					var z;
					while (math.smallerEq(cLength, 4) && (actualDepth !== maxDepth)) {
							// if the square of the lenght larger than 4, 
							// it will escape to infinity
						z = {};
						z.a = math.subtract(math.square(cNumber.a), math.square(cNumber.b));
						z.b = math.multiply(cNumber.a, cNumber.b);
						z.b = math.add(z.b, z.b);
						z.a = math.add(z.a, cStartNumber.a);
						z.b = math.add(z.b, cStartNumber.b);
						cNumber = z;
						cLength = math.add(math.square(cNumber.a), math.square(cNumber.b));
						actualDepth++;	
					}
		}			
	}			

	// ----------- end functions -----------------------------------------------------------
	
	mandel.initialize();
	mandel.mandelbrot();

	
