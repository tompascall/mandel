// mandel_worker.js
// worker for mandel.js

"use strict";

importScripts('math/math.min.js');

math.config({
  	number: 'bignumber',  // Default type of number: 'number' (default) or 'bignumber'
  	precision: 64         // Number of significant digits for BigNumbers
	});
		// configuring math.js
		

self.addEventListener('message', function(e) {
  
	var aComplexIterated;
	var bComplexIterated;
	var step;

	var message = JSON.parse(e.data);

	if (!message.bigNumber){
			aComplexIterated = message.aComplexIterated;
			bComplexIterated = message.bComplexIterated;
			step = message.step;
		}
		else {
			aComplexIterated = bigObjectToBigNumber(message.aComplexIterated);
			bComplexIterated = bigObjectToBigNumber(message.bComplexIterated);
			step = bigObjectToBigNumber(message.step);
		}

  var sendMessage = mandelWorker(aComplexIterated, bComplexIterated, message.canvasSize, message.bigNumber, step, message.maxDepth);
  
  self.postMessage(sendMessage);
}, false);

function bigObjectToBigNumber(big){
	var bignumber = math.bignumber();
	bignumber.c = big.c;
	bignumber.e = big.e;
	bignumber.s = big.s;
	return bignumber;
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