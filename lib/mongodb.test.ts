// Mock mongoose before any imports
const mockConnect = jest.fn();

jest.mock('mongoose', () => ({
  connect: jest.fn((...args) => mockConnect(...args)),
}));

import mongoose from 'mongoose';

describe('connectDB', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Clear the global mongoose cache
    if (global.mongoose) {
      global.mongoose.conn = null;
      global.mongoose.promise = null;
    }

    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('1. should return a mongoose instance when successful', () => {
    it('should successfully connect and return mongoose instance', async () => {
      // Arrange
      process.env.MONGODB_URI = 'mongodb://localhost:27017/testdb';
      const mockMongooseInstance = mongoose as any;
      mockConnect.mockResolvedValue(mockMongooseInstance);

      // Import connectDB after setting env
      jest.resetModules();
      const { default: connectDB } = await import('./mongodb');

      // Act
      const result = await connectDB();

      // Assert
      expect(result).toBe(mockMongooseInstance);
      expect(mockConnect).toHaveBeenCalledWith(
        'mongodb://localhost:27017/testdb',
        { bufferCommands: false }
      );
      expect(mockConnect).toHaveBeenCalledTimes(1);
    });
  });

  describe('2. should throw an error if MONGODB_URI is not defined', () => {
    it('should throw an error when MONGODB_URI is undefined', async () => {
      // Arrange
      delete process.env.MONGODB_URI;

      // Import connectDB after deleting env
      jest.resetModules();
      const { default: connectDB } = await import('./mongodb');

      // Act & Assert
      await expect(connectDB()).rejects.toThrow(
        'Please define the MONGODB_URI environment variable inside .env.local'
      );
      expect(mockConnect).not.toHaveBeenCalled();
    });

    it('should throw an error when MONGODB_URI is empty string', async () => {
      // Arrange
      process.env.MONGODB_URI = '';

      // Import connectDB after setting empty env
      jest.resetModules();
      const { default: connectDB } = await import('./mongodb');

      // Act & Assert
      await expect(connectDB()).rejects.toThrow(
        'Please define the MONGODB_URI environment variable inside .env.local'
      );
      expect(mockConnect).not.toHaveBeenCalled();
    });
  });

  describe('3. should return the cached connection on subsequent calls', () => {
    it('should return cached connection without calling mongoose.connect again', async () => {
      // Arrange
      process.env.MONGODB_URI = 'mongodb://localhost:27017/testdb';
      const mockMongooseInstance = mongoose as any;
      mockConnect.mockResolvedValue(mockMongooseInstance);

      // Import connectDB after setting env
      jest.resetModules();
      const { default: connectDB } = await import('./mongodb');

      // Act - First call
      const firstResult = await connectDB();
      
      // Act - Second call
      const secondResult = await connectDB();

      // Assert
      expect(firstResult).toBe(mockMongooseInstance);
      expect(secondResult).toBe(mockMongooseInstance);
      expect(firstResult).toBe(secondResult);
      expect(mockConnect).toHaveBeenCalledTimes(1); // Only called once
    });

    it('should use cached promise when connection is in progress', async () => {
      // Arrange
      process.env.MONGODB_URI = 'mongodb://localhost:27017/testdb';
      const mockMongooseInstance = mongoose as any;
      let resolveConnection: (value: typeof mongoose) => void;
      
      const connectionPromise = new Promise<typeof mongoose>((resolve) => {
        resolveConnection = resolve;
      });
      
      mockConnect.mockReturnValue(connectionPromise);

      // Import connectDB after setting env
      jest.resetModules();
      const { default: connectDB } = await import('./mongodb');

      // Act - Start two connections simultaneously
      const firstCallPromise = connectDB();
      const secondCallPromise = connectDB();

      // Resolve the connection
      resolveConnection!(mockMongooseInstance);

      const [firstResult, secondResult] = await Promise.all([
        firstCallPromise,
        secondCallPromise,
      ]);

      // Assert
      expect(firstResult).toBe(mockMongooseInstance);
      expect(secondResult).toBe(mockMongooseInstance);
      expect(mockConnect).toHaveBeenCalledTimes(1); // Only called once
    });
  });

  describe('4. should reset its promise cache if the connection fails', () => {
    it('should reset promise cache and allow retry after connection failure', async () => {
      // Arrange
      process.env.MONGODB_URI = 'mongodb://localhost:27017/testdb';
      const connectionError = new Error('Connection failed');
      const mockMongooseInstance = mongoose as any;

      // First call fails
      mockConnect.mockRejectedValueOnce(connectionError);
      // Second call succeeds
      mockConnect.mockResolvedValueOnce(mockMongooseInstance);

      // Import connectDB after setting env
      jest.resetModules();
      const { default: connectDB } = await import('./mongodb');

      // Act - First call should fail
      await expect(connectDB()).rejects.toThrow('Connection failed');

      // Act - Second call should succeed
      const result = await connectDB();

      // Assert
      expect(result).toBe(mockMongooseInstance);
      expect(mockConnect).toHaveBeenCalledTimes(2); // Called twice (retry)
    });

    it('should not cache connection when promise rejection occurs', async () => {
      // Arrange
      process.env.MONGODB_URI = 'mongodb://localhost:27017/testdb';
      const connectionError = new Error('Network error');
      
      mockConnect.mockRejectedValue(connectionError);

      // Import connectDB after setting env
      jest.resetModules();
      const { default: connectDB } = await import('./mongodb');

      // Act & Assert - First call
      await expect(connectDB()).rejects.toThrow('Network error');

      // Act & Assert - Second call should also throw
      await expect(connectDB()).rejects.toThrow('Network error');

      // Assert - mongoose.connect called multiple times (no caching on failure)
      expect(mockConnect).toHaveBeenCalledTimes(2);
    });

    it('should clear promise cache but not create new connection automatically', async () => {
      // Arrange
      process.env.MONGODB_URI = 'mongodb://localhost:27017/testdb';
      const connectionError = new Error('Timeout error');
      
      mockConnect.mockRejectedValueOnce(connectionError);

      // Import connectDB after setting env
      jest.resetModules();
      const { default: connectDB } = await import('./mongodb');

      // Act - First call fails
      try {
        await connectDB();
      } catch (error) {
        // Expected to fail
      }

      // Assert - Check that global cache is reset
      expect(global.mongoose?.promise).toBeNull();
      expect(global.mongoose?.conn).toBeNull();
    });
  });
});
