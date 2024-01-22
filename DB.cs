using Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.Reflection;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Text;



namespace Queries;

public class DB
{
    private readonly ModelContext _db;  // Declare _db field

    private readonly IHttpContextAccessor _httpContextAccessor;

    public DB(ModelContext db, IHttpContextAccessor httpContextAccessor)
    {
        _db = db;  // Initialize _db in the constructor
        _httpContextAccessor = httpContextAccessor;
    }
    //Employees attending on day 
    public async Task<int> EmployeesOnSite(DateTime day)
    {
        var employees = await _db.Employees
            .Include(e => e.Availabilities)
            .Where(e => e.Availabilities.Any(a => a.Date == DateOnly.FromDateTime(day)))
            .ToArrayAsync();
        int amount = employees.Length;
        return amount;
    }

    public async Task<ActionResult<Object[]>> GetEmployeesOnSite(DateTime day)
    {
        try
        {
            //Get all employees for the day of the year in Availability
            var employees = await _db.Employees
                 .Include(e => e.Availabilities)
                 .Where(e => e.Availabilities.Any(a => a.Date == DateOnly.FromDateTime(day)))
                 .ToArrayAsync();

            return new ObjectResult(new
            {
                success = true,
                employees
            });
        }
        catch (Exception ex)
        {
            // Log or handle the exception appropriately
            Console.Error.WriteLine($"Error in GetEmployeesOnSite: {ex.Message}");
            return new ObjectResult(new { success = false, message = "An error occurred." });
        }
    }
    public async Task<ActionResult<Object[]>> GetEmpsOnEvent(int id)
    {
        try
        {
            //Get all employees for the day of the year in Availability
            var employees = await _db.Events
                .Where(e => e.Id == id)
                .SelectMany(e => e.Attendees).Select(e => e.Employee)
                .ToArrayAsync();

            // Now, 'employees' is of type EmployeeEvent[]
            return new ObjectResult(new
            {
                success = true,
                employees
            });
        }
        catch (Exception ex)
        {
            // Log or handle the exception appropriately
            Console.Error.WriteLine($"Error in GetEmployeesOnSite: {ex.Message}");
            return new ObjectResult(new { success = false, message = "An error occurred." });
        }
    }

    public async Task<List<Employee>> GetEmployees()
    {
        var employees = await _db.Employees
                .Include(e => e.Room)
                .Include(e => e.Availabilities)
                .Include(e => e.Reviews)
                .Include(e => e.AttendedEvents)
                .AsSplitQuery()
                .ToListAsync();
        return employees;
    }

    public async Task<ActionResult<Employee>> AddEmp(Employee emp, IEmailSender emailSender)
    {

        try
        {
            if (_db.Employees.Count() == 0) emp.Id = 1;
            else
                emp.Id = _db.Employees.Max(e => e.Id) + 1;
            var employee = _db.Employees.Add(emp);
            await _db.SaveChangesAsync();
            // send an email to the new employee saying that their account has been created successfully
            await emailSender.SendEmailAsync(new Message(new List<string> { emp.Email }, "Account Created", $"Your account has been created successfully {emp.FirstName} {emp.LastName}!"));
            return emp;
        }
        catch (Exception e)
        {
            Console.WriteLine(e.Message);
            return null;
        }
    }

    public async Task<ActionResult<List<Availability>>> GetAllDates()
    {
        var Dates = await _db.Availabilities
            .Include(w => w.Employee)
            .AsSplitQuery()
            .ToListAsync();
        return Dates;
    }

    public async Task<ActionResult<List<String>>> GetAllMails()
    {
        // Return a list of all employee emails
        var mails = await _db.Employees
            .Select(e => e.Email)
            .ToListAsync();

        return mails;
    }

    public async Task<ActionResult> Login(string email, string password)
    {
        try
        {
            var employee = await _db.Employees
                .Where(e => e.Email.ToLower() == email.ToLower())
                .FirstOrDefaultAsync();

            if (employee == null)
            {
                return new ObjectResult(new { success = false, message = "Employee not found!" });
            }

            // Check if the password is correct
            if (!BCrypt.Net.BCrypt.Verify(password, employee.Password))
            {
                return new ObjectResult(new { success = false, message = "Incorrect password!" });
            }

            return new ObjectResult(new { success = true, employee });
        }
        catch (Exception e)
        {
            Console.WriteLine(e.Message);
            return new ObjectResult(new { success = false, message = "Something went wrong!" });
        }
    }

    public async Task<ActionResult> JoinDay(string email, DateTime day)
    {
        var employee = await _db.Employees.AsNoTracking()
            .Include(e => e.Availabilities)
            .FirstOrDefaultAsync(e => e.Email.ToLower() == email.ToLower());

        if (employee == null)
        {
            return new ObjectResult(new { success = false, message = "Employee not found." });
        }

        var date = DateOnly.FromDateTime(day);
        if (employee.Availabilities.Any(a => a.Date == date))
        {
            // delete the availability
            var availability = employee.Availabilities.Where(a => a.Date == date).FirstOrDefault();
            _db.Availabilities.Remove(availability);
            await _db.SaveChangesAsync();
            return new ObjectResult(new { success = true, message = false });
        }

        // Rest of your code...

        var newAvailability = new Availability
        {
            EmployeeId = employee.Id,
            Date = date
        };
        _db.Availabilities.Add(newAvailability);
        await _db.SaveChangesAsync();
        return new ObjectResult(new { success = true, message = true });
    }

    public async Task<ActionResult> InOffice(string email, DateTime day)
    {
        var emp = await _db.Employees
            .Include(e => e.Availabilities)
            .Where(e => e.Email == email)
            .FirstOrDefaultAsync();

        if (emp == null)
        {
            return new ObjectResult(new { success = false, message = "Employee not found!" });
        }

        var avail = emp.Availabilities.Where(a => a.Date == DateOnly.FromDateTime(day)).FirstOrDefault();
        if (avail != null)
        {
            return new ObjectResult(new { success = true, message = true });
        }

        return new ObjectResult(new { success = true, message = false });
    }


    public async Task<ActionResult> AddPfp(string email, string pfp)
    {
        try
        {
            var emp = await _db.Employees
                .Where(e => e.Email == email)
                .FirstOrDefaultAsync();

            if (emp == null)
            {
                return new ObjectResult(new { success = false, message = "Employee not found!" });
            }
            else
            {
                // Attempt to convert the string to a byte array
                try
                {
                    byte[] imageBytes = Convert.FromBase64String(pfp);
                    emp.ProfilePicture = imageBytes;
                    await _db.SaveChangesAsync();
                    return new ObjectResult(new { success = true, message = "Profile picture updated!" });
                }
                catch (Exception ex)
                {
                    // Handle the exception and return an appropriate response
                    return new ObjectResult(new { success = false, message = "Error decoding base64 string: " + ex.Message });
                }
            }
        }
        catch (Exception ex)
        {
            // Handle any other exceptions that might occur
            return new ObjectResult(new { success = false, message = "An error occurred: " + ex.Message });
        }
    }
    public async Task<int> EventAtt(int id) =>
        (from e in _db.Events where e.Id == id select e.Attendees).First().Count;

    public async Task<ActionResult<List<Room>>> GetAvailableSpaces()
    {
        try
        {
            List<Room> rooms = await _db.Rooms.Include(r => r.Employee).ToListAsync();

            return new ObjectResult(new { success = true, rooms });
        }
        catch (Exception ex)
        {
            // Log or handle the exception appropriately
            Console.Error.WriteLine($"Error in GetAvailableSpaces: {ex.Message}");
            return new ObjectResult(new { success = false, message = "An error occurred." });
        }
    }

    public async Task<ActionResult<Room>> ClaimSpace(int RoomNumber, string email)
    {
        try
        {
            // Get the room with the specified id
            var room = await _db.Rooms
                .Where(r => r.RoomNumber == RoomNumber)
                .FirstOrDefaultAsync();

            if (room == null)
            {
                return new ObjectResult(new { success = false, message = "Room not found!" });
            }

            // Get the employee with the specified id
            var employee = await _db.Employees
                .Where(e => e.Email == email)
                .Include(e => e.Room)
                .FirstOrDefaultAsync();

            if (employee == null)
            {
                return new ObjectResult(new { success = false, message = "Employee not found!" });
            }
            if (employee.Room != null)
            {
                return new ObjectResult(new { success = false, message = "Employee already claimed a room!\n There is a limit of one per person." });
            }

            // Check if the room is already claimed
            if (room.Employee != null && room.Employee != employee)
            {
                return new ObjectResult(new { success = false, message = "Room already claimed!" });
            }


            // Claim the room
            room.Employee = employee;
            await _db.SaveChangesAsync();

            return new ObjectResult(new { success = true, room });
        }
        catch (Exception ex)
        {
            // Log or handle the exception appropriately
            Console.Error.WriteLine($"Error in ClaimSpace: {ex.Message}");
            return new ObjectResult(new { success = false, message = "An error occurred." });
        }
    }

    public async Task<ActionResult<Room>> ReleaseSpace(int RoomNumber, string email)
    {
        try
        {
            // Get the room with the specified id
            var room = await _db.Rooms
                .Where(r => r.RoomNumber == RoomNumber)
                .FirstOrDefaultAsync();

            if (room == null)
            {
                return new ObjectResult(new { success = false, message = "Room not found!" });
            }

            // Get the employee with the specified id
            var employee = await _db.Employees
                .Where(e => e.Email == email)
                .FirstOrDefaultAsync();

            if (employee == null)
            {
                return new ObjectResult(new { success = false, message = "Employee not found!" });
            }

            // Check if the room is already claimed
            if (room.Employee == null || room.Employee != employee)
            {
                return new ObjectResult(new { success = false, message = "Room not claimed!" });
            }

            // Release the room
            room.Employee = null;
            await _db.SaveChangesAsync();

            return new ObjectResult(new { success = true, room });
        }
        catch (Exception ex)
        {
            // Log or handle the exception appropriately
            Console.Error.WriteLine($"Error in ReleaseSpace: {ex.Message}");
            return new ObjectResult(new { success = false, message = "An error occurred." });
        }
    }

    public async Task<ActionResult<Room>> ReleaseSpaceAdmin(int RoomNumber)
    {
        try
        {
            // Get the room with the specified id
            var room = await _db.Rooms
                .Where(r => r.RoomNumber == RoomNumber)
                .Include(r => r.Employee).FirstOrDefaultAsync();

            if (room == null)
            {
                return new ObjectResult(new { success = false, message = "Room not found!" });
            }

            // Check if the room is already claimed
            if (room.Employee == null)
            {
                return new ObjectResult(new { success = false, message = "Room not claimed!" });
            }

            // Release the room
            room.Employee = null;
            await _db.SaveChangesAsync();

            return new ObjectResult(new { success = true, room });
        }
        catch (Exception ex)
        {
            // Log or handle the exception appropriately
            Console.Error.WriteLine($"Error in ReleaseSpaceAdmin: {ex.Message}");
            return new ObjectResult(new { success = false, message = "An error occurred." });
        }
    }

    public async Task<ActionResult<Event>> GetEvent(int eventId)
    {
        try
        {
            var events = await _db.Events
                .Include(e => e.Reviews)
                .Include(e => e.Attendees)
                .Where(e => e.Id == eventId)
                .FirstOrDefaultAsync();

            return events;
        }
        catch (Exception ex)
        {
            // Log or handle the exception appropriately
            Console.Error.WriteLine($"Error in GetEvent: {ex.Message}");
            return new ObjectResult(new { success = false, message = "An error occurred." });
        }
    }

    public async Task<ActionResult<List<Event>>> GetEvents()
    {
        try
        {
            List<Event> events = await _db.Events
                .Include(e => e.Reviews)
                .Include(e => e.Attendees)
                .OrderBy(e => e.Date)
                .ThenBy(e => e.StartTime)
                .ThenBy(e => e.Location)
                .ThenBy(e => e.Name)
                .ToListAsync();

            return events;
        }
        catch (Exception ex)
        {
            // Log or handle the exception appropriately
            Console.Error.WriteLine($"Error in GetEvents: {ex.Message}");
            return new ObjectResult(new { success = false, message = "An error occurred." });
        }
    }

    public async Task<ActionResult<List<Event>>> GetPublicEvents()
    {
        try
        {
            List<Event> events = await _db.Events
                .Include(e => e.Reviews)
                .Include(e => e.Attendees)
                .OrderBy(e => e.Date)
                .ThenBy(e => e.StartTime)
                .ThenBy(e => e.Location)
                .ThenBy(e => e.Name)
                .Where(e => e.isPublic == true)
                .ToListAsync();

            return events;
        }
        catch (Exception ex)
        {
            // Log or handle the exception appropriately
            Console.Error.WriteLine($"Error in GetEvents: {ex.Message}");
            return new ObjectResult(new { success = false, message = "An error occurred." });
        }
    }

    public async Task<ActionResult<List<Event>>> GetPrivateEvents()
    {
        try
        {
            List<Event> events = await _db.Events
                .Include(e => e.Reviews)
                .Include(e => e.Attendees)
                .OrderBy(e => e.Date)
                .ThenBy(e => e.StartTime)
                .ThenBy(e => e.Location)
                .ThenBy(e => e.Name)
                .Where(e => e.isPublic == false)
                .ToListAsync();

            return events;
        }
        catch (Exception ex)
        {
            // Log or handle the exception appropriately
            Console.Error.WriteLine($"Error in GetEvents: {ex.Message}");
            return new ObjectResult(new { success = false, message = "An error occurred." });
        }
    }

    public async Task<ActionResult<List<Event>>> GetEventsByEmployee(int employeeId)
    {
        try
        {
            var events = await _db.Events
                .Include(e => e.Reviews)
                .Include(e => e.Attendees)
                .OrderBy(e => e.Date)
                .ThenBy(e => e.StartTime)
                .ThenBy(e => e.Location)
                .ThenBy(e => e.Name)
                .ToListAsync();

            var userEvents = events
                .Where(e => e.Attendees.Any(attendee => attendee.EmployeeId == employeeId))
                .ToList();

            return userEvents;
        }
        catch (Exception ex)
        {
            // Log or handle the exception appropriately
            Console.Error.WriteLine($"Error in GetEventsByEmployee: {ex.Message}");
            return new ObjectResult(new { success = false, message = "An error occurred." });
        }
    }

    public async Task<ActionResult<Event>> AddEvent(Event newEvent)
    {
        try
        {
            // Add the new event to the database
            await _db.Events.AddAsync(newEvent);
            await _db.SaveChangesAsync();

            return newEvent;
        }
        catch (Exception ex)
        {
            // Log or handle the exception appropriately
            Console.Error.WriteLine($"Error in AddEvent: {ex.Message}");
            return new ObjectResult(new { success = false, message = "An error occurred." });
        }
    }

    public async Task<IActionResult> DeleteEvent(int eventId)
    {
        try
        {
            // Get the event with the specified id
            var eventToDelete = await _db.Events
                .Where(e => e.Id == eventId)
                .FirstOrDefaultAsync();

            if (eventToDelete == null)
            {
                return new ObjectResult(new { success = false, message = "Event not found!" });
            }

            // Delete the event
            _db.Events.Remove(eventToDelete);
            await _db.SaveChangesAsync();

            return new ObjectResult(new { success = true, message = "Event deleted!" });
        }
        catch (Exception ex)
        {
            // Log or handle the exception appropriately
            Console.Error.WriteLine($"Error in DeleteEvent: {ex.Message}");
            return new ObjectResult(new { success = false, message = "An error occurred." });
        }
    }

    public async Task<bool> CheckJoin(int eventId, int userId)
    {
        var query = (from e in _db.Events where e.Id == eventId select e);
        var Events = query.Any(x => x.Attendees.Any(e => e.EmployeeId == userId));
        return Events;
    }

    public async Task<IActionResult> ApproveEvent(int eventId)
    {
        try
        {
            // Get the event with the specified id
            var eventToApprove = await _db.Events
                .Where(e => e.Id == eventId)
                .FirstOrDefaultAsync();

            if (eventToApprove == null)
            {
                return new ObjectResult(new { success = false, message = "Event not found!" });
            }

            // Approve the event
            eventToApprove.isPublic = true;
            await _db.SaveChangesAsync();

            return new ObjectResult(new { success = true, message = "Event approved!" });
        }
        catch (Exception ex)
        {
            // Log or handle the exception appropriately
            Console.Error.WriteLine($"Error in ApproveEvent: {ex.Message}");
            return new ObjectResult(new { success = false, message = "An error occurred." });
        }
    }

    public async Task<ActionResult<Event>> EditEvent(int eventId, Event updatedEvent, IEmailSender emailSender)
    {
        try
        {
            // var eventToEdit = await _db.Events.FindAsync(id);

            // if (eventToEdit == null)
            // {
            //     return NotFound();
            // }

            // // Get all EmployeeEvent records for this event
            // var employeeEvents = _db.EmployeeEvents.Where(ee => ee.EventId == eventToEdit.Id);

            // // Get all attendees (Employees) for this event
            // var attendees = employeeEvents.Select(ee => ee.Employee).ToList();

            // // Check if there are any attendees
            // if (attendees.Any())
            // {
            //     // Get the email addresses of the attendees
            //     var attendeeEmails = attendees.Select(a => a.Email).ToList();

            //     var changes = new StringBuilder();

            //     // Compare and update properties
            //     CompareAndUpdateProperty("Location", eventToEdit.Location, input.Location, changes);
            //     CompareAndUpdateProperty("Date", eventToEdit.Date, input.Date, changes);
            //     CompareAndUpdateProperty("StartTime", eventToEdit.StartTime, input.StartTime, changes);
            //     CompareAndUpdateProperty("EndTime", eventToEdit.EndTime, input.EndTime, changes);
            //     CompareAndUpdateProperty("Description", eventToEdit.Description, input.Description, changes);

            //     // Update or add the new event
            //     eventToEdit.Location = input.Location;
            //     eventToEdit.Date = input.Date;
            //     eventToEdit.StartTime = input.StartTime;
            //     eventToEdit.EndTime = input.EndTime;
            //     eventToEdit.Description = input.Description;

            //     await _db.SaveChangesAsync();

            //     // Create a message
            //     var message = new StringBuilder();

            //     message.AppendLine("Event:");

            //     message.AppendLine($"Location: {eventToEdit.Location}");
            //     message.AppendLine($"Date: {eventToEdit.Date}");
            //     message.AppendLine($"Start Time: {eventToEdit.StartTime}");
            //     message.AppendLine($"End Time: {eventToEdit.EndTime}");
            //     message.AppendLine($"Description: {eventToEdit.Description}");

            //     // Append changes
            //     if (changes.Length > 0)
            //     {
            //         message.AppendLine("\nChanges:");
            //         message.Append(changes.ToString());
            //     }

            //     // Send email
            //     _emailSender.SendEmailAsync(new Message(attendeeEmails, "Event Changed", message.ToString()));
            // }

            // return eventToEdit;

            // Get the event with the specified id
            var eventToEdit = await _db.Events
                .Where(e => e.Id == eventId)
                .FirstOrDefaultAsync();

            if (eventToEdit == null)
            {
                return new ObjectResult(new { success = false, message = "Event not found!" });
            }

            // Get all EmployeeEvent records for this event
            var employeeEvents = _db.EmployeeEvents.Where(ee => ee.EventId == eventToEdit.Id);

            // Get all attendees (Employees) for this event
            var attendees = employeeEvents.Select(ee => ee.Employee).ToList();

            var changes = new StringBuilder();

            // Compare properties
            CompareProperty("Name", eventToEdit.Name, updatedEvent.Name, changes);
            CompareProperty("Location", eventToEdit.Location, updatedEvent.Location, changes);
            CompareProperty("Date", eventToEdit.Date, updatedEvent.Date, changes);
            CompareProperty("StartTime", eventToEdit.StartTime, updatedEvent.StartTime, changes);
            CompareProperty("EndTime", eventToEdit.EndTime, updatedEvent.EndTime, changes);
            CompareProperty("Description", eventToEdit.Description, updatedEvent.Description, changes);

            // Update 
            eventToEdit.Name = updatedEvent.Name;
            eventToEdit.Location = updatedEvent.Location;
            eventToEdit.Date = updatedEvent.Date;
            eventToEdit.StartTime = updatedEvent.StartTime;
            eventToEdit.EndTime = updatedEvent.EndTime;
            eventToEdit.Description = updatedEvent.Description;

            // Save changes
            await _db.SaveChangesAsync();

            // Check if there are any attendees
            if (attendees.Any())
            {
                // Get the email addresses of the attendees
                var attendeeEmails = attendees.Select(a => a.Email).ToList();

                // Create a message
                var message = new StringBuilder();

                message.AppendLine("Event:");

                message.AppendLine($"Location: {eventToEdit.Location}");
                message.AppendLine($"Date: {eventToEdit.Date}");
                message.AppendLine($"Start Time: {eventToEdit.StartTime}");
                message.AppendLine($"End Time: {eventToEdit.EndTime}");
                message.AppendLine($"Description: {eventToEdit.Description}");

                // Append changes
                if (changes.Length > 0)
                {
                    message.AppendLine("\nChanges:");
                    message.Append(changes.ToString());
                }

                // Send email
                emailSender.SendEmailAsync(new Message(attendeeEmails, "Event Changed", message.ToString()));
            }

            return eventToEdit;
        }
        catch (Exception ex)
        {
            // Log or handle the exception appropriately
            Console.Error.WriteLine($"Error in EditEvent: {ex.Message}");
            return new ObjectResult(new { success = false, message = "An error occurred." });
        }
    }
    public async Task<ActionResult<Employee>> EditUser(int id, Employee updatedEmployee, IEmailSender emailSender)
    {
        
        try
        {
            // Get the event with the specified id
            var userToEdit = await _db.Employees
                .Where(e => e.Id == id)
                .FirstOrDefaultAsync();

            if (userToEdit == null)
            {
                return new ObjectResult(new { success = false, message = "User not found!" });
            }
            // Update 
            userToEdit.FirstName = (updatedEmployee.FirstName == null ? userToEdit.FirstName : updatedEmployee.FirstName);
            userToEdit.LastName = (updatedEmployee.LastName == null ? userToEdit.LastName : updatedEmployee.LastName);
            userToEdit.Email = (updatedEmployee.Email == null ? userToEdit.Email : updatedEmployee.Email);


            // Save changes
            await _db.SaveChangesAsync();

            var attendeeEmails = _db.Employees
                    .Where(e => e.Id == id).Select(e => e.Email).ToList();


            // Create a message
            var message = new StringBuilder();

            message.AppendLine($"Your new Employee info is :\n FirstName: {userToEdit.FirstName} \n " +
                               $"LastName: {userToEdit.LastName} \n Email: {userToEdit.Email}");

            // Send email
            emailSender.SendEmailAsync(new Message(attendeeEmails, "Employee info Changed", message.ToString()));
            return userToEdit;
        }
        catch (Exception ex)
        {
            // Log or handle the exception appropriately
            Console.Error.WriteLine($"Error in EditEvent: {ex.Message}");
            return new ObjectResult(new { success = false, message = "An error occurred." });
        }
    }
    public async Task<ActionResult> IsAdmin(string email)
    {
        try
        {
            var employee = await _db.Employees
                .Where(e => e.Email == email)
                .FirstOrDefaultAsync();

            if (employee == null)
            {
                return new ObjectResult(new { success = false, message = "Employee not found!" });
            }

            return new ObjectResult(new { success = true, isAdmin = employee.IsAdmin });
        }
        catch (Exception ex)
        {
            // Log or handle the exception appropriately
            Console.Error.WriteLine($"Error in IsAdmin: {ex.Message}");
            return new ObjectResult(new { success = false, message = "An error occurred." });
        }
    }

    public async Task<IActionResult> RemoveEmployee(int id)
    {
        try
        {
            // Get the event with the specified id
            var userToDelete = await _db.Employees.Where(e => e.Id == id).FirstOrDefaultAsync();

            if (userToDelete == null)
            {
                return new ObjectResult(new { success = false, message = "User not found!" });
            }

            // Delete the event
            _db.Employees.Remove(userToDelete);
            await _db.SaveChangesAsync();

            return new ObjectResult(new { success = true, message = "User deleted!" });
        }
        catch (Exception ex)
        {
            // Log or handle the exception appropriately
            Console.Error.WriteLine($"Error in RemoveEmployee: {ex.Message}");
            return new ObjectResult(new { success = false, message = "An error occurred." });
        }
    }


    private void CompareProperty(string propertyName, object oldValue, object newValue, StringBuilder changes)
    {
        if (!object.Equals(oldValue, newValue))
        {
            changes.AppendLine($"{propertyName}:");
            changes.AppendLine($"Old value: {oldValue}");
            changes.AppendLine($"New value: {newValue}");
            changes.AppendLine();
        }
    }

    public async Task<ActionResult> AddRoom(int Rnum, string Rname)
    {
        try
        {
            if (_db.Rooms.Any(x => x.RoomNumber == Rnum))
            {
                return new ObjectResult(new { success = false, message = $"Room already exists with room number {Rnum}!" });
            }
            Room room = new(Rnum, Rname, true);
            _db.Rooms.Add(room);
            await _db.SaveChangesAsync();
            return new ObjectResult(new { success = true, message = "Room added!" });
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error in AddRoom: {ex.Message}");
            return new ObjectResult(new { success = false, message = "An error occurred." });
        }
    }

    public async Task<ActionResult> DeleteRoom(int Rnum)
    {
        try
        {
            var room = await _db.Rooms
                .Where(r => r.RoomNumber == Rnum)
                .FirstOrDefaultAsync();

            if (room == null)
            {
                return new ObjectResult(new { success = false, message = "Room not found!" });
            }

            _db.Rooms.Remove(room);
            await _db.SaveChangesAsync();
            return new ObjectResult(new { success = true, message = "Room deleted!" });
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error in DeleteRoom: {ex.Message}");
            return new ObjectResult(new { success = false, message = "An error occurred." });
        }
    }

    public async Task<ActionResult> UpdateRoom(int Rnum, string Rname)
    {
        try
        {
            var room = await _db.Rooms
                .Where(r => r.RoomNumber == Rnum)
                .FirstOrDefaultAsync();

            if (room == null)
            {
                return new ObjectResult(new { success = false, message = "Room not found!" });
            }

            room.RoomName = Rname;
            await _db.SaveChangesAsync();
            return new ObjectResult(new { success = true, message = "Room updated!" });
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error in UpdateRoom: {ex.Message}");
            return new ObjectResult(new { success = false, message = "An error occurred." });
        }
    }

    public async Task<ActionResult> ForgotPassword(string email, IEmailSender emailSender)
    {
        try
        {
            var employee = await _db.Employees
                .Where(e => e.Email.ToLower() == email.ToLower())
                .FirstOrDefaultAsync();

            if (employee == null)
            {
                return new ObjectResult(new { success = false, message = "Email not found!" });
            }

            // Generate a password reset token
            var token = Guid.NewGuid().ToString();

            var host = _httpContextAccessor.HttpContext.Request.Host;

            bool isLocal = host.Host.Contains("localhost");

            string http = isLocal ? "https://" : "";

            // Save the token to the database
            employee.Token = token;
            employee.TokenExpirationDate = DateTime.Now.AddMinutes(30);
            await _db.SaveChangesAsync();

            emailSender.SendEmailAsync(new Message(new List<string> { email }, "Password Reset", $"Click here to reset your password: {http}{host}/resetpassword/{token}, it will expire in 30 minutes"));

            return new ObjectResult(new { success = true, message = "Password change link sent!" });
        }
        catch (Exception ex)
        {
            // Log or handle the exception appropriately
            Console.Error.WriteLine($"Error in ForgotPassword: {ex.Message}");
            return new ObjectResult(new { success = false, message = "An error occurred." });
        }
    }

    public async Task<ActionResult> EmployeeEventAttendance(int userId)
    {
        try
        {
           
            var emp = from e in _db.Employees where userId == e.Id select e;
            var query = from e in emp
                let eventsAttend = e.AttendedEvents
                    .Where(v => userId == v.EmployeeId && v.Event.Date < DateOnly.FromDateTime(DateTime.Now))
                    .ToList()

                select new
                {
                    EmpEvent = e,
                    CountAttend = eventsAttend.Count
                };
            
           
                foreach (var c in query)
                {
                    Console.WriteLine(c.CountAttend);
                    c.EmpEvent.AmountOfTimesAttended = c.CountAttend;
                }
            

            await _db.SaveChangesAsync();
            return new ObjectResult(new { success = true, message = "Token not found or either used up!" });

        }
        catch (Exception)
        {
            return new ObjectResult(new { success = false, message = "Token not found or either used up!" });
        }
       
        
    }
    public async Task<ActionResult> ForgotPasswordConfirmation(string token, string password, string ConfirmPassword, IEmailSender emailSender)
    {
        try
        {
            var employee = await _db.Employees
                .Where(e => e.Token == token)
                .FirstOrDefaultAsync();

            if (employee == null)
            {
                return new ObjectResult(new { success = false, message = "Token not found or either used up!" });
            }

            if (employee.TokenExpirationDate < DateTime.Now)
            {
                Console.WriteLine(employee.TokenExpirationDate);
                return new ObjectResult(new { success = false, message = "Token expired!" });
            }

            if (password != ConfirmPassword)
            {
                return new ObjectResult(new { success = false, message = "Passwords do not match!" });
            }

            // Hash the password
            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

            // Save the new password to the database
            employee.Password = hashedPassword;
            employee.Token = null;
            employee.TokenExpirationDate = null;
            await _db.SaveChangesAsync();

            return new ObjectResult(new { success = true, message = "Password changed!" });
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error in ForgotPasswordConfirmation: {ex.Message}");
            return new ObjectResult(new { success = false, message = "An error occurred." });
        }
    }
}
