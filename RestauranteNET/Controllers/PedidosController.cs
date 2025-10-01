using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestauranteNET.Data;
using RestauranteNET.Models;

namespace RestauranteNET.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class PedidosController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<Usuario> _userManager;

        public PedidosController(ApplicationDbContext context, UserManager<Usuario> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        // Criar pedido
        [HttpPost]
        public async Task<IActionResult> CreatePedido(Pedido pedido)
        {
            // Pega o usuário logado
            var user = await _userManager.GetUserAsync(User);
            pedido.ClienteId = user.Id;
            pedido.Data = DateTime.Now;

            _context.Pedidos.Add(pedido);
            await _context.SaveChangesAsync();
            return Ok(pedido);
        }

        // Pedidos do usuário logado
        [HttpGet("meus")]
        public async Task<IActionResult> GetMeusPedidos()
        {
            var user = await _userManager.GetUserAsync(User);

            var pedidos = await _context.Pedidos
                .Include(p => p.Itens).ThenInclude(i => i.Comida)
                .Where(p => p.ClienteId == user.Id)
                .OrderByDescending(p => p.Data)
                .ToListAsync();

            return Ok(pedidos);
        }

        // Todos os pedidos (apenas admin)
        [HttpGet("all")]
        [Authorize(Roles = "Administrador")]
        public async Task<IActionResult> GetAllPedidos()
        {
            var pedidos = await _context.Pedidos
                .Include(p => p.Cliente)
                .Include(p => p.Itens).ThenInclude(i => i.Comida)
                .OrderByDescending(p => p.Data)
                .ToListAsync();

            return Ok(pedidos);
        }

        // Atualizar status (apenas admin)
        [HttpPut("{id}/status")]
        [Authorize(Roles = "Administrador")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] string status)
        {
            var pedido = await _context.Pedidos.FindAsync(id);
            if (pedido == null) return NotFound();

            pedido.Status = status;
            await _context.SaveChangesAsync();
            return Ok(pedido);
        }
    }
}