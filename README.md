hapi-auth-mozu
[![Circle CI](https://circleci.com/gh/creativelive/hapi-auth-mozu.png?style=badge)](https://circleci.com/gh/creativelive/hapi-auth-mozu)
==============

MOZU ecommerce request authentication plugin

Provide a hapi auth scheme `mozu` for handling validation of event callbacks from MOZU event subscription system.  The scheme requires the following options:
- `sharedSecret` - shared secret provided by MOZU for your application


## Install

```
npm install hapi-auth-mozu
```

## Use
```
var Hapi = require('hapi');
var server = new Hapi.Server();

var options = {
    sharedSecret: 'abcdefg'
};

server.pack.require('hapi-auth-mozu', function(err) {
    server.auth.strategy('default', 'mozu', options);
});
```
