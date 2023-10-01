/**
 * TO DO:
 * - continue to refine and clean code
 * - refine icons and cursors
 * - text move bug
 * - actual player/equipment images
 */

// remember 0.3 (30%) is the magic number!

/**
 * Image sources
 * folderName (in assets folder): [fileNames or fileIndexes]
 */
let sources = {
    players: [...Array(84).keys()],
    pitches: [...Array(16).keys()],
    tools: ['draw', 'text', 'line', 'dashedLine', 'arrow', 'dashedArrow', 'delete', 'download', 'curve'],
    equipments: [...Array(41).keys()],
};

/**
 * Image Loading Function
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
 * Runs once all images are loaded
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
     * Downloads the stage as an image and prompts the user for the file name
     */
    function downloadImage() {
        let fileName = prompt('File Name:');
        if (fileName == null)
            return;
        let dataURL = stage.toDataURL({ pixelRatio: 3 });
        downloadURI(dataURL, `${fileName}.png`);
    }

    /**
     * Changes `currentMode` and the cursor to the affiliated icon
     * 
     * @param {String} mode The mode (players, tools, or equipments) that `currentMode` and the cursor is changing to
     * @param {String} tool (optional) If `mode` is 'tools', the specific tool (text, markup, line...) that `currentMode` and the cursor is changing to
     */
    function changeMode(mode, tool = '') {
        if (mode == 'players' || mode == 'equipments' || tool == 'text') {
            for (i of graphicsLayer.children) {
                i.draggable(true);
            }
        } else {
            for (i of graphicsLayer.children) {
                i.draggable(false);
            }
        }
        if (tool == 'download') {
            downloadImage();
            return;
        }
        currentCursor = tool == '' ? `url('assets_low/${mode}/${selectedImage}.png') ${images[mode][selectedImage].width * 0.3 / 2} ${images[mode][selectedImage].height * 0.3 / 2}, auto` : 'default';
        stage.container().style.cursor = currentCursor;
        currentMode = tool == '' ? mode : tool;
    }

    /**
     * Loads the menu by adding icons and event listeners
     */
    function loadMenu() {
        // create player elements
        for (let i of sources['players']) {
            if (i <= 31) {
                document.getElementById('team1').innerHTML += `<img class="player" id="player${i}" src="assets/players/${i}.png"></img>`;
            } else if (i > 31 && i <= 63) {
                document.getElementById('team2').innerHTML += `<img class="player" id="player${i}" src="assets/players/${i}.png"></img>`;
            } else {
                document.getElementById('gk').innerHTML += `<img class="player" id="player${i}" src="assets/players/${i}.png"></img>`;
            }
        }
        // add event listeners
        for (let i of sources['players']) {
            document.getElementById(`player${i}`).addEventListener('click', e => {
                for (let j of sources['tools']) {
                    document.getElementById(j).dataset.selected = false;
                }
                selectedImage = i;
                changeMode('players');
            });
        }

        // create tool elements
        for (let i of sources['tools']) {
            document.getElementById('tools').innerHTML += `<img class="tool" id="${i}" src="assets/tools/${i}.png" data-selected="false"></img>`;
        }
        for (let i of sources['tools']) {
            let element = document.getElementById(i);
            element.addEventListener('click', e => {
                for (let j of sources['tools']) {
                    document.getElementById(j).dataset.selected = false;
                }
                element.dataset.selected = true;
                selectedImage = i;
                changeMode('tools', i);
            });
        }

        // create equipment elements
        for (let i of sources['equipments']) {
            document.getElementById('equipments').innerHTML += `<img class="equipment${images['equipments'][i].width < 15 / 0.3 || images['equipments'][i].height < 15 / 0.3 ? 'Small' : 'Large'}" id="equipment${i}" src="assets_low/equipments/${i}.png"></img>`;
        }
        // add event listeners
        for (let i of sources['equipments']) {
            document.getElementById(`equipment${i}`).addEventListener('click', e => {
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
        for (let i of sources['pitches']) {
            document.getElementById('pitches').innerHTML += `<img class="pitch" id="pitch${i}" src="assets/pitches/${i}.png"></img>`;
        }
        for (let i of sources['pitches']) {
            document.getElementById(`pitch${i}`).addEventListener('click', e => {
                pitch.clear();
                pitch.add(
                    new Konva.Image({
                        x: 0,
                        y: 0,
                        image: images['pitches'][i],
                        width: width,
                        height: height,
                    }));
            });
        }
    }

    let graphicsLayer = new Konva.Layer();
    /**
     * Adds image to `graphicsLayer`
     * @param {Image} image The image to add (from `images`)
     * @param {Number} x The x position of the image being added
     * @param {Number} y The y position of the image being added
     */
    function addImage(image, x, y) {
        graphicsLayer.add(
            new Konva.Image({
                width: image.width * 0.3,
                height: image.height * 0.3,
                x: x - image.width * 0.3 / 2,
                y: y - image.height * 0.3 / 2,
                image: image,
                draggable: true,
            }));
        stage.add(graphicsLayer);
    }

    /**
     * Adds text to `graphicsLayer`
     * @param {String} text The text to add
     * @param {*} x The x position of the text being added
     * @param {*} y The y position of the text being added
     */
    function addText(text, x, y) {
        if (text == null || text == '')
            return;
        graphicsLayer.add(
            new Konva.Text({
                x: x,
                y: y,
                text: text,
                fontSize: 20,
                fontFamily: 'Open Sans',
                fill: '#000000',
                draggable: true,
            }));
        stage.add(graphicsLayer);
    }

    /**
     * Main code starts here
     */

    // variables
    let selectedImage;
    let currentMode = 'none';
    let currentCursor = 'default';
    let markup = false;
    let markupLayer = new Konva.Layer();
    let deleting = false;
    const width = 650;
    const height = 500;

    // load menus
    loadMenu();
    loadPitches();

    // create the main stage
    let stage = new Konva.Stage({
        container: 'planner',
        width: width,
        height: height,
    });

    // add the pitch to the stage
    let pitch = new Konva.Layer();
    pitch.add(
        new Konva.Image({
            x: 0,
            y: 0,
            image: images['pitches'][0],
            width: width,
            height: height,
        }));
    stage.add(pitch);

    /**
     * Interacting with the stage
     */
    // graphics
    stage.on('click tap', function (e) {
        let pos = stage.getRelativePointerPosition();
        if (currentMode == 'players') {
            addImage(images['players'][selectedImage], pos.x, pos.y);
        } else if (currentMode == 'text') {
            addText(prompt('Add text:'), pos.x, pos.y);
        } else if (currentMode == 'equipments') {
            addImage(images['equipments'][selectedImage], pos.x, pos.y);
        } else if (currentMode == 'delete') {
            // don't delete the pitch
            if (e.target.attrs.width == width)
                return;
            e.target.destroy();
            stage.container().style.cursor = currentCursor;
        }
    });
    // markup
    function computeQuadraticBezierPathData(p1, p2, p3) {
        const pathData = `M${p1.x},${p1.y} Q${p2.x},${p2.y} ${p3.x},${p3.y}`;
        return pathData;
    }
    stage.on('mousedown touchstart', function () {
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
                    stroke: '#000000',
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
                    stroke: '#000000',
                    strokeWidth: 2,
                    fill: '#000000',
                    globalCompositeOperation: 'source-over',
                    lineCap: 'round',
                    lineJoin: 'round',
                    dash: currentMode == 'dashedArrow' ? [15, 10] : [],
                });
                break;
            case 'curve':
                arrow = new Konva.Arrow({
                    stroke: '#000000',
                    strokeWidth: 2,
                    fill: '#000000',
                    globalCompositeOperation: 'source-over',
                    lineCap: 'round',
                    lineJoin: 'round',
                });
                line = new Konva.Path({
                    stroke: '#000000',
                    strokeWidth: 2,
                    globalCompositeOperation: 'source-over',
                    lineCap: 'round',
                    lineJoin: 'round',
                });
                markupLayer.add(arrow);
                break;
            case 'delete':
                deleting = true;
                return;
            default:
                return;
        }
        markupLayer.add(line);
        stage.add(markupLayer);
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
            case 'curve':
                secondPosition = {
                    "x": pos.x,
                    "y": pos.y,
                }

                if (Math.abs(originalPosition.x - pos.x) > Math.abs(originalPosition.y - pos.y)) {
                    line.setData(computeQuadraticBezierPathData(...[{ "x": originalPosition.x, "y": originalPosition.y }, { "x": pos.x, "y": originalPosition.y }, { "x": pos.x, "y": pos.y },]));
                } else {
                    line.setData(computeQuadraticBezierPathData(...[{ "x": originalPosition.x, "y": originalPosition.y }, { "x": originalPosition.x, "y": pos.y }, { "x": pos.x, "y": pos.y },]));
                }

                //arrow.points([pos.x + (10 - (originalPosition.y - pos.y) / 10), pos.y < line['dataArray'][1]['points'][1] ? pos.y + 2 : pos.y - 2, pos.x, pos.y]);
                break;
            case 'delete':
                if (deleting == true) {
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


    /**
     * Change cursor when interacting with objects
     */
    graphicsLayer.on('mouseenter', function () {
        if (currentMode == 'players' || currentMode == 'equipments' || currentMode == 'text') {
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
});
