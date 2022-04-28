# ArtAnarchy_Demo

A demo extension for the bachelor topic of ArtAnarch

## Content

The main content in this repository is contained in the dev folder and is split into three parts:

1. The frontend, comprised of the HTML file for the video overlay view and its corresponding Javascript and CSS files. The following functionality is provided:
   - Choosing color to draw by pressing on the colored squares
   - Choosing draw style by pressing on the line "button" (TBD pencil & eraser)
   - Choosing line width by pressing on the different sized circles
   - Drawing on the canvas in the middle of the screen by clicking and dragging the mouse
   - Clear the canvas by pressing the clear button
   - Showing the submitted drawings of other users by pressing the show button (default)
   - Hiding the drawings of other users by pressing the hide button
   - Submitting your current drawing(/canvas) by pressing the submit button. This uses a POST request towards the backend to submit all drawn lines
   - (The frontend also uses a GET request to fetch the current collection of submitted lines of all users)
2. The backend, comprised of a single Javascript file constructing an Express JS server that acts as an API. The following functionality is provided:
   - Storing line data submitted by a POST request to "/post_paths"
   - Sending all stored line data as result of a received GET request. As the external viewer page cant be authorized it accesses the server through "/get_paths_external" while the frontend accesses the server through "/get_paths"
3. The external viewer, comprised of a HTML and a Javascript file. There is no functionality provided by this viewer except that it also fetches the line data every 2 seconds and displays it on a blank website.

## Setting up and Usage

### Twitch/Frontend

When your twitch account has been invited to test this extension add it to your account and set it as one of your active video overlay extensions. At the moment only certain allowed users are able to use the extension as it is still a demo.

### Backend

When you've activated the extension host your backend by navigating to the directory `/dev/backend/` and running the command:

    node backend_demo.js

This will run the Express JS server locally. I recommend using the free software [ngrok](https://ngrok.com/) to make the locally hosted server accessible over the internet. To do this run the following command in the directory in which you stored the ngrok.exe file (alternatively additionally give the path to the file):

    ngrok http 3000

If your local server is not hosted on port 3000 change the port to the port your server is hosted on.

### External Viewer

The external viewer can be opened simply by opening the HTML file in a browser of your choice (I do not guarantee the file to flawlessly work in every browser there is). If you want to include the file into your streaming software include the file in a browser as a source. Alternatively in case you use OBS for streaming you have the possibility to create a browser source containing the HTML file. If you run into while doing this you can host the HTML locally to access it through a weblink. To do this run the following command in the directory `/dev/external/`:

    npx httpserver

Use the weblink `http://localhost:8080/external_viewer.html` in the browser source in OBS (change the port if you use a differnt port for hosting the server).
