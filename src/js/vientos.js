class VientosCallbackError extends Error {
  constructor(...params){
    super(...params);
  }
}
class VientosClientIdError extends Error {
  constructor(...params){
    super(...params);
  }
}
class VientosTopicError extends Error {
  constructor(...params){
    super(...params);
  }
}
window.Vientos = {
  CallbackError: VientosCallbackError,
  ClientIdError: VientosClientIdError,
  TopicError: VientosTopicError,
};
Vientos.Broker = {
  clientSerial: 0,
  clientSubscriptions: {},
  clientStores: {},
  registerClient: function(registerCallback = function(clientId, clientStore){}, sync = false){
    if (typeof(registerCallback) != 'function'){
      throw new Vientos.CallbackError("Vientos.CallbackError: 'registerCallback' argument of function 'registerClient' must be of type 'function'.");
    }
    if (registerCallback.length != 2){
      throw new Vientos.CallbackError("Vientos.CallbackError: 'registerCallback' argument of function 'registerClient' must take 2 arguments; 'clientId' and 'clientStore'");
    }
    if ((sync != true) && (sync != false)){
      throw new Vientos.CallbackError("Vientos.CallbackError: 'sync' argument of function 'registerClient' must be either 'true' or 'false'");
    }

    let newClientId = ++this.clientSerial;
    this.clientSubscriptions[newClientId] = [];
    this.clientStores[newClientId] = {};

    switch (sync){
      case true:
        registerCallback(newClientId, this.clientStores[newClientId]);
        break;
      case false:
        setTimeout(() => registerCallback(newClientId, this.clientStores[newClientId]), 0);
        break;
    }
    return this.clientSerial;
  },
  topics: {},
  subscribe: function(topic, clientId, callback, sync = false){
    if (typeof(callback) != 'function'){
      throw new Vientos.CallbackError("Vientos.CallbackError: 'callback' argument of function 'subscribe' must be of type 'function'.");
    }
    if (callback.length != 2){
      throw new Vientos.CallbackError("Vientos.CallbackError: 'callback' argument of function 'subscribe' must take 2 arguments; 'data' and 'clientStore'");
    }
    if ((sync != true) && (sync != false)){
      throw new Vientos.CallbackError("Vientos.CallbackError: 'sync' argument of function 'subscribe' must be either 'true' or 'false'");
    }

    if (this.topics[topic] == null){
      this.topics[topic] = {};
    }
    this.topics[topic][clientId] = {callback: callback, sync: sync};

    this.clientSubscriptions[clientId][topic] = Date.now();
  },
  unsubscribe: function(topic, clientId){
    delete this.topics[topic][clientId];
    if (Object.keys(this.topics[topic]).length == 0){
      delete this.topics[topic];
    }
  },
  countClientSubscriptions: function(clientId){
    return Object.keys(this.clientSubscriptions[clientId]).length;
  },
  countTopicSubscribers: function(topic){
    switch (this.topics[topic] == null){
      case true:
        return 0;
      case false:
        return Object.keys(this.topics[topic]).length;
    }
  },
  publish: function(topic, data){
    for (let clientId in this.topics[topic]){
      switch (this.topics[topic][clientId].sync){
        case true:
          this.topics[topic][clientId].callback(data, this.clientStores[clientId]);
          break;
        case false:
          setTimeout(() => this.topics[topic][clientId].callback(data, this.clientStores[clientId]), 0);
          break;
      }
    }
  }
}
class Client {
  constructor(){
    this.clientId = Vientos.Broker.registerClient();
  }
  sub(topic, callback, sync = false){
    Vientos.Broker.subscribe(topic, this.clientId, callback, sync = sync);
  }
  unsub(topic){
    Vientos.Broker.unsubscribe(topic, this.clientId);
  }
  subCount(){
    return Vientos.Broker.countSubscriptions(this.clientId);
  }
  topicCount(topic){
    return Vientos.Broker.countTopicSubscribers(topic);
  }
  pub(topic, data){
    Vientos.Broker.publish(topic, data);
  }
}
Vientos.Client = Client;
