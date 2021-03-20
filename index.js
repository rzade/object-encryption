'use strict';
var jwt = require('jsonwebtoken');

function send(secret, data){
	return new Promise(function(resolve, reject) {
		var token = jwt.sign(data, secret);
		resolve(encodeR(secret, token));
	});
}

function sendExpireSecond(secret, data, exp = 15){
	return new Promise(function(resolve, reject) {
		var token = jwt.sign({ exp: Math.floor(Date.now()/1000)+exp, data }, secret);
		resolve(encodeR(secret, token));
	});
}

function admit(secret, data){
	return new Promise(function(resolve, reject) {
		const decoded_data = decodeR(secret, data);
		jwt.verify(decoded_data, secret, function(err, decoded) {
			if(decoded){
				delete decoded.iat;
				resolve(decoded);
			} else {
				reject({ error: { message: 'Not used anymore!' } });
			}
		});
	});
}

function decodeR(secret, decode){
	var secret_match = secret.match(/.{1}/g);
	var before = [];
	var after = [];
	decode.match(/.{1,18}/g).map((v,i) => {
		if(i>0){
			after.push(v);
		} else {
			before.push(v);
		}
	});
	let secret_match_minus = 0;
	let last = [];
	after.join('').match(/.{1,4}/g).map((v2,i2) => {
		const x = secret_match[secret_match_minus]||'';
		if(x) v2=v2.substring(1);
		last.push(v2);
		if(x) secret_match_minus++;
	});
	return [...before, ...last].join('');
}

function encodeR(secret, encode){
	var secret_match = secret.match(/.{1}/g);
	var before = [];
	var after = [];
	encode.match(/.{1,18}/g).map((v,i) => {
		if(i>0){
			after.push(v);
		} else {
			before.push(v+secret_match[0]);
		}
	});
	let last = [];
	let secret_match_minus = 1;
	after.map((v,i) => {
		let n = [];
		for(let v2 of v.match(/.{1,3}/g)){
			const x = secret_match[secret_match_minus]||'';
			n.push(v2+x);
			if(x) secret_match_minus++;
		}
		last.push(n.join(''));
	});
	return [...before, ...last].join('');
}

module.exports = { send, sendExpireSecond, admit };