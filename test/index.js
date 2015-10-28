'user strict';

var assert = require('assert'),
	path = require('path'),
	fs = require('fs'),
	RedisCache = require('../lib');

global.swintVar.printLevel = 5;

describe('Cache test', function() {
	var testValue1 = {
			a: 1,
			b: 2
		},
		cacheInst;

	before(function(done) {
		var credPath = path.join(process.env.HOME, '.swint', 'swint-redis-cache-test.json'),
			cred = JSON.parse(fs.readFileSync(credPath));

		new RedisCache(cred, function(err, redisCache) {
			cacheInst = redisCache;
			done();
		});
	});

	it('should match hit rate', function(done) {
		cacheInst.set('aaa', testValue1, 30, function(err, reply) {
			cacheInst.get('bbb', function(err, reply) {
				cacheInst.get('aaa', function(err, reply) {
					assert.deepEqual(reply, {
						a: 1,
						b: 2
					});
					setTimeout(function(){
						return cacheInst.getHitRate.call(cacheInst, function(err, rate) {
							cacheInst.end();
							done();
						});
					}, 500);
				});
			});
		});
	});
});
