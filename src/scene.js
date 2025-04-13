/*
* Name		    : scene.js
* Project	    : Atmospheric optics, rainbow, SunShine phenomena, sky color.
* Description   : Defines details of the scene
*
* Author        : Jozef Bilko (xbilko03)
*/
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.174.0/build/three.module.js';


var lightSphere;
var light;
let cloudsDens = 0.0;
let humidityRel = 100;

export function createScene(sceneSize)
{
    const scene = new THREE.Scene();

    // Hodnota 'time' sa nastaví neskôr
    let time = 6; // predpokladajme, že máme čas medzi 0 a 24 hod.

    /* sky definition */
    const skyGeometry = new THREE.SphereGeometry(sceneSize, 32, 32);
    const skyMaterial = new THREE.ShaderMaterial({
        uniforms: { 
            time: { value: time }
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
    const cloudGeometry = new THREE.SphereGeometry(sceneSize + 7, 32, 32);
    const cloudMaterial = new THREE.ShaderMaterial({
        uniforms: { 
            time: { value: time },
            cloudDensity: { value: cloudsDens }
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
    float upper = lower + 5.0;              // mäkký prechod
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






const rainbowGeometry = new THREE.RingGeometry(56, 65, 128, 1, 0, Math.PI);

const rainbowMaterialEvening = new THREE.ShaderMaterial({
    uniforms: {
        opacity: { value: 1.0}
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        varying vec2 vUv;
        uniform float opacity;

        vec3 getRainbowColor(float t) {
    // Čisté pásy: každý rozsah má svoju farbu
    if (t < 0.44) return vec3(0.56, 0.0, 1.0);
    else if (t < 0.45) return vec3(0.29, 0.0, 0.51);
    else if (t < 0.46) return vec3(0.0, 0.0, 1.0);
    else if (t < 0.47) return vec3(0.0, 1.0, 0.0);
    else if (t < 0.48) return vec3(1.0, 1.0, 0.0);
    else if (t < 0.49) return vec3(1.0, 0.5, 0.0);
    else return vec3(1.0, 0.0, 0.0);
}


        void main() {
            float angle = atan(vUv.y - 0.5, vUv.x - 0.5);
            float radius = length(vUv - vec2(0.5));
            float t = radius; // used as gradient input

            vec3 color = getRainbowColor(t);
            gl_FragColor = vec4(color, opacity);
        }
    `,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false
});
const rainbowMaterialMorning = new THREE.ShaderMaterial({
    uniforms: {
        opacity: { value: 1.0}
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        varying vec2 vUv;
        uniform float opacity;

        vec3 getRainbowColor(float t) {
    // Čisté pásy: každý rozsah má svoju farbu
    if (t < 0.44) return vec3(0.56, 0.0, 1.0);
    else if (t < 0.45) return vec3(0.29, 0.0, 0.51);
    else if (t < 0.46) return vec3(0.0, 0.0, 1.0);
    else if (t < 0.47) return vec3(0.0, 1.0, 0.0);
    else if (t < 0.48) return vec3(1.0, 1.0, 0.0);
    else if (t < 0.49) return vec3(1.0, 0.5, 0.0);
    else return vec3(1.0, 0.0, 0.0);
}


        void main() {
            float angle = atan(vUv.y - 0.5, vUv.x - 0.5);
            float radius = length(vUv - vec2(0.5));
            float t = radius; // used as gradient input

            vec3 color = getRainbowColor(t);
            gl_FragColor = vec4(color, opacity);
        }
    `,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false
});

const rainbowEvening = new THREE.Mesh(rainbowGeometry, rainbowMaterialEvening);
rainbowEvening.rotation.y = 1.56;
rainbowEvening.position.set(70, -5, 0); // trochu vyššie
rainbowEvening.name = 'rainbowEvening';

scene.add(rainbowEvening);


const rainbowMorning = new THREE.Mesh(rainbowGeometry, rainbowMaterialMorning);
rainbowMorning.rotation.y = 1.56;
rainbowMorning.position.set(-70, -5, 0); // trochu vyššie
rainbowMorning.name = 'rainbowMorning';

scene.add(rainbowMorning);




    /* light definition */
    light = new THREE.DirectionalLight(0xffff00, 1);
    light.position.set(0, 100, 0);
    scene.add(light);
    /* light ball */
    const lightSphereGeometry = new THREE.SphereGeometry(10.2, 16, 16);
    const lightSphereMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, 0.7, 0.2) });

    lightSphere = new THREE.Mesh(lightSphereGeometry, lightSphereMaterial);
    lightSphere.position.set(0, 2, 0);
    scene.add(lightSphere);



// Definícia pre SunShine efekt okolo slnka
const SunShineGeometry = new THREE.CircleGeometry(800, 800);  // väčší polomer podľa potreby
const SunShineMaterial = new THREE.ShaderMaterial({
    uniforms: {
        lightPosition: { value: new THREE.Vector3(0, 0, 0) },
        SunShineStrength: { value: 1.0 }
    },
    vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1);
        }
    `,
    fragmentShader: `
        varying vec3 vWorldPosition;
        uniform vec3 lightPosition;
        uniform float SunShineStrength;

        void main() {
            float dist = distance(vWorldPosition, lightPosition);
            float intensity = SunShineStrength * smoothstep(150.0, 0.0, dist);  // väčšie SunShine
            gl_FragColor = vec4(1.0, 1.0, 1.0, intensity);
        }
    `,
    transparent: true,
    depthWrite: false,  // Nezapisovať do depth bufferu
    depthTest: false,   // Vypneme depth test, aby SunShine nebolo orezané inými objektami
});

// SunShine mesh
const SunShine = new THREE.Mesh(SunShineGeometry, SunShineMaterial);
SunShine.name = 'SunShine';

// Nastavenie, aby sa SunShine vykreslovalo pred ostatnými objektmi
SunShine.renderOrder = 1; // Vyššia hodnota znamená, že sa objekt vykreslí neskôr, teda pred ostatnými

scene.add(SunShine);

const HaloGeometryRed = new THREE.RingGeometry(25, 25.7, 64);
const HaloGeometryBlue = new THREE.RingGeometry(25.5, 25.9, 64);
const HaloGeometryPurple = new THREE.RingGeometry(25.8, 26, 64);
const HaloGeometryLight = new THREE.RingGeometry(26, 350, 64);

const HaloMaterialRed = new THREE.ShaderMaterial({
    uniforms: {
        lightPosition: { value: new THREE.Vector3(0, 0, 0) },
        HaloStrength: { value: 1.0 },
        opacity: { value: humidityRel / 100.0},
        cloudDens: { value: cloudsDens }
    },
    vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1);
        }
    `,
    fragmentShader: `varying vec3 vWorldPosition;
        uniform vec3 lightPosition;
        uniform float HaloStrength;
        uniform float opacity;
        uniform float cloudDens;

void main() {
    float dist = distance(vWorldPosition, lightPosition);

    // Prechod od čiernej k žltej na okrajoch
    float intensity = smoothstep(45.0, 50.0, dist);  // Intenzita sa začína pri vnútornom okraji

    // Generovanie žltej farby na okrajoch
    vec3 haloColor = vec3(1.0, 0.0, 0.0); // Čistá žltá farba

  
            float cloudMultiplier = 0.0;


            if(cloudDens <= 1.5 && cloudDens >= 0.5)
            {
                cloudMultiplier = cloudDens - 1.0;
                if ( cloudMultiplier < 0.0)
                    { cloudMultiplier =  cloudMultiplier * -1.0; }
                cloudMultiplier = 1.0 - cloudMultiplier;
            }

    // Kombinovanie farby a intenzity
    gl_FragColor = vec4(haloColor * intensity, opacity * 0.05 * cloudMultiplier); // 1.0 pre plnú nepriehľadnosť
}

    `,
    transparent: true,
    depthWrite: false,  
    depthTest: false,   
});

const HaloMaterialBlue = new THREE.ShaderMaterial({
    uniforms: {
        lightPosition: { value: new THREE.Vector3(0, 0, 0) },
        HaloStrength: { value: 1.0 },
        opacity: { value: humidityRel / 100.0},
        cloudDens: { value: cloudsDens }
    },
    vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1);
        }
    `,
    fragmentShader: `varying vec3 vWorldPosition;
uniform vec3 lightPosition;
uniform float HaloStrength;
        uniform float opacity;
        uniform float cloudDens;

void main() {
    float dist = distance(vWorldPosition, lightPosition);

    // Prechod od čiernej k žltej na okrajoch
    float intensity = smoothstep(45.0, 50.0, dist);  // Intenzita sa začína pri vnútornom okraji

    // Generovanie žltej farby na okrajoch
    vec3 haloColor = vec3(0.0, 0.0, 1.0); // Čistá žltá farba

    float cloudMultiplier = 0.0;

            if(cloudDens <= 1.5 && cloudDens >= 0.5)
            {
                cloudMultiplier = cloudDens - 1.0;
                if ( cloudMultiplier < 0.0)
                    { cloudMultiplier =  cloudMultiplier * -1.0; }
                cloudMultiplier = 1.0 - cloudMultiplier;
            }
    // Kombinovanie farby a intenzity
    gl_FragColor = vec4(haloColor * intensity, opacity * 0.05 * cloudMultiplier); // 1.0 pre plnú nepriehľadnosť
}

    `,
    transparent: true,
    depthWrite: false,  
    depthTest: false,   
});

const HaloMaterialPurple = new THREE.ShaderMaterial({
    uniforms: {
        lightPosition: { value: new THREE.Vector3(0, 0, 0) },
        HaloStrength: { value: 1.0 },
        opacity: { value: humidityRel / 100.0},
        cloudDens: { value: cloudsDens }
    },
    vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1);
        }
    `,
    fragmentShader: `varying vec3 vWorldPosition;
uniform vec3 lightPosition;
uniform float HaloStrength;
        uniform float opacity;
        uniform float cloudDens;

void main() {
    float dist = distance(vWorldPosition, lightPosition);

    // Prechod od čiernej k žltej na okrajoch
    float intensity = smoothstep(45.0, 50.0, dist);  // Intenzita sa začína pri vnútornom okraji

    // Generovanie žltej farby na okrajoch
    vec3 haloColor = vec3(0.6, 0.4, 1.0); // Čistá žltá farba

    float cloudMultiplier = 0.0;

            if(cloudDens <= 1.5 && cloudDens >= 0.5)
            {
                cloudMultiplier = cloudDens - 1.0;
                if ( cloudMultiplier < 0.0)
                    { cloudMultiplier =  cloudMultiplier * -1.0; }
                cloudMultiplier = 1.0 - cloudMultiplier;
            }
    // Kombinovanie farby a intenzity
    gl_FragColor = vec4(haloColor * intensity, opacity * 0.05 * cloudMultiplier); // 1.0 pre plnú nepriehľadnosť
}

    `,
    transparent: true,
    depthWrite: false,  
    depthTest: false,   
});

const HaloMaterialLight = new THREE.ShaderMaterial({
    uniforms: {
        lightPosition: { value: new THREE.Vector3(0, 0, 0) },
        SunShineStrength: { value: 1.0 },
        opacity: { value: humidityRel / 100.0},
        cloudDens: { value: cloudsDens }
    },
    vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1);
        }
    `,
    fragmentShader: `
        varying vec3 vWorldPosition;
        uniform vec3 lightPosition;
        uniform float SunShineStrength;
        uniform float opacity;
        uniform float cloudDens;

        void main() {
            float dist = distance(vWorldPosition, lightPosition);
            float intensity = SunShineStrength * smoothstep(150.0, 0.0, dist);
            float cloudMultiplier = 0.0;

            if(cloudDens <= 1.5 && cloudDens >= 0.5)
            {
                cloudMultiplier = cloudDens - 1.0;
                if ( cloudMultiplier < 0.0)
                    { cloudMultiplier =  cloudMultiplier * -1.0; }
                cloudMultiplier = 1.0 - cloudMultiplier;
            }
            gl_FragColor = vec4(1.0, 1.0, 1.0, intensity * opacity *  cloudMultiplier);
        }
    `,
    transparent: true,
    depthWrite: false,  // Nezapisovať do depth bufferu
    depthTest: false,   // Vypneme depth test, aby SunShine nebolo orezané inými objektami
});


// Vytvorenie mesh pre Halo
const HaloRed = new THREE.Mesh(HaloGeometryRed, HaloMaterialRed);
const HaloBlue = new THREE.Mesh(HaloGeometryBlue, HaloMaterialBlue);
const HaloPurple = new THREE.Mesh(HaloGeometryPurple, HaloMaterialPurple);
const HaloLight = new THREE.Mesh(HaloGeometryLight, HaloMaterialLight);
HaloRed.name = 'HaloRed';
HaloBlue.name = 'HaloBlue';
HaloPurple.name = 'HaloPurple';
HaloLight.name = 'HaloLight';

// Nastavenie pre vykresľovanie Halo objektu
HaloRed.renderOrder = 1; 
HaloBlue.renderOrder = 1; 
HaloPurple.renderOrder = 1; 
HaloLight.renderOrder = 1; 

scene.add(HaloRed);
scene.add(HaloBlue);
scene.add(HaloPurple);
scene.add(HaloLight);









    /* rain definition */
    const rainCount = 100000; // Počet kvapiek dažďa
    const rainGeometry = new THREE.BufferGeometry();
    const rainPositions = new Float32Array(rainCount * 3); // x, y, z pre každú kvapku

    for (let i = 0; i < rainCount; i++) {
        rainPositions[i * 3] = (Math.random() - 0.5) * sceneSize * 2;    // x
        rainPositions[i * 3 + 1] = Math.random() * 50 + 10;              // y
        rainPositions[i * 3 + 2] = (Math.random() - 0.5) * sceneSize * 2; // z
    }

    rainGeometry.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));

    const rainMaterial = new THREE.PointsMaterial({
        color: 0xaaaaaa,
        size: 0.1,
        transparent: true,
        opacity: 0.6
    });

    const rain = new THREE.Points(rainGeometry, rainMaterial);
    rain.name = 'rain';
    rain.visible = false; // Na začiatku dážď vypnutý

    scene.add(rain);


    /* scene */
    const groundGeometry = new THREE.CircleGeometry(sceneSize, 64);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x228A22 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = - Math.PI / 2;
    ground.position.y = -0.5;
    scene.add(ground);
    

    return scene;
}

export function updateRainLevel(rainIntensity, scene) {
    const rain = scene.getObjectByName('rain');
    if (!rain) return;

    rain.visible = rainIntensity > 0.0;

    if (rain.material && rain.material.opacity !== undefined) {
        rain.material.opacity = Math.min(0.2 + rainIntensity * 0.8, 1.0);
    }

    // Počet aktívnych kvapiek (napr. max 100k * intenzita)
    const maxRainCount = 10000;
    const activeRainCount = Math.floor(rainIntensity * maxRainCount);

    const positions = rain.geometry.attributes.position.array;

    for (let i = 0; i < activeRainCount * 3; i += 3) {
        positions[i + 1] -= 0.5 + rainIntensity * 1.5;

        if (positions[i + 1] < 0) {
            positions[i + 1] = Math.random() * 50 + 10;
        }
    }
    rain.geometry.setDrawRange(0, activeRainCount);

    rain.geometry.attributes.position.needsUpdate = true;
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

export function updateRainbowVisibility(time, okta, rain, scene) {
    const rainbowMorning = scene.getObjectByName('rainbowMorning');
    const rainbowEvening = scene.getObjectByName('rainbowEvening');

    if (!rainbowMorning || !rainbowEvening) return;

    let finalOpacityEvening = 0.0;
    let finalOpacityMorning = 0.0;

    if(rain > 0.0)
    {
        if(okta < 7.0)
        {
            if(time < 9.0)
            {
                finalOpacityMorning = 1 - okta / 8.0;
                finalOpacityMorning = finalOpacityMorning / 4.0;

                if(time > 7.0)
                    rainbowMorning.position.y = -50;
                else if(time > 6.0)
                    rainbowMorning.position.y = -30;
                else
                    rainbowMorning.position.y = -10;
            }
            else if(time > 15.0)
            {
                finalOpacityEvening = 1 - okta / 8.0;
                finalOpacityEvening = finalOpacityEvening / 4.0;

                if(time < 17.0)
                    rainbowEvening.position.y = -50;
                else if(time < 18.0)
                    rainbowEvening.position.y = -30;
                else
                    rainbowEvening.position.y = -10;
            }
        }
    }

    rainbowMorning.material.uniforms.opacity.value = finalOpacityMorning;
    rainbowEvening.material.uniforms.opacity.value = finalOpacityEvening;
}

export function updateClouds(time, scene, okta) {
    // Find the cloud mesh (since it's the only one)
    const cloud = scene.children.find(child => child.name === 'clouds');

    const HaloRed = scene.children.find(child => child.name === 'HaloRed');
    const HaloBlue = scene.children.find(child => child.name === 'HaloBlue');
    const HaloPurple = scene.children.find(child => child.name === 'HaloPurple');
    const HaloLight = scene.children.find(child => child.name === 'HaloLight');

    // If the cloud mesh is found and it has the expected material and uniforms
    if (cloud && cloud.material && cloud.material.uniforms) {
        // Update the time and cloud density values in the shader uniforms
        cloud.material.uniforms.time.value = time;
        cloud.material.uniforms.cloudDensity.value = okta / 4;  // Assuming okta controls cloud density
        cloudsDens = okta / 4;
        HaloRed.material.uniforms.cloudDens.value = cloudsDens;
        HaloBlue.material.uniforms.cloudDens.value = cloudsDens;
        HaloPurple.material.uniforms.cloudDens.value = cloudsDens;
        HaloLight.material.uniforms.cloudDens.value = cloudsDens;
    }
}
export function updateSunShineEffect(time, scene, camera, humidity) {
    humidityRel = humidity;
    
    const SunShine = scene.children.find(child => child.name === 'SunShine');
    const HaloRed = scene.children.find(child => child.name === 'HaloRed');
    const HaloBlue = scene.children.find(child => child.name === 'HaloBlue');
    const HaloPurple = scene.children.find(child => child.name === 'HaloPurple');
    const HaloLight = scene.children.find(child => child.name === 'HaloLight');
    // Získame referenciu na SunShine mesh (už vieme, že je len jeden)

    if (SunShine && SunShine.material && SunShine.material.uniforms) {
        // Aktualizujeme pozíciu SunShine efektu podľa pozície svetla (slnka)
        SunShine.lookAt(camera.position);
        SunShine.position.copy(lightSphere.position);

        HaloRed.lookAt(camera.position);
        HaloRed.position.copy(lightSphere.position);
        HaloRed.material.uniforms.opacity.value = humidity / 100;
        
        HaloBlue.lookAt(camera.position);
        HaloBlue.position.copy(lightSphere.position);
        HaloBlue.material.uniforms.opacity.value = humidity / 100;
        
        HaloPurple.lookAt(camera.position);
        HaloPurple.position.copy(lightSphere.position);
        HaloPurple.material.uniforms.opacity.value = humidity / 100;
        
        HaloLight.lookAt(camera.position);
        HaloLight.position.copy(lightSphere.position);
        HaloLight.material.uniforms.opacity.value = humidity / 100;

        HaloRed.material.uniforms.cloudDens.value = cloudsDens;
        HaloBlue.material.uniforms.cloudDens.value = cloudsDens;
        HaloPurple.material.uniforms.cloudDens.value = cloudsDens;
        HaloLight.material.uniforms.cloudDens.value = cloudsDens;



        // Môžeme nastaviť dynamickú intenzitu SunShine efektu podľa času
        //const SunShineIntensity = Math.sin(Math.PI * (time / 12)) * 0.5 + 0.5;  // Dynamická intenzita na základe času
        //SunShine.material.uniforms.SunShineStrength.value = SunShineIntensity;  // Nastavenie intenzity SunShine
    }
    else
        console.log("kokot");

}