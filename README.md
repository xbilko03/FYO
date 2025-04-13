# Atmospheric Optics Simulation

This project simulates various atmospheric optical phenomena, such as rainbows, halos, and sky color changes throughout the day.

## Online Demo
https://xbilko03.github.io/FYO/

## Features

- Dynamic sun position and sky color based on time of day (6:00–18:00)
- Cloud coverage controlled via oktas (0–8 scale)
- Realistic atmospheric halo effects influenced by cloud density
- Rain simulation with adjustable intensity and density
- Rainbow appearance based on humidity, rain presence, and sun angle
- Interactive camera and movement controls
- Responsive UI with sliders for time, clouds, humidity, and rain

## Technologies Used

- [Three.js](https://threejs.org/) — WebGL 3D rendering
- GLSL — Custom shaders for halos and rainbows
- Vanilla JavaScript

## How to Run

You can run the project locally using any static file server. For example:

```bash
npx http-server .
