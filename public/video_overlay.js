const drawTypes = {
    Line: "line",
    Pencil: "pencil",
};
var drawType = drawTypes.Line;
var drawColor = "#000000";
var drawSize = 1;
var isDrawing = false;

var mouseDownPos = { x: 0, y: 0 };

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

    return { x: x, y: y };
}

var oImgData;
var oCanvas = document.getElementById("otherCanvas");

var dImgData;
var dCanvas = document.getElementById("drawingCanvas");
dCanvas.addEventListener("mousedown", beginDraw, false);
dCanvas.addEventListener("mousemove", draw, false);
dCanvas.addEventListener("mouseup", endDraw, false);
var paths = [];

var sCanvasWidth = 100;
var sImgData;
var sCanvas = document.getElementById("selectionCanvas");
sCanvas.addEventListener("click", select, false);

function updateImgData(canvas, context, type = "draw") {
    if (type === "draw") {
        dImgData = context.getImageData(0, 0, canvas.width, canvas.height);
    } else if (type === "selection") {
        sImgData = context.getImageData(0, 0, canvas.width, canvas.height);
    } else if (type === "other") {
        oImgData = context.getImageData(0, 0, canvas.width, canvas.height);
    }
}

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

function initSCanvas() {
    sCanvas.width = sCanvasWidth;
    sCanvas.height = Math.max(window.innerHeight - 20, 1);
    context = sCanvas.getContext("2d");
    context.strokeStyle = "#000000";

    for (key in selectMappingColors) {
        dict = selectMappingColors[key];
        context.fillStyle = dict["color"];
        x = dict["x"];
        y = dict["y"];
        colorRect = new Path2D();
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
        toolRect = new Path2D();
        toolRect.rect(x * 100 + 1, (y * 100) / 3 + 1, 100 - 2, 100 / 3 - 2);
        context.fillText(
            key,
            x * 100 + 1 + sCanvasWidth / 6,
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
        sizeCirc = new Path2D();
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
    document.createElement("aaaa");
}
initSCanvas();

function beginDraw(event) {
    var { x, y } = getCursorPosition(dCanvas, event);
    mouseDownPos["x"] = x - dCanvas.offsetLeft;
    mouseDownPos["y"] = y - dCanvas.offsetTop;
    isDrawing = true;
}

function endDraw(event) {
    isDrawing = false;
    updateImgData(dCanvas, dCanvas.getContext("2d"), "draw");
    var { x, y } = getCursorPosition(dCanvas, event);
    paths.push({
        xStart: mouseDownPos["x"],
        yStart: mouseDownPos["y"],
        xEnd: x - dCanvas.offsetLeft,
        yEnd: y - dCanvas.offsetTop,
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
            drawPencil(this, event);
            break;
        case drawTypes.Line:
            drawLine(this, event);
            break;
        default:
            break;
    }
}

function drawPencil(this_object, event) {}

function drawLine(this_object, event) {
    context = this_object.getContext("2d");
    context.putImageData(dImgData, 0, 0);

    var position = getCursorPosition(dCanvas, event);
    x = position["x"] - this_object.offsetLeft;
    y = position["y"] - this_object.offsetTop;

    context.beginPath();
    context.moveTo(mouseDownPos["x"], mouseDownPos["y"]);
    context.lineTo(x, y);

    context.strokeStyle = drawColor;
    context.lineWidth = drawSize;
    context.stroke();
}

function select(event) {
    var { x, y } = getCursorPosition(this, event);
    var xCoord = Math.floor(x / 100);
    var yCoord = Math.floor(y / 100);
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
    if (!tool) {
        for (key in selectMappingSize) {
            if (
                context.isPointInPath(
                    selectMappingSize[key]["path"],
                    event.offsetX,
                    event.offsetY
                )
            ) {
                drawSize = selectMappingSize[key]["size"];
                break;
            }
        }
    }
}

var clearButton = document.getElementById("clearButton");
clearButton.onclick = function() {
    dCanvas.getContext("2d").clearRect(0, 0, dCanvas.width, dCanvas.height);
    clicks = 0;
    updateImgData(dCanvas, dCanvas.getContext("2d"), "draw");
    paths = [];
    console.log("clear");
};
var showOthersButton = document.getElementById("showOthersButton");
showOthersButton.onclick = function() {
    oCanvas.hidden = false;
    console.log("showOthers");
};
var hideOthersButton = document.getElementById("hideOthersButton");
hideOthersButton.onclick = function() {
    oCanvas.hidden = true;
    console.log("hideOthers");
};
var submitButton = document.getElementById("submitButton");
// submitButton.onclick = function() {
//     let xhr = new XMLHttpRequest();
//     xhr.open("POST", location.protocol + "//localhost:8080/canvas/post");

//     xhr.setRequestHeader("Accept", "application/json");
//     xhr.setRequestHeader("Content-Type", "application/json");

//     xhr.onload = () => console.log(xhr.responseText);

//     let data = `{ "imgData": ${dImgData}, "data": ${dImgData.data}, "width": ${dImgData.width}, "height": ${dImgData.height} }`;

//     xhr.send(data);
//     console.log("submit");
// };

function resizeCanvases() {
    dCanvas.width = Math.max(window.innerWidth - sCanvasWidth - 42, 1);
    dCanvas.height = Math.max(window.innerHeight - 200 - 22, 1);
    if (dImgData != null) {
        dCanvas.getContext("2d").putImageData(dImgData, 0, 0);
    }

    oCanvas.width = Math.max(window.innerWidth - sCanvasWidth - 42, 1);
    oCanvas.height = Math.max(window.innerHeight - 22, 1);
    if (oImgData != null) {
        oCanvas.getContext("2d").putImageData(oImgData, 0, 0);
    }

    sCanvas.width = sCanvasWidth;
    sCanvas.height = Math.max(window.innerHeight - 200 - 220, 1);
    if (sImgData != null) {
        sCanvas.getContext("2d").putImageData(sImgData, 0, 0);
    }
}

window.onload = window.onresize = resizeCanvases;

var token, userId;
// so we don't have to write this out everytime
const twitch = window.Twitch.ext;

// callback called when context of an extension is fired
twitch.onContext((context) => {
    console.log(context);
});

// onAuthorized callback called each time JWT is fired
twitch.onAuthorized((auth) => {
    // save our credentials
    token = auth.token;
    userId = auth.userId;
});

$(function() {
    $("#submitButton").click(function(e) {
        $.ajax({
            type: "POST",
            url: "https://5569-2a02-810b-4340-74a0-9dd2-3fea-a1b-8145.eu.ngrok.io/post_paths",
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
    // $("#showButton").click(function(e) {
    //     $.ajax({
    //         type: "GET",
    //         url: "https://5569-2a02-810b-4340-74a0-9dd2-3fea-a1b-8145.eu.ngrok.io/get_paths",
    //         contentType: "application/json",
    //         success: function(data) {
    //             console.log(data);
    //             var context = oCanvas.getContext("2d");
    //             for (key in data) {
    //                 context.fillStyle = data[key]["color"];
    //                 context.strokeStyle = data[key]["color"];
    //                 context.lineWidth = data[key]["size"];
    //                 context.beginPath();
    //                 context.moveTo(data[key]["xStart"], data[key]["yStart"]);
    //                 context.lineTo(data[key]["xEnd"], data[key]["yEnd"]);
    //                 context.stroke();
    //             }
    //             updateImgData(oCanvas, context, "others");
    //         },
    //         headers: {
    //             Authorization: "Bearer " + token,
    //         },
    //     });
    // });
    $("#hideOthersButton").click(function(e) {
        oImgData = null;
        oCanvas.getContext("2d").clearRect(0, 0, oCanvas.width, oCanvas.height);
    });
});

var updateInterval = setInterval(function() {
    $.ajax({
        type: "GET",
        url: "https://5569-2a02-810b-4340-74a0-9dd2-3fea-a1b-8145.eu.ngrok.io/get_paths",
        contentType: "application/json",
        success: function(data) {
            console.log(data);
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