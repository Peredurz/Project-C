
namespace Models
{
    public class Employee
    {
        [Key]
        [Column(TypeName = "int")]
        public int Id { get; set; }

        [Column(TypeName = "varchar(50)")]
        public string FirstName { get; set; } = null!;

        [Column(TypeName = "varchar(50)")]
        public string LastName { get; set; } = null!;

        [Column(TypeName = "varchar(50)")]
        public string Email { get; set; } = null!;

        [Column(TypeName = "varchar(150)")]
        public string Password { get; set; } = null!;

        [Column(TypeName = "varchar(50)")]
        public string Function { get; set; } = null!;

        [Column(TypeName = "int")]
        public int AmountOfTimesAttended { get; set; }

        [Column(TypeName = "boolean")]
        public bool IsAdmin { get; set; }

        [Column(TypeName = "bytea")]
        public byte[]? ProfilePicture { get; set; }

        [Column(TypeName = "varchar(72)")]
        public string? Token { get; set; }

        [Column(TypeName = "timestamp")]
        public DateTime? TokenExpirationDate { get; set; }

        public Room? Room { get; set; }
        public List<Availability>? Availabilities { get; set; }
        public List<Review>? Reviews { get; set; }
        public List<EmployeeEvent>? AttendedEvents { get; set; }
    }
}