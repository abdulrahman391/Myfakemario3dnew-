# Gear Quest 3D

A 3D platformer in the spirit of Mario 3D World that runs in any browser, on desktop and mobile. There is no build step.

## Run it
- **GitHub Pages:** upload this folder to a repo, then go to Settings → Pages → deploy from `main` (root).
- **Locally:** run `python3 -m http.server` in this folder and open `http://localhost:8000`.
- Three.js loads from a CDN, so you need internet access.

## Project layout
```
index.html     page shell and menu
css/style.css  styling and touch controls
js/levels.js   level data (easy to edit, see the header comment)
js/game.js     engine: physics, animation, enemies, power-ups, input
js/net.js      online multiplayer (WebRTC)
```

## Heroes
| Hero | Look | Attack |
|---|---|---|
| Sprocket | Grey robot | Water shot that freezes enemies. Frozen enemies are harmless, and a second hit does double damage |
| Flame | Red, flame crest | Bouncing fireballs |
| Bull | Dark red, horns | Wide wind gust that pierces through enemies |

**Villain:** Evil Sprocket, Sprocket's red twin. He guards the end of every world and fires bolts. Beat him to reveal the goal flag.

## Power-ups
- **Gear:** +1 health
- **Star:** invincible for 8 seconds, and you damage enemies by touching them
- **Propeller:** a rotor pops out. Press jump in the air for a lift, then hold jump to glide
- **Spring Boots:** faster, higher jumps

## Levels
Three hand-built worlds: Gear Meadow, Magma Foundry (lava) and Storm Sky Tower. They use moving and rising platforms, crumbling platforms, bounce pads, spinning bar hazards, checkpoints, 3 green stars each, and a boss arena.

## Controls
| | Player 1 | Player 2 (local) |
|---|---|---|
| Move | WASD | Arrow keys |
| Jump | Space | Enter |
| Spin attack | F | Right Shift |

Rotate the camera with Q/E or by dragging. On mobile, use the left stick, **A** to jump and **B** to attack. Stomping on enemies also hurts them.

## Multiplayer
- **Local 2P:** one keyboard, shared camera.
- **Online or same Wi-Fi:** peer-to-peer, no server. The host presses **Host** and sends the code. The friend presses **Join**, pastes it, presses **Connect** and sends back the reply. The host pastes the reply, presses **Connect**, then **START**. Player positions and attacks sync, and each device simulates its own enemies and pickups.

## Make your own level
Open `js/levels.js` and add a row such as `[4,4,3,2,.5,'x','ce']`: width, depth, gap, x shift, height change, platform kind, flags.
