# Zetta driver for Wemo

A driver to play with Wemo devices.

## Install

```
$ git clone https://github.com/timonreinhard/zetta-wemothat-driver
```

## Usage

```
var zetta = require('zetta');
var Wemo = require('zetta-wemothat-driver');

zetta()
  .use(Wemo)
  .listen(1337)
```

## Devices

### Wemo Bulb

#### Transitions

##### turnOn()

Turns the bulb on.

##### turnOff()

Turns the bulb off.

##### dim(level = 0-255)

Turns the bulb on and dims it to the given level.

## Credits

All credit goes to [Ben Hardill](http://www.hardill.me.uk/wordpress/tag/wemo/) for his research on Belkin's Wemo devices.
