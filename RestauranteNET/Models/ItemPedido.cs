namespace RestauranteNET.Models
{
    public class ItemPedido
    {
        public int Id { get; set; }
        public int ComidaId { get; set; }
        public Comida Comida { get; set; } = null!;
        public int Quantidade { get; set; }
        public decimal PrecoUnitario { get; set; }
    }
}
