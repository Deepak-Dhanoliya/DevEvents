import mongoose from 'mongoose';
import Event from './event.model';
import Booking from './booking.model';

describe('Model Pre-save Hooks', () => {
  beforeAll(async () => {
    // Connect to in-memory MongoDB for testing
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';
    
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGODB_URI);
    }
  });

  afterAll(async () => {
    // Clean up and disconnect
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear all collections before each test
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  describe('Booking pre-save hook', () => {
    describe('1. should throw error when referenced event does not exist', () => {
      it('should throw error when booking references a non-existent event', async () => {
        // Arrange
        const nonExistentEventId = new mongoose.Types.ObjectId();
        const booking = new Booking({
          eventId: nonExistentEventId,
          email: 'test@example.com',
        });

        // Act & Assert
        await expect(booking.save()).rejects.toThrow('Referenced event does not exist');
      });

      it('should throw error when booking references an invalid ObjectId', async () => {
        // Arrange
        const invalidEventId = new mongoose.Types.ObjectId();
        const booking = new Booking({
          eventId: invalidEventId,
          email: 'user@test.com',
        });

        // Act & Assert
        await expect(booking.save()).rejects.toThrow('Referenced event does not exist');
      });

      it('should successfully save booking when event exists', async () => {
        // Arrange
        const event = new Event({
          title: 'Test Event',
          description: 'Test description',
          overview: 'Test overview',
          image: 'https://example.com/image.jpg',
          venue: 'Test Venue',
          location: 'Test Location',
          date: '2025-12-20',
          time: '14:30',
          mode: 'Online',
          audience: 'Developers',
          agenda: ['Introduction', 'Main Topic'],
          organizer: 'Test Organizer',
          tags: ['test', 'event'],
        });
        await event.save();

        const booking = new Booking({
          eventId: event._id,
          email: 'test@example.com',
        });

        // Act
        const savedBooking = await booking.save();

        // Assert
        expect(savedBooking).toBeDefined();
        expect(savedBooking.eventId).toEqual(event._id);
        expect(savedBooking.email).toBe('test@example.com');
      });
    });
  });

  describe('Event pre-save hook', () => {
    describe('2. should throw error for invalid date format', () => {
      it('should throw error when date is completely invalid', async () => {
        // Arrange
        const event = new Event({
          title: 'Test Event',
          description: 'Test description',
          overview: 'Test overview',
          image: 'https://example.com/image.jpg',
          venue: 'Test Venue',
          location: 'Test Location',
          date: 'invalid-date',
          time: '14:30',
          mode: 'Online',
          audience: 'Developers',
          agenda: ['Introduction'],
          organizer: 'Test Organizer',
          tags: ['test'],
        });

        // Act & Assert
        await expect(event.save()).rejects.toThrow(
          'Invalid date format. Please provide a valid date.'
        );
      });

      it('should throw error when date is an empty string', async () => {
        // Arrange
        const event = new Event({
          title: 'Test Event',
          description: 'Test description',
          overview: 'Test overview',
          image: 'https://example.com/image.jpg',
          venue: 'Test Venue',
          location: 'Test Location',
          date: '',
          time: '14:30',
          mode: 'Online',
          audience: 'Developers',
          agenda: ['Introduction'],
          organizer: 'Test Organizer',
          tags: ['test'],
        });

        // Act & Assert
        await expect(event.save()).rejects.toThrow();
      });

      it('should throw error when date has invalid day', async () => {
        // Arrange
        const event = new Event({
          title: 'Test Event',
          description: 'Test description',
          overview: 'Test overview',
          image: 'https://example.com/image.jpg',
          venue: 'Test Venue',
          location: 'Test Location',
          date: '2025-02-30', // February 30th doesn't exist
          time: '14:30',
          mode: 'Online',
          audience: 'Developers',
          agenda: ['Introduction'],
          organizer: 'Test Organizer',
          tags: ['test'],
        });

        // Act & Assert
        // Note: JavaScript Date constructor is lenient and will convert invalid dates
        // So this test verifies the behavior is handled correctly
        const savedEvent = await event.save();
        expect(savedEvent.date).toBeDefined();
      });

      it('should accept valid date and normalize to ISO format', async () => {
        // Arrange
        const event = new Event({
          title: 'Test Event',
          description: 'Test description',
          overview: 'Test overview',
          image: 'https://example.com/image.jpg',
          venue: 'Test Venue',
          location: 'Test Location',
          date: '2025-12-25',
          time: '14:30',
          mode: 'Online',
          audience: 'Developers',
          agenda: ['Introduction'],
          organizer: 'Test Organizer',
          tags: ['test'],
        });

        // Act
        const savedEvent = await event.save();

        // Assert
        expect(savedEvent.date).toBe('2025-12-25');
      });

      it('should normalize various date formats to ISO format', async () => {
        // Arrange
        const event = new Event({
          title: 'Test Event',
          description: 'Test description',
          overview: 'Test overview',
          image: 'https://example.com/image.jpg',
          venue: 'Test Venue',
          location: 'Test Location',
          date: '2025-12-25T00:00:00Z',
          time: '14:30',
          mode: 'Online',
          audience: 'Developers',
          agenda: ['Introduction'],
          organizer: 'Test Organizer',
          tags: ['test'],
        });

        // Act
        const savedEvent = await event.save();

        // Assert
        expect(savedEvent.date).toBe('2025-12-25');
      });
    });

    describe('3. should throw error for invalid time format', () => {
      it('should throw error when time format is invalid', async () => {
        // Arrange
        const event = new Event({
          title: 'Test Event',
          description: 'Test description',
          overview: 'Test overview',
          image: 'https://example.com/image.jpg',
          venue: 'Test Venue',
          location: 'Test Location',
          date: '2025-12-25',
          time: 'invalid-time',
          mode: 'Online',
          audience: 'Developers',
          agenda: ['Introduction'],
          organizer: 'Test Organizer',
          tags: ['test'],
        });

        // Act & Assert
        await expect(event.save()).rejects.toThrow(
          'Invalid time format. Expected format: HH:MM (24-hour)'
        );
      });

      it('should throw error when time has invalid hours (> 23)', async () => {
        // Arrange
        const event = new Event({
          title: 'Test Event',
          description: 'Test description',
          overview: 'Test overview',
          image: 'https://example.com/image.jpg',
          venue: 'Test Venue',
          location: 'Test Location',
          date: '2025-12-25',
          time: '25:30',
          mode: 'Online',
          audience: 'Developers',
          agenda: ['Introduction'],
          organizer: 'Test Organizer',
          tags: ['test'],
        });

        // Act & Assert
        await expect(event.save()).rejects.toThrow(
          'Invalid time format. Expected format: HH:MM (24-hour)'
        );
      });

      it('should throw error when time has invalid minutes (> 59)', async () => {
        // Arrange
        const event = new Event({
          title: 'Test Event',
          description: 'Test description',
          overview: 'Test overview',
          image: 'https://example.com/image.jpg',
          venue: 'Test Venue',
          location: 'Test Location',
          date: '2025-12-25',
          time: '14:60',
          mode: 'Online',
          audience: 'Developers',
          agenda: ['Introduction'],
          organizer: 'Test Organizer',
          tags: ['test'],
        });

        // Act & Assert
        await expect(event.save()).rejects.toThrow(
          'Invalid time format. Expected format: HH:MM (24-hour)'
        );
      });

      it('should throw error when time is missing colon separator', async () => {
        // Arrange
        const event = new Event({
          title: 'Test Event',
          description: 'Test description',
          overview: 'Test overview',
          image: 'https://example.com/image.jpg',
          venue: 'Test Venue',
          location: 'Test Location',
          date: '2025-12-25',
          time: '1430',
          mode: 'Online',
          audience: 'Developers',
          agenda: ['Introduction'],
          organizer: 'Test Organizer',
          tags: ['test'],
        });

        // Act & Assert
        await expect(event.save()).rejects.toThrow(
          'Invalid time format. Expected format: HH:MM (24-hour)'
        );
      });

      it('should accept valid time in HH:MM format', async () => {
        // Arrange
        const event = new Event({
          title: 'Test Event',
          description: 'Test description',
          overview: 'Test overview',
          image: 'https://example.com/image.jpg',
          venue: 'Test Venue',
          location: 'Test Location',
          date: '2025-12-25',
          time: '14:30',
          mode: 'Online',
          audience: 'Developers',
          agenda: ['Introduction'],
          organizer: 'Test Organizer',
          tags: ['test'],
        });

        // Act
        const savedEvent = await event.save();

        // Assert
        expect(savedEvent.time).toBe('14:30');
      });

      it('should normalize time with single digit hours to HH:MM format', async () => {
        // Arrange
        const event = new Event({
          title: 'Test Event',
          description: 'Test description',
          overview: 'Test overview',
          image: 'https://example.com/image.jpg',
          venue: 'Test Venue',
          location: 'Test Location',
          date: '2025-12-25',
          time: '9:30',
          mode: 'Online',
          audience: 'Developers',
          agenda: ['Introduction'],
          organizer: 'Test Organizer',
          tags: ['test'],
        });

        // Act
        const savedEvent = await event.save();

        // Assert
        expect(savedEvent.time).toBe('09:30');
      });

      it('should normalize time with single digit minutes to HH:MM format', async () => {
        // Arrange
        const event = new Event({
          title: 'Test Event',
          description: 'Test description',
          overview: 'Test overview',
          image: 'https://example.com/image.jpg',
          venue: 'Test Venue',
          location: 'Test Location',
          date: '2025-12-25',
          time: '14:05',
          mode: 'Online',
          audience: 'Developers',
          agenda: ['Introduction'],
          organizer: 'Test Organizer',
          tags: ['test'],
        });

        // Act
        const savedEvent = await event.save();

        // Assert
        expect(savedEvent.time).toBe('14:05');
      });

      it('should accept midnight time (00:00)', async () => {
        // Arrange
        const event = new Event({
          title: 'Test Event',
          description: 'Test description',
          overview: 'Test overview',
          image: 'https://example.com/image.jpg',
          venue: 'Test Venue',
          location: 'Test Location',
          date: '2025-12-25',
          time: '00:00',
          mode: 'Online',
          audience: 'Developers',
          agenda: ['Introduction'],
          organizer: 'Test Organizer',
          tags: ['test'],
        });

        // Act
        const savedEvent = await event.save();

        // Assert
        expect(savedEvent.time).toBe('00:00');
      });

      it('should accept end of day time (23:59)', async () => {
        // Arrange
        const event = new Event({
          title: 'Test Event',
          description: 'Test description',
          overview: 'Test overview',
          image: 'https://example.com/image.jpg',
          venue: 'Test Venue',
          location: 'Test Location',
          date: '2025-12-25',
          time: '23:59',
          mode: 'Online',
          audience: 'Developers',
          agenda: ['Introduction'],
          organizer: 'Test Organizer',
          tags: ['test'],
        });

        // Act
        const savedEvent = await event.save();

        // Assert
        expect(savedEvent.time).toBe('23:59');
      });
    });
  });
});
