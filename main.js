/*
* Name		    : main.js
* Project	    : Atmospheric optics, rainbow, halo phenomena, sky color.
* Description   : Sets up the controls and the scene, runs the scene
*
* Author        : Jozef Bilko (xbilko03)
*/
import * as THREE from 'three';
import { createScene } from './scene.js';
import { setupControls } from './controls.js';
import { createUI } from './UI.js'; // Import the createUI function

/* init scene */
const sceneSize = 100;
const scene = createScene(sceneSize);

/* init camera */
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 5);

/* init window */
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

/* init camera speed */
const moveSpeed = 0.1;

/* box definition */
const minX = -10, maxX = 10;
const minY = 2, maxY = 20;
const minZ = -10, maxZ = 10;

/* allows the window to be resized */
window.addEventListener('resize', () =>
{
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

/* setup controls */
const { controls, updateMovement } = setupControls(camera, renderer);

/* Create the UI */
createUI(); // Create the UI with bullet points

/* runs the scene */
function run()
{
    requestAnimationFrame(run);
    updateMovement();

    /* restrain movement defined by a box */
    if (camera.position.x < minX) camera.position.x = minX;
    if (camera.position.x > maxX) camera.position.x = maxX;
    if (camera.position.y < minY) camera.position.y = minY;
    if (camera.position.y > maxY) camera.position.y = maxY;
    if (camera.position.z < minZ) camera.position.z = minZ;
    if (camera.position.z > maxZ) camera.position.z = maxZ;

    renderer.render(scene, camera);
}
run();
