using System;
using System.Collections.Generic;

namespace RestauranteNET.Models
{
    public class Pedido
    {
        public int Id { get; set; }
        public string ClienteId { get; set; } = string.Empty;
        public Usuario Cliente { get; set; } = null!;
        public DateTime Data { get; set; } = DateTime.Now;
        public string Tipo { get; set; } = string.Empty; // proprio, parceiro, reserva
        public string? Horario { get; set; } // Horário da reserva (ex.: "19:00")
        public decimal Total { get; set; }
        public string Status { get; set; } = "pending";
        public ICollection<ItemPedido> Itens { get; set; } = new List<ItemPedido>();

        public string? EnderecoEntrega { get; set; }
    }
}