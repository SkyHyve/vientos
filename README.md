# Vientos

Vientos is a package for making React tables with ease.
This library is browser native so does not require any build step.

## Table of Contents

- Installation
- Usage

## Installation

```sh
npm install vientos
```

## Usage

Include the source in your html
```html
<script type="text/javascript" src="{% static 'path/to/vientos.js' %}"></script>
```

### Broker

The broker is a singleton hat exists in the Vientos object. It is responsible for handling the registration, subscriptions and publications. It can be accessed using
```js
Vientos.Broker
```
however it is recommeneded to avoid directly accessing this object and always using the Client API.

### Client

Vientos.Client is a class used for accessing the Vientos API.
A new Vientos.Client object can be instantiated by
```js
const vientosClient = new Vientos.Client();
```
#### Constructor

The constructor has a signature
```js
constructor(registerCallback = function(clientId, clientStore){}, sync = false){}
```
The *registerCallback* argument is a function that will be run after the registration has been accepted by the Broker but before the clientId has been returned to the Client constructor. Default is a no-op function.

The *clientId* argument of the *registerCallback* function is the unique ID returned when registering with the broker which the client object will have set as an attribute.

The *clientStore* argument of the *registerCallback* function is initially an empty object that the client can do whatever it wants to with. It is useful for storing extra data that can be used in subscription callbacks that would otherwise not appear in the publication data, specific to the client.

The *sync* argument is whether the *registerCallback* will be run synchronously or asynchronously. Default is *false*.

#### Subscribe

The Client has a method *sub*
with signature
```js
sub(topic, callback, sync = false){}
```

The *topic* argument is a string that references which topic to subscribe to.

The *callback* argument is a function that will be run on behalf of the client by the Broker when a publication is made to the given *topic*. The *callback* function must have the signature
```js
function(data, clientStore){}
```
Where *data* is the data that was published to the given *topic* and *clientStore* is the object stored by the Broker on behalf of the client that can provide extra data for the *callback* function.

The *sync* argument is whether the *callback* will be run synchronously or asynchronously. Default is *false*.

#### Publish

The Client has a method *pub*
with signature
```js
pub(topic, data){}
```

The *topic* argument is a string that references which topic to publish to.

The *data* argument is of arbitrary type that will be passed to the callback functions of the subscribers for the given *topic*.

### Examples

#### Hello World

```js
const vientosClient1 = new Vientos.Client();
vientosClient1.sub('topic1', (data, clientStore) => console.log(data));

const vientosClient1 = new Vientos.Client();
vientosClient1.sub('topic2', (data, clientStore) => console.log(data * 2));

vientosClient1.pub('topic2', 42);
vientosClient2.pub('topic1', 'minerals');
```

In this example the output may be out of order as the *sync* argument was not passed as *true*, but the output for each would be 84 and "minerals" respectively.

#### React

A good use of Vientos is for functional react components that need to communicate with one another.
