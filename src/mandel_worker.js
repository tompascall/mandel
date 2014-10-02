// mandel_worker.js
// worker for mandel.js
// for local testing launch chrome width --allow-file-access-from-files
// sources: http://www.html5rocks.com/en/tutorials/workers/basics/
// https://developer.mozilla.org/en-US/docs/Web/Guide/Performance/Using_web_workers

"use strict";

importScripts('../libraries/mathjs/dist/math.min.js');

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

	if (!message.bigNumberMode){
			aComplexIterated = message.aComplexIterated;
			bComplexIterated = message.bComplexIterated;
			step = message.step;
		}
		else {
			aComplexIterated = bigObjectToBigNumber(message.aComplexIterated);
			bComplexIterated = bigObjectToBigNumber(message.bComplexIterated);
			step = bigObjectToBigNumber(message.step);
		}

  var sendMessage = mandelWorker(aComplexIterated, bComplexIterated, message.canvasSize, message.bigNumberMode, step, message.maxDepth);

  self.postMessage(sendMessage);
}, false);

function bigObjectToBigNumber(big){
	var bignumber = math.bignumber();
	bignumber.c = big.c;
	bignumber.e = big.e;
	bignumber.s = big.s;
	return bignumber;
}

function mandelWorker(aComplexIterated, bComplexIterated, canvasSize, bigNumberMode, step, maxDepth){
	var cStartNumber = {a : aComplexIterated, b : bComplexIterated};
	var actualDepth;
	var actualDepthArray = [];

	for (var lineX = 0; lineX < canvasSize; lineX++) {
			actualDepth = 0;

			if (!bigNumberMode) {
				mandelCalcNotBigNumber(cStartNumber); // modifies mandel.actualDepth
			}
			else {
				mandelCalcBigNumber(cStartNumber);
			}

				actualDepthArray.push(actualDepth);

			if (!bigNumberMode) {
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
