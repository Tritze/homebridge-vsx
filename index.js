var request = require("request");
var inherits = require('util').inherits;
var net = require('net');
var Service, Characteristic;

var maxVolume;
var minVolume;

module.exports = function(homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;

    homebridge.registerAccessory("homebridge-VSX", "VSX", VSX);

    function VSX(log, config) {
        
        this.HOST = config.ip;
        this.PORT = config.port;
        this.name = config.name;
        maxVolume = config.maxVolume;
        minVolume = config.minVolume;

        this.log = log;
    }

    // Custom Characteristics and service...
    VSX.AudioVolume = function() {
        Characteristic.call(this, 'Volume', '4804a651-2f32-4e1f-ac75-dacf23d9df93');
        console.log("Maximum Volume", maxVolume);
        this.setProps({
            format: Characteristic.Formats.FLOAT,
            maxValue: maxVolume,
            minValue: minVolume,
            minStep: 0.5,
            perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
        });
        this.value = this.getDefaultValue();
    };
    inherits(VSX.AudioVolume, Characteristic);

    VSX.Muting = function() {
        Characteristic.call(this, 'Mute', '4804a652-2f32-4e1f-ac75-dacf23d9df93');
        console.log("Mute Characteristic")
        this.setProps({
            format: Characteristic.Formats.BOOL,
            perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
        });
        this.value = this.getDefaultValue();
    };
    inherits(VSX.Muting, Characteristic);

    VSX.AudioDeviceService = function(displayName, subtype) {
        Service.call(this, displayName, '4804a653-2f32-4e1f-ac75-dacf23d9df93', subtype);
        this.addCharacteristic(VSX.AudioVolume);
        this.addCharacteristic(VSX.Muting);
    };
    inherits(VSX.AudioDeviceService, Service);



    VSX.prototype = {

        httpRequest: function(url, method, callback) {
            
            var that = this;
            request({
                url: url,
                method: method
            },
            function (error, response, body) {
                callback(error, response, body);
            });
        },

        sendMsg: function (msg, callback) {

        },

        getPowerState: function(callback) {

            var client = new net.Socket();
            client.connect(this.PORT, this.HOST, function() {
             
                console.log('CONNECTED TO: ' + this.HOST + ':' + this.PORT);
                client.write('?P\r\n');
          
            }); 
              
            client.on('data', function(data) {
              
                console.log('DATA: ' + data);
                var str = data.toString();
                
                if (str.includes("PWR1")) {
                    console.log("OFF");
                    client.destroy();
                    callback(null, false);
                  
                } else if (str.includes("PWR0")) {
                    console.log("ON");
                    client.destroy();
                    callback(null, true);
                  
                } else {
                    console.log("waiting");
                }
            });
            
            client.on('close', function() {
                console.log('Connection closed');  
            });
          
            client.on('error', function(ex) {
                console.log("handled error");
                console.log(ex);
                callback(ex)  
            }); 
        },

        setPowerState: function(powerOn, callback) {

            if(powerOn){
                var client = new net.Socket();
                client.connect(this.PORT, this.HOST, function() {
            
                    console.log('CONNECTED TO: ' + this.HOST + ':' + this.PORT);
                    // Write a message to the socket as soon as the client is connected, the server will receive it as message from the client 
                    client.write('PO\r\n');
                    
                    client.destroy();
                });
                    //Add a 'close' event handler for the client sock
                client.on('close', function() {
                    console.log('Connection closed');
                });
                
                client.on('close', function() {
                    console.log('Connection closed'); 
                });
                
                client.on('error', function(ex) {
                    console.log("handled error");
                    console.log(ex); 
                }); 
            
            } else {
                var client = new net.Socket();
                client.connect(this.PORT, this.HOST, function() {
            
                    console.log('CONNECTED TO: ' + this.HOST + ':' + this.PORT);
                    // Write a message to the socket as soon as the client is connected, the server will receive it as message from the client 
                    client.write('PF\r\n');
                    
                    client.destroy();   
                });
                
                //Add a 'close' event handler for the client sock
                client.on('close', function() {
                    console.log('Connection closed');
                });
                
                client.on('error', function(ex) {
                    console.log("handled error");
                    console.log(ex);
                }); 
            
            }
            callback();
        },

        getMuteState: function(callback) {
            var client = new net.Socket();
            client.connect(this.PORT, this.HOST, function() {
             
                console.log('CONNECTED TO: ' + this.HOST + ':' + this.PORT);
                client.write('?M\r\n');
          
            }); 
              
            client.on('data', function(data) {
              
                console.log('DATA: ' + data);
                var str = data.toString();
                
                if (str.includes("MUT1")) {
                    console.log("MUTE OFF");
                    client.destroy();
                    callback(null, false);
                  
                } else if (str.includes("MUT0")) {
                    console.log("MUTE ON");
                    client.destroy();
                    callback(null, true);
                  
                } else {
                    console.log("waiting");
                }
            });
            
            client.on('close', function() {
                console.log('Connection closed');  
            });
          
            client.on('error', function(ex) {
                console.log("handled error");
                console.log(ex);
                callback(ex)  
            }); 
        },

        setMuteState: function(muteOn, callback) {
            if(muteOn){
                var client = new net.Socket();
                client.connect(this.PORT, this.HOST, function() {
            
                    console.log('CONNECTED TO: ' + this.HOST + ':' + this.PORT);
                    // Write a message to the socket as soon as the client is connected, the server will receive it as message from the client 
                    client.write('MO\r\n');
                    
                    client.destroy();
                });
                    //Add a 'close' event handler for the client sock
                client.on('close', function() {
                    console.log('Connection closed');
                });
                
                client.on('close', function() {
                    console.log('Connection closed'); 
                });
                
                client.on('error', function(ex) {
                    console.log("handled error");
                    console.log(ex); 
                }); 
            
            } else {
                var client = new net.Socket();
                client.connect(this.PORT, this.HOST, function() {
            
                    console.log('CONNECTED TO: ' + this.HOST + ':' + this.PORT);
                    // Write a message to the socket as soon as the client is connected, the server will receive it as message from the client 
                    client.write('MF\r\n');
                    
                    client.destroy();   
                });
                
                //Add a 'close' event handler for the client sock
                client.on('close', function() {
                    console.log('Connection closed');
                });
                
                client.on('error', function(ex) {
                    console.log("handled error");
                    console.log(ex);
                }); 
            
            }
            callback();
        },

        getVolume: function(callback) {
            var client = new net.Socket();
            client.connect(this.PORT, this.HOST, function() {
             
                console.log('CONNECTED TO: ' + this.HOST + ':' + this.PORT);
                client.write('?V\r\n');
          
            }); 
              
            client.on('data', function(data) {
              
                console.log('DATA: ' + data);
                var str = data.toString();
                
                var volStr = str.substr(3,2);
                var vol = (volStr - 161) * 0.5;

                callback(null, vol);
            });
            
            client.on('close', function() {
                console.log('Connection closed');  
            });
          
            client.on('error', function(ex) {
                console.log("handled error");
                console.log(ex);
                callback(ex)  
            }); 
        },

        setVolume: function(value, callback) {
            var client = new net.Socket();

            var volStr = value / 0.5 + 161;
            var writeStr = volStr + '\r\n';

            client.connect(this.PORT, this.HOST, function() {
        
                console.log('CONNECTED TO: ' + this.HOST + ':' + this.PORT);
                // Write a message to the socket as soon as the client is connected, the server will receive it as message from the client 
                client.write(writeStr);
                
                client.destroy();
            });
                //Add a 'close' event handler for the client sock
            client.on('close', function() {
                console.log('Connection closed');
            });
            
            client.on('close', function() {
                console.log('Connection closed'); 
            });
            
            client.on('error', function(ex) {
                console.log("handled error");
                console.log(ex); 
            }); 
            
            callback();
        },

        getServices: function() {
            var that = this;

            var informationService = new Service.AccessoryInformation();

            informationService
                .setCharacteristic(Characteristic.Manufacturer, "Pioneer")
                .setCharacteristic(Characteristic.Model, "VSX-2020")
                .setCharacteristic(Characteristic.SerialNumber, "1234567890");

            var switchService = new Service.Switch(this.name);

            switchService
                .getCharacteristic(Characteristic.On)
                    .on('get', this.getPowerState.bind(this))
                    .on('set', this.setPowerState.bind(this));

            var audioDeviceService = new VSX.AudioDeviceService("Audio Functions");  

            audioDeviceService
                .getCharacteristic(VSX.Muting)
                    .on('get', this.getMuteState.bind(this))
                    .on('set', this.setMuteState.bind(this));

            audioDeviceService
                .getCharacteristic(VSX.AudioVolume)
                    .on('get', this.getVolume.bind(this))
                    .on('set', this.setVolume.bind(this));

            return [informationService, switchService, audioDeviceService];
        }
    };
};