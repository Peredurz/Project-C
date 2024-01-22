using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging; // Import the ILogger namespace
using Models;
using BCrypt.Net;
using Queries;

namespace Project_C.Controllers
{
    [ApiController]
    [Route("api")]
    public class RoomController : ControllerBase
    {
        private readonly ILogger<RoomController> _logger;
        private DB _db; // Declare _db field
        private IHttpContextAccessor _httpContextAccessor;

        /// <summary>
        /// Initializes a new instance of the <see cref="EmployeeController"/> class.
        /// </summary>
        /// <param name="logger">The logger.</param>
        /// <param name="db">The database context.</param>
        public RoomController(
            ILogger<RoomController> logger,
            ModelContext db,
            IHttpContextAccessor httpContextAccessor
        )
        {
            _logger = logger;
            _db = new DB(db, httpContextAccessor); // Initialize _db in the constructor
        }

        [HttpGet]
        [Route("getavailablespaces")]
        public async Task<ActionResult<List<Room>>> GetAvailableSpaces()
        {
            return await _db.GetAvailableSpaces();
        }

        [HttpPut]
        [Route("claimspace")]
        public async Task<ActionResult<Room>> ClaimSpace(RoomInputModel input)
        {
            return await _db.ClaimSpace((int)input.RoomNumber, input.Email);
        }

        [HttpPut]
        [Route("releasespace")]
        public async Task<ActionResult<Room>> ReleaseSpace(RoomInputModel input)
        {
            return await _db.ReleaseSpace((int)input.RoomNumber, input.Email);
        }

        [HttpPut]
        [Route("releasespaceadmin")]
        public async Task<ActionResult<Room>> ReleaseSpaceAdmin(RoomInputModel input)
        {
            return await _db.ReleaseSpaceAdmin((int)input.RoomNumber);
        }

        [HttpPost]
        [Route("addroom")]
        public async Task<ActionResult> AddRoom(RoomInputModel input)
        {
            return await _db.AddRoom((int)input.RoomNumber, input.RoomName);
        }

        [HttpDelete]
        [Route("deleteroom")]
        public async Task<ActionResult> DeleteRoom(RoomInputModel input)
        {
            return await _db.DeleteRoom((int)input.RoomNumber);
        }

        [HttpPut]
        [Route("updateroom")]
        public async Task<ActionResult> UpdateRoom(RoomInputModel input)
        {
            return await _db.UpdateRoom((int)input.RoomNumber, input.RoomName);
        }
    }

    public class RoomInputModel
    {
        public string? Email { get; set; }
        public int? RoomNumber { get; set; }
        public string? RoomName { get; set; }
    }
}
