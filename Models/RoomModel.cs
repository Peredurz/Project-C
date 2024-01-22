
namespace Models
{
    public class Room
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column(TypeName = "int")]
        public int Id { get; set; }

        [Column(TypeName = "int")]
        public int RoomNumber { get; set; }

        [Column(TypeName = "varchar(50)")]
        public string RoomName { get; set; } = null!;

        [Column(TypeName = "boolean")]
        public bool IsAvailable { get; set; }

        [Column(TypeName = "int")]
        public int? EmployeeId { get; set; }

        public Employee? Employee { get; set; }

        public Room() { }
        public Room(int roomNumber, string roomName, bool isAvailable)
        {
            RoomNumber = roomNumber;
            RoomName = roomName;
            IsAvailable = isAvailable;
        }
        public Room(int roomNumber, string roomName, bool isAvailable, int employeeId)
        {
            RoomNumber = roomNumber;
            RoomName = roomName;
            IsAvailable = isAvailable;
            EmployeeId = employeeId;
        }
    }
}