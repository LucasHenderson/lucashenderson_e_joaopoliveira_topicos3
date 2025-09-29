using Microsoft.AspNetCore.Identity.UI.Services;

namespace RestauranteNET.Services
{
    public class EmailSender : IEmailSender
    {
        public Task SendEmailAsync(string email, string subject, string htmlMessage)
        {
            // Por enquanto, só loga no console
            Console.WriteLine($"Email para {email}: {subject}");
            return Task.CompletedTask;
        }
    }
}