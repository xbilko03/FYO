/*
* Name		    : controls.js
* Project	    : Atmospheric optics, rainbow, halo phenomena, sky color.
* Description   : Defines camera movement controls behavior
*
* Author        : Jozef Bilko (xbilko03)
*/
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';

export function setupControls(camera, renderer)
{
    const controls = new PointerLockControls(camera, renderer.domElement);

    let moveForward = false;
    let moveBackward = false;
    let moveLeft = false;
    let moveRight = false;

    window.addEventListener('keydown', (event) =>
    {
        if (event.key === 'w') moveForward = true;
        if (event.key === 's') moveBackward = true;
        if (event.key === 'a') moveLeft = true;
        if (event.key === 'd') moveRight = true;
    });
    window.addEventListener('keyup', (event) =>
    {
        if (event.key === 'w') moveForward = false;
        if (event.key === 's') moveBackward = false;
        if (event.key === 'a') moveLeft = false;
        if (event.key === 'd') moveRight = false;
    });

    document.body.addEventListener('click', () => 
    {
        controls.lock();
    });

    function updateMovement()
    {
        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);

        const moveSpeed = 0.1;
        if (moveForward)
            camera.position.addScaledVector(direction, moveSpeed);
        if (moveBackward)
            camera.position.addScaledVector(direction, -moveSpeed);

        const right = new THREE.Vector3().crossVectors(direction, new THREE.Vector3(0, 1, 0)).normalize();

        if (moveLeft)
            camera.position.addScaledVector(right, -moveSpeed);
        if (moveRight)
            camera.position.addScaledVector(right, moveSpeed);
    }

    return { controls, updateMovement };
}
