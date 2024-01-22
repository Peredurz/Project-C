using Newtonsoft.Json;

namespace Models
{
    public class Availability
    {
        [Key]
        [Column(TypeName = "int")]
        public int EmployeeId { get; set; }

        [Column(TypeName = "Date")]
        public DateOnly Date { get; set; }

        public Employee Employee { get; set; }

        public Availability() { }
        public Availability(int employeeId, DateOnly date)
        {
            EmployeeId = employeeId;
            Date = date;
        }
    }
}