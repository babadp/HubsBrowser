using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
public class ComfyController : ControllerBase
{
    private readonly HttpClient _httpClient;
    
    public ComfyController(IHttpClientFactory httpClientFactory)
    {
        _httpClient = httpClientFactory.CreateClient();
    }

    [HttpPost("upload")]
    public async Task<IActionResult> UploadImage([FromBody] byte[] imageBlob)
    {
        if (imageBlob == null || imageBlob.Length == 0)
        {
            return BadRequest("No image data provided.");
        }

        // Crear el contenido del formulario para enviar a ComfyUI
        var formData = new MultipartFormDataContent();

        // Añade imagen
        var imageContent = new ByteArrayContent(imageBlob);
        imageContent.Headers.ContentType = new MediaTypeHeaderValue("image/png"); // Asegúrate de que el tipo MIME coincide
        formData.Add(imageContent, "image", "image.png");

      /*
        // Añade workflow
        var workflowContent = new StringContent(ProcesaPrompt());
        workflowContent.Headers.ContentType = MediaTypeHeaderValue.Parse("application/json");
        formData.Add(workflowContent, "workflow");
        */

        // Hacer la petición POST a la API de ComfyUI
        var response = await _httpClient.PostAsync("http://127.0.0.1:8188/upload/image", formData);

        if (response.IsSuccessStatusCode)
        {
            var responseData = await response.Content.ReadAsStringAsync();
            // Devuelve la URL de la imagen procesada
            return Ok(new { processed_image_url = responseData });
        }
        else
        {
            return StatusCode((int)response.StatusCode, "Error processing image.");
        }
    }

    /*
    private string ProcesaPrompt()
    {
        string promptText = @"
        {
            ""3"": {
                ""inputs"": {
                    ""seed"": 712691034083095,
                    ""steps"": 17,
                    ""cfg"": 4,
                    ""sampler_name"": ""dpmpp_sde"",
                    ""scheduler"": ""karras"",
                    ""denoise"": 0.9,
                    ""model"": [
                        ""4"",
                        0
                    ],
                    ""positive"": [
                        ""22"",
                        0
                    ],
                    ""negative"": [
                        ""7"",
                        0
                    ],
                    ""latent_image"": [
                        ""20"",
                        0
                    ]
                },
                ""class_type"": ""KSampler"",
                ""_meta"": {
                    ""title"": ""KSampler""
                }
            },
            ""4"": {
                ""inputs"": {
                    ""ckpt_name"": ""architecturerealmix_v11.safetensors""
                },
                ""class_type"": ""CheckpointLoaderSimple"",
                ""_meta"": {
                    ""title"": ""Load Checkpoint""
                }
            },
            ""6"": {
                ""inputs"": {
                    ""text"": ""modern building, cafe, colorful,  sunlight, architectural photography, photorealistic (sharp)"",
                    ""clip"": [
                        ""4"",
                        1
                    ]
                },
                ""class_type"": ""CLIPTextEncode"",
                ""_meta"": {
                    ""title"": ""CLIP Text Encode (Prompt)""
                }
            },
            ""7"": {
                ""inputs"": {
                    ""text"": ""text, oil, fake, fog, haze, bloom"",
                    ""clip"": [
                        ""4"",
                        1
                    ]
                },
                ""class_type"": ""CLIPTextEncode"",
                ""_meta"": {
                    ""title"": ""CLIP Text Encode (Prompt)""
                }
            },
            ""8"": {
                ""inputs"": {
                    ""samples"": [
                        ""3"",
                        0
                    ],
                    ""vae"": [
                        ""4"",
                        2
                    ]
                },
                ""class_type"": ""VAEDecode"",
                ""_meta"": {
                    ""title"": ""VAE Decode""
                }
            },
            ""9"": {
                ""inputs"": {
                    ""filename_prefix"": ""ComfyUI"",
                    ""images"": [
                        ""8"",
                        0
                    ]
                },
                ""class_type"": ""SaveImage"",
                ""_meta"": {
                    ""title"": ""Save Image""
                }
            },
            ""14"": {
                ""inputs"": {
                    ""images"": [
                        ""31"",
                        0
                    ]
                },
                ""class_type"": ""PreviewImage"",
                ""_meta"": {
                    ""title"": ""Preview Image""
                }
            },
            ""19"": {
                ""inputs"": {
                    ""image"": ""normal-image.png"",
                    ""upload"": ""image""
                },
                ""class_type"": ""LoadImage"",
                ""_meta"": {
                    ""title"": ""Load Image""
                }
            },
            ""20"": {
                ""inputs"": {
                    ""pixels"": [
                        ""19"",
                        0
                    ],
                    ""vae"": [
                        ""4"",
                        2
                    ]
                },
                ""class_type"": ""VAEEncode"",
                ""_meta"": {
                    ""title"": ""VAE Encode""
                }
            },
            ""22"": {
                ""inputs"": {
                    ""strength"": 0.8,
                    ""conditioning"": [
                        ""6"",
                        0
                    ],
                    ""control_net"": [
                        ""24"",
                        0
                    ],
                    ""image"": [
                        ""31"",
                        0
                    ]
                },
                ""class_type"": ""ControlNetApply"",
                ""_meta"": {
                    ""title"": ""Apply ControlNet""
                }
            },
            ""24"": {
                ""inputs"": {
                    ""control_net_name"": ""control_v11p_sd15_canny_fp16.safetensors""
                },
                ""class_type"": ""ControlNetLoader"",
                ""_meta"": {
                    ""title"": ""Load ControlNet Model""
                }
            },
            ""31"": {
                ""inputs"": {
                    ""low_threshold"": 0.4,
                    ""high_threshold"": 0.8,
                    ""image"": [
                        ""19"",
                        0
                    ]
                },
                ""class_type"": ""Canny"",
                ""_meta"": {
                    ""title"": ""Canny""
                }
            },
            ""files"":{
              ""/input/capture.png""
            }
        }
        ";

        // Deserialize the JSON into a dictionary
        var prompt = JsonConvert.DeserializeObject<Dictionary<string, object>>(promptText);

        // Set the text prompt for our positive CLIPTextEncode
        var node19 = (Dictionary<string, object>)((Dictionary<string, object>)prompt["19"])["inputs"];
        node19["image"] = "capture.png";

        // Set the seed for our KSampler node
        var node3 = (Dictionary<string, object>)((Dictionary<string, object>)prompt["3"])["inputs"];
        node3["seed"] = 5;

        // Serialize the updated object back to JSON
        return JsonConvert.SerializeObject(prompt, Formatting.Indented);
    }
  */
}

