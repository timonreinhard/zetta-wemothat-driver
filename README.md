##Zetta Wemo driver for any platform

A *work-in-progress* driver to play with some of those newer Wemo devices.

###Install

```
$ git clone https://github.com/timonreinhard/zetta-wemothat-driver
```

###Usage

```
var zetta = require('zetta');
var Wemo = require('zetta-wemothat-driver');

zetta()
  .use(Wemo)
  .listen(1337)
```

### Hardware

* any platform

###Transitions

#####do(message)

Calls the device's log() function passing the message param.
