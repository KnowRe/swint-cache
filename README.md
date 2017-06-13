# swint-redis-cache

[![Greenkeeper badge](https://badges.greenkeeper.io/Knowre-Dev/swint-redis-cache.svg)](https://greenkeeper.io/)
Redis cache for Swint

**Warning: This is not the final draft yet, so do not use this until its official version is launched**

## Installation
```sh
$ npm install --save swint-redis-cache
```

## Options
* `host` : `String`, default: `'localhost'`
* `pass` : `String`, default: `''`
* `port` : `Number`, default: `6379`
* `db` : `Number`, default: `0`
* Methods
  * `.set(key, data, ttl, callback)`
    * `key` : `String`
    * `data` : `Object`
    * `ttl` : `Number`
    * `callback`: `Function`
  * `.get(key, callback)`
    * `key` : `String`
    * `callback`: `Function`

## Usage
```javascript
var cacheInst;

new RedisCache(cred, function(err, redisCache) {
	cacheInst = redisCache;
	// ...
});

// ...

cacheInst.set('foo', data, 30, function(err, reply) {
	// ...
});

cacheInst.get('foo', function(err, reply) {
	// ...
});
```
