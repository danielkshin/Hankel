/**
 * TO DO:
 * - clean up this disgusting code
 * - download as image
 * - actual player/equipment images
 */

/**
 * Image sources
 * folder_name (in assets folder): [file_names or file_indexes]
 */
let sources = {
    players: [...Array(8).keys()],
    pitches: [...Array(8).keys()],
    tools: ['draw', 'text', 'line', 'dashedLine', 'arrow', 'dashedArrow', 'delete'],
    equipments: [0, 1,],
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
 */
loadImages(sources, function (images) {
    let selectedImage;
    let currentMode = 'brush';
    let currentCursor = 'default';
    let draw = false;

    /**
     * Changes `currentMode` and the cursor to the affiliated icon
     * 
     * @param {String} mode The mode (players, tools, or equipments) that `currentMode` and the cursor is changing to
     * @param {String} tool (optional) If `mode` is 'tools', the specific tool (text, draw, line...) that `currentMode` and the cursor is changing to
     */
    function changeMode(mode, tool = '') {
        if (mode == 'players' || mode == 'equipments') {
            for (i of editingLayer.children) {
                i.draggable(true);
            }
        } else {
            for (i of editingLayer.children) {
                i.draggable(false);
            }
        } // change to ternary
        currentCursor = `url('${images[mode][tool == '' ? selectedImage : tool].src}') 16 16, auto`;
        console.log(currentCursor);
        stage.container().style.cursor = currentCursor;
        currentMode = tool == '' ? mode : tool;
    }

    /**
     * Loads the menu by adding icons and event listeners to them
     */
    function loadMenu() {
        // create player elements
        for (let i of sources['players']) {
            document.getElementById('players').innerHTML += `<img class="icon" id="player${i}" src="assets/players/${i}.png"></img>`;
        }
        // add event listeners
        for (let i of sources['players']) {
            document.getElementById(`player${i}`).addEventListener('click', e => {
                selectedImage = i;
                changeMode('players');
            });
        }

        // create tool elements
        for (let i of sources['tools']) {
            document.getElementById('tools').innerHTML += `<img class="icon" id="${i}" src="assets/tools/${i}.png"></img>`;
        }
        for (let i of sources['tools']) {
            let element = document.getElementById(i);
            element.addEventListener('click', e => {
                selectedImage = i;
                changeMode('tools', i);
            });
        }

        // create equipment elements
        for (let i of sources['equipments']) {
            document.getElementById('equipments').innerHTML += `<img class="icon" id="equipment${i}" src="assets/equipments/${i}.png"></img>`;
        }
        // add event listeners
        for (let i of sources['equipments']) {
            document.getElementById(`equipment${i}`).addEventListener('click', e => {
                selectedImage = i;
                changeMode('equipments');
            });
        }
    }
    loadMenu();

    function loadPitches() {
        for (let i of sources['pitches']) {
            document.getElementById('pitches').innerHTML += `<img class="pitch" id="pitch${i}" src="assets/pitches/${i}.png"></img>`;
        }


        for (let i of sources['pitches']) {
            document.getElementById(`pitch${i}`).addEventListener('click', e => {
                changePitch(i);
            });
        }
    }
    loadPitches();

    /**
     * When interacting with objects in `editingLayer`, change cursor to 'move' (drag)
     */
    let editingLayer = new Konva.Layer();
    editingLayer.on('mouseenter', function () {
        if (currentMode == 'players' || currentMode == 'equipments')
            stage.container().style.cursor = 'move';
    });
    editingLayer.on('mouseleave', function () {
        if (currentMode == 'players' || currentMode == 'equipments')
            stage.container().style.cursor = currentCursor;
    });

    /**
     * Adds image to `editingLayer`
     * @param {Image} image The image to add (from `images`)
     * @param {Number} x The x position of the image being added
     * @param {Number} y The y position of the image being added
     */
    function addImage(image, x, y) {
        editingLayer.add(new Konva.Image({
            x: x - 16,
            y: y - 16,
            image: image,
            draggable: true,
        }));
        stage.add(editingLayer);
    }

    /**
     * Adds text to `editingLayer`
     * @param {String} text The text to add
     * @param {*} x The x position of the text being added
     * @param {*} y The y position of the text being added
     */
    function addText(text, x, y) {
        editingLayer.add(new Konva.Text({
            x: x,
            y: y,
            text: text,
            fontSize: 20,
            fontFamily: 'Calibri',
            fill: 'black',
            draggable: true,
        }));
        stage.add(editingLayer);
    }

    /**
     * The main stage
     */
    const width = 640;
    const height = 445;

    let stage = new Konva.Stage({
        container: 'planner',
        width: width,
        height: height,
    });

    let pitch = new Konva.Layer();
    pitch.add(new Konva.Image({
        x: 0,
        y: 0,
        image: images['pitches'][0],
        width: width,
        height: height,
    }));
    stage.add(pitch);

    function changePitch(i) {
        pitch.clear();
        pitch.add(new Konva.Image({
            x: 0,
            y: 0,
            image: images['pitches'][i],
            width: width,
            height: height,
        }));
    }

    stage.on('click tap', function (e) {
        let pos = stage.getRelativePointerPosition();
        if (currentMode == 'players') {
            addImage(images['players'][selectedImage], pos.x, pos.y);
        } else if (currentMode == 'text') {
            addText(prompt('add text'), pos.x, pos.y);
        } else if (currentMode == 'equipments') {
            addImage(images['equipments'][selectedImage], pos.x, pos.y);
        } else if (currentMode == 'delete') {
            if (e.target.attrs.width == 640)
                return;
            e.target.destroy();
        }
    });



    let drawLayer = new Konva.Layer();
    let original = [0, 0];
    stage.on('mousedown touchstart', function (e) {
        const pos = stage.getPointerPosition();

        original = [pos.x, pos.y];

        draw = true;
        if (currentMode == 'draw') {
            line = new Konva.Line({
                stroke: '#ffffff',
                strokeWidth: 3,
                globalCompositeOperation: 'source-over',
                lineCap: 'round',
                lineJoin: 'round',
                points: [pos.x, pos.y, pos.x, pos.y],
            });
        } else if (currentMode == 'line') {
            line = new Konva.Line({
                stroke: '#ffffff',
                strokeWidth: 3,
                globalCompositeOperation: 'source-over',
                lineCap: 'round',
                lineJoin: 'round',
            });
        } else if (currentMode == 'dashedLine') {
            line = new Konva.Line({
                stroke: '#ffffff',
                strokeWidth: 3,
                globalCompositeOperation: 'source-over',
                lineCap: 'round',
                lineJoin: 'round',
                dash: [15, 10],
            });
        } else if (currentMode == 'arrow') {
            line = new Konva.Arrow({
                stroke: '#ffffff',
                strokeWidth: 3,
                fill: '#ffffff',
                globalCompositeOperation: 'source-over',
                lineCap: 'round',
                lineJoin: 'round',
            });
        } else if (currentMode == 'dashedArrow') {
            line = new Konva.Arrow({
                stroke: '#ffffff',
                strokeWidth: 3,
                fill: '#ffffff',
                globalCompositeOperation: 'source-over',
                lineCap: 'round',
                lineJoin: 'round',
                dash: [15, 10],
            });
        } else {
            return;
        }

        drawLayer.add(line);
        stage.add(drawLayer);
    });

    stage.on('mouseup touchend', function () {
        draw = false;
    });

    stage.on('mousemove touchmove', function (e) {
        const pos = stage.getPointerPosition();

        e.evt.preventDefault();
        if (!draw) {
            return;
        }
        if (currentMode == 'draw') {
            let newPoints = line.points().concat([pos.x, pos.y]);
            line.points(newPoints);
        } else if (currentMode == 'line' || currentMode == 'dashedLine' || currentMode == 'arrow' || currentMode == 'dashedArrow') {
            line.points([original[0], original[1], pos.x, pos.y]);
        }
    });

});
