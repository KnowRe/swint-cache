'use strict';

var redis = require('redis'),
	swintHelper = require('swint-helper'),
	defaultize = swintHelper.defaultize;

module.exports = function(options, callback) {
	defaultize({
		host: 'localhost',
		pass: '',
		port: 6379,
		db: 0
	}, options);

	return new Cache(options, callback);
};

var Cache = function(options, callback) {
	this.options = options;
	this.callback = callback;

	this._initialize(options);
};

var _ = Cache.prototype;

_._initialize = function(options) {
	var that = this;
	
	this.client = redis.createClient(options.port, options.host);

	if(options.pass) {
		this.client.auth(options.pass, function(err) {
			if(err) {
				that.callback(err,null);
			}
		});
	}
	this.client.select(options.db);

	this.client.on('connect', function() {
		that.client.send_anyway = true;
		that.client.select(options.db);
		that.client.send_anyway = false;
		that.client.exists('stats:hits',function(err, reply) {
			if(reply != 1){
				that._resetStats('stats:hits');
				that._resetStats('stats:misses');				
			}
		});
		that.callback(null, that);
	});

	this.client.on('error', function(){
		that.callback(new Error('connect error'),null);
	});
};

_.ttl = function(key, ttl, cb){
	this.client.expire(key, ttl, function(err, reply) {
		cb(err,reply);
	});
};

_.get = function(key, cb) {
	var that = this;

	this.client.get(key, function(err, reply) {
		if(err) {
			cb(err, null);
		} else if(!reply) {
			that._increaseStats('stats:misses');
			cb(null, null);
		} else {
			that._increaseStats('stats:hits');
			cb(null, JSON.parse(reply));
		}
	});
};

_.set = function(key, value, ttl, cb) {
	this.client.setex(key, ttl, JSON.stringify(value), cb);
};

_.setCacheWrapper = function(object, method, wrapperFunc) {
	var fn = object[method];

	return object[method] = function() {
		return wrapperFunc.apply(this, [fn.bind(this)].concat(Array.prototype.slice.call(arguments)));
	};
};

_.getHitRate = function(cb) {
	var hits = 0,
		misses = 0,
		that = this;

	this.client.get('stats:hits', function(err, reply) {
		if(err) {
			cb(err, null);
		} else {
			hits = Number(reply);
			that.client.get('stats:misses',function(err, reply) {
				if(err) {
					cb(err, null);
				} else {
					misses = Number(reply);
					cb(null, String(Math.floor(hits / (hits + misses) * 100)) + '%');
				}
			});
		}
	});
};

_._resetStats = function(key) {
	this.client.set(key, '0');
};

_._increaseStats = function(key) {
	var that = this;

	this.client.exists(key,function(err, reply) {
		if(err) {
			that.callback(err, reply);
		} else if(reply === 1) {
			that.client.incr(key);
		} else {
			that._resetStats(key);
		}
	});
};

_.dbsize = function(cb) {
	return this.client.dbsize(cb);
};

_.del = function(key, cb) {
	this.client.del(key, cb);
};

_.end = function() {
	this.client.end();
};
