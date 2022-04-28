const selectMappingColors = {
    red: { color: "#ff0000", x: 0, y: 0 },
    green: { color: "#00ff00", x: 1, y: 0 },
    blue: { color: "#0000ff", x: 2, y: 0 },
    orange: { color: "#ffaa00", x: 0, y: 1 },
    cyan: { color: "#00ffff", x: 1, y: 1 },
    magenta: { color: "#ff00ff", x: 2, y: 1 },
    yellow: { color: "#ffff00", x: 0, y: 2 },
    white: { color: "#ffffff", x: 1, y: 2 },
    black: { color: "#000000", x: 2, y: 2 },
};
const selectMappingTools = {
    pencil: { x: 0, y: 3 },
    eraser: { x: 0, y: 4 },
    line: { x: 0, y: 5 },
};
const selectMappingSize = {
    small: { x: 0, y: 6, size: 1 },
    medium: { x: 1, y: 6, size: 2 },
    large: { x: 2, y: 6, size: 3 },
};
const drawTypes = {
    Line: "line",
    Pencil: "pencil",
};
const twitch = window.Twitch.ext;
const backend_subdomain = "1a40-2a02-810b-4340-74a0-55f5-2627-2645-fa2b";
var token, userId;

var drawType = drawTypes.Line;
var drawColor = "#000000";
var drawSize = 1;
var isDrawing = false;

var mouseDownPos = { x: 0, y: 0 };
var lastMousePos = { x: 0, y: 0 };

var oImgData;
var oCanvas = document.getElementById("otherCanvas");

var dImgData;
var dCanvas = document.getElementById("drawingCanvas");

var paths = [];

var sCanvasWidth = 100;
var sImgData;
var sCanvas = document.getElementById("selectionCanvas");

var clearButton = document.getElementById("clearButton");
var showOthersButton = document.getElementById("showOthersButton");
var hideOthersButton = document.getElementById("hideOthersButton");
var submitButton = document.getElementById("submitButton");

dCanvas.addEventListener("mousedown", beginDraw, false);
dCanvas.addEventListener("mousemove", draw, false);
dCanvas.addEventListener("mouseup", endDraw, false);
sCanvas.addEventListener("click", select, false);

function getCursorPosition(canvas, event) {
    var x;
    var y;

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

    return { x: x - canvas.offsetLeft, y: y - canvas.offsetTop };
}

function updateImgData(canvas, context, type = "draw") {
    if (type === "draw") {
        dImgData = context.getImageData(0, 0, canvas.width, canvas.height);
    } else if (type === "selection") {
        sImgData = context.getImageData(0, 0, canvas.width, canvas.height);
    } else if (type === "other") {
        oImgData = context.getImageData(0, 0, canvas.width, canvas.height);
    }
}

function initSCanvas() {
    sCanvas.width = sCanvasWidth;
    sCanvas.height = Math.max(window.innerHeight - 160 - 2, 1);
    context = sCanvas.getContext("2d");
    context.strokeStyle = "#000000";

    for (key in selectMappingColors) {
        dict = selectMappingColors[key];
        console.log(dict);
        context.fillStyle = dict["color"];
        console.log(context.fillStyle);
        x = dict["x"];
        console.log(x);
        y = dict["y"];
        console.log(y);
        let colorRect = new Path2D();
        colorRect.rect(
            (x * 100) / 3 + 1,
            (y * 100) / 3 + 1,
            100 / 3 - 2,
            100 / 3 - 2
        );
        context.fill(colorRect);
        context.stroke(colorRect);
        dict["path"] = colorRect;
    }

    for (key in selectMappingTools) {
        dict = selectMappingTools[key];
        context.fillStyle = "#000000";
        x = dict["x"];
        y = dict["y"];
        let toolRect = new Path2D();
        toolRect.rect(x + 1, (y * 100) / 3 + 1, 100 - 2, 100 / 3 - 2);
        context.fillText(
            key,
            x + 1 + sCanvasWidth / 6,
            (y * 100) / 3 + 1 + sCanvasWidth / 6
        );
        context.stroke(toolRect);
        dict["path"] = toolRect;
    }

    for (key in selectMappingSize) {
        dict = selectMappingSize[key];
        context.fillStyle = "#000000";
        x = dict["x"];
        y = dict["y"];
        let sizeCirc = new Path2D();
        sizeCirc.arc(
            (x * 100) / 3 + sCanvasWidth / 6,
            (y * 100) / 3 + sCanvasWidth / 6,
            dict["size"] * 5,
            0,
            2 * Math.PI
        );
        context.fill(sizeCirc);
        dict["path"] = sizeCirc;
    }
    updateImgData(sCanvas, context, "selection");
}

function beginDraw(event) {
    var { x, y } = getCursorPosition(dCanvas, event);
    mouseDownPos["x"] = x;
    mouseDownPos["y"] = y;
    isDrawing = true;
}

function endDraw(event) {
    isDrawing = false;
    updateImgData(dCanvas, dCanvas.getContext("2d"), "draw");
    var { x, y } = getCursorPosition(dCanvas, event);
    paths.push({
        xStart: mouseDownPos["x"],
        yStart: mouseDownPos["y"],
        xEnd: x,
        yEnd: y,
        color: drawColor,
        size: drawSize,
    });
}

function draw(event) {
    if (!dImgData) {
        updateImgData(dCanvas, dCanvas.getContext("2d"), "draw");
    }
    if (!isDrawing) {
        return;
    }
    switch (drawType) {
        case drawTypes.Pencil:
            drawPencil(event);
            break;
        case drawTypes.Line:
            drawLine(event);
            break;
        default:
            break;
    }
}

function drawPencil(event) {}

function drawLine(event) {
    context = dCanvas.getContext("2d");
    context.putImageData(dImgData, 0, 0);

    var position = getCursorPosition(dCanvas, event);
    x = position["x"];
    y = position["y"];

    context.beginPath();
    context.moveTo(mouseDownPos["x"], mouseDownPos["y"]);
    context.lineTo(x, y);

    context.strokeStyle = drawColor;
    context.lineWidth = drawSize;
    context.stroke();
}

function select(event) {
    var color = false;
    for (key in selectMappingColors) {
        if (
            context.isPointInPath(
                selectMappingColors[key]["path"],
                event.offsetX,
                event.offsetY
            )
        ) {
            drawColor = selectMappingColors[key]["color"];
            color = true;
            break;
        }
    }
    if (!color) {
        var tool = false;
        for (key in selectMappingTools) {
            if (
                context.isPointInPath(
                    selectMappingTools[key]["path"],
                    event.offsetX,
                    event.offsetY
                )
            ) {
                drawType = key;
                tool = true;
                break;
            }
        }
    }
    if (!color && !tool) {
        var size = false;
        for (key in selectMappingSize) {
            if (
                context.isPointInPath(
                    selectMappingSize[key]["path"],
                    event.offsetX,
                    event.offsetY
                )
            ) {
                drawSize = selectMappingSize[key]["size"];
                size = true;
                break;
            }
        }
    }
}

function resizeCanvases() {
    dCanvas.width = Math.max(window.innerWidth - sCanvasWidth - 112 - 2, 1);
    dCanvas.height = Math.max(window.innerHeight - 160 - 2, 1);
    if (dImgData != null) {
        dCanvas.getContext("2d").putImageData(dImgData, 0, 0);
    }

    oCanvas.width = Math.max(window.innerWidth - sCanvasWidth - 112, 1);
    oCanvas.height = Math.max(window.innerHeight - 160, 1);
    if (oImgData != null) {
        oCanvas.getContext("2d").putImageData(oImgData, 0, 0);
    }

    sCanvas.width = sCanvasWidth;
    sCanvas.height = Math.max(window.innerHeight - 160 - 2, 1);
    initSCanvas();
    if (sImgData != null) {
        sCanvas.getContext("2d").putImageData(sImgData, 0, 0);
    }
}

window.onload = window.onresize = resizeCanvases;

// onAuthorized callback called each time JWT is fired
twitch.onAuthorized((auth) => {
    token = auth.token;
    userId = auth.userId;
    document.getElementById("submitButton").disabled = false;
});

clearButton.onclick = function() {
    dCanvas.getContext("2d").clearRect(0, 0, dCanvas.width, dCanvas.height);
    clicks = 0;
    updateImgData(dCanvas, dCanvas.getContext("2d"), "draw");
    paths = [];
    console.log("clear");
};
showOthersButton.onclick = function() {
    oCanvas.hidden = false;
    console.log("showOthers");
};
hideOthersButton.onclick = function() {
    oCanvas.hidden = true;
    console.log("hideOthers");
};

$(function() {
    $("#submitButton").click(function(e) {
        $.ajax({
            type: "POST",
            url: "https://" + backend_subdomain + ".eu.ngrok.io/post_paths",
            data: JSON.stringify({ paths: paths }),
            contentType: "application/json",
            headers: {
                Authorization: "Bearer " + token,
            },
        });
    });
    twitch.listen("broadcast", function(target, contentType, body) {
        if (contentType == "application/json") {
            var context = oCanvas.getContext("2d");
            var data = JSON.parse(body);
            for (var key in data) {
                context.fillStyle = data[key]["color"];
                context.lineWidth = data[key]["size"];
                context.beginPath();
                context.moveTo(data[key]["xStart"], data[key]["yStart"]);
                context.lineTo(data[key]["xEnd"], data[key]["yEnd"]);
                context.stroke();
            }
        }
    });
});

var updateInterval = setInterval(function() {
    $.ajax({
        type: "GET",
        url: "https://" + backend_subdomain + ".eu.ngrok.io/get_paths",
        contentType: "application/json",
        success: function(data) {
            var context = oCanvas.getContext("2d");
            context.clearRect(0, 0, oCanvas.width, oCanvas.height);
            for (key in data) {
                context.fillStyle = data[key]["color"];
                context.strokeStyle = data[key]["color"];
                context.lineWidth = data[key]["size"];
                context.beginPath();
                context.moveTo(data[key]["xStart"], data[key]["yStart"]);
                context.lineTo(data[key]["xEnd"], data[key]["yEnd"]);
                context.stroke();
            }
            updateImgData(oCanvas, context, "others");
        },
        headers: {
            Authorization: "Bearer " + token,
        },
    });
}, 2000);

initSCanvas();

sCanvas.fillStyle("#000000");
sCanvas.fillRect(30, 30, sCanvasWidth, sCanvasWidth);
updateImgData(sCanvas, sCanvas.getContext("2d"), "selection");