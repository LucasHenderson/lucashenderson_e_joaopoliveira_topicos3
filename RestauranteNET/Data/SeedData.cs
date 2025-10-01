using Microsoft.AspNetCore.Identity;
using RestauranteNET.Models;

namespace RestauranteNET.Data
{
    public static class SeedData
    {
        public static async Task Initialize(IServiceProvider serviceProvider)
        {
            var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();
            var userManager = serviceProvider.GetRequiredService<UserManager<Usuario>>();
            var context = serviceProvider.GetRequiredService<ApplicationDbContext>();

            // 1. Criar Roles
            string[] roleNames = { "Administrador", "Cliente" };
            foreach (var roleName in roleNames)
            {
                if (!await roleManager.RoleExistsAsync(roleName))
                {
                    await roleManager.CreateAsync(new IdentityRole(roleName));
                }
            }

            // 2. Criar Administrador
            var adminEmail = "admin@restaurante.net";
            var adminUser = await userManager.FindByEmailAsync(adminEmail);
            if (adminUser == null)
            {
                adminUser = new Usuario
                {
                    UserName = adminEmail,
                    Email = adminEmail,
                    NomeCompleto = "Administrador",
                    Endereco = "Rua Principal, 100",
                    PhoneNumber = "63 99999-0000",
                    EmailConfirmed = true
                };
                await userManager.CreateAsync(adminUser, "Admin@123");
                await userManager.AddToRoleAsync(adminUser, "Administrador");
            }

            // 3. Criar Clientes
            var clientes = new[]
            {
                new { Email = "maria@email.com", Nome = "Maria Silva", Endereco = "Rua das Flores, 123", Telefone = "63 98888-1111" },
                new { Email = "joao@email.com", Nome = "João Santos", Endereco = "Av. Central, 456", Telefone = "63 98888-2222" },
                new { Email = "ana@email.com", Nome = "Ana Costa", Endereco = "Rua Verde, 789", Telefone = "63 98888-3333" }
            };

            foreach (var clienteData in clientes)
            {
                var cliente = await userManager.FindByEmailAsync(clienteData.Email);
                if (cliente == null)
                {
                    cliente = new Usuario
                    {
                        UserName = clienteData.Email,
                        Email = clienteData.Email,
                        NomeCompleto = clienteData.Nome,
                        Endereco = clienteData.Endereco,
                        PhoneNumber = clienteData.Telefone,
                        EmailConfirmed = true
                    };
                    await userManager.CreateAsync(cliente, "Senha@123");
                    await userManager.AddToRoleAsync(cliente, "Cliente");
                }
            }

            // 4. Criar Comidas
            if (!context.Comidas.Any())
            {
                var comidas = new[]
                {
                    // Sugestões do Chefe
                    new Comida { Nome = "Filé ao Molho Madeira", Descricao = "Filé mignon ao molho madeira com legumes salteados", Preco = 48.00M, Chef = true, ImgUrl = "/imgs/file-madeira.jpg" },
                    new Comida { Nome = "Risoto de Camarão", Descricao = "Risoto cremoso com camarões frescos", Preco = 55.00M, Chef = true, ImgUrl = "/imgs/risoto.jpg" },
                    
                    // Pratos Principais
                    new Comida { Nome = "Pizza Marguerita", Descricao = "Pizza com molho de tomate, mussarela e manjericão", Preco = 42.00M, Chef = false, ImgUrl = "/imgs/pizza-marguerita.jpg" },
                    new Comida { Nome = "Lasanha Bolonhesa", Descricao = "Camadas de massa com molho bolonhesa e queijo", Preco = 35.00M, Chef = false, ImgUrl = "/imgs/lasanha.jpg" },
                    new Comida { Nome = "Strogonoff de Frango", Descricao = "Strogonoff cremoso com arroz e batata palha", Preco = 32.00M, Chef = false, ImgUrl = "/imgs/strogonoff.jpg" },
                    new Comida { Nome = "Feijoada Completa", Descricao = "Feijoada tradicional com acompanhamentos", Preco = 38.00M, Chef = false, ImgUrl = "/imgs/feijoada.jpg" },
                    new Comida { Nome = "Hambúrguer Artesanal", Descricao = "Hambúrguer 180g com queijo, bacon e molho especial", Preco = 28.00M, Chef = false, ImgUrl = "/imgs/hamburguer.jpg" },
                    new Comida { Nome = "Salmão Grelhado", Descricao = "Salmão grelhado com purê de batatas", Preco = 52.00M, Chef = false, ImgUrl = "/imgs/salmao.jpg" },
                    new Comida { Nome = "Picanha na Brasa", Descricao = "Picanha nobre grelhada com acompanhamentos", Preco = 58.00M, Chef = false, ImgUrl = "/imgs/picanha.jpg" },
                    new Comida { Nome = "Frango à Parmegiana", Descricao = "Filé de frango empanado com molho e queijo", Preco = 36.00M, Chef = false, ImgUrl = "/imgs/parmegiana.jpg" },
                    
                    // Massas
                    new Comida { Nome = "Espaguete à Carbonara", Descricao = "Massa com molho carbonara cremoso", Preco = 34.00M, Chef = false, ImgUrl = "/imgs/carbonara.jpg" },
                    new Comida { Nome = "Penne ao Pesto", Descricao = "Penne com molho pesto e tomate seco", Preco = 30.00M, Chef = false, ImgUrl = "/imgs/pesto.jpg" },
                    
                    // Saladas
                    new Comida { Nome = "Salada Caesar", Descricao = "Alface romana, croutons, parmesão e molho caesar", Preco = 24.00M, Chef = false, ImgUrl = "/imgs/caesar.jpg" },
                    new Comida { Nome = "Salada Caprese", Descricao = "Tomate, mussarela de búfala e manjericão", Preco = 26.00M, Chef = false, ImgUrl = "/imgs/caprese.jpg" },
                    
                    // Sobremesas
                    new Comida { Nome = "Petit Gateau", Descricao = "Bolinho de chocolate com sorvete de creme", Preco = 18.00M, Chef = false, ImgUrl = "/imgs/petit.jpg" },
                    new Comida { Nome = "Tiramisù", Descricao = "Sobremesa italiana com café e mascarpone", Preco = 16.00M, Chef = false, ImgUrl = "/imgs/tiramisu.jpg" },
                    
                    // Bebidas
                    new Comida { Nome = "Suco Natural", Descricao = "Suco natural de frutas da estação", Preco = 8.00M, Chef = false, ImgUrl = "/imgs/suco.jpg" },
                    new Comida { Nome = "Refrigerante Lata", Descricao = "Refrigerante 350ml", Preco = 6.00M, Chef = false, ImgUrl = "/imgs/refri.jpg" },
                    new Comida { Nome = "Água Mineral", Descricao = "Água mineral 500ml", Preco = 4.00M, Chef = false, ImgUrl = "/imgs/agua.jpg" },
                    new Comida { Nome = "Caipirinha", Descricao = "Caipirinha tradicional ou de frutas", Preco = 15.00M, Chef = false, ImgUrl = "/imgs/caipirinha.jpg" }
                };

                context.Comidas.AddRange(comidas);
                await context.SaveChangesAsync();
            }

            // 5. Criar Pedidos de Exemplo
            if (!context.Pedidos.Any())
            {
                var maria = await userManager.FindByEmailAsync("maria@email.com");
                var joao = await userManager.FindByEmailAsync("joao@email.com");
                var pizza = context.Comidas.First(c => c.Nome == "Pizza Marguerita");
                var lasanha = context.Comidas.First(c => c.Nome == "Lasanha Bolonhesa");
                var file = context.Comidas.First(c => c.Nome == "Filé ao Molho Madeira");

                var pedidos = new[]
                {
                    new Pedido
                    {
                        ClienteId = maria.Id,
                        Data = DateTime.Now.AddDays(-2),
                        Tipo = "proprio",
                        Status = "confirmed",
                        Total = 42.00M + 15.00M, // Pizza + taxa delivery próprio
                        Itens = new List<ItemPedido>
                        {
                            new ItemPedido { ComidaId = pizza.Id, Quantidade = 1, PrecoUnitario = pizza.Preco }
                        }
                    },
                    new Pedido
                    {
                        ClienteId = joao.Id,
                        Data = DateTime.Now.AddDays(-1),
                        Tipo = "parceiro",
                        Status = "confirmed",
                        Total = 70.00M + 5.00M, // Lasanha x2 + taxa parceiro
                        Itens = new List<ItemPedido>
                        {
                            new ItemPedido { ComidaId = lasanha.Id, Quantidade = 2, PrecoUnitario = lasanha.Preco }
                        }
                    },
                    new Pedido
                    {
                        ClienteId = maria.Id,
                        Data = DateTime.Now,
                        Tipo = "proprio",
                        Status = "pending",
                        Total = 48.00M * 0.8M + 15.00M, // Filé com 20% desconto + taxa
                        Itens = new List<ItemPedido>
                        {
                            new ItemPedido { ComidaId = file.Id, Quantidade = 1, PrecoUnitario = file.Preco * 0.8M }
                        }
                    }
                };

                context.Pedidos.AddRange(pedidos);
                await context.SaveChangesAsync();
            }

            // 6. Criar Reservas de Exemplo
            if (!context.Reservas.Any())
            {
                var ana = await userManager.FindByEmailAsync("ana@email.com");

                var reservas = new[]
                {
                    new Reserva
                    {
                        ClienteId = ana.Id,
                        Data = DateTime.Now.AddDays(1),
                        Horario = "19h",
                        Status = "confirmed",
                        Total = 10.00M // Taxa de reserva
                    },
                    new Reserva
                    {
                        ClienteId = ana.Id,
                        Data = DateTime.Now.AddDays(3),
                        Horario = "20h",
                        Status = "pending",
                        Total = 10.00M
                    }
                };

                context.Reservas.AddRange(reservas);
                await context.SaveChangesAsync();
            }
        }
    }
}