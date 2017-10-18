# Luman Gulp-Workflow #

To run the task runner the following software neet to be installed:
- NodeJS
- NPM
- bower

Run the following command to install depended packages.

```
npm install
```

Install gulp-cli if you don't have it:

```
npm install -g gulp-cli
```

After you've installed all the requierd elements, you can run the task runner using this command:

```
gulp
```

To compile all of your html/css/js files into final compressed/minified version, run the following command:

```
gulp dist
```

also, there's a possobility to send your compressed/minified files to remote server. To do this, you should to set up connection in /_gulpfile/settings.js in `module.exports.remoteConn` object.

The source code of your project located in the ./src folder