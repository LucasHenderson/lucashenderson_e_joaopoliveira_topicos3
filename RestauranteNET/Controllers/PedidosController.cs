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

        // DTOs
        public class PedidoDto
        {
            public string Tipo { get; set; } = string.Empty;
            public string? Horario { get; set; } // Horário da reserva (opcional)
            public decimal Total { get; set; }
            public List<ItemPedidoDto> Itens { get; set; } = new List<ItemPedidoDto>();
        }

        public class ItemPedidoDto
        {
            public int ComidaId { get; set; }
            public int Quantidade { get; set; }
            public decimal PrecoUnitario { get; set; }
        }

        // Criar pedido
        [HttpPost]
        public async Task<IActionResult> CreatePedido([FromBody] PedidoDto dto)
        {
            try
            {
                if (dto == null || dto.Itens == null || !dto.Itens.Any())
                    return BadRequest("Pedido inválido");

                var user = await _userManager.GetUserAsync(User);
                if (user == null)
                    return Unauthorized();

                var pedido = new Pedido
                {
                    ClienteId = user.Id,
                    Data = DateTime.Now,
                    Tipo = dto.Tipo,
                    Horario = dto.Tipo == "reserva" ? dto.Horario : null, // Salvar horário apenas para reservas
                    Total = dto.Total,
                    Status = "pending",
                    Itens = dto.Itens.Select(i => new ItemPedido
                    {
                        ComidaId = i.ComidaId,
                        Quantidade = i.Quantidade,
                        PrecoUnitario = i.PrecoUnitario
                    }).ToList()
                };

                _context.Pedidos.Add(pedido);
                await _context.SaveChangesAsync();

                // Adicionar log para verificar o pedido criado
                Console.WriteLine($"===== DEBUG PEDIDO CRIADO =====");
                Console.WriteLine($"Pedido ID: {pedido.Id}");
                Console.WriteLine($"Cliente ID: {pedido.ClienteId}");
                Console.WriteLine($"Tipo: {pedido.Tipo}");
                Console.WriteLine($"Horario: {pedido.Horario ?? "N/A"}");
                Console.WriteLine($"Total: {pedido.Total}");
                Console.WriteLine($"Itens: {pedido.Itens.Count}");
                Console.WriteLine($"==============================");

                return Ok(new { message = "Pedido criado com sucesso", id = pedido.Id });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao criar pedido: {ex.Message}");
                return BadRequest(new { error = ex.Message });
            }
        }

        // Resto do código permanece igual...
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

        // Cancelar pedido (apenas pelo cliente e se status = pending)
        [HttpPut("{id}/cancelar")]
        public async Task<IActionResult> CancelarPedido(int id)
        {
            try
            {
                var user = await _userManager.GetUserAsync(User);
                var pedido = await _context.Pedidos.FindAsync(id);

                if (pedido == null)
                    return NotFound(new { message = "Pedido não encontrado." });

                // Verificar se o pedido pertence ao usuário
                if (pedido.ClienteId != user.Id)
                    return Forbid();

                // Só pode cancelar se estiver pendente
                if (pedido.Status != "pending")
                    return BadRequest(new { message = "Apenas pedidos pendentes podem ser cancelados." });

                pedido.Status = "canceled";
                await _context.SaveChangesAsync();

                return Ok(new { message = "Pedido cancelado com sucesso." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}