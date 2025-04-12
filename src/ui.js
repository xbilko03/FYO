/*
* Name		    : ui.js
* Project	    : Atmospheric optics, rainbow, halo phenomena, sky color.
* Description   : Sets up the ui for the project
*
* Author        : Jozef Bilko (xbilko03)
*/


export let timeSliderValue = 6; // Defaultná hodnota


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
    timeSliderLabel.textContent = 'Light Intensity: ';
    timeSliderLabel.style.marginBottom = '5px';
    uiWindow.appendChild(timeSliderLabel);

    const timeSlider = document.createElement('input');
    timeSlider.type = 'range';
    timeSlider.min = '0';
    timeSlider.max = '100';
    timeSlider.value = '50';
    timeSlider.style.width = '100%';
    uiWindow.appendChild(timeSlider);

    const timeValue = document.createElement('span');
    timeValue.textContent = ` ${timeSlider.value}`;
    uiWindow.appendChild(timeValue);

    timeSlider.addEventListener('input', (e) =>
    {
        timeValue.textContent = ` ${e.target.value}`;
    });

    /* space between sliders */
    const spacer2 = document.createElement('div');
    spacer2.style.height = '15px';
    uiWindow.appendChild(spacer2);

    /* time slider */
    const lightSliderLabel = document.createElement('label');
    lightSliderLabel.textContent = 'Time: ';
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

    /* append to doc */
    document.body.appendChild(uiWindow);
}
