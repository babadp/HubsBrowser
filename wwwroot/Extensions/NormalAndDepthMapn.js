// ------------------------------------------------------------------------------- mapa de profundidad y normales
function readDepthAndNormalMaps(viewer) {
    const depthTarget = viewer.impl.renderer().getDepthTarget();
    const gl = viewer.impl.glrenderer().context;
    const w = depthTarget.width;
    const h = depthTarget.height;

    // Bind the framebuffer for reading
    const framebuffer = depthTarget.__webglFramebuffer;
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.viewport(0, 0, w, h);

    // Read pixels from WebGL
    const pixels = new Float32Array(4 * w * h);
    gl.readPixels(0, 0, w, h, gl.RGBA, gl.FLOAT, pixels);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    // Function to unpack depth from alpha channel


    // Create canvases
    const depthCanvas = document.createElement('canvas');
    const normalCanvas = document.createElement('canvas');
    depthCanvas.width = normalCanvas.width = w;
    depthCanvas.height = normalCanvas.height = h;
    const depthCtx = depthCanvas.getContext('2d');
    const normalCtx = normalCanvas.getContext('2d');
    const depthImageData = depthCtx.createImageData(w, h);
    const normalImageData = normalCtx.createImageData(w, h);
    const depthData = depthImageData.data;
    const normalData = normalImageData.data;

    // Process each pixel to unpack depth and normals
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const index = (y * w + x) * 4;
            const depth = unpackDepth(pixels[index + 3], pixels[index + 2]);  // Alpha channel for depth
            const normals = unpackNormals([pixels[index], pixels[index + 1]]); // Red and green for normals

            // Set depth data
            const depthColor = Math.min(255, Math.max(0, 255 * depth)); // Clamping depth value
            const depthIndex = ((h - y - 1) * w + x) * 4; // Flip image
            depthData[depthIndex] = depthColor;
            depthData[depthIndex + 1] = depthColor;
            depthData[depthIndex + 2] = depthColor;
            depthData[depthIndex + 3] = 255;  // Alpha

            // Set normal data
            const normalIndex = ((h - y - 1) * w + x) * 4; // Flip image
            normalData[normalIndex] = (normals[0] + 1.0) * 0.5 * 255; // Scale and bias nx
            normalData[normalIndex + 1] = (normals[1] + 1.0) * 0.5 * 255; // Scale and bias ny
            normalData[normalIndex + 2] = (normals[2] + 1.0) * 0.5 * 255; // Compute nz for visualization
            normalData[normalIndex + 3] = 255;  // Alpha
        }
    }

    // Draw the image data to the canvases
    depthCtx.putImageData(depthImageData, 0, 0);
    normalCtx.putImageData(normalImageData, 0, 0);

    // Convert canvas to a PNG URL
    const depthPngUrl = depthCanvas.toDataURL('image/png');
    const normalPngUrl = normalCanvas.toDataURL('image/png');

    // Create download links for the PNGs
    createDownloadLink(depthPngUrl, 'depth-image.png', 'Download Depth Image');
    createDownloadLink(normalPngUrl, 'normal-image.png', 'Download Normal Image');
}

function unpackDepth(alpha, beta) {
    const near = 0.1;
    const far = 100000.0;
    let depthValue = beta; // Use beta directly if it contains the depth
    let scaledDepth = (depthValue - near) / (far - near); // Normalize the depth
    // Expand the depth range to utilize the full 0-255 range for visualization
    return (50.0 + beta) / 50.0;
    //return Math.min(255, Math.max(0, scaledDepth * 255 * 10000)); // Scale up depth values significantly for visibility
}

// Function to unpack normals from red and green channels
function unpackNormals(rg) {
    let nx = (rg[0] * 2.0) - 1.0;
    let ny = (rg[1] * 2.0) - 1.0;
    let nz = Math.sqrt(1.0 - nx * nx - ny * ny);
    return [nx, ny, nz];
}


// Helper function to create and append download links
function createDownloadLink(pngUrl, fileName, linkText) {
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = fileName;
    downloadLink.innerText = linkText;
    document.body.appendChild(downloadLink);
    downloadLink.click();
}

// ----------------------------------------------------------

function sacaCaptura(viewer) {
    viewer.getScreenShot(1920, 1080, function (blobURL) {
        fetch(blobURL)
            .then(res => res.blob())
            .then(blob => {
                const formData = new FormData();
                formData.append('image', blob, 'capture.png');

                fetch('http://127.0.0.1:8188/upload/image', {
                    method: 'POST',
                    mode: 'no-cors',
                    body: formData
                })
                    /*.then(response => response.json())
                    .then(data => {
                        // Aquí puedes manejar la respuesta
                        console.log('Imagen fotorrealista generada:', data);
                    })*/
                    .catch(error => console.error('Error:', error));
            });
    });
}
