using Newtonsoft.Json;

namespace Models
{
    public class Week
    {
        [Key]
        [Column(TypeName = "int")]
        public int EmployeeId { get; set; }

        [Column(TypeName = "boolean")]
        public bool Monday { get; set; }

        [Column(TypeName = "boolean")]
        public bool Tuesday { get; set; }

        [Column(TypeName = "boolean")]
        public bool Wednesday { get; set; }

        [Column(TypeName = "boolean")]
        public bool Thursday { get; set; }

        [Column(TypeName = "boolean")]
        public bool Friday { get; set; }

        [Column(TypeName = "boolean")]
        public bool Saturday { get; set; }

        [Column(TypeName = "boolean")]
        public bool Sunday { get; set; }

        public Employee Employee { get; set; } = null!;

        public Week() { }
        public Week(int employeeId, bool monday, bool tuesday, bool wednesday, bool thursday, bool friday, bool saturday, bool sunday)
        {
            EmployeeId = employeeId;
            Monday = monday;
            Tuesday = tuesday;
            Wednesday = wednesday;
            Thursday = thursday;
            Friday = friday;
            Saturday = saturday;
            Sunday = sunday;
        }
    }
}