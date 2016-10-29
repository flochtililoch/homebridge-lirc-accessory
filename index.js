'use strict';

var Service, Characteristic;

const {get, put} = require('superagent'),
      packageName = require('./package').name,
      UNKNOWN = 'unknown',
      accessoryName = 'LIRC Accessory';

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

module.exports = function (homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory(packageName, accessoryName, Accessory);
};

class Accessory {

  constructor (log, config) {
    this.log = log;
    this.config = config;
  }

  url (property) {
    return `${this.config.baseUrl}/states/${property}`;
  }

  informationService () {
    const service = new Service.AccessoryInformation();

    service
      .setCharacteristic(Characteristic.Manufacturer, this.config.manufacturerName || UNKNOWN)
      .setCharacteristic(Characteristic.Model, this.config.model || UNKNOWN)
      .setCharacteristic(Characteristic.Name, this.config.name || UNKNOWN)
      .setCharacteristic(Characteristic.SerialNumber, this.config.serialNumber || UNKNOWN);

    return service;
  }

  coreService () {
    const service = new Service[this.config.hapService]();
    const wrap = (characteristic, property, to, from) => {
      const responseHandler = (callback) => {
        return (err, res) => {
          let value = null;
          if (res && res.body && res.body.value) {
            value = from(res.body.value);
            this.log(`Got ${property}:`, value);
          }
          callback(err, value);
        };
      };

      const getter = (callback) => {
        const url = this.url(property);
        this.log(`GET ${url}`);
        get(url).end(responseHandler(callback));
      };

      const setter = (val, callback) => {
        const url = this.url(property),
              value = to(val);
        this.log(`PUT ${url} with value:`, {value});
        put(url)
          .send({value})
          .end(responseHandler(callback));
      };

      service.getCharacteristic(characteristic)
        .on('get', getter)
        .on('set', setter);
    };

    this.config.properties.forEach(property => {
      const {characteristic, lircState} = property;
      wrap(
        Characteristic[characteristic],
        lircState,
        this.to(property),
        this.from(property)
      );
    });

    return service;
  }

  getServices () {
    return [
      this.coreService(),
      this.informationService()
    ];
  }

  to (property) {
    const {type, ratio} = property;
    switch (type) {
      case 'Boolean': return value => Boolean(value);
      case 'Integer': return value => Math.round(value / ratio);
      default: throw new Error(`to: property type '${type}' not implemented`);
    }
  }

  from (property) {
    const {type, ratio} = property;
    switch (type) {
      case 'Boolean': return value => Boolean(value);
      case 'Integer': return value => parseInt(value, 10) * ratio;
      default: throw new Error(`from: property type '${type}' not implemented`);
    }
  }

}