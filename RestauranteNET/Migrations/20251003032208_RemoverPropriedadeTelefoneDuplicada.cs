using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RestauranteNET.Migrations
{
    /// <inheritdoc />
    public partial class RemoverPropriedadeTelefoneDuplicada : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Telefone",
                table: "AspNetUsers");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Telefone",
                table: "AspNetUsers",
                type: "nvarchar(15)",
                maxLength: 15,
                nullable: true);
        }
    }
}
