using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestauranteNET.Data;
using RestauranteNET.Models;

namespace RestauranteNET.Controllers
{
    [Authorize] // Requer login
    public class PedidosViewController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<Usuario> _userManager;

        public PedidosViewController(ApplicationDbContext context, UserManager<Usuario> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        public async Task<IActionResult> MeusPedidos()
        {
            var user = await _userManager.GetUserAsync(User);

            var pedidos = await _context.Pedidos
                .Include(p => p.Itens).ThenInclude(i => i.Comida)
                .Where(p => p.ClienteId == user.Id)
                .OrderByDescending(p => p.Data)
                .ToListAsync();

            return View(pedidos);
        }
    }
}