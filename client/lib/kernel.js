/*
 * Copyright 2015 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var jjs = require('@jupyterlab/services');
var request = require('request');
var Utils = require('./utils.js');

var Kernel = {};

/**
 * Takes a jupyter-js-services execution future and calls a Promise resolve/reject once the execute completes.
 *
 * Should be used either when creating a new Spark object or a no-op.
 *
 * @param {KernelFutureHandler} handle
 * @param {Promise.resolve} resolve
 * @param {Promise.reject} reject
 * @param {object[]} [extraArgs] Optional extra arguments to be passed to the resolve.
 *
 * @ignore
 */
Kernel.verifyKernelExecution = function(future, resolve, reject, extraArgs) {
  var error = null;
  var args = [];

  var code;

  future.onReply = function(msg) {
    //console.log("onReply,", msg);

    if (msg.content.status === 'error') {
      error = [msg.content.evalue].concat(msg.content.traceback).join('\n');
    }
  };

  future.onIOPub = msg => {
    //console.log("onIOPub,", msg);

    if (msg.content.data) {
      args.push(msg.content.data['text/plain']);
    }

    if (msg.content.code) {
      code = msg.content.code;
    }
  };

  future.onDone = msg => {
    //console.log("onDone,", msg);

    if (error) {
      if (reject) {
        Utils.error('Error on executing:\n'+code+'\nError was:\n'+error);
        reject(error);
      }
    } else if (resolve) {
      if (extraArgs) {
        args = args.concat(extraArgs)
      }

      Utils.log('Successfully executed:\n'+code+'\nResult was:\n'+args);

      resolve.apply(this, args);
    }
  };
};

var variableCounter = {};

Kernel.genVariable = function(name) {
  if (!variableCounter[name]) {
    variableCounter[name] = 1;
  } else {
    variableCounter[name]++;
  }

  return name + variableCounter[name];
};

Kernel.resetVariables = function() {
  variableCounter = {};
};

function _getURL(jobName) {
  // special processing for eclairjs.cloudet.xyz to follow redirect
  //  to spawned kernel
  var JUPYTER_HOST = process.env.JUPYTER_HOST || '127.0.0.1';
  var JUPYTER_PORT = process.env.JUPYTER_PORT || 8888;
  var JUPYTER_TOKEN = process.env.JUPYTER_TOKEN || null;

  // full url that includes a token (http://localhost:8888/?token=13ba94615de47b7ad3cdb3f8482ae38eb882735259568a62)
  var JUPYTER_URL = process.env.JUPYTER_URL || null;
  if (JUPYTER_URL) {
    const url = require('url');
    var parsed = url.parse(JUPYTER_URL, true);
    JUPYTER_HOST = parsed.hostname;
    JUPYTER_PORT = parsed.port;
    JUPYTER_TOKEN = parsed.query && parsed.query.token ? parsed.query.token : null;
  }

  // used for remote urls where we need to handle redirects
  var ELAIRJS_HOST = process.env.ECLAIRJS_HOST || '';

  var kernelName = process.env.ECLAIRJS_KERNEL_NAME || 'toree';

  return new Promise(function(resolve, reject) {
    if (JUPYTER_HOST != ELAIRJS_HOST) {
      var hostURL = JUPYTER_HOST + ":" + JUPYTER_PORT;
      resolve({
        baseUrl: 'http://' + hostURL,
        wsUrl: 'ws://' + hostURL,
        name: kernelName,
        path: jobName,
        token: JUPYTER_TOKEN
      });
    } else {
      request({
        followAllRedirects: true,
        url: 'http://' + ELAIRJS_HOST + '/spawn'
      }, function(error, response, body) {
        if (!error) {
          // console.log(response.request.path);
          var userPath = response.request.path.split('/').slice(0, 3).join('/');
          var hostURL = ELAIRJS_HOST + userPath;
          // console.log(hostURL)
          resolve({
            baseUrl: 'http://' + hostURL, 
            wsUrl: 'ws://' + hostURL,
            name: kernelName,
            path: jobName,
            token: JUPYTER_TOKEN
          });
        }
        else
          reject(error);
      });
    }
  });
}

function __getServerURL(jobName) {

  var vcap = Utils.vcapBluemixServer();
  if(!vcap)
    return _getURL(jobName);

  var tenant_id = vcap.credentials.tenant_id;
  var instance_id = vcap.credentials.instance_id;
  var tenant_secret = vcap.credentials.tenant_secret;
  var host = 'spark.bluemix.net'; //vcap.credentials.cluster_master_url;

  var url ='//'+ tenant_id +'_'+ instance_id +':'+ tenant_secret +'@'+ host +'/jupyter/v2'

  return Promise.resolve({
    baseUrl: 'https:'+url, 
    wsUrl: 'wss:'+url,
    name: 'scala-spark20',
    ajaxSettings: {
      user: tenant_id + '_' + instance_id,
      password: tenant_secret
    },
    notebookPath: jobName
  });
}

Kernel.createKernelSession = function(jobName) {
  return new Promise(function(resolve, reject) {
    // We build our Spark Kernel connection here and share it when any classes that need it
    __getServerURL(jobName).then(function(serverInfo) {
      //start the kernel
      //console.log(serverInfo);

      jjs.Kernel.startNew(serverInfo).then(function(k) {
        //console.log("got kernel");
        //when we have kernel info we know the spark kernel is ready.
        resolve(k);
      }).catch(function(e) {
        console.error('Failed to connect to Jupyter instance', e);
        reject(e);
      });
/*
      jjs.startNewSession(
        serverInfo
      ).then(function(session) {
        //when we have kernel info we know the spark kernel is ready.
        session.kernel.kernelInfo().then(function(info) {
          if (process.env.ECLAIRJS_VERBOSE) {
            Utils.remoteLog(session.kernel);
          }
          resolve(session);
        });
      }).catch(function(e) {
        console.error('Failed to start Jupyter session', e);
        reject(err);
      });
      */
    }).catch(function(e) {
      console.error('Failed to connect to Jupyter instance', e);
      reject(e);
    })
  });
};

module.exports = Kernel;
