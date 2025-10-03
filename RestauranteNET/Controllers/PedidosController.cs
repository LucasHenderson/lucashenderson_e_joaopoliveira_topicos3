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
            public string? Horario { get; set; }
            public decimal Total { get; set; }
            public List<ItemPedidoDto> Itens { get; set; } = new List<ItemPedidoDto>();
        }

        public class ItemPedidoDto
        {
            public int ComidaId { get; set; }
            public int Quantidade { get; set; }
            public decimal PrecoUnitario { get; set; }
        }

        // Verificar disponibilidade de horários
        [HttpGet("horarios-disponiveis")]
        public async Task<IActionResult> GetHorariosDisponiveis([FromQuery] string data)
        {
            try
            {
                if (!DateTime.TryParse(data, out DateTime dataReserva))
                {
                    return BadRequest("Data inválida");
                }

                var horarios = new[] { "19", "20", "21", "22" };
                var disponibilidade = new Dictionary<string, object>();

                foreach (var horario in horarios)
                {
                    var count = await _context.Pedidos
                        .Where(p => p.Tipo.ToLower() == "reserva"
                            && p.Horario == horario
                            && p.Data.Date == dataReserva.Date
                            && p.Status != "canceled")
                        .CountAsync();

                    disponibilidade[horario] = new
                    {
                        disponivel = count < 5,
                        reservas = count,
                        vagas = 5 - count
                    };
                }

                return Ok(disponibilidade);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
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

                // Validação para reservas
                if (dto.Tipo == "reserva" && !string.IsNullOrEmpty(dto.Horario))
                {
                    var reservasNoHorario = await _context.Pedidos
                        .Where(p => p.Tipo.ToLower() == "reserva"
                            && p.Horario == dto.Horario
                            && p.Data.Date == DateTime.Now.Date
                            && p.Status != "canceled")
                        .CountAsync();

                    if (reservasNoHorario >= 5)
                    {
                        return BadRequest(new { error = "Este horário está lotado. Escolha outro horário." });
                    }
                }

                var pedido = new Pedido
                {
                    ClienteId = user.Id,
                    Data = DateTime.Now,
                    Tipo = dto.Tipo,
                    Horario = dto.Tipo == "reserva" ? dto.Horario : null,
                    Total = dto.Total,
                    Status = "pending",
                    EnderecoEntrega = user.Endereco,
                    Itens = dto.Itens.Select(i => new ItemPedido
                    {
                        ComidaId = i.ComidaId,
                        Quantidade = i.Quantidade,
                        PrecoUnitario = i.PrecoUnitario
                    }).ToList()
                };

                _context.Pedidos.Add(pedido);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Pedido criado com sucesso", id = pedido.Id });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("meus")]
        public async Task<IActionResult> GetMeusPedidos()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
                return Unauthorized();

            var pedidos = await _context.Pedidos
                .Include(p => p.Itens).ThenInclude(i => i.Comida)
                .Where(p => p.ClienteId == user.Id)
                .OrderByDescending(p => p.Data)
                .ToListAsync();

            return Ok(pedidos);
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAllPedidos()
        {
            try
            {
                var user = await _userManager.GetUserAsync(User);
                if (user == null)
                {
                    return Unauthorized(new { error = "Usuário não autenticado" });
                }

                // Verificar se é administrador
                var isAdmin = await _userManager.IsInRoleAsync(user, "Administrador");
                if (!isAdmin)
                {
                    return Forbid();
                }

                var pedidos = await _context.Pedidos
                    .Include(p => p.Cliente)
                    .Include(p => p.Itens).ThenInclude(i => i.Comida)
                    .OrderByDescending(p => p.Data)
                    .ToListAsync();

                return Ok(pedidos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] string status)
        {
            try
            {
                var user = await _userManager.GetUserAsync(User);
                if (user == null)
                    return Unauthorized();

                var isAdmin = await _userManager.IsInRoleAsync(user, "Administrador");
                if (!isAdmin)
                    return Forbid();

                var pedido = await _context.Pedidos.FindAsync(id);
                if (pedido == null)
                    return NotFound();

                pedido.Status = status;
                await _context.SaveChangesAsync();

                return Ok(pedido);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPut("{id}/cancelar")]
        public async Task<IActionResult> CancelarPedido(int id)
        {
            try
            {
                var user = await _userManager.GetUserAsync(User);
                if (user == null)
                    return Unauthorized();

                var pedido = await _context.Pedidos.FindAsync(id);
                if (pedido == null)
                    return NotFound(new { message = "Pedido não encontrado." });

                if (pedido.ClienteId != user.Id)
                    return Forbid();

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