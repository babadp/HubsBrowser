using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;


[Route("api/[controller]")]
[ApiController]
public class ComfyController : ControllerBase
{
    private readonly HttpClient _httpClient;

    public ComfyController(IHttpClientFactory httpClientFactory)
    {
        _httpClient = httpClientFactory.CreateClient();
    }

    [HttpPost("upload")]
    public async Task<IActionResult> UploadImage([FromForm] IFormFile image)
    {
        if (image == null || image.Length == 0)
        {
            return BadRequest("No image provided.");
        }

        // Crear el contenido del formulario para enviar a ComfyUI
        var formData = new MultipartFormDataContent();
        using (var fileStream = image.OpenReadStream())
        {
            var streamContent = new StreamContent(fileStream);
            streamContent.Headers.ContentType = new MediaTypeHeaderValue(image.ContentType);
            formData.Add(streamContent, "image", image.FileName);

            // Hacer la petición POST a la API de ComfyUI
            var response = await _httpClient.PostAsync("http://127.0.0.1:8188/", formData);

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
    }
}

