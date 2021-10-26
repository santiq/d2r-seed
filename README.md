# DEPRECATED

Use "D2R Assist" instead

Only use this repo to get inspiration on how to read memory using node.js in windows


-------------------

## Diablo II Resurrect map seed revelear + Web UI for Maphack


### Instalation

``` 
npm install
```

This program requires node-gyp, [see installation instructions here](https://github.com/nodejs/node-gyp#on-windows)

## Usage

1. Open diablo 2 resurrected and join a game

2. Run this script with

```
node index.js
```

3. Open your browser and visit http://localhost:3002

4. Enjoy

## Roadmap to an actual map hack

- [x] Detect Area ID
- [X] Detect Difficulty ID
- [X] Call map api to get a map json or image
- [ ] Draw revealed map over D2R window 
    - Needs electron.js
