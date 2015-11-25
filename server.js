require('es6-promise').polyfill(); // Required in some browsers
require('babel-core/register')({stage: 0}); //babel polyfill ES6

require.extensions['.scss'] = function() {
  return;
};

var express = require('express');
var path = require('path');
const app = express();

app.use(express.static(path.resolve(__dirname, 'dist')));
app.use(express.static(path.resolve(__dirname, 'bootstrap')));
require('./app/api/api.js')(app);
require('./app/react/server.js')(app);

const port = 3000;
app.listen(port, function onStart(err) {
  if (err) {
    console.log(err);
  }
  console.info('==> 🌎 Listening on port %s. Open up http://localhost:%s/ in your browser.', port, port);
});
