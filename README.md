# Zetta driver for Wemo

Extended Wemo driver for [Zetta](http://www.zettajs.org) that provides broader model support and handles device events.

## Supported Hardware

  * [x] Wemo Light Bulb
  * [x] Wemo Insight Switch
  * [x] Wemo Switch
  * [x] Wemo Motion
  * [ ] Wemo Maker
  * [ ] Osram Lightify TW
  * [x] Osram Flex RGBW
  * [ ] Osram Gardenspot RGB

## Install

```
$ npm install zetta-wemothat-driver
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

### Wemo (Color) Light

#### Transitions

##### turnOn()

Turns the bulb on.

##### turnOff()

Turns the bulb off.

##### dim(level = 0-255)

Turns the light on and dims it to the given level.

##### setColor(red = 0-255, green = 0-255, blue = 0-255)

Sets the light to the specified RGB color.

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

Published under the [MIT License](https://github.com/timonreinhard/zetta-wemothat-driver/blob/master/LICENSE).
