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
let cloudsDens = 0.5;

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
        uniform float time;
    
        void main() {
            // Definovanie farieb pre rôzne časti dňa
            vec3 morningColor = vec3(0.9, 0.6, 0.3); // ranná obloha (oranžová)
            vec3 middayColor = vec3(0.1, 0.6, 1.0); // poludnie (jasne modrá)
            vec3 eveningColor = vec3(0.9, 0.6, 0.3); // večerná obloha (oranžová)
    
            // Interpolácia podľa času
            float morning = smoothstep(4.0, 4.0, time);  // ranná fáza (6:00 až 9:00)
            float midday = smoothstep(6.0, 13.0, time);  // poludňajšia fáza (9:00 až 15:00)
            float evening = smoothstep(13.0, 18.0, time); // večerná fáza (15:00 až 18:00)
    
            // Kombinácia farieb podľa času
            vec3 skyColor = mix(morningColor, middayColor, midday);
            skyColor = mix(skyColor, eveningColor, evening);
    
            // Aplikovanie farby na oblohu
            gl_FragColor = vec4(skyColor, 1.0); // výsledná farba oblohy
        }`,
        side: THREE.BackSide
    });
    
    
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(sky);
    
    /* clouds definition */
    const cloudGeometry = new THREE.SphereGeometry(sceneSize + 5, 32, 32);
    const cloudMaterial = new THREE.ShaderMaterial({
        uniforms: { 
            time: { value: time },  // Start time, which can be updated later
            cloudDensity: { value: cloudsDens }  // Set the cloud density here
        },
    vertexShader: `
    varying vec3 vWorldPosition;
    void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,
    fragmentShader: `
         varying vec3 vWorldPosition;
    uniform float time;
    uniform float cloudDensity;
    

    // Hashovanie
    float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);

        vec2 u = f * f * (3.0 - 2.0 * f);

        return mix(
            mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
            mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
            u.y
        );
    }

    float fbm(vec2 p) {
        float total = 0.0;
        float amplitude = 0.5;
        for (int i = 0; i < 5; i++) {
            total += noise(p) * amplitude;
            p *= 2.0;
            amplitude *= 0.5;
        }
        return total;
    }

    void main() {
    vec2 coord = vWorldPosition.xz * 0.3 + vec2(time * 0.01, 0.0);
    float cloud = fbm(coord);

    // Dynamický threshold: čím vyššia hustota, tým viac oblakov prejde prahom
    float lower = 0.5 - cloudDensity * 2.5; // napr. od 1.0 (bez oblakov) po 0.4 (veľa oblakov)
    float upper = lower + 4.0;              // mäkký prechod
    float alpha = smoothstep(lower, upper, cloud);

    // Farby oblakov na základe času
    vec3 morningCloudColor = vec3(1.0, 1.0, 1.0);  // Svetlé obláčky ráno
    vec3 middayCloudColor = vec3(0.8, 0.8, 0.9);   // Jemne modré obláčky cez deň
    vec3 eveningCloudColor = vec3(0.9, 0.7, 0.5);  // Teplé oranžové obláčky večer

    // Interpolácia farieb na základe času
    float morning = smoothstep(6.0, 9.0, time); // ranná fáza
    float midday = smoothstep(9.0, 15.0, time); // poludňajšia fáza
    float evening = smoothstep(15.0, 18.0, time); // večerná fáza

    // Kombinácia farieb oblakov podľa času
    vec3 cloudColor = mix(morningCloudColor, middayCloudColor, midday);
    cloudColor = mix(cloudColor, eveningCloudColor, evening);

    // Dynamická farba oblakov na základe hustoty
    // Ak je cloudDensity vyššia, oblak bude tmavší
    cloudColor *= mix(1.0, 0.6, cloudDensity); // Znižujeme jas farby, čím je cloudDensity vyššia

    // Mixovanie farby a šumu
    vec3 color = mix(cloudColor, vec3(1.0), cloud * 0.5); // Miešame farbu na základe šumu

    gl_FragColor = vec4(color, alpha); // Výsledná farba oblakov
}

`,
    transparent: true,
    side: THREE.BackSide  // Zaistíme, že budú priesvitné
});

// Vytvoríme mesh pre oblaky
const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
clouds.position.set(0, -50, -2);
clouds.name = 'clouds';  // Ensure it's named 'clouds'
scene.add(clouds);

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

    if (lightSphere && light)
    {
        const radius = 105;

        // Azimut (θ) sa pohybuje od 0 po 2π počas denného cyklu
        const angle = (time) * Math.PI / 12;  // Čas sa upraví tak, aby bol od 6:00 (0) do 18:00 (2π)
        time = time;

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
        // Pre interval [0, 12] prechádza od 0 do 2 (rastie až na poludnie), potom späť na 0
        let timeIntensity = Math.sin(Math.PI * (time / 12)) * 2.0 + 2.0; 

        // Dynamická zmena intenzity svetla podľa hustoty oblakov (cloudDensity)
        // Ak je cloudDensity vyššia, svetlo bude slabšie
        let cloudFactor = 1.0 - (cloudsDens / 2.0); // cloudDens je medzi 0 a 2, takže 0 bude zodpovedať 1 (plné svetlo), a 2 bude zodpovedať 0 (tma)

        // Nastavenie intenzity svetla na základe času a cloudDensity
        light.intensity = timeIntensity * cloudFactor + 0.5;
    }
}

export function updateClouds(time, scene, okta) {
    // Find the cloud mesh (since it's the only one)
    const cloud = scene.children.find(child => child.name === 'clouds');

    // If the cloud mesh is found and it has the expected material and uniforms
    if (cloud && cloud.material && cloud.material.uniforms) {
        // Update the time and cloud density values in the shader uniforms
        cloud.material.uniforms.time.value = time;
        cloud.material.uniforms.cloudDensity.value = okta / 4;  // Assuming okta controls cloud density
        cloudsDens = okta / 4;
    }
}
