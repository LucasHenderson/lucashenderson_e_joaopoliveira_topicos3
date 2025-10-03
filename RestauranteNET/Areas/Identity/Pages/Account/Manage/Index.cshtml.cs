using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using RestauranteNET.Models;

namespace RestauranteNET.Areas.Identity.Pages.Account.Manage
{
    public class IndexModel : PageModel
    {
        private readonly UserManager<Usuario> _userManager;
        private readonly SignInManager<Usuario> _signInManager;

        public IndexModel(
            UserManager<Usuario> userManager,
            SignInManager<Usuario> signInManager)
        {
            _userManager = userManager;
            _signInManager = signInManager;
        }

        [TempData]
        public string? StatusMessage { get; set; }

        [BindProperty]
        public InputModel Input { get; set; } = new InputModel();

        [BindProperty]
        public ChangePasswordInputModel PasswordInput { get; set; } = new ChangePasswordInputModel();

        public class InputModel
        {
            [Required(ErrorMessage = "Nome completo é obrigatório")]
            [Display(Name = "Nome Completo")]
            public string NomeCompleto { get; set; } = string.Empty;

            [EmailAddress]
            [Display(Name = "Email")]
            public string Email { get; set; } = string.Empty;

            [Required(ErrorMessage = "Telefone é obrigatório")]
            [Display(Name = "Telefone")]
            public string PhoneNumber { get; set; } = string.Empty;

            [Required(ErrorMessage = "Endereço é obrigatório")]
            [Display(Name = "Endereço")]
            public string Endereco { get; set; } = string.Empty;
        }

        public class ChangePasswordInputModel
        {
            [Required(ErrorMessage = "Senha atual é obrigatória")]
            [DataType(DataType.Password)]
            [Display(Name = "Senha Atual")]
            public string OldPassword { get; set; } = string.Empty;

            [Required(ErrorMessage = "Nova senha é obrigatória")]
            [StringLength(100, ErrorMessage = "A senha deve ter no mínimo {2} caracteres.", MinimumLength = 6)]
            [DataType(DataType.Password)]
            [Display(Name = "Nova Senha")]
            public string NewPassword { get; set; } = string.Empty;

            [Required(ErrorMessage = "Confirmação de senha é obrigatória")]
            [DataType(DataType.Password)]
            [Display(Name = "Confirmar Nova Senha")]
            [Compare("NewPassword", ErrorMessage = "As senhas não coincidem")]
            public string ConfirmPassword { get; set; } = string.Empty;
        }

        private async Task LoadAsync(Usuario user)
        {
            var userName = await _userManager.GetUserNameAsync(user);
            var phoneNumber = await _userManager.GetPhoneNumberAsync(user);

            Input = new InputModel
            {
                NomeCompleto = user.NomeCompleto,
                Email = userName ?? "",
                PhoneNumber = phoneNumber ?? "",
                Endereco = user.Endereco ?? ""
            };
        }

        public async Task<IActionResult> OnGetAsync()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return NotFound();
            }

            await LoadAsync(user);
            return Page();
        }

        public async Task<IActionResult> OnPostAsync()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return NotFound();
            }

            if (!ModelState.IsValid)
            {
                await LoadAsync(user);
                return Page();
            }

            Console.WriteLine("===== SALVANDO INFORMAÇÕES =====");
            Console.WriteLine($"Nome digitado: {Input.NomeCompleto}");
            Console.WriteLine($"Nome atual no BD: {user.NomeCompleto}");
            Console.WriteLine($"Telefone digitado: {Input.PhoneNumber}");
            Console.WriteLine($"Telefone atual no BD: {user.PhoneNumber}");
            Console.WriteLine($"Endereço digitado: {Input.Endereco}");
            Console.WriteLine($"Endereço atual no BD: {user.Endereco}");

            // Atualizar cada campo
            bool mudou = false;

            if (Input.NomeCompleto != user.NomeCompleto)
            {
                user.NomeCompleto = Input.NomeCompleto;
                mudou = true;
                Console.WriteLine("Nome será atualizado");
            }

            if (Input.PhoneNumber != user.PhoneNumber)
            {
                user.PhoneNumber = Input.PhoneNumber;
                mudou = true;
                Console.WriteLine("Telefone será atualizado");
            }

            if (Input.Endereco != user.Endereco)
            {
                user.Endereco = Input.Endereco;
                mudou = true;
                Console.WriteLine("Endereço será atualizado");
            }

            if (mudou)
            {
                var result = await _userManager.UpdateAsync(user);

                if (result.Succeeded)
                {
                    Console.WriteLine("✅ SALVO COM SUCESSO!");
                    await _signInManager.RefreshSignInAsync(user);
                    StatusMessage = "✅ Suas informações foram atualizadas com sucesso!";
                }
                else
                {
                    Console.WriteLine("❌ ERRO ao salvar:");
                    foreach (var error in result.Errors)
                    {
                        Console.WriteLine($"  - {error.Description}");
                    }
                    StatusMessage = "❌ Erro ao salvar. Verifique os dados.";
                }
            }
            else
            {
                Console.WriteLine("Nenhuma alteração detectada");
                StatusMessage = "Nenhuma alteração foi feita";
            }

            return RedirectToPage();
        }

        public async Task<IActionResult> OnPostChangePasswordAsync()
        {
            Console.WriteLine("===== TENTANDO ALTERAR SENHA =====");

            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                Console.WriteLine("❌ Usuário não encontrado");
                return NotFound();
            }

            Console.WriteLine($"Usuário: {user.Email}");
            Console.WriteLine($"Senha atual tem: {PasswordInput.OldPassword?.Length ?? 0} caracteres");
            Console.WriteLine($"Senha nova tem: {PasswordInput.NewPassword?.Length ?? 0} caracteres");
            Console.WriteLine($"Confirmação tem: {PasswordInput.ConfirmPassword?.Length ?? 0} caracteres");

            // Validação
            if (string.IsNullOrEmpty(PasswordInput.OldPassword) ||
                string.IsNullOrEmpty(PasswordInput.NewPassword) ||
                string.IsNullOrEmpty(PasswordInput.ConfirmPassword))
            {
                StatusMessage = "❌ Todos os campos são obrigatórios";
                await LoadAsync(user);
                return Page();
            }

            if (PasswordInput.NewPassword != PasswordInput.ConfirmPassword)
            {
                StatusMessage = "❌ As senhas novas não coincidem";
                await LoadAsync(user);
                return Page();
            }

            // Tentar alterar
            var result = await _userManager.ChangePasswordAsync(
                user,
                PasswordInput.OldPassword,
                PasswordInput.NewPassword
            );

            Console.WriteLine($"Resultado: {result.Succeeded}");

            if (result.Succeeded)
            {
                Console.WriteLine("✅ SENHA ALTERADA!");
                await _signInManager.RefreshSignInAsync(user);
                StatusMessage = "✅ Senha alterada com sucesso!";
                return RedirectToPage();
            }
            else
            {
                Console.WriteLine("❌ FALHA ao alterar:");
                foreach (var error in result.Errors)
                {
                    Console.WriteLine($"  - {error.Code}: {error.Description}");
                }
                StatusMessage = "❌ Senha atual incorreta";
                await LoadAsync(user);
                return Page();
            }
        }
    }
}