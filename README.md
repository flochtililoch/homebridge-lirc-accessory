# homebridge-lirc-accessory

Plugin for [Homebridge](https://github.com/nfarina/homebridge) proxying HomeKit requests to [lirc-state-api](https://github.com/flochtililoch/lirc-state-api) service. Let you control your infrared devices via HomeKit / Siri.

## Pre-requisite
[lirc-state-api](https://github.com/flochtililoch/lirc-state-api) service configured and running.

## Configuration

Assuming the service `lirc-state-api` is running on `localhost:3001`, and has a device `fan` with states `power`, `air` and `rotate`.

```json
  "accessories": [
    {
      "accessory": "homebridge-lirc-accessory.LIRC Accessory",
      "hapService": "Fan",
      "name": "Fan",
      "manufacturer": "dyson",
      "model": "cool",
      "serialNumber": "123-45678",
      "baseUrl": "http://localhost:3001/devices/fan",
      "properties": [
        {
          "characteristic": "On",
          "lircState": "power",
          "type": "Boolean"
        },
        {
          "characteristic": "RotationSpeed",
          "lircState": "air",
          "type": "Integer",
          "ratio": 10
        },
        {
          "characteristic": "RotationDirection",
          "lircState": "rotate",
          "type": "Boolean"
        }
      ]
    }
  ]
```
