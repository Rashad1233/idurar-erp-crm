# User-Specific UNSPSC Favorites

This document provides information about the UNSPSC favorites feature which allows users to save and manage their commonly used UNSPSC codes.

## Overview

The UNSPSC (United Nations Standard Products and Services Code) favorites feature enables users to:

- Save frequently used UNSPSC codes with custom names and descriptions
- Organize UNSPSC codes for quick access
- Set default favorites for commonly used categories
- Select from favorites instead of searching each time

This functionality makes it easier for users who regularly work with the same types of products or services to quickly find and select the appropriate UNSPSC codes.

## Technical Implementation

### Database Model

The feature uses a `UserUnspscFavorite` model to store user-specific favorites:

```javascript
UserUnspscFavorite = {
  id: UUID,
  userId: UUID,           // References the User model
  name: String,           // User-defined name for the favorite
  description: String,    // Optional description
  unspscCode: String,     // The UNSPSC code (e.g., "43211501")
  level: Enum,            // SEGMENT, FAMILY, CLASS, or COMMODITY
  title: String,          // Official title of the UNSPSC code
  segment: String,        // Optional segment code
  family: String,         // Optional family code
  class: String,          // Optional class code
  commodity: String,      // Optional commodity code
  isDefault: Boolean,     // Whether this is the user's default
  createdAt: DateTime,
  updatedAt: DateTime
}
```

### API Endpoints

The following RESTful API endpoints are available:

- `GET /api/unspsc-favorites` - Get all favorites for the current user
- `POST /api/unspsc-favorites` - Create a new favorite
- `GET /api/unspsc-favorites/:id` - Get a specific favorite
- `PUT /api/unspsc-favorites/:id` - Update a favorite
- `DELETE /api/unspsc-favorites/:id` - Delete a favorite

### Frontend Components

The feature includes the following frontend components:

1. **UnspscFavorites** - A reusable component for displaying and managing favorites
2. **UnspscAiSearchWithFavorites** - An enhanced version of the AI search component that includes tabs for switching between search and favorites

## User Flow

1. When searching for UNSPSC codes using the AI search, users can save results they frequently use as favorites
2. Users can give each favorite a custom name and description for easier recognition
3. When creating new items, users can select from their saved favorites instead of searching again
4. Users can set a default favorite that will be pre-selected when opening the form

## Benefits

- **Time Savings**: No need to search for the same codes repeatedly
- **Consistency**: Helps ensure consistent code usage for similar items
- **Personalization**: Each user maintains their own list of favorites
- **Reduced Errors**: Minimizes the risk of selecting incorrect codes for familiar items

## Future Enhancements

Potential future enhancements for this feature:

1. **Favorite Groups**: Allow users to organize favorites into custom groups
2. **Import/Export**: Enable users to export their favorites and import them on other accounts
3. **Sharing**: Allow administrators to share recommended favorites with users
4. **Analytics**: Track most used favorites for business intelligence

## Technical Considerations

- Favorites are user-specific and not shared across the organization
- Default favorites (where `isDefault = true`) are handled on the client side for improved performance
- The feature is designed to work alongside the AI-powered search, not replace it
