namespace Models
{
    public class Review
    {
        [Column(TypeName = "int")]
        public int EmployeeId { get; set; }

        [Column(TypeName = "int")]
        public int EventId { get; set; }

        public Employee? Employee { get; set; }
        public Event? Event { get; set; }

        [Column(TypeName = "varchar(300)")]
        public string? ReviewText { get; set; }

        public Review() { }
        public Review(int employeeId, int eventId, string reviewText)
        {
            EmployeeId = employeeId;
            EventId = eventId;
            ReviewText = reviewText;
        }
    }
}