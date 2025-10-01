using Microsoft.AspNetCore.Mvc;

namespace RestauranteNET.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            // Se o usuário já estiver logado, redireciona conforme a role
            if (User.Identity?.IsAuthenticated == true)
            {
                if (User.IsInRole("Administrador"))
                {
                    return RedirectToAction("Index", "Administrator");
                }
                return RedirectToAction("Index", "Menu");
            }

            // Se não estiver logado, redireciona para a página de login
            return RedirectToPage("/Account/Login", new { area = "Identity" });
        }

        public IActionResult Privacy()
        {
            return View();
        }
    }
}