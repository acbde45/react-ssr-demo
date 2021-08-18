'use strict';

const debug = require('debug')('webpack-hot-server-middleware');
const path = require('path');
const fs = require('fs');
const requireFromString = require('require-from-string');
const sourceMapSupport = require('source-map-support');

const createConnectHandler = (error, serverRenderer) => (req, res, next) => {
  debug(`Receive request ${req.url}`);
  if (error) {
    return next(error);
  }
  serverRenderer(req, res, next);
};

function interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj.default : obj;
}

function isMultiCompiler(compiler) {
  // Duck typing as `instanceof MultiCompiler` fails when npm decides to
  // install multiple instances of webpack.
  return compiler && compiler.compilers;
}

function findCompiler(multiCompiler, name) {
  return multiCompiler.compilers.filter(
    (compiler) => compiler.name.indexOf(name) === 0
  );
}

function findStats(multiStats, name) {
  return multiStats.stats.filter(
    (stats) => stats.compilation.name.indexOf(name) === 0
  );
}

function getFilename(serverStats, outputPath) {
  const serverStatsJson = serverStats.toJson();
  const assetsByChunkName = serverStatsJson.assetsByChunkName;
  const chunkName = serverStatsJson.chunks[0].names[0];
  let filename = assetsByChunkName[chunkName] || '';
  // If source maps are generated `assetsByChunkName.main`
  // will be an array of filenames.
  return path.join(
    outputPath,
    Array.isArray(filename)
      ? filename.find((asset) => /\.js$/.test(asset))
      : filename
  );
}

function getServerRenderer(filename, buffer, stats) {
  const errMessage = `The 'server' compiler must export a function in the form of \`(stats) => (req, res, next) => void\``;

  let serverRenderer = interopRequireDefault(
    requireFromString(buffer.toString(), filename)
  );

  if (typeof serverRenderer !== 'function') {
    throw new Error(errMessage);
  }

  serverRenderer = serverRenderer(stats);
  if (typeof serverRenderer !== 'function') {
    throw new Error(errMessage);
  }

  return serverRenderer;
}

function installSourceMapSupport(fs) {
  sourceMapSupport.install({
    // NOTE: If https://github.com/evanw/node-source-map-support/pull/149
    // lands we can be less aggressive and explicitly invalidate the source
    // map cache when Webpack recompiles.
    emptyCacheBetweenOperations: true,
    retrieveFile(source) {
      try {
        return fs.readFileSync(source, 'utf8');
      } catch (ex) {
        // Doesn't exist
      }
    },
  });
}

/**
 * Passes the request to the most up to date 'server' bundle.
 * NOTE: This must be mounted after webpackDevMiddleware to ensure this
 * middleware doesn't get called until the compilation is complete.
 * @param   {MultiCompiler} multiCompiler                  e.g webpack([clientConfig, serverConfig])
 * @options {String}        options.chunkName              The name of the main server chunk.
 * @options {Object}        options.serverRendererOptions  Options passed to the `serverRenderer`.
 * @return  {Function}                                     Middleware fn.
 */
function webpackHotServerMiddleware(multiCompiler) {
  debug('Using webpack-hot-server-middleware');

  if (!isMultiCompiler(multiCompiler)) {
    throw new Error(
      `Expected webpack compiler to contain both a 'client' and/or 'server' config`
    );
  }

  const serverCompiler = findCompiler(multiCompiler, 'server')[0];
  const clientCompilers = findCompiler(multiCompiler, 'client');

  if (!serverCompiler) {
    throw new Error(`Expected a webpack compiler named 'server'`);
  }
  if (!clientCompilers.length) {
    debug(
      `Cannot find webpack compiler named 'client'. Starting without client compiler`
    );
  }

  const outputFs = serverCompiler.outputFileSystem;
  const outputPath = serverCompiler.outputPath;

  installSourceMapSupport(outputFs);

  let serverRenderer;
  let error = false;

  const doneHandler = (multiStats) => {
    error = false;

    const serverStats = findStats(multiStats, 'server')[0];
    // Server compilation errors need to be propagated to the client.
    if (serverStats.compilation.errors.length) {
      error = serverStats.compilation.errors[0];
      return;
    }

    let clientStatsJson = null;

    if (clientCompilers.length) {
      const clientStats = findStats(multiStats, 'client');
      clientStatsJson = clientStats.map((obj) => obj.toJson());

      if (clientStatsJson.length === 1) {
        clientStatsJson = clientStatsJson[0];
      }
    }

    let filename = getFilename(serverStats, outputPath);

    const buffer = outputFs.readFileSync(filename);

    const serverRendererOptions = {
      clientStats: clientStatsJson,
      serverStats: serverStats.toJson(),
    };

    try {
      serverRenderer = getServerRenderer(
        filename,
        buffer,
        serverRendererOptions
      );
    } catch (ex) {
      debug(ex);
      error = ex;
    }
  };

  multiCompiler.hooks.done.tap('WebpackHotServerMiddleware', doneHandler);

  return function () {
    return createConnectHandler(error, serverRenderer).apply(null, arguments);
  };
}

module.exports = webpackHotServerMiddleware;
