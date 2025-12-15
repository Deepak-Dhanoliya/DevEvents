# GET /api/events/[slug]

Fetches a single event by its unique slug identifier.

## Endpoint

```
GET /api/events/[slug]
```

## Parameters

| Parameter | Type   | Required | Description                                    |
|-----------|--------|----------|------------------------------------------------|
| `slug`    | string | Yes      | URL-friendly event identifier (lowercase, alphanumeric with hyphens) |

## Response Codes

| Status Code | Description                                          |
|-------------|------------------------------------------------------|
| `200`       | Success - Event found and returned                   |
| `400`       | Bad Request - Invalid or missing slug parameter      |
| `404`       | Not Found - Event with the specified slug not found  |
| `500`       | Internal Server Error - Unexpected server error      |

## Success Response (200)

```json
{
  "message": "Event fetched successfully",
  "event": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "React Conference 2025",
    "slug": "react-conference-2025",
    "description": "The biggest React conference of the year",
    "overview": "Join us for three days of React talks...",
    "image": "https://example.com/event-image.jpg",
    "venue": "Tech Convention Center",
    "location": "San Francisco, CA",
    "date": "2025-12-20",
    "time": "09:00",
    "mode": "Hybrid",
    "audience": "Developers",
    "agenda": [
      "Opening Keynote",
      "React Server Components",
      "State Management Best Practices"
    ],
    "organizer": "React Foundation",
    "tags": ["react", "javascript", "conference"],
    "createdAt": "2025-12-14T00:00:00.000Z",
    "updatedAt": "2025-12-14T00:00:00.000Z"
  }
}
```

## Error Responses

### 400 Bad Request - Missing Slug

```json
{
  "message": "Slug parameter is required and must be a valid string"
}
```

### 400 Bad Request - Invalid Slug Format

```json
{
  "message": "Invalid slug format. Slug must contain only lowercase letters, numbers, and hyphens"
}
```

**Invalid slug examples:**
- `Invalid-Slug` (contains uppercase)
- `test@slug` (contains special characters)
- `-test-slug` (starts with hyphen)
- `test-slug-` (ends with hyphen)
- `test--slug` (consecutive hyphens)

### 404 Not Found

```json
{
  "message": "Event with slug 'non-existent-event' not found"
}
```

### 500 Internal Server Error

```json
{
  "message": "An unexpected error occurred while fetching the event",
  "error": "Database connection failed"
}
```

## Examples

### Fetch Event by Slug

```bash
curl http://localhost:3000/api/events/react-conference-2025
```

### JavaScript/TypeScript

```typescript
async function fetchEvent(slug: string) {
  try {
    const response = await fetch(`/api/events/${slug}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    
    const data = await response.json();
    return data.event;
  } catch (error) {
    console.error('Error fetching event:', error);
    throw error;
  }
}

// Usage
const event = await fetchEvent('react-conference-2025');
console.log(event.title); // "React Conference 2025"
```

### Next.js Server Component

```typescript
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params;
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/${slug}`, {
    cache: 'no-store' // or use revalidate for ISR
  });
  
  if (!response.ok) {
    notFound();
  }
  
  const { event } = await response.json();
  
  return (
    <div>
      <h1>{event.title}</h1>
      <p>{event.description}</p>
      {/* ... rest of your component */}
    </div>
  );
}
```

## Validation Rules

The slug parameter must follow these rules:

1. **Required**: Cannot be empty or missing
2. **Lowercase only**: Must contain only lowercase letters
3. **Alphanumeric**: Letters (a-z) and numbers (0-9) only
4. **Hyphens**: Can contain hyphens to separate words
5. **No leading/trailing hyphens**: Cannot start or end with a hyphen
6. **No consecutive hyphens**: Cannot contain multiple consecutive hyphens

**Valid slugs:**
- `react-conference-2025`
- `javascript-es2024`
- `nextjs-workshop`
- `web-dev-summit`

**Invalid slugs:**
- `React-Conference` (uppercase)
- `react_conference` (underscore)
- `-react-conference` (leading hyphen)
- `react-conference-` (trailing hyphen)
- `react--conference` (consecutive hyphens)

## Performance Notes

- Uses `.lean()` for optimized query performance (returns plain JavaScript objects)
- Database queries are cached based on Next.js caching strategy
- Consider implementing Redis caching for high-traffic applications
