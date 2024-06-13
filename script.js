/**
 * Image sources
 * {folderName (in assets folder): [fileNames or fileIndexes],...}
 */
let sources = {
    players: [...Array(84).keys()],
    pitches: [...Array(16).keys()],
    tools: ['draw', 'text', 'line', 'dashedLine', 'arrow', 'dashedArrow', 'curvedArrow', 'dashedCurvedArrow', 'circle', 'move', 'delete', 'download', 'downloadJSON', 'uploadJSON'],
    equipments: [...Array(41).keys()],
};

/**
 * Loads images
 * 
 * Edited version of https://www.html5canvastutorials.com/tutorials/html5-canvas-image-loader/
 * Loads images in a manner that it stores loaded images in a similar structure as the sources
 * Don't touch unless you know what you're doing!
 */
function loadImages(sources, callback) {
    let images = {};
    let loadedImages = 0;
    let numImages = 0;

    for (let type in sources) {
        numImages += sources[type].length;
    }
    for (let type in sources) {
        images[type] = [];
        for (let src of sources[type]) {
            images[type][src] = new Image();
            images[type][src].crossOrigin = 'anonymous';
            images[type][src].onload = function () {
                if (++loadedImages >= numImages) {
                    callback(images);
                }
            };
            images[type][src].src = `assets/${type}/${src}.png`;
        }
    }
};

/**
 * Main script
 */
loadImages(sources, function (images) {
    /**
     * Downloads data URI as a file
     * 
     * @param {*} uri URI
     * @param {String} name File name
     */
    function downloadURI(uri, name) {
        let link = document.createElement('a');
        link.download = name;
        link.href = uri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        delete link;
    }

    /**
     * Adds notes to final image
     */
    function addNotes() {
        if (document.getElementById('notesOption').checked) {
            stage.height(700);
            pitchLayer.add(
                new Konva.Rect({
                    x: 0,
                    y: height,
                    width: width,
                    height: 200,
                    fill: 'white',
                }),
                new Konva.Text({
                    x: 5,
                    y: height + 5,
                    width: width - 10,
                    height: 190,
                    text: document.getElementById('notesInput').value,
                    fontSize: 15,
                    fontFamily: 'Open Sans',
                })
            );
        }
    }

    /**
     * Downloads the stage as an image
     */
    async function downloadImage() {
        // (!) Experimental use of the Files System Access API
        // If the browser supports the API
        if (window.showSaveFilePicker) {
            const handle = await showSaveFilePicker({
                types: [
                    {
                        description: 'PNG File',
                        accept: {
                            'image/png': ['.png'],
                        },
                    },
                ],
            });

            await addNotes();

            let image = await new Promise((res) => stage.toCanvas().toBlob(res));
            const writable = await handle.createWritable();
            await writable.write(image);
            writable.close();
        }
        // If the browser does not support the API
        else {
            await addNotes();

            const fileName = prompt('File Name:');
            // Do nothing if user cancels prompt
            if (fileName == null)
                return;
            await downloadURI(stage.toDataURL({ pixelRatio: 3 }), `${fileName}.png`);
        }
        // Reset height of stage
        await stage.height(520);
    }

    /**
     * Downloads the stage as JSON
     */
    async function downloadJSON() {
        // (!) Experimental use of the Files System Access API
        // If the browser supports the API
        if (window.showSaveFilePicker) {
            const handle = await showSaveFilePicker({
                types: [
                    {
                        description: 'HNKL File',
                        accept: {
                            'text/json': ['.hnkl'],
                        },
                    },
                ],
            });
            const JSON = stage.toJSON();
            const writable = await handle.createWritable();
            await writable.write(JSON);
            writable.close();
        }
        // If the browser does not support the API
        else {
            const fileName = prompt('File Name:');
            // Do nothing if user cancels prompt
            if (fileName == null)
                return;
            await downloadURI('data:text/json;charset=utf-8,' + encodeURIComponent(stage.toJSON()), `${fileName}.hnkl`);
        }
    }

    /**
     * Adds interactions with the stage
     */
    function addInteractions() {
        // Reset variables
        currentMode = 'none';
        currentCursor = 'default';
        stage.container().style.cursor = currentCursor;

        // Graphics
        stage.on('click tap', function (e) {
            if (currentMode != 'none')
                changed = true;
            let pos = stage.getRelativePointerPosition();
            if (currentMode == 'players') {
                addImage('players', selectedImage, pos.x, pos.y);
            } else if (currentMode == 'text') {
                addText(prompt('Add text:'), pos.x, pos.y);
            } else if (currentMode == 'equipments') {
                addImage('equipments', selectedImage, pos.x, pos.y);
            } else if (currentMode == 'delete') {
                // Prevent deletion of the pitch
                if (e.target.attrs.width == width)
                    return;
                e.target.destroy();
                stage.container().style.cursor = currentCursor;
            }
        });

        // Markup
        stage.on('mousedown touchstart', function () {
            if (currentMode != 'none')
                changed = true;
            const pos = stage.getPointerPosition();
            originalPosition = {
                x: pos.x,
                y: pos.y,
            };
            markup = true;

            switch (currentMode) {
                case 'draw':
                case 'line':
                case 'dashedLine':
                    line = new Konva.Line({
                        stroke: document.getElementById('colorPicker').value,
                        strokeWidth: 2,
                        globalCompositeOperation: 'source-over',
                        lineCap: 'round',
                        lineJoin: 'round',
                        points: [pos.x, pos.y, pos.x, pos.y],
                        dash: currentMode == 'dashedLine' ? [15, 10] : [],
                    });
                    break;
                case 'arrow':
                case 'dashedArrow':
                    line = new Konva.Arrow({
                        stroke: document.getElementById('colorPicker').value,
                        strokeWidth: 2,
                        fill: document.getElementById('colorPicker').value,
                        globalCompositeOperation: 'source-over',
                        lineCap: 'round',
                        lineJoin: 'round',
                        dash: currentMode == 'dashedArrow' ? [15, 10] : [],
                    });
                    break;
                case 'curvedArrow':
                case 'dashedCurvedArrow':
                    line = new Konva.Arrow({
                        stroke: document.getElementById('colorPicker').value,
                        strokeWidth: 2,
                        fill: document.getElementById('colorPicker').value,
                        globalCompositeOperation: 'source-over',
                        lineCap: 'round',
                        lineJoin: 'round',
                        bezier: true,
                        dash: currentMode == 'dashedCurvedArrow' ? [15, 10] : [],
                    });
                    break;
                case 'circle':
                    line = new Konva.Ellipse({
                        x: pos.x,
                        y: pos.y,
                        stroke: document.getElementById('colorPicker').value,
                        strokeWidth: 2,
                        globalCompositeOperation: 'source-over',
                    });
                    break;
                case 'delete':
                    deleting = true;
                    return;
                default:
                    return;
            }
            markupLayer.add(line);
        });
        stage.on('mouseup touchend', function () {
            markup = false;
            deleting = false;
        });
        stage.on('mousemove touchmove', function (e) {
            const pos = stage.getPointerPosition();
            e.evt.preventDefault();
            if (!markup) {
                return;
            }

            switch (currentMode) {
                case 'draw':
                    let newPoints = line.points().concat([pos.x, pos.y]);
                    line.points(newPoints);
                    break;
                case 'line':
                case 'dashedLine':
                case 'arrow':
                case 'dashedArrow':
                    line.points([originalPosition.x, originalPosition.y, pos.x, pos.y]);
                    break;
                case 'curvedArrow':
                case 'dashedCurvedArrow':
                    if (Math.abs(originalPosition.x - pos.x) > Math.abs(originalPosition.y - pos.y)) {
                        line.points([originalPosition.x, originalPosition.y, originalPosition.x, originalPosition.y, pos.x, originalPosition.y, pos.x, pos.y]);
                        if (e.evt.shiftKey) {
                            line.points([originalPosition.x, originalPosition.y, originalPosition.x, originalPosition.y, originalPosition.x, pos.y, pos.x, pos.y]);
                        }
                    } else {
                        line.points([originalPosition.x, originalPosition.y, originalPosition.x, originalPosition.y, originalPosition.x, pos.y, pos.x, pos.y]);
                        if (e.evt.shiftKey) {
                            line.points([originalPosition.x, originalPosition.y, originalPosition.x, originalPosition.y, pos.x, originalPosition.y, pos.x, pos.y]);
                        }
                    }
                    break;
                case 'circle':
                    line.radius({ x: Math.abs(originalPosition.x - pos.x), y: Math.abs(originalPosition.y - pos.y) });
                    break;
                case 'delete':
                    if (deleting) {
                        if (e.target.attrs.width == width)
                            return;
                        e.target.destroy();
                        stage.container().style.cursor = currentCursor;
                    }
                    break;
                default:
                    return;
            }
        });


        // Change cursor when interacting with objects
        graphicsLayer.on('mouseenter', function () {
            if (currentMode == 'players' || currentMode == 'equipments' || currentMode == 'text' || currentMode == 'move') {
                stage.container().style.cursor = 'move';
            }
            else if (currentMode == 'delete') {
                stage.container().style.cursor = 'crosshair';
            }
        });
        graphicsLayer.on('mouseleave', function () {
            stage.container().style.cursor = currentCursor;
        });
        markupLayer.on('mouseenter', function () {
            if (currentMode == 'delete') {
                stage.container().style.cursor = 'crosshair';
            }
        });
        markupLayer.on('mouseleave', function () {
            stage.container().style.cursor = currentCursor;
        });
    }

    /**
     * Changes `currentMode` and the cursor to the affiliated icon
     * 
     * @param {String} mode The mode (players, tools, or equipments) that `currentMode` and the cursor is changing to
     * @param {String} tool (optional) If `mode` is 'tools', the specific tool (draw, text, line...) that `currentMode` and the cursor is changing to
     */
    function changeMode(mode, tool = '') {
        // Make graphics draggable depending on the mode/tool
        for (i of graphicsLayer.children) {
            i.draggable(mode == 'players' || mode == 'equipments' || tool == 'text' || tool == 'move');
        }
        // Download image, download JSON, or upload JSON depending on mode
        if (tool == 'download') {
            downloadImage();
            return;
        } else if (tool == 'downloadJSON') {
            stage.setAttr('notes', document.getElementById('notesInput').value);
            downloadJSON();
            return;
        } else if (tool == 'uploadJSON') {
            // Reset variables
            currentMode = 'none';
            currentCursor = 'default';
            stage.container().style.cursor = currentCursor;

            const uploadFile = document.getElementById('uploadFile');
            uploadFile.click();
            return;
        }
        // Change the cursor and the current mode
        currentCursor = tool == '' ? `url('assets_low/${mode}/${selectedImage}.png') ${images[mode][selectedImage].width * 0.3 / 2} ${images[mode][selectedImage].height * 0.3 / 2}, auto` : 'default';
        stage.container().style.cursor = currentCursor;
        currentMode = tool == '' ? mode : tool;
    }

    /**
     * Loads the menu by adding icons and event listeners
     */
    function loadMenu() {
        // Create player elements
        for (let i of sources['players']) {
            if (i <= 31) {
                document.getElementById('team1').innerHTML += `<img class="player" id="player${i}" src="assets/players/${i}.png" draggable="false"></img>`;
            } else if (i > 31 && i <= 63) {
                document.getElementById('team2').innerHTML += `<img class="player" id="player${i}" src="assets/players/${i}.png" draggable="false"></img>`;
            } else {
                document.getElementById('gk').innerHTML += `<img class="player" id="player${i}" src="assets/players/${i}.png" draggable="false"></img>`;
            }
        }
        // Add event listeners
        for (let i of sources['players']) {
            document.getElementById(`player${i}`).addEventListener('click', function () {
                for (let j of sources['tools']) {
                    document.getElementById(j).dataset.selected = false;
                }
                selectedImage = i;
                changeMode('players');
            });
        }

        // Create tool elements
        for (let i of sources['tools']) {
            document.getElementById('tools').innerHTML += `<img class="tool" id="${i}" src="assets/tools/${i}.png" data-selected="false" draggable="false"></img>`;
        }
        for (let i of sources['tools']) {
            let element = document.getElementById(i);
            element.addEventListener('click', function () {
                for (let j of sources['tools']) {
                    document.getElementById(j).dataset.selected = false;
                }
                element.dataset.selected = true;
                selectedImage = i;
                changeMode('tools', i);
            });
        }

        // Create equipment elements
        for (let i of sources['equipments']) {
            document.getElementById('equipments').innerHTML += `<img class="equipment${images['equipments'][i].width < 15 / 0.3 || images['equipments'][i].height < 14 / 0.3 ? 'Small' : 'Large'}" id="equipment${i}" src="assets_low/equipments/${i}.png" draggable="false"></img>`;
            if (i == 6 || i == 15 || i == 22 || i == 28 || i == 32 || i == 36) {
                document.getElementById('equipments').innerHTML += '<br>';
            }
        }
        // Add event listeners
        for (let i of sources['equipments']) {
            document.getElementById(`equipment${i}`).addEventListener('click', function () {
                for (let j of sources['tools']) {
                    document.getElementById(j).dataset.selected = false;
                }
                selectedImage = i;
                changeMode('equipments');
            });
        }
    }

    /**
     * Loads the pitches menu by adding pitches and event listeners
     */
    function loadPitches() {
        // Create pitches elements
        for (let i of sources['pitches']) {
            document.getElementById('pitches').innerHTML += `<img class="pitch" id="pitch${i}" src="assets/pitches/${i}.png" draggable="false"></img>`;
        }
        // Add event listeners
        for (let i of sources['pitches']) {
            document.getElementById(`pitch${i}`).addEventListener('click', function () {
                changed = true;
                pitchLayer.destroyChildren();
                let pitchImage = new Konva.Image({
                    x: 0,
                    y: 0,
                    image: images['pitches'][i],
                    width: width,
                    height: height,
                });
                pitchImage.setAttr('imageType', 'pitches');
                pitchImage.setAttr('index', i);
                pitchLayer.add(pitchImage);
            });
        }
    }

    /**
     * Adds image to `graphicsLayer`
     * 
     * @param {String} type The image type (players, pitches, or equipments)
     * @param {Number} index The index of the image in the assets folder
     * @param {Number} x The x position of the image being added
     * @param {Number} y The y position of the image being added
     */
    function addImage(type, index, x, y) {
        image = images[type][index];
        imageToAdd = new Konva.Image({
            width: image.width * 0.3,
            height: image.height * 0.3,
            x: x - image.width * 0.3 / 2,
            y: y - image.height * 0.3 / 2,
            image: image,
            draggable: true,
        });
        imageToAdd.setAttr('imageType', type);
        imageToAdd.setAttr('index', index);
        graphicsLayer.add(imageToAdd);
    }

    /**
     * Adds text to `graphicsLayer`

     * @param {String} text The text to add
     * @param {*} x The x position of the text being added
     * @param {*} y The y position of the text being added
     */
    function addText(text, x, y) {
        // Do nothing if no text is provided
        if (text == null || text == '')
            return;
        graphicsLayer.add(
            new Konva.Text({
                x: x,
                y: y,
                text: text,
                fontSize: 20,
                fontFamily: 'Open Sans',
                fill: document.getElementById('colorPicker').value,
                draggable: true,
            })
        );
    }

    /**
     * Main code
     */

    // Set up variables
    let selectedImage;
    let currentMode = 'none';
    let currentCursor = 'default';
    let markup = false;
    let markupLayer = new Konva.Layer();
    let graphicsLayer = new Konva.Layer();
    let pitchLayer = new Konva.Layer();
    let deleting = false;
    let changed = false;
    const width = 675;
    const height = 520;

    // Load the menus
    loadMenu();
    loadPitches();

    // Create the main stage
    let stage = new Konva.Stage({
        container: 'planner',
        width: width,
        height: height,
    });

    // Add pitch image to pitch layer
    let pitchImage = new Konva.Image({
        x: 0,
        y: 0,
        image: images['pitches'][0],
        width: width,
        height: height,
    });
    pitchImage.setAttr('imageType', 'pitches');
    pitchImage.setAttr('index', 0);
    pitchLayer.add(pitchImage);

    // Add pitch, graphics, and markup layer to the stage
    stage.add(pitchLayer);
    stage.add(graphicsLayer);
    stage.add(markupLayer);

    // Enable stage interactions
    addInteractions();

    /**
     * Enable notes in image once typed in
     */
    document.getElementById('notesInput').addEventListener('input', function () {
        changed = true;
        document.getElementById('notesOption').checked = true;
    });

    /**
     * Load stage from uploaded JSON file
     */
    document.getElementById('uploadFile').addEventListener('change', function () {
        if (uploadFile.files.length > 0) {
            // Read the uploaded file as JSON
            let reader = new FileReader();
            reader.readAsText(uploadFile.files[0]);
            reader.onload = function () {
                let json = JSON.parse(reader.result);
                // Load stage from the JSON
                stage = Konva.Node.create(json, 'planner');
                // Set image attributes 
                stage.find('Image').forEach((imageNode) => {
                    imageNode.image(images[imageNode.getAttr('imageType')][imageNode.getAttr('index')]);
                });
                // Set notes attributes from the JSON
                document.getElementById('notesInput').value = stage.getAttr('notes');
                document.getElementById('notesOption').checked = stage.getAttr('notes') != '';

                // Set layers from the JSON
                pitchLayer = stage.children[0];
                if (stage.children[1] != undefined)
                    graphicsLayer = stage.children[1];
                if (stage.children[2] != undefined)
                    markupLayer = stage.children[2];

                // Reenable stage interations
                addInteractions();

                // Reset uploaded files
                uploadFile.value = '';
            };
        }
    });

    // Asks for confirmation before closing / reloading to prevent loss of unsaved work
    window.addEventListener('beforeunload', (event) => {
        if (changed)
            event.preventDefault();
    });
});
