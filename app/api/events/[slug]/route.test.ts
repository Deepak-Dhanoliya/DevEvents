import { NextRequest } from 'next/server';
import { GET } from './route';
import connectDB from '@/lib/mongodb';
import Event from '@/database/event.model';

// Mock dependencies
jest.mock('@/lib/mongodb');
jest.mock('@/database/event.model');

const mockConnectDB = connectDB as jest.MockedFunction<typeof connectDB>;
const mockEvent = Event as jest.Mocked<typeof Event>;

describe('GET /api/events/[slug]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Validation', () => {
    it('should return 400 when slug is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/events/');
      const params = Promise.resolve({ slug: '' });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toBe('Slug parameter is required and must be a valid string');
    });

    it('should return 400 when slug format is invalid (contains uppercase)', async () => {
      const request = new NextRequest('http://localhost:3000/api/events/Invalid-Slug');
      const params = Promise.resolve({ slug: 'Invalid-Slug' });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toContain('Invalid slug format');
    });

    it('should return 400 when slug contains special characters', async () => {
      const request = new NextRequest('http://localhost:3000/api/events/test@slug');
      const params = Promise.resolve({ slug: 'test@slug' });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toContain('Invalid slug format');
    });

    it('should return 400 when slug starts with hyphen', async () => {
      const request = new NextRequest('http://localhost:3000/api/events/-test-slug');
      const params = Promise.resolve({ slug: '-test-slug' });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toContain('Invalid slug format');
    });

    it('should return 400 when slug ends with hyphen', async () => {
      const request = new NextRequest('http://localhost:3000/api/events/test-slug-');
      const params = Promise.resolve({ slug: 'test-slug-' });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toContain('Invalid slug format');
    });
  });

  describe('Event Not Found', () => {
    it('should return 404 when event does not exist', async () => {
      mockConnectDB.mockResolvedValue(undefined);
      mockEvent.findOne = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      const request = new NextRequest('http://localhost:3000/api/events/non-existent-event');
      const params = Promise.resolve({ slug: 'non-existent-event' });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.message).toBe("Event with slug 'non-existent-event' not found");
      expect(mockConnectDB).toHaveBeenCalled();
      expect(mockEvent.findOne).toHaveBeenCalledWith({ slug: 'non-existent-event' });
    });
  });

  describe('Successful Retrieval', () => {
    it('should return 200 and event data when event exists', async () => {
      const mockEventData = {
        _id: '507f1f77bcf86cd799439011',
        title: 'Test Event',
        slug: 'test-event',
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
        createdAt: '2025-12-14T00:00:00.000Z',
        updatedAt: '2025-12-14T00:00:00.000Z',
      };

      mockConnectDB.mockResolvedValue(undefined);
      mockEvent.findOne = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockEventData),
      });

      const request = new NextRequest('http://localhost:3000/api/events/test-event');
      const params = Promise.resolve({ slug: 'test-event' });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Event fetched successfully');
      expect(data.event).toEqual(mockEventData);
      expect(mockConnectDB).toHaveBeenCalled();
      expect(mockEvent.findOne).toHaveBeenCalledWith({ slug: 'test-event' });
    });

    it('should handle slug with multiple hyphens', async () => {
      const mockEventData = {
        _id: '507f1f77bcf86cd799439012',
        title: 'React Next.js Workshop 2025',
        slug: 'react-nextjs-workshop-2025',
        description: 'Learn React and Next.js',
        overview: 'Comprehensive workshop',
        image: 'https://example.com/image.jpg',
        venue: 'Tech Hub',
        location: 'San Francisco',
        date: '2025-12-25',
        time: '10:00',
        mode: 'Hybrid',
        audience: 'Developers',
        agenda: ['Basics', 'Advanced Topics', 'Q&A'],
        organizer: 'Tech Academy',
        tags: ['react', 'nextjs', 'workshop'],
        createdAt: '2025-12-14T00:00:00.000Z',
        updatedAt: '2025-12-14T00:00:00.000Z',
      };

      mockConnectDB.mockResolvedValue(undefined);
      mockEvent.findOne = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockEventData),
      });

      const request = new NextRequest('http://localhost:3000/api/events/react-nextjs-workshop-2025');
      const params = Promise.resolve({ slug: 'react-nextjs-workshop-2025' });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.event.slug).toBe('react-nextjs-workshop-2025');
    });

    it('should handle slug with numbers', async () => {
      const mockEventData = {
        _id: '507f1f77bcf86cd799439013',
        title: 'JavaScript ES2024',
        slug: 'javascript-es2024',
        description: 'Latest JS features',
        overview: 'ES2024 overview',
        image: 'https://example.com/image.jpg',
        venue: 'Code Center',
        location: 'New York',
        date: '2025-12-30',
        time: '15:00',
        mode: 'Online',
        audience: 'Developers',
        agenda: ['New Features', 'Best Practices'],
        organizer: 'JS Community',
        tags: ['javascript', 'es2024'],
        createdAt: '2025-12-14T00:00:00.000Z',
        updatedAt: '2025-12-14T00:00:00.000Z',
      };

      mockConnectDB.mockResolvedValue(undefined);
      mockEvent.findOne = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockEventData),
      });

      const request = new NextRequest('http://localhost:3000/api/events/javascript-es2024');
      const params = Promise.resolve({ slug: 'javascript-es2024' });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.event.slug).toBe('javascript-es2024');
    });
  });

  describe('Error Handling', () => {
    it('should return 500 when database connection fails', async () => {
      mockConnectDB.mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost:3000/api/events/test-event');
      const params = Promise.resolve({ slug: 'test-event' });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.message).toBe('An unexpected error occurred while fetching the event');
      expect(data.error).toBe('Database connection failed');
    });

    it('should return 500 when database query fails', async () => {
      mockConnectDB.mockResolvedValue(undefined);
      mockEvent.findOne = jest.fn().mockReturnValue({
        lean: jest.fn().mockRejectedValue(new Error('Query execution failed')),
      });

      const request = new NextRequest('http://localhost:3000/api/events/test-event');
      const params = Promise.resolve({ slug: 'test-event' });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.message).toBe('An unexpected error occurred while fetching the event');
      expect(data.error).toBe('Query execution failed');
    });

    it('should handle unknown errors gracefully', async () => {
      mockConnectDB.mockResolvedValue(undefined);
      mockEvent.findOne = jest.fn().mockReturnValue({
        lean: jest.fn().mockRejectedValue('Unknown error'),
      });

      const request = new NextRequest('http://localhost:3000/api/events/test-event');
      const params = Promise.resolve({ slug: 'test-event' });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.message).toBe('An unexpected error occurred while fetching the event');
      expect(data.error).toBe('Unknown error');
    });
  });
});
