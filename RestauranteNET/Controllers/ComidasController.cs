using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestauranteNET.Data;
using RestauranteNET.Models;

namespace RestauranteNET.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ComidasController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ComidasController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetComidas()
        {
            var comidas = await _context.Comidas.ToListAsync();
            return Ok(comidas);
        }

        [HttpPost]
        public async Task<IActionResult> CreateComida(Comida comida)
        {
            _context.Comidas.Add(comida);
            await _context.SaveChangesAsync();
            return Ok(comida);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateComida(int id, Comida comida)
        {
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
        public async Task<IActionResult> DeleteComida(int id)
        {
            var comida = await _context.Comidas.FindAsync(id);
            if (comida == null) return NotFound();

            _context.Comidas.Remove(comida);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}