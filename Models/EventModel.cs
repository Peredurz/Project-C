
namespace Models
{
    public class Event
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column(TypeName = "int")]
        public int Id { get; set; }

        [Column(TypeName = "varchar(50)")]
        public string Name { get; set; } = null!;

        [Column(TypeName = "varchar(50)")]
        public string Location { get; set; } = null!;

        [Column(TypeName = "date")]
        public DateOnly Date { get; set; }

        [Column(TypeName = "time")]
        public TimeOnly StartTime { get; set; }

        [Column(TypeName = "time")]
        public TimeOnly EndTime { get; set; }

        [Column(TypeName = "varchar(50)")]
        public string Description { get; set; } = null!;

        [Column(TypeName = "boolean")]
        public bool isPublic { get; set; } 

        public List<Review>? Reviews { get; set; }
        public List<EmployeeEvent>? Attendees { get; set; }
    }
}