using Microsoft.EntityFrameworkCore;

namespace Models
{
    public class ModelContext : DbContext
    {
        public ModelContext(DbContextOptions<ModelContext> options) : base(options)
        {
        }

        public DbSet<Employee> Employees { get; set; }
        public DbSet<Event> Events { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<Room> Rooms { get; set; }
        public DbSet<Availability> Availabilities { get; set; }
        public DbSet<EmployeeEvent> EmployeeEvents { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Employee>()
                .HasKey(e => e.Id);

            modelBuilder.Entity<Event>()
                .HasKey(ev => ev.Id);

            modelBuilder.Entity<Review>()
                .HasKey(r => new { r.EmployeeId, r.EventId });

            modelBuilder.Entity<Room>()
                .HasKey(r => r.Id);

            modelBuilder.Entity<Availability>()
                .HasKey(w => new { w.EmployeeId, w.Date });

            modelBuilder.Entity<EmployeeEvent>()
                .HasKey(ee => new { ee.EmployeeId, ee.EventId });

            modelBuilder.Entity<Employee>()
                .HasMany(e => e.Reviews)
                .WithOne(r => r.Employee)
                .HasForeignKey(r => r.EmployeeId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Event>()
                .HasMany(ev => ev.Reviews)
                .WithOne(r => r.Event)
                .HasForeignKey(r => r.EventId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Employee>()
                .HasOne(e => e.Room)
                .WithOne(r => r.Employee)
                .HasForeignKey<Room>(r => r.EmployeeId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Employee>()
                .HasMany(e => e.Availabilities)
                .WithOne(w => w.Employee)
                .HasForeignKey(w => w.EmployeeId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Availability>()
                .HasOne(w => w.Employee)
                .WithMany(e => e.Availabilities)
                .HasForeignKey(w => w.EmployeeId);

            modelBuilder.Entity<EmployeeEvent>()
                .HasOne(ee => ee.Employee)
                .WithMany(e => e.AttendedEvents)
                .HasForeignKey(ee => ee.EmployeeId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<EmployeeEvent>()
                .HasOne(ee => ee.Event)
                .WithMany(ev => ev.Attendees)
                .HasForeignKey(ee => ee.EventId);
        }
    }
}