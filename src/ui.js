/*
* Name		    : ui.js
* Project	    : Atmospheric optics, rainbow, halo phenomena, sky color.
* Description   : Sets up the ui for the project
*
* Author        : Jozef Bilko (xbilko03)
*/


export let timeSliderValue = 6; // Defaultná hodnota
export let cloudsSliderValue = 0;
export let humiditySliderValue = 0;
export let rainSliderValue = 0;

export function createUI()
{
    /* window definition */
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

    /* header definition */
    const heading = document.createElement('h3');
    heading.textContent = 'Movement';
    uiWindow.appendChild(heading);

    /* list of words */
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

    /* light slider */
    const timeSliderLabel = document.createElement('label');
    timeSliderLabel.textContent = 'Clouds [octet]: ';
    timeSliderLabel.style.marginBottom = '5px';
    uiWindow.appendChild(timeSliderLabel);

    const timeSlider = document.createElement('input');
    timeSlider.type = 'range';
    timeSlider.min = '0';
    timeSlider.max = '8';
    timeSlider.value = '0';
    timeSlider.style.width = '100%';
    uiWindow.appendChild(timeSlider);

    const timeValue = document.createElement('span');
    timeValue.textContent = ` ${timeSlider.value}`;
    uiWindow.appendChild(timeValue);

    timeSlider.addEventListener('input', (e) =>
    {
        timeValue.textContent = ` ${e.target.value}`;
        cloudsSliderValue = parseFloat(e.target.value);
    });

    /* space between sliders */
    const spacer2 = document.createElement('div');
    spacer2.style.height = '15px';
    uiWindow.appendChild(spacer2);

    /* time slider */
    const lightSliderLabel = document.createElement('label');
    lightSliderLabel.textContent = 'Time [hours]: ';
    lightSliderLabel.style.marginBottom = '5px';
    uiWindow.appendChild(lightSliderLabel);

    const lightSlider = document.createElement('input');
    lightSlider.type = 'range';
    lightSlider.min = '6';
    lightSlider.max = '18';
    lightSlider.value = '6';
    lightSlider.style.width = '100%';
    uiWindow.appendChild(lightSlider);

    const lightValue = document.createElement('span');
    lightValue.textContent = ` ${lightSlider.value}`;
    uiWindow.appendChild(lightValue);

    lightSlider.addEventListener('input', (e) => {
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
                    timeValue.textContent = ` ${3}`;
                    cloudsSliderValue = 3;
                    timeSlider.value = '3';
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
                    timeValue.textContent = ` ${5}`;
                    cloudsSliderValue = 5;
                    timeSlider.value = '5';
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
                    timeValue.textContent = ` ${7}`;
                    cloudsSliderValue = 7;
                    timeSlider.value = '7';
                }
            }
    });

    /* append to doc */
    document.body.appendChild(uiWindow);
}
