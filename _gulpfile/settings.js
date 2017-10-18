module.exports.AUTOPREFIXER_BROWSERS = [
    'last 30 versions'
];

module.exports.remoteConn = {
    host: 'hostName',
    user: 'userName',
    pass: 'password',
    path: '/absolute/path/to/remote/folder'
}

module.exports.depFolders = [
  './src/public/imgs/**/*.*',
  './src/public/fonts/**/*.*'
]

module.exports.assetpathsSettings = {
  newDomain: '/newDomain/',
  oldDomain : '/',
  docRoot : '/',
  filetypes : ['jpg','jpeg','png','ico','gif','js','css'],
  templates: true
}