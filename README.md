# SafeTrace JavaScript application
[Open a new issue on Github][2]

A simple application showcasing how you can work with the `HAT` in a JavaScript app. 
The purpose of the app is to showcase log in, registration and simple read/write operations. 
Also you can use it to build your own application on HAT.
​
## Getting Started
You can start by either downloading the project or cloning it.
​
## Prerequisites
```
Node 12.13.0
NPM 6.12
```

## Installing
Make sure you have Node(You can download it [here][3]) and NPM installed by 
running simple commands to see their current version.

**For Node:**
```
node -v
```

**For NPM:**
```
npm -v
```

## Development server
Run `npm install` or `yarn install` to install all the required dependencies and then run `npm start` or `yarn start` for a dev server. 

Then navigate to `http://localhost:3000/` to run the app. The app will automatically reload if you change any of the source files. 

## Testing
In the HAT Starter app you can sign in to an existing testing HAT or you can create a new one. 

If you are [running the HAT on a localhost][4] you have to pass the [Access token][5] as a parameter.

**Example:**
```
http://localhost:3000/authentication?token=<Access-Token>
```

## Configuration
You can change the configuration with your application details.
``` javascript
export const appConfig = {
  applicationId: 'testhatapp', // The application ID.
  namespace: 'testhatapp', // The application's namespace.
  hatCluster: '.hubat.net', // The HAT's cluster for the Login. In this case we are using '.hubat.net' for testing purposes.
  hatApiVersion: 'v2.6', // The API version of the HAT. 
  secure: true, // If you want to run the HAT locally, you have to modify this field to 'false'.
};
```

## License
Copyright (C) 2020 Dataswift Ltd

This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at http://mozilla.org/MPL/2.0/

[1]: https://developers.hubofallthings.com/guides/hat-js-guide
[2]: https://github.com/Hub-of-all-Things/hat-starter-app-js/issues
[3]: https://nodejs.org/
[4]: https://docs.dataswift.io/documentation/quick-start#run-hat-locally-from-source-code
[5]: https://docs.dataswift.io/guides/hat-login
