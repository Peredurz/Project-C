
namespace Models
{
    public class EmployeeEvent
    {
        [Column(TypeName = "int")]
        public int EmployeeId { get; set; }

        [Column(TypeName = "int")]
        public int EventId { get; set; }

        public Employee? Employee { get; set; }
        public Event? Event { get; set; }

        public EmployeeEvent() { }
        public EmployeeEvent(int employeeId, int eventId)
        {
            EmployeeId = employeeId;
            EventId = eventId;
        }
    }
}