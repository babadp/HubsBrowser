

class ImageRenderExtension extends Autodesk.Viewing.Extension {
    constructor(viewer, options) {
        super(viewer, options);
        this.viewsNames = {};
    }

    load() {
        // Set background environment to "Infinity Pool"
        // and make sure the environment background texture is visible
        this.viewer.setLightPreset(6);
        this.viewer.setEnvMapBackground(true);

        // Ensure the model is centered
        this.viewer.fitToView();

        return true;
    }

    unload() {

    }

    onToolbarCreated(toolbar) {
        var viewer = this.viewer;

        // Button 1
        var button1 = createToolbarButton('snapshot-button', 'https://img.icons8.com/ios/30/camera--v3.png', 'Tomar Captura');
        button1.onClick = function (e) {
            //readDepthAndNormalMaps(viewer);
            sacaCaptura(viewer);
            iniciaPrompt();
        }
        // SubToolbar
        this.subToolbar = new Autodesk.Viewing.UI.ControlGroup('my-custom-toolbar');
        this.subToolbar.addControl(button1);

        toolbar.addControl(this.subToolbar);
    }

}

// funcion para crear boton de snapshots
function createToolbarButton(buttonId, buttonIconUrl, buttonTooltip) {
    const button = new Autodesk.Viewing.UI.Button(buttonId);
    button.setToolTip(buttonTooltip);
    const icon = button.container.querySelector('.adsk-button-icon');
    if (icon) {
        icon.style.backgroundImage = `url(${buttonIconUrl})`;
        icon.style.backgroundSize = `24px`;
        icon.style.backgroundRepeat = `no-repeat`;
        icon.style.backgroundPosition = `center`;
    }
    return button;
}

// --------------------------------------------------


function iniciaPrompt() {
    let prompt =
    {
    3: {
        inputs: {
            seed: 712691034083095,
            steps: 17,
            cfg: 4,
            sampler_name: "dpmpp_sde",
            scheduler: "karras",
            denoise: 0.9,
            model: ["4", 0],
            positive: ["22", 0],
            negative: ["7", 0],
            latent_image: ["20", 0]
        },
        class_type: "KSampler",
        _meta: {
            title: "KSampler"
        }
    },
    4: {
        inputs: {
            ckpt_name: "architecturerealmix_v11.safetensors"
        },
        class_type: "CheckpointLoaderSimple",
        _meta: {
            title: "Load Checkpoint"
        }
    },
    6: {
        inputs: {
            text: "modern building, cafe, colorful, sunlight, architectural photography, photorealistic (sharp)",
            clip: ["4", 1]
        },
        class_type: "CLIPTextEncode",
        _meta: {
            title: "CLIP Text Encode (Prompt)"
        }
    },
    7: {
        inputs: {
            text: "text, oil, fake, fog, haze, bloom",
            clip: ["4", 1]
        },
        class_type: "CLIPTextEncode",
        _meta: {
            title: "CLIP Text Encode (Prompt)"
        }
    },
    8: {
        inputs: {
            samples: ["3", 0],
            vae: ["4", 2]
        },
        class_type: "VAEDecode",
        _meta: {
            title: "VAE Decode"
        }
    },
    9: {
        inputs: {
            filename_prefix: "ComfyUI",
            images: ["8", 0]
        },
        class_type: "SaveImage",
        _meta: {
            title: "Save Image"
        }
    },
    14: {
        inputs: {
            images: ["31", 0]
        },
        class_type: "PreviewImage",
        _meta: {
            title: "Preview Image"
        }
    },
    19: {
        inputs: {
            image: "capture.png",
            upload: "image"
        },
        class_type: "LoadImage",
        _meta: {
            title: "Load Image"
        }
    },
    20: {
        inputs: {
            pixels: ["19", 0],
            vae: ["4", 2]
        },
        class_type: "VAEEncode",
        _meta: {
            title: "VAE Encode"
        }
    },
    22: {
        inputs: {
            strength: 0.8,
            conditioning: ["6", 0],
            control_net: ["24", 0],
            image: ["31", 0]
        },
        class_type: "ControlNetApply",
        _meta: {
            title: "Apply ControlNet"
        }
    },
    24: {
        inputs: {
            control_net_name: "control_v11p_sd15_canny_fp16.safetensors"
        },
        class_type: "ControlNetLoader",
        _meta: {
            title: "Load ControlNet Model"
        }
    },
    31: {
        inputs: {
            low_threshold: 0.4,
            high_threshold: 0.8,
            image: ["19", 0]
        },
        class_type: "Canny",
        _meta: {
            title: "Canny"
        }
    }
    };

    /*
    // Establecer la imagen en el nodo '19'
    const node19 = promptText["19"]["inputs"];
    node19["image"] = "capture.png";

    // Establecer la semilla (seed) en el nodo '3'
    const node3 = promptText["3"]["inputs"];
    node3["seed"] = 5;
    */
    
    // Serializar el objeto actualizado de nuevo a JSON
    const updatedPromptText = JSON.stringify({ prompt });
    console.log(updatedPromptText);

    fetch('http://127.0.0.1:8188/prompt', {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: updatedPromptText
    });
}

Autodesk.Viewing.theExtensionManager.registerExtension('ImageRenderExtension', ImageRenderExtension);