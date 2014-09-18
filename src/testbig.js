function createBigNumber(){
	var big = math.bignumber(0.123456789);
	console.log(big);
}

function bigNumberToBigObject(bignumber){
	big = {};
	big.c = bignumber.c; // an array
	big.e = bignumber.e; // 
	big.s = bignumber.s; // 
	return big;
} 

function bigObjectToBigNumber(big){
	var bignumber = math.bignumber();
	bignumber.c = big.c;
	bignumber.e = big.e;
	bignumber.s = big.s;
	return bignumber;
}

	var bignumber1 = math.bignumber("0.123456789123456789123456789");
	var bignumber2 = math.bignumber("1.23e-123456789");
	var bignumber3 = math.add(bignumber1, bignumber2);

	var big1 = bigNumberToBigObject(bignumber1);
	var bignumber4 = bigObjectToBigNumber(big1);
	
	if (math.equal(bignumber4, bignumber3)){
		console.log("ok");
	}

	