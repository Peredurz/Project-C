using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;  // Import the ILogger namespace
using Models;
using BCrypt.Net;
using Queries;

namespace Project_C.Controllers
{
    /// <summary>
    /// Controller for managing employee data.
    /// </summary>
    [ApiController]
    [Route("account")]
    public class ForgotPasswordController : ControllerBase
    {
        private readonly ILogger<ForgotPasswordController> _logger;
        private readonly DB _db;
        private readonly IEmailSender _emailSender;
        public ForgotPasswordController(ILogger<ForgotPasswordController> logger, ModelContext db, IHttpContextAccessor httpContextAccessor, IEmailSender emailSender)
        {
            _logger = logger;
            _emailSender = emailSender;
            _db = new DB(db, httpContextAccessor);
        }

        [HttpPost]
        [Route("forgotpassword")]
        public async Task<IActionResult> ForgotPassword(ForgotPasswordInputModel forgotPasswordModel)
        {
            return await _db.ForgotPassword(forgotPasswordModel.Email, _emailSender);
        }

        [HttpPost]
        [Route("resetpassword")]
        public async Task<IActionResult> ForgotPasswordConfirmation(ForgotPasswordInputModel forgotPasswordModel)
        {
            return await _db.ForgotPasswordConfirmation(forgotPasswordModel.Token, forgotPasswordModel.Password, forgotPasswordModel.ConfirmPassword, _emailSender);
        }
    }

    /// <summary>
    /// The input model for adding a new forgot password.
    /// </summary>
    public class ForgotPasswordInputModel
    {
        public string? Email { get; set; }
        public string? Token { get; set; }
        public string? Password { get; set; }
        public string? ConfirmPassword { get; set; }
    }
}
