# Zetta driver for Wemo

A driver based on [wemo-client](https://github.com/timonreinhard/wemo-client) to play with Wemo devices.

## Supported Hardware

  * [x] Wemo Light Bulb
  * [x] Wemo Insight Switch
  * [x] Wemo Switch
  * [x] Wemo Motion
  * [ ] Wemo Maker
  * [ ] Osram Lightify TW
  * [ ] Osram Flex RGBW
  * [ ] Osram Gardenspot RGB

## Install

```
$ npm install timonreinhard/zetta-wemothat-driver
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

### Wemo Motion

This sensor emits the states `motion` or `quiet`.

### Wemo Bulb

#### Transitions

##### turnOn()

Turns the bulb on.

##### turnOff()

Turns the bulb off.

##### dim(level = 0-255)

Turns the bulb on and dims it to the given level.

### Wemo Switch

#### Transitions

##### turnOn()

Turns the switch on.

##### turnOff()

Turns the switch off.

### Wemo Insight Switch

#### Streams

##### power

The current power consumption of the device in watts.

#### Transitions

##### turnOn()

Turns the switch on.

##### turnOff()

Turns the switch off.

## License

Published under the [MIT License](https://github.com/timonreinhard/zetta-wemothat-driver/blob/master/LICENSE.md).
