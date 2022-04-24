var clicks = 0;
var lastClick = { x: 0, y: 0 };

var canvas = document.getElementById("drawingCanvas");
canvas.addEventListener("click", drawLine, false);

function getCursorPosition(canvas, event) {
    var x;
    var y;
    var rect = canvas.getBoundingClientRect();

    if (event.pageX != undefined && event.pageY != undefined) {
        x = event.pageX;
        y = event.pageY;
    } else {
        x =
            event.clientX +
            document.body.scrollLeft +
            document.documentElement.scrollLeft;
        y =
            event.clientY +
            document.body.scrollTop +
            document.documentElement.scrollTop;
    }

    return { x: x, y: y };
}

function drawLine(event) {
    context = this.getContext("2d");

    var position = getCursorPosition(canvas, event);
    x = position["x"] - this.offsetLeft;
    y = position["y"] - this.offsetTop;

    if (clicks != 1) {
        clicks++;
    } else {
        context.beginPath();
        context.moveTo(lastClick["x"], lastClick["y"]);
        context.lineTo(x, y);

        context.strokeStyle = "#000000";
        context.stroke();

        clicks = 0;
    }

    lastClick["x"] = x;
    lastClick["y"] = y;
}

function resizeCanvas() {
    canvas.width = Math.max(window.innerWidth - 150, 1);
    canvas.height = window.innerHeight - 20;
}
window.onload = window.onresize = resizeCanvas;