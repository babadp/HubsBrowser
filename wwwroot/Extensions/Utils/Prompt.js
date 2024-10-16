function iniciaWorkflow(promptText) {
    let workflow =
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


    // Establecer la semilla (seed) en el nodo '3'
    const node6 = workflow["6"]["inputs"];
    node6["text"] = promptText;

    // Cambio de nombre a prompt porque Comfy lo detecta con esta palabra
    const prompt = workflow;

    // Serializar el objeto actualizado de nuevo a JSON
    const updatedWorkflow = JSON.stringify({ prompt });
    console.log(updatedWorkflow);

    fetch('http://127.0.0.1:8188/prompt', {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: updatedWorkflow
    });
}
