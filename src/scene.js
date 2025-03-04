/*
* Name		    : scene.js
* Project	    : Atmospheric optics, rainbow, halo phenomena, sky color.
* Description   : Defines details of the scene
*
* Author        : Jozef Bilko (xbilko03)
*/
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.174.0/build/three.module.js';

export function createScene(sceneSize)
{
    const scene = new THREE.Scene();

    /* sky definition */
    const skyGeometry = new THREE.SphereGeometry(sceneSize, 32, 32);
    const skyMaterial = new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 } },
        vertexShader: `varying vec3 vWorldPosition;
        void main() {
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
        fragmentShader: `varying vec3 vWorldPosition;
        void main() {
            float gradient = smoothstep(-1.0, 1.0, normalize(vWorldPosition).y);
            gl_FragColor = vec4(mix(vec3(0.2, 0.4, 1.0), vec3(1.0, 0.5, 0.2), gradient), 1.0);
        }`,
        side: THREE.BackSide
    });
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(sky);

    /* rainbow definition */
    const rainbowGeometry = new THREE.RingGeometry(1.5, 2, 64, 1, 0, 2 * Math.PI);
    const rainbowMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8
    });
    const rainbow = new THREE.Mesh(rainbowGeometry, rainbowMaterial);
    rainbow.rotation.x = Math.PI / 2;
    rainbow.position.set(0, 1, -2);
    scene.add(rainbow);

    /* light definition */
    const light = new THREE.PointLight(0xffff00, 1, 100);
    light.position.set(0, 2, 0);
    scene.add(light);
    /* light ball */
    const lightSphereGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    const lightSphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const lightSphere = new THREE.Mesh(lightSphereGeometry, lightSphereMaterial);
    lightSphere.position.set(0, 2, 0);
    scene.add(lightSphere);

    /* scene */
    const groundGeometry = new THREE.CircleGeometry(sceneSize, 64);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x228A22 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = - Math.PI / 2;
    ground.position.y = -0.1;
    scene.add(ground);

    return scene;
}
