# Zetta Wemo Bridge driver for any platform

A *work-in-progress* driver to play with the Wemo Bridge.

## Install

```
$ git clone https://github.com/timonreinhard/zetta-wemo-bridge-driver
```

## Usage

```
var zetta = require('zetta');
var Wemo = require('zetta-wemo-bridge-driver');

zetta()
  .use(Wemo)
  .listen(1337)
```

## Hardware

* any platform

## Transitions

##### turnOn()

Turns the bulb on.

##### turnOff()

Turns the bulb off.

##### dim(level = 0-255)

Turns the bulb on and dims it to the given level.
