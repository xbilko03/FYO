/*
* Name		    : scene.js
* Project	    : Atmospheric optics, rainbow, halo phenomena, sky color.
* Description   : Defines details of the scene
*
* Author        : Jozef Bilko (xbilko03)
*/
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.174.0/build/three.module.js';


var lightSphere;
var light;

export function createScene(sceneSize)
{
    const scene = new THREE.Scene();

    // Hodnota 'time' sa nastaví neskôr
    let time = 6; // predpokladajme, že máme čas medzi 0 a 24 hod.

    /* sky definition */
    const skyGeometry = new THREE.SphereGeometry(sceneSize, 32, 32);
    const skyMaterial = new THREE.ShaderMaterial({
        uniforms: { 
            time: { value: time } // inicializujeme time na hodnotu 12
        },
        vertexShader: `varying vec3 vWorldPosition;
        void main() {
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
        fragmentShader: `varying vec3 vWorldPosition;
uniform float time; // pridáme čas ako uniform

void main() {
    // Definovanie farieb pre rôzne časti dňa
    vec3 morningColor = vec3(0.6, 0.8, 1.0); // ranná obloha (svetlomodrá)
    vec3 middayColor = vec3(0.1, 0.5, 1.0); // poludnie (jasne modrá)
    vec3 eveningColor = vec3(1.0, 0.6, 0.3); // večerná obloha (oranžová)

    // Získanie "timeFactor" pre interpoláciu
    float morning = smoothstep(6.0, 9.0, time); // ranná fáza
    float midday = smoothstep(9.0, 15.0, time); // poludňajšia fáza
    float evening = smoothstep(15.0, 18.0, time); // večerná fáza

    // Kombinácia farieb v závislosti od času
    vec3 skyColor = mix(morningColor, middayColor, midday);
    skyColor = mix(skyColor, eveningColor, evening);

    // Vytvorenie gradientu farby oblohy na základe výšky
    float gradient = smoothstep(-1.0, 1.0, normalize(vWorldPosition).y);
    
    // Aplikovanie farby na oblohu
    gl_FragColor = vec4(skyColor, 1.0); // výsledná farba oblohy
}

`,
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
    light = new THREE.DirectionalLight(0xffff00, 1);
    light.position.set(0, 100, 0);
    scene.add(light);
    /* light ball */
    const lightSphereGeometry = new THREE.SphereGeometry(10.2, 16, 16);
    const lightSphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    lightSphere = new THREE.Mesh(lightSphereGeometry, lightSphereMaterial);
    lightSphere.position.set(0, 2, 0);
    scene.add(lightSphere);

    /* scene */
    const groundGeometry = new THREE.CircleGeometry(sceneSize, 64);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x228A22 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = - Math.PI / 2;
    ground.position.y = -0.5;
    scene.add(ground);

    return scene;
}
export function updateSkyColor(time, scene) {
    // Získame referenciu na sky mesh z scény
    const sky = scene.children.find(child => child.type === 'Mesh' && child.geometry.type === 'SphereGeometry');

    // Ak nájdeme sky mesh, aktualizujeme jeho 'time' uniform
    if (sky && sky.material && sky.material.uniforms) {
        sky.material.uniforms.time.value = time; // nastavíme nový čas
    }
}
/* Aktualizácia pozície slnka podľa času */
export function updateSunPosition(time, scene)
{
    console.log('Aktualizácia pozície slnka');

    if (lightSphere && light)
    {
        const radius = 100;

        // Azimut (θ) sa pohybuje od 0 po 2π počas denného cyklu
        // Tento pohyb je riadený časom (0 až 24)
        const angle = (time) * Math.PI / 12;  // Čas sa upraví tak, aby bol od 6:00 (0) do 18:00 (2π)

        // Výška (φ) slnka sa mení podľa času (stúpa od 6:00 do 12:00, potom klesá)
        const height = Math.max(0.1, Math.sin(Math.PI * (time) / 12));  // Používame sínusovú funkciu na výšku

        // Výpočet pozície slnka v 3D priestore
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);  // Y pozícia slnka
        const z = height;                    // Z pozícia slnka (dynamická výška)

        // Nastavenie pozície slnka
        lightSphere.position.set(x, y, z);
        light.position.set(x + 30, y + 30, z + 30);

        // Nastavenie intenzity svetla podľa času (najvyššia intenzita na poludnie)
        light.intensity = 2; // Ráno a večer je intenzita nízka, na poludnie je najvyššia
    }
}
