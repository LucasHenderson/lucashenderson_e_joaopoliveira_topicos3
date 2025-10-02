﻿using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RestauranteNET.Migrations
{
    /// <inheritdoc />
    public partial class AddHorario : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Horario",
                table: "Pedidos",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Horario",
                table: "Pedidos");
        }
    }
}
