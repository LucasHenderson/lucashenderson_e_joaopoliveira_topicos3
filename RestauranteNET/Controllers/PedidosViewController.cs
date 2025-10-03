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

            Console.WriteLine($"===== DEBUG MEUS PEDIDOS =====");
            Console.WriteLine($"User ID: {user?.Id}");
            Console.WriteLine($"User Email: {user?.Email}");

            var pedidos = await _context.Pedidos
                .Include(p => p.Itens).ThenInclude(i => i.Comida)
                .Where(p => p.ClienteId == user.Id)
                .OrderByDescending(p => p.Data)
                .ToListAsync();

            Console.WriteLine($"Total de pedidos encontrados: {pedidos.Count}");
            foreach (var p in pedidos)
            {
                Console.WriteLine($"Pedido ID: {p.Id}, Tipo: {p.Tipo}, Status: '{p.Status}', Total: {p.Total}, Itens: {p.Itens.Count}");
            }
            Console.WriteLine($"==============================");

            return View(pedidos);
        }
    }
    }