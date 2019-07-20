[![Build Status](https://travis-ci.org/TunedChaos/smm2coursemanager-client.svg?branch=master)](https://travis-ci.org/TunedChaos/smm2coursemanager-client)
# SMM2CourseManager Client

SMM2CourseManager Client is an administrative utility to work with the [SMM2CourseManager Server](https://github.com/TunedChaos/smm2coursemanager-server){:target="_blank"}

## Prerequisites
- [SMM2CourseManager Server](https://github.com/TunedChaos/smm2coursemanager-server)
Or access to someone who has it deployed

## Installation
Download the appropriate [Latest Release](https://github.com/TunedChaos/smm2coursemanager-client/releases/latest)

## Configuration
The first time you open the SMM2 Course Manager Client you will see a configuration screen asking for three (3) items.
- An Encryption Key
  - This can be whatever you like, it must be at least 12 characters. It is what is used to obfuscate the stored data.
- An Authentication Code
  - If you followed the instructions to [set up the server](https://github.com/TunedChaos/smm2coursemanager-server) then you should know what your Authentication Code is.
- A Server Address
  - The server address of the server you set up earlier (hopefully) or whomevers friend's server you're using!

Note that the encryption key, and authentication code must be 12 or more characters each.

## Building from Source
Clone this repository
```bash
git clone git@github.com:TunedChaos/smm2coursemanager-client.git
```

Run the Node.js&reg; Package Manager Installer
```bash
npm install
```

Build with electron-forge
```bash
electron-forge make
```

The build should automatically detect your platform and give you the appropriate file(s) to run. You will need to find the `out` directory in the project's root, then the `make` directory. From here you will find your installer.

## Common Issues
- The loading screen is taking a long time
  - Just be patient it should finish
- No really, I see the main screen but loading is still taking forever!
  - Oh! That means you probably don't have the right server address
- But I do!
  - Probably not, double check your server address, put it into a web browser, if the server address isn't currently showing a current and next status (even a non-status) then your address isn't right.

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://github.com/TunedChaos/smm2coursemanager-client/blob/master/LICENSE)
