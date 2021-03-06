#!/usr/bin/env node

var Http = require('http');
var Fs = require('fs');
var Path = require('path');
var Commander = require('commander');
var Assert = require('assert');
var Server = require('../lib/server.js');
var _ = require('lodash');
var Death = require('death');
var UpdateNotifier = require('update-notifier');
var pkg = require('../package.json');

UpdateNotifier({
  pkg
}).notify();

var handleError = error => {
  _.defer(() => {
    process.exit(1);
  });

  if (Commander.debug) {
    console.error(error.stack); // eslint-disable-line no-console
  } else {
    console.error(error.message); // eslint-disable-line no-console
  }
};

var handleFinish = () => {
  process.exit(0);
};

var command;

Commander.version(pkg.version)
  .option('-d --debug', 'enable debug')
  .option('    --state-file [string]', 'state file, default: ~/.bnb.json', Path.join(process.env['HOME'] || process.env['HOMEPATH'], '.bnb.json'));

Commander.command('server')
  .option('-p, --port [integer]', 'HTTP port, default: 2999', ((i, d) => parseInt(i || d)), 2999)
  .option('-b, --bind [string]', 'HTTP bind, default: 127.0.0.1', '127.0.0.1')
  .action(options => {
    var server = new Server(Commander);
    command = 'server';
    Promise.resolve()
      .then(() => server.listen(options))
      .then(() => {
        Death(() =>
          Promise.resolve()
          .then(() => server.close())
          .then(handleFinish)
          .catch(handleError)
        );
      })
      .catch(handleError);
  });

Commander.parse(process.argv);

if (!command) {
  Commander.outputHelp();
  process.exit(1);
}
