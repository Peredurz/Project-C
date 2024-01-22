using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Models;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Queries;

namespace Project_C.Controllers
{
    [ApiController]
    [Route("events")]
    public class EventController : ControllerBase
    {
        private readonly ILogger<EventController> _logger;
        private readonly DB _db;
        private readonly IEmailSender _emailSender;
        public EventController(ILogger<EventController> logger, ModelContext db, IHttpContextAccessor httpContextAccessor, IEmailSender emailSender)
        {
            _logger = logger;
            _emailSender = emailSender;
            _db = new DB(db, httpContextAccessor);
        }

        [HttpGet]
        [Route("event")]
        public async Task<ActionResult<Event>> GetEvent([FromQuery] int id)
        {
            return await _db.GetEvent(id);
        }

        [HttpGet]
        [Route("allevents")]
        public async Task<ActionResult<List<Event>>> GetAllEvents()
        {
            return await _db.GetEvents();
        }

        [HttpGet]
        [Route("allpublicevents")]
        public async Task<ActionResult<List<Event>>> GetAllPublicEvents()
        {
            return await _db.GetPublicEvents();
        }

        [HttpGet]
        [Route("allprivateevents")]
        public async Task<ActionResult<List<Event>>> GetAllPrivateEvents()
        {
            return await _db.GetPrivateEvents();
        }

        [HttpGet]
        [Route("alluserevents")]
        public async Task<ActionResult<List<Event>>> GetAllUser([FromQuery] int employeeId)
        {
            return await _db.GetEventsByEmployee(employeeId);
        }

        [HttpPost]
        [Route("addevent")]
        public async Task<ActionResult<Event>> AddEvent([FromBody] EventInputModel input)
        {
            var newEvent = new Event
            {
                Name = input.Name,
                Location = input.Location,
                Date = input.Date,
                StartTime = input.StartTime,
                EndTime = input.EndTime,
                Description = input.Description,
                isPublic = input.isPublic
            };

            return await _db.AddEvent(newEvent);
        }

        [HttpDelete]
        [Route("deleteevent/{id}")]
        public async Task<IActionResult> DeleteEvent(int id)
        {
            return await _db.DeleteEvent(id);
        }

        [HttpPut]
        [Route("approveevent/{id}")]
        public async Task<IActionResult> ApproveEvent(int id)
        {
            return await _db.ApproveEvent(id);
        }

        [HttpPut]
        [Route("editevent/{id}")]
        public async Task<ActionResult<Event>> EditEvent(int id, [FromBody] EventInputModel input)
        {
            var newEvent = new Event
            {
                Name = input.Name,
                Location = input.Location,
                Date = input.Date,
                StartTime = input.StartTime,
                EndTime = input.EndTime,
                Description = input.Description,
                isPublic = input.isPublic
            };

            return await _db.EditEvent(id, newEvent, _emailSender);
        }

        [HttpGet]
        [Route("attendance")]
        public async Task<int> EvAttend([FromQuery] int eventId)
        {
            return await _db.EventAtt(eventId);
        }
        [HttpGet]
        [Route("attending")]
        public async Task<bool> EventJoined([FromQuery] int eventId, int userId)
        {
            return await _db.CheckJoin(eventId, userId);
        }
    }

    public class EventInputModel
    {
        public string Name { get; set; }
        public string Location { get; set; }
        public DateOnly Date { get; set; }
        public TimeOnly StartTime { get; set; }
        public TimeOnly EndTime { get; set; }
        public string Description { get; set; }
        public bool isPublic { get; set; }
    }
}