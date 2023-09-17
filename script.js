// to-do:
// - cursor system -> change mode function?
// - other tools
// - pitch changing
// - way to delete objects

// image loading
// https://www.html5canvastutorials.com/tutorials/html5-canvas-image-loader/
function loadImages(sources, callback) {
    let images = {};
    let loadedImages = 0;
    let numImages = 0;

    for (let type in sources) {
        numImages += sources[type].length;
    }
    for (let type in sources) {
        images[type] = [];
        for (let src in sources[type]) {
            images[type][src] = new Image();
            images[type][src].crossOrigin = 'anonymous';
            images[type][src].onload = function () {
                if (++loadedImages >= numImages) {
                    callback(images);
                }
            };
            images[type][src].src = `assets/${type}/${sources[type][src]}.png`;
        }
    }
};

let sources = {
    players: [...Array(8).keys()],
    pitches: [0,],
    tools: ['text', 'text2',],
    equipments: [0, 1,],
};

loadImages(sources, function (images) {
    let selectedImage;
    let mode = 'none';
    let cursor = 'default';

    function loadMenu() {
        // create player elements
        for (let i of sources['players']) {
            document.getElementById('players').innerHTML += `<img class="icon" id="player${i}" src="assets/players/${i}.png"></img>`;
        }
        // add event listeners
        for (let i of sources['players']) {
            document.getElementById(`player${i}`).addEventListener('click', e => {
                console.log(e.target.id, 'selected');
                selectedImage = i;
                cursor = `url('${e.target.src}') 16 16, auto`;
                stage.container().style.cursor = cursor;
                mode = 'player';
            });
        }

        // create tool elements
        for (let i of sources['tools']) {
            document.getElementById('tools').innerHTML += `<img class="icon" id="${i}" src="assets/tools/${i}.png"></img>`;
        }
        for (let i of sources['tools']) {
            let element = document.getElementById(i);
            element.addEventListener('click', e => {
                console.log(i, ' selected');
                cursor = `url('${e.target.src}') 16 16, auto`;
                stage.container().style.cursor = cursor;
                mode = i;
            });
        }


        // create equipment elements
        for (let i of sources['equipments']) {
            document.getElementById('equipments').innerHTML += `<img class="icon" id="equipment${i}" src="assets/equipments/${i}.png"></img>`;
        }
        // add event listeners
        for (let i of sources['equipments']) {
            document.getElementById(`equipment${i}`).addEventListener('click', e => {
                console.log(e.target.id, 'selected');
                selectedImage = i;
                cursor = `url('${e.target.src}') 16 16, auto`;
                stage.container().style.cursor = cursor;
                mode = 'equipment';
            });
        }

    }

    let icons = new Konva.Layer();
    function addImage(image, x, y) {
        icons.add(new Konva.Image({
            x: x - 16,
            y: y - 16,
            image: image,
            draggable: true,
        }));
        stage.add(icons);
    }
    function addText(text, x, y) {
        icons.add(new Konva.Text({
            x: x,
            y: y,
            text: text,
            fontSize: 20,
            fontFamily: 'Calibri',
            fill: 'black',
            draggable: true,
        }));
        stage.add(icons);
    }
    icons.on('mouseenter', function () {
        stage.container().style.cursor = 'move';
    });
    icons.on('mouseleave', function () {
        stage.container().style.cursor = cursor;
    });


    loadMenu();

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

    stage.on('click tap', function () {
        let pos = stage.getRelativePointerPosition();
        console.log(pos.x, pos.y);
        if (mode == 'player') {
            addImage(images['players'][selectedImage], pos.x, pos.y);
        }
        else if (mode == 'text') {
            addText(prompt('add text'), pos.x, pos.y);
        }
        else if (mode == 'equipment') {
            addImage(images['equipments'][selectedImage], pos.x, pos.y);
        }
    });
});