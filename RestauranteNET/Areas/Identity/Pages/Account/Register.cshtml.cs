using System.ComponentModel.DataAnnotations;
using System.Text;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.WebUtilities;
using RestauranteNET.Models;

namespace RestauranteNET.Areas.Identity.Pages.Account
{
    public class RegisterModel : PageModel
    {
        private readonly SignInManager<Usuario> _signInManager;
        private readonly UserManager<Usuario> _userManager;
        private readonly IUserStore<Usuario> _userStore;
        private readonly IUserEmailStore<Usuario> _emailStore;
        private readonly ILogger<RegisterModel> _logger;
        private readonly IEmailSender _emailSender;

        public RegisterModel(
            UserManager<Usuario> userManager,
            IUserStore<Usuario> userStore,
            SignInManager<Usuario> signInManager,
            ILogger<RegisterModel> logger,
            IEmailSender emailSender)
        {
            _userManager = userManager;
            _userStore = userStore;
            _emailStore = (IUserEmailStore<Usuario>)userStore;
            _signInManager = signInManager;
            _logger = logger;
            _emailSender = emailSender;
        }

        [BindProperty]
        public InputModel Input { get; set; }

        public string ReturnUrl { get; set; }

        public IList<AuthenticationScheme> ExternalLogins { get; set; }

        public class InputModel
        {
            [Required(ErrorMessage = "O email é obrigatório")]
            [EmailAddress(ErrorMessage = "Email inválido")]
            [Display(Name = "Email")]
            public string Email { get; set; }

            [Required(ErrorMessage = "O nome completo é obrigatório")]
            [StringLength(100, ErrorMessage = "O nome deve ter no máximo {1} caracteres")]
            [Display(Name = "Nome completo")]
            public string NomeCompleto { get; set; }

            [StringLength(200, ErrorMessage = "O endereço deve ter no máximo {1} caracteres")]
            [Display(Name = "Endereço")]
            public string? Endereco { get; set; }

            [Phone(ErrorMessage = "Telefone inválido")]
            [RegularExpression(@"^\d{2}\s\d{5}-\d{4}$", ErrorMessage = "Formato: 99 99999-9999")]
            [Display(Name = "Telefone")]
            public string? Telefone { get; set; }

            [Required(ErrorMessage = "A senha é obrigatória")]
            [StringLength(100, ErrorMessage = "A senha deve ter entre {2} e {1} caracteres", MinimumLength = 6)]
            [DataType(DataType.Password)]
            [Display(Name = "Senha")]
            public string Password { get; set; }

            [DataType(DataType.Password)]
            [Display(Name = "Confirmar senha")]
            [Compare("Password", ErrorMessage = "As senhas não coincidem")]
            public string ConfirmPassword { get; set; }
        }

        public async Task OnGetAsync(string returnUrl = null)
        {
            ReturnUrl = returnUrl;
            ExternalLogins = (await _signInManager.GetExternalAuthenticationSchemesAsync()).ToList();
        }

        public async Task<IActionResult> OnPostAsync(string returnUrl = null)
        {
            returnUrl ??= Url.Content("~/");
            ExternalLogins = (await _signInManager.GetExternalAuthenticationSchemesAsync()).ToList();

            if (ModelState.IsValid)
            {
                // Verifica se o email já existe
                var existingUser = await _userManager.FindByEmailAsync(Input.Email);
                if (existingUser != null)
                {
                    ModelState.AddModelError(string.Empty, "Este email já está cadastrado.");
                    return Page();
                }

                var user = new Usuario
                {
                    UserName = Input.Email,
                    Email = Input.Email,
                    NomeCompleto = Input.NomeCompleto,
                    Endereco = Input.Endereco,
                    PhoneNumber = Input.Telefone
                };

                var result = await _userManager.CreateAsync(user, Input.Password);

                if (result.Succeeded)
                {
                    _logger.LogInformation("Usuário criou uma nova conta com senha.");
                    await _signInManager.SignInAsync(user, isPersistent: false);
                    return LocalRedirect(returnUrl);
                }

                foreach (var error in result.Errors)
                {
                    ModelState.AddModelError(string.Empty, error.Description);
                }
            }

            return Page();
        }
    }
}
