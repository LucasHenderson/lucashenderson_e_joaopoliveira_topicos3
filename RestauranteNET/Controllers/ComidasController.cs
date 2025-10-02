using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestauranteNET.Data;
using RestauranteNET.Models;

namespace RestauranteNET.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ComidasController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public ComidasController(ApplicationDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        [HttpGet]
        public async Task<IActionResult> GetComidas()
        {
            var comidas = await _context.Comidas.ToListAsync();
            return Ok(comidas);
        }

        [HttpPost]
        [Authorize(Roles = "Administrador")]
        public async Task<IActionResult> CreateComida([FromBody] Comida comida)
        {
            if (string.IsNullOrEmpty(comida.Nome) || comida.Preco <= 0)
            {
                return BadRequest(new { error = "Nome e preço são obrigatórios." });
            }

            _context.Comidas.Add(comida);
            await _context.SaveChangesAsync();
            return Ok(comida);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Administrador")]
        public async Task<IActionResult> UpdateComida(int id, [FromBody] Comida comida)
        {
            if (string.IsNullOrEmpty(comida.Nome) || comida.Preco <= 0)
            {
                return BadRequest(new { error = "Nome e preço são obrigatórios." });
            }

            var existing = await _context.Comidas.FindAsync(id);
            if (existing == null) return NotFound();

            existing.Nome = comida.Nome;
            existing.Descricao = comida.Descricao;
            existing.Preco = comida.Preco;
            existing.Chef = comida.Chef;
            existing.ImgUrl = comida.ImgUrl;

            await _context.SaveChangesAsync();
            return Ok(existing);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Administrador")]
        public async Task<IActionResult> DeleteComida(int id)
        {
            var comida = await _context.Comidas.FindAsync(id);
            if (comida == null) return NotFound();

            _context.Comidas.Remove(comida);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost("upload")]
        [Authorize(Roles = "Administrador")]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { error = "Nenhum arquivo enviado." });
            }

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
            var extension = Path.GetExtension(file.FileName).ToLower();
            if (!allowedExtensions.Contains(extension))
            {
                return BadRequest(new { error = "Apenas arquivos JPG e PNG são permitidos." });
            }

            var fileName = Guid.NewGuid().ToString() + extension;
            var filePath = Path.Combine(_environment.WebRootPath, "uploads", fileName);

            Directory.CreateDirectory(Path.Combine(_environment.WebRootPath, "Uploads"));

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var url = $"/Uploads/{fileName}";
            return Ok(new { url });
        }
    }
}