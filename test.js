
function download(name, index) {
    let canvas = document.getElementById(name);
    let link = document.createElement('a');
    link.download = index - 1;
    link.href = canvas.toDataURL();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    delete link;
}
