##Zetta Wemo Light driver for any platform

###Install

```
$> git clone https://github.com/timonreinhard/zetta-wemolight-driver
```

###Usage

```
var zetta = require('zetta');
var WemoLight = require('zetta-wemolight-driver');

zetta()
  .use(WemoLight)
  .listen(1337)
```

### Hardware

* any platform

###Transitions

#####do(message)

Calls the device's log() function passing the message param.

###Design

This device driver is designed to be the starter code for other device drivers.
