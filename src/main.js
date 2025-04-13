/*
* Name		    : main.js
* Project	    : Atmospheric optics, rainbow, halo phenomena, sky color.
* Description   : Sets up the controls and the scene, runs the scene
*
* Author        : Jozef Bilko (xbilko03)
*/
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.174.0/build/three.module.js';
import { createScene, updateSkyColor, updateSunPosition, updateClouds, updateSunShineEffect, updateRainLevel, updateRainbowVisibility } from './scene.js';
import { setupControls } from './controls.js';
import { createUI, timeSliderValue, cloudsSliderValue, humiditySliderValue, rainSliderValue } from './ui.js';

/* init */
const sceneSize = 100;
const scene = createScene(sceneSize);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 5);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

/* movement constraint box */
const minX = -10, maxX = 10;
const minY = 2, maxY = 5;
const minZ = -10, maxZ = 10;

/* window resize */
window.addEventListener('resize', () =>
{
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

/* setup controls */
const { controls, updateMovement } = setupControls(camera, renderer);

createUI();

/* runs the scene */
function animate()
{
    requestAnimationFrame(animate);
    updateMovement();

    /* dynamic changes to environment */
    updateClouds(timeSliderValue, scene, cloudsSliderValue);
    updateSkyColor(timeSliderValue, scene);
    updateSunPosition(timeSliderValue  - 6, scene);
    updateSunShineEffect(timeSliderValue, scene, camera, humiditySliderValue);
    updateRainLevel(rainSliderValue, scene);
    updateRainbowVisibility(timeSliderValue, cloudsSliderValue, rainSliderValue, scene);

    /* restrain movement defined by a box */
    if (camera.position.x < minX) camera.position.x = minX;
    if (camera.position.x > maxX) camera.position.x = maxX;
    if (camera.position.y < minY) camera.position.y = minY;
    if (camera.position.y > maxY) camera.position.y = maxY;
    if (camera.position.z < minZ) camera.position.z = minZ;
    if (camera.position.z > maxZ) camera.position.z = maxZ;

    renderer.render(scene, camera);
}
animate();

