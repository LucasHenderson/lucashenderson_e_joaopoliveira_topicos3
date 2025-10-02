namespace RestauranteNET.Models
{
    public class Comida
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Descricao { get; set; } = string.Empty;
        public decimal Preco { get; set; }
        public bool Chef { get; set; }
        public string ImgUrl { get; set; } = string.Empty;
    }
}