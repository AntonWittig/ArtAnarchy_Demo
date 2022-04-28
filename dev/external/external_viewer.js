const backend_subdomain = "1a40-2a02-810b-4340-74a0-55f5-2627-2645-fa2b";

oCanvas = document.getElementById("otherCanvas");
oCanvas.width = window.innerWidth;
oCanvas.height = window.innerHeight;

var updateInterval = setInterval(function() {
    $.ajax({
        type: "GET",
        url: "https://" + backend_subdomain + ".eu.ngrok.io/get_paths_external",
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
    });
}, 2000);