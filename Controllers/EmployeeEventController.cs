using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Models;
using System;
using System.Threading.Tasks;

namespace Project_C.Controllers
{
    [ApiController]
    [Route("empevents")]
    public class EmployeeEventController : ControllerBase
    {
        private readonly ILogger<EmployeeEventController> _logger;
        private readonly ModelContext _db;

        public EmployeeEventController(ILogger<EmployeeEventController> logger, ModelContext db)
        {
            _logger = logger;
            _db = db;
        }

        [HttpGet]
        [Route("allempevents")]
        public async Task<ActionResult<List<EmployeeEvent>>> GetAllEmployeeEvents()
        {
            var employeeEvents = await _db.EmployeeEvents
                .Include(e => e.Employee)
                .Include(e => e.Event)
                .ToListAsync();
            return employeeEvents;
        }
        [HttpPut]
        [Route("revents")]
        public async Task<ActionResult<List<EmployeeEvent>>> RemoveUserFromEvent([FromBody] EmployeeEventInputModel inputModel)
        {
            try
            {

                var employeeEventsAttendees = (from x in _db.Events where x.Id == inputModel.EventId select x.Attendees).First();
                var employee = (from e in _db.Employees where e.Id == inputModel.EmployeeId select e).First();

                if (employeeEventsAttendees != null)
                {
                    // Use Where to filter out the employee to be removed
                    employeeEventsAttendees = employeeEventsAttendees.Where(e => e.EmployeeId != inputModel.EmployeeId).ToList();
                    employee.AttendedEvents = employee.AttendedEvents.Where(e => e.EventId != inputModel.EventId).ToList();
                    await _db.SaveChangesAsync();
                    return Ok(employeeEventsAttendees);
                }

                else
                {
                    return NotFound(); // or BadRequest() depending on requirements
                }
            }
            catch (Exception ex)
            {
                // Handle exceptions and log if necessary
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }


        [HttpPost]
        [Route("attendevent")]
        public async Task<ActionResult<EmployeeEvent>> AddEmployeeEvent([FromBody] EmployeeEventInputModel input)
        {
            try
            {

                var newEmployeeEvent = new EmployeeEvent { EmployeeId = input.EmployeeId, EventId = input.EventId };
                if (!_db.EmployeeEvents.Contains(newEmployeeEvent))
                {
                    await _db.EmployeeEvents.AddAsync(newEmployeeEvent);
                }
                else
                {
                    return BadRequest(new { errorMessage = "Employee has already joined the event." });
                }

                var eventToUpdate = await _db.Events.FindAsync(input.EventId);
                if (eventToUpdate != null)
                {
                    eventToUpdate.Attendees.Add(newEmployeeEvent);
                }

                await _db.SaveChangesAsync();

                return newEmployeeEvent;
            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message);
                return BadRequest();
            }
        }

        [HttpDelete]
        [Route("deleteemployeeevent")]
        public async Task<ActionResult<EmployeeEvent>> DeleteEmployeeEvent([FromBody] EmployeeEventInputModel input)
        {
            try
            {
                var employeeEventToDelete = await _db.EmployeeEvents.FindAsync(input.EmployeeId, input.EventId);
                if (employeeEventToDelete != null)
                {
                    _db.EmployeeEvents.Remove(employeeEventToDelete);
                }

                var eventToUpdate = await _db.Events.FindAsync(input.EventId);
                if (eventToUpdate != null)
                {
                    eventToUpdate.Attendees.Remove(employeeEventToDelete);
                }

                await _db.SaveChangesAsync();

                return employeeEventToDelete;
            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message);
                return BadRequest();
            }
        }
    }

    public class EmployeeEventInputModel
    {
        public int EmployeeId { get; set; }
        public int EventId { get; set; }
    }
}