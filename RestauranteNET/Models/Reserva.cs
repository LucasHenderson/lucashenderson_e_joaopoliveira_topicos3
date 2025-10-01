using RestauranteNET.Models;

namespace RestauranteNET.Models
{
    public class Reserva
    {
        public int Id { get; set; }
        public string ClienteId { get; set; } = string.Empty;
        public Usuario Cliente { get; set; } = null!;  // <-- Ajustado

        public DateTime Data { get; set; }
        public string Horario { get; set; } = string.Empty; // 19h, 20h, 21h
        public string Status { get; set; } = "pending";
        public decimal Total { get; set; }
    }
}