/*
* Name		    : ui.js
* Project	    : Atmospheric optics, rainbow, halo phenomena, sky color.
* Description   : Sets up the ui for the project
*
* Author        : Jozef Bilko (xbilko03)
*/

/* default global vars */
export let timeSliderValue = 6;
export let cloudsSliderValue = 0;
export let humiditySliderValue = 0;
export let rainSliderValue = 0;

export function createUI()
{
    /* window */
    const uiWindow = document.createElement('div');
    uiWindow.style.position = 'absolute';
    uiWindow.style.top = '20px';
    uiWindow.style.right = '20px';
    uiWindow.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    uiWindow.style.color = 'white';
    uiWindow.style.padding = '10px';
    uiWindow.style.borderRadius = '10px';
    uiWindow.style.fontFamily = 'Arial, sans-serif';
    uiWindow.style.fontSize = '16px';
    uiWindow.style.zIndex = '1000';

    /* header */
    const heading = document.createElement('h3');
    heading.textContent = 'Movement';
    uiWindow.appendChild(heading);

    /* list of controls */
    const list = document.createElement('ul');
    const items = ['Mouse - Look around', 'WASD - Move', 'ESC - Return mouse'];

    items.forEach(item => {
        const listItem = document.createElement('li');
        listItem.textContent = item;
        list.appendChild(listItem);
    });

    uiWindow.appendChild(list);

    /* space between list and sliders */
    const spacer = document.createElement('div');
    spacer.style.height = '15px'
    uiWindow.appendChild(spacer);

    /* cloud slider */
    const cloudSliderLabel = document.createElement('label');
    cloudSliderLabel.textContent = 'Clouds [octet]: ';
    cloudSliderLabel.style.marginBottom = '5px';
    uiWindow.appendChild(cloudSliderLabel);

    const cloudSlider = document.createElement('input');
    cloudSlider.type = 'range';
    cloudSlider.min = '0';
    cloudSlider.max = '8';
    cloudSlider.value = '0';
    cloudSlider.style.width = '100%';
    uiWindow.appendChild(cloudSlider);

    const cloudValue = document.createElement('span');
    cloudValue.textContent = ` ${cloudSlider.value}`;
    uiWindow.appendChild(cloudValue);

    cloudSlider.addEventListener('input', (e) =>
    {
        cloudValue.textContent = ` ${e.target.value}`;
        cloudsSliderValue = parseFloat(e.target.value);
    });

    /* space between sliders */
    const spacer2 = document.createElement('div');
    spacer2.style.height = '15px';
    uiWindow.appendChild(spacer2);

    /* time slider */
    const timeSliderLabel = document.createElement('label');
    timeSliderLabel.textContent = 'Time [hours]: ';
    timeSliderLabel.style.marginBottom = '5px';
    uiWindow.appendChild(timeSliderLabel);

    const timeSlider = document.createElement('input');
    timeSlider.type = 'range';
    timeSlider.min = '6';
    timeSlider.max = '18';
    timeSlider.value = '6';
    timeSlider.style.width = '100%';
    uiWindow.appendChild(timeSlider);

    const lightValue = document.createElement('span');
    lightValue.textContent = ` ${timeSlider.value}`;
    uiWindow.appendChild(lightValue);

    timeSlider.addEventListener('input', (e) => {
        lightValue.textContent = ` ${e.target.value}`;
        timeSliderValue = parseFloat(e.target.value);
    });

    /* space between sliders */
    const spacer3 = document.createElement('div');
    spacer3.style.height = '15px';
    uiWindow.appendChild(spacer3);

    /* humidity slider */
    const humiditySliderLabel = document.createElement('label');
    humiditySliderLabel.textContent = 'Relative Humidity [%]: ';
    humiditySliderLabel.style.marginBottom = '5px';
    uiWindow.appendChild(humiditySliderLabel);

    const humiditySlider = document.createElement('input');
    humiditySlider.type = 'range';
    humiditySlider.min = '0';
    humiditySlider.max = '100';
    humiditySlider.value = '0';
    humiditySlider.style.width = '100%';
    uiWindow.appendChild(humiditySlider);

    const humidityValue = document.createElement('span');
    humidityValue.textContent = ` ${humiditySlider.value}`;
    uiWindow.appendChild(humidityValue);

    humiditySlider.addEventListener('input', (e) => {
        humidityValue.textContent = ` ${e.target.value}`;
        humiditySliderValue = parseFloat(e.target.value);
    });

    /* space between sliders */
    const spacer4 = document.createElement('div');
    spacer4.style.height = '15px';
    uiWindow.appendChild(spacer4);

    /* rain slider */
    const rainSliderLabel = document.createElement('label');
    rainSliderLabel.textContent = 'Rain Level: ';
    rainSliderLabel.style.marginBottom = '5px';
    uiWindow.appendChild(rainSliderLabel);

    const rainSlider = document.createElement('input');
    rainSlider.type = 'range';
    rainSlider.min = '0';
    rainSlider.max = '3';
    rainSlider.value = '0';
    rainSlider.style.width = '100%';
    uiWindow.appendChild(rainSlider);

    const rainValue = document.createElement('span');
    rainValue.textContent = ` ${rainSlider.value}`;
    uiWindow.appendChild(rainValue);

    rainSlider.addEventListener('input', (e) => {
        rainValue.textContent = ` ${e.target.value}`;
        rainSliderValue = parseFloat(e.target.value);

        /* default minimum values defined for rain levels */
        if(rainSliderValue == 1)
            {
                if(humiditySliderValue < 60)
                {
                    humidityValue.textContent = ` ${60}`;
                    humiditySliderValue = 60;
                    humiditySlider.value = '60';
                }
                if(cloudsSliderValue < 3)
                {
                    cloudValue.textContent = ` ${3}`;
                    cloudsSliderValue = 3;
                    cloudSlider.value = '3';
                }
            }
            else 
            if(rainSliderValue == 2)
            {
                if(humiditySliderValue < 75)
                {
                    humidityValue.textContent = ` ${75}`;
                    humiditySliderValue = 75;
                    humiditySlider.value = '75';
                }
                if(cloudsSliderValue < 5)
                {
                    cloudValue.textContent = ` ${5}`;
                    cloudsSliderValue = 5;
                    cloudSlider.value = '5';
                }
            }
            else 
            if(rainSliderValue == 3)
            {
                if(humiditySliderValue < 85)
                {
                    humidityValue.textContent = ` ${85}`;
                    humiditySliderValue = 85;
                    humiditySlider.value = '85';
                }
                if(cloudsSliderValue < 7)
                {
                    cloudValue.textContent = ` ${7}`;
                    cloudsSliderValue = 7;
                    cloudSlider.value = '7';
                }
            }
    });

    /* finish */
    document.body.appendChild(uiWindow);
}
