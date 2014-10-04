// worker.js
// generic methods for managing workers

"use strict";

var calcWorker = {};

calcWorker.setupWorker = function(workerPath, messageProcessor){
  calcWorker.worker = new Worker(workerPath);
  calcWorker.worker.addEventListener('message', messageProcessor, false);
}

calcWorker.terminateWorker = function(messageProcessor){
  calcWorker.worker.removeEventListener('message', messageProcessor, false);
  calcWorker.worker.terminate();
}

calcWorker.sendMessage = function(jsonMessage){
   calcWorker.worker.postMessage(jsonMessage);
}
