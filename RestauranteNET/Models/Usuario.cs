using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace RestauranteNET.Models
{
    public class Usuario : IdentityUser
    {
        [Required]
        [MaxLength(100)]
        public string NomeCompleto { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? Endereco { get; set; }

        [MaxLength(15)]
        public string? Telefone { get; set; }
    }
}
