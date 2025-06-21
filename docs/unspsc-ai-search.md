# UNSPSC AI Search Integration

This feature adds AI-powered search capabilities for UNSPSC (United Nations Standard Products and Services Code) codes in the ERP system.

## Features

- **AI-powered UNSPSC search**: Uses DeepSeek AI to find relevant UNSPSC codes based on product descriptions
- **Fallback to database search**: If AI search fails, the system falls back to traditional database search
- **Confidence scores**: AI results include confidence scores to help users select the most appropriate code
- **Reasoning**: Each AI result includes reasoning for why a particular code was suggested
- **Copy to clipboard**: Users can easily copy UNSPSC codes with a single click
- **User-specific favorites**: Users can save frequently used UNSPSC codes as favorites for quick access (NEW)
- **Default selections**: Users can set default UNSPSC codes for common product types (NEW)

## Implementation Details

### Backend Components

- **DeepSeek API integration**: The system connects to DeepSeek AI via API to generate relevant UNSPSC code suggestions
- **Local database search**: The system also searches the local UNSPSC database as a fallback
- **Hybrid results**: Results can come from either AI or database search, with clear indication of the source
- **User favorites storage**: Saved favorites are stored in the database, specific to each user (NEW)

### Frontend Components

- **UnspscAiSearch component**: A reusable React component that provides the AI search interface
- **UnspscAiSearchWithFavorites component**: Enhanced version with tabs for AI search and favorites (NEW)
- **UnspscFavorites component**: Component for managing saved UNSPSC favorites (NEW)
- **CreateItemMasterForm integration**: The component is integrated into the Create Item Master form
- **Result display**: Shows UNSPSC codes with titles, confidence scores, and reasoning

## Configuration

The DeepSeek API integration requires an API key to be set in the environment variables:

```
DEEPSEEK_API_KEY=your_api_key_here
```

> **Important**: As of May 27, 2025, the DeepSeek API key has been moved from hardcoded values to environment variables for improved security. Make sure to set this variable in your `.env` file.

## Usage

1. Type a product or service description in the search box
2. The system will search for relevant UNSPSC codes
3. Select the most appropriate code from the results
4. The selected code will populate the form fields automatically

## Security Considerations

- API keys are stored securely in environment variables, not in code
- The DeepSeek API key is now managed through the `.env` file only
- All AI interactions are performed server-side
- User inputs are sanitized before being sent to the AI service

## Limitations

- The AI service requires an internet connection
- Results are only as good as the training data used by the AI model
- Some specialized products may require manual UNSPSC code selection
