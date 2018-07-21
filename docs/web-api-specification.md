# Operations

There three "operations" which are relevant.

## Operation 1: Trigger Simulation

The first operations triggers the hash generation and simulates the completion of a route.

```
POST /simulation
```

## Operation 2: Monitor Simulation

The second operation gives the possibility to monitor the state.

```
GET /state

JSON-Result:

{
    routes:                     20,
    available_route_proofs:     7
}
```


## Operation 3: Get Route-Informations

The third operations delivers all the routes.

```
GET /routes

The JSON-result can be found in data-model-specification.

```