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
    [Route("api")]
    public class EmployeeController : ControllerBase
    {
        private readonly ILogger<EmployeeController> _logger;
        private DB _db;  // Declare _db field
        private IEmailSender _emailSender;
        private IHttpContextAccessor _httpContextAccessor;

        /// <summary>
        /// Initializes a new instance of the <see cref="EmployeeController"/> class.
        /// </summary>
        /// <param name="logger">The logger.</param>
        /// <param name="db">The database context.</param>
        public EmployeeController(ILogger<EmployeeController> logger, ModelContext db, IHttpContextAccessor httpContextAccessor, IEmailSender emailSender)
        {
            _logger = logger;
            _emailSender = emailSender;
            _db = new DB(db, httpContextAccessor);  // Initialize _db in the constructor
        }

        /// <summary>
        /// Gets all employees.
        /// </summary>
        /// <returns>A list of all employees.</returns>
        [HttpGet]
        [Route("allemps")]
        public async Task<ActionResult<List<Employee>>> GetAllEmps()
        {
            // get all employees and their relationships from the database
            return await _db.GetEmployees();
        }

        /// <summary>
        /// Adds a new employee to the database.
        /// </summary>
        /// <param name="input">The input model for the new employee.</param>
        /// <returns>The newly created employee.</returns>
        [HttpPost]
        [Route("register")]
        public async Task<ActionResult<Employee>> AddAsync(EmployeeInputModel input)
        {
            var employee = new Employee
            {
                Email = input.Email,
                FirstName = input.FirstName,
                LastName = input.LastName,
                Password = BCrypt.Net.BCrypt.HashPassword(input.Password),
                Function = "Employee",
                IsAdmin = false,
            };
            return await _db.AddEmp(employee, _emailSender);
        }

        /// <summary>
        /// Gets all weeks.
        /// </summary>
        /// <returns>A list of all dates.</returns>
        [HttpGet]
        [Route("alldates")]
        public async Task<ActionResult<List<Availability>>> GetAllDates()
        {
            return await _db.GetAllDates();
        }

        [HttpGet]
        [Route("Allmails")]
        public async Task<ActionResult<List<String>>> GetAllMails()
        {
            // Return a list of all employee emails
            return await _db.GetAllMails();
        }
        [HttpPut]
        [Route("edituser/{id}")]
        public async Task<ActionResult<Employee>> EditUser(int id, [FromBody] EmployeeInputModel input)
        {
           
            var NewUser = new Employee()
            {
                FirstName = input.FirstName,
                LastName = input.LastName,
                Email = input.Email,
                Password = input.Password,
            };

            return await _db.EditUser(id, NewUser, _emailSender);
        }
        [HttpPost]
        [Route("login")]
        public async Task<ActionResult> LoginAsync(EmployeeInputModel input)
        {
            // Get the employee with the given email
            return await _db.Login(input.Email, input.Password);
        }

        [HttpGet]
        [Route("onsite")]
        public async Task<int> OnSiteEmployees(string day)
        {
            DateTime date = DateTime.Parse(day);
            return await _db.EmployeesOnSite(date);
        }

        [HttpPut]
        [Route("join")]
        public async Task<ActionResult> Join(EmployeeInputModel input)
        {
            DateTime day = DateTime.Parse(input.Day!);
            return await _db.JoinDay(input.Email!, day!);
        }

        [HttpGet]
        [Route("inoffice")]
        public async Task<ActionResult> IsInOffice(string Email, string Day)
        {
            DateTime day = DateTime.Parse(Day);
            return await _db.InOffice(Email!, day!);
        }

        [HttpGet]
        [Route("getempsonsite")]
        public async Task<ActionResult<Object[]>> GetEmpsOnSite(string day)
        {
            DateTime date = DateTime.Parse(day);
            return await _db.GetEmployeesOnSite(date);
        }
        [HttpGet]
        [Route("getempsonevent")]
        public async Task<ActionResult<Object[]>> GetEmpsOnEvent(int id)
        {
            return await _db.GetEmpsOnEvent(id);
        }

        [HttpPut]
        [Route("addpfp")]
        public async Task<ActionResult> AddPfp(EmployeeInputModel input)
        {
            return await _db.AddPfp(input.Email!, input.Pfp!);
        }

        [HttpPut]
        [Route("userattendance")]
        public async Task<ActionResult> EmployeeEventAttendance([FromBody] UserAttendanceRequest request)
        {
             return await _db.EmployeeEventAttendance(request.userId);
        }
        [HttpGet]
        [Route("isAdmin")]
        public async Task<ActionResult> IsAdmin(string Email)
        {
            return await _db.IsAdmin(Email!);
        }
        [HttpDelete]
        [Route("removeuser/{id}")]
        public async Task<IActionResult> RemoveUser(int id)
        {
            return await _db.RemoveEmployee(id);
        }
    }

    /// <summary>
    /// The input model for adding a new employee.
    /// </summary>
    public class EmployeeInputModel
    {
        public string? Email { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Password { get; set; }
        public string? Pfp { get; set; }
        public string? Day { get; set; }
        public string? Token { get; set; }
    }
}


public class UserAttendanceRequest
{
    public int userId { get; set; }
}