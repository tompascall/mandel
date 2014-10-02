// worker.js
// generic methods for managing workers

"use strict";

var worker = {};

worker.setupWorker = function(workerObject, workerPath, messageProcessor){
  workerObject.worker = new Worker(workerPath);
  workerObject.worker.addEventListener('message', messageProcessor, false);
}

worker.terminateWorker = function(workerObject, messageProcessor){
  workerObject.worker.removeEventListener('message', messageProcessor, false);
  workerObject.worker.terminate();
}

worker.sendMessage = function(workerObject, jsonMessage){
   workerObject.worker.postMessage(jsonMessage);
}
