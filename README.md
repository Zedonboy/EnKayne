# Enkayne NKN whiteboard


## Introduction

Enkaye is a rudimentary collaborative whiteboard platform. Infact it is a Library you can use. check packages/nkn-whiteboard.

its not yet, finished to be a candiddate for npm package

## How to install

```
git clone <repo>

cd <repo>

npm install

npm run dev
```

## Features

It can draw shapes like Rect, FreeHand, Circle and Text.

Audio will not work properly because of the deprecated onaudioprocess function
https://developer.mozilla.org/en-US/docs/Web/API/ScriptProcessorNode/onaudioprocess

Moreover, I don't have the best working system, my speakers are dead. i developed this feature blindly.

You can undo and redo

## Internal Design.
I used double clients, one for whiteboard drawing data and the other for audio data. This architecture because i want to conserve bandwidth, so that nodes can subscribe to channels they need, unlike other implementation that use conditional logic for different datatypes(Which the data is already passed through the network.)

2. Canvas Data is very very small, to make JSON parsing trivial

## Communication Protocol
At the dataChannel, every data is a string json. with two properties.

`name` and  `value`

name is the name of the object(every Object to be published must have a `OBJECT_NAME` static property)

value is the object itself.

## Library RoadMap

-Get Audio to work properly.
- Video streaming
- ability to select canvas drawing and move them around
- shared whiteboard, subscribers can work on whiteboard too, if given the permission.
- [Libraty Design] given library user freedom to instantiate NKNClients, so independent companies/applications can use it. with their own wallet.

## Challenges Faced

- NKN is still young and little bit slow compared to our traditional centralized logic. but we are getting there

- Audio Web API was very confusing, because using worklet, i may not access NKNClient instance to publish audio data.

- Time is small, but yes its enough for a hackathon
- My System is really bad(Audio) and slow.
- Firefox does not run the app properly, Use Chrome

## Class Design
Channel.ts - Contains all logic interacting with NKNClient

event.ts - Contains all event types that will be sent through the network

types.ts Contains all types.

index.ts is the boardEngine, let's say the userspace guy. that take user intentions

impl/* - Is the Canvas drawing tools implementations

## Known Bugs

- ability to retain stroke and fill color/params data, during undo and redo event.
