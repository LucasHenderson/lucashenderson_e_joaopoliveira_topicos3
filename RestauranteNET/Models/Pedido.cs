using RestauranteNET.Models;

public class Pedido
{
    public int Id { get; set; }
    public string ClienteId { get; set; } = string.Empty;
    public Usuario Cliente { get; set; } = null!;  // <-- Ajustado

    public DateTime Data { get; set; } = DateTime.Now;
    public string Tipo { get; set; } = string.Empty; // proprio, parceiro, presencial
    public decimal Total { get; set; }
    public string Status { get; set; } = "pending";

    public ICollection<ItemPedido> Itens { get; set; } = new List<ItemPedido>();
}
