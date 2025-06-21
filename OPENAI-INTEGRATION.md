# OpenAI Integration for UNSPSC Code Enhancement

## Overview

This document describes the integration of OpenAI's GPT-4.1 Nano model into the ERP system to enhance UNSPSC code search, classification, and information retrieval.

## Setup and Configuration

### OpenAI API Key

To use the OpenAI integration, you need a valid OpenAI API key. Follow these steps to configure it:

1. Sign up for an OpenAI account at [platform.openai.com](https://platform.openai.com)
2. Create an API key in your OpenAI dashboard
3. Set up the API key in one of these ways:
   - Create a `.env` file in the backend directory with `OPENAI_API_KEY=your-key-here`
   - Directly update the API key in `backend/routes/enhancedUnspscRoutes.js`
   - Set the environment variable `OPENAI_API_KEY` before starting the server

### Installation

Run the `setup-openai-integration.bat` script to install the necessary packages and start the system:

```
./setup-openai-integration.bat
```

This script will:
1. Install the OpenAI package in the backend
2. Set up the UNSPSC database tables
3. Start the backend and frontend servers

## Features

### AI-Powered UNSPSC Code Search

The system uses GPT-4.1 Nano to:
- Find relevant UNSPSC codes based on natural language descriptions
- Provide hierarchical information (Segment, Family, Class, Commodity)
- Explain matches between product descriptions and codes
- Rank results by relevance

### UNSPSC Code Details

For any UNSPSC code, the system provides:
- Complete hierarchical breakdown
- Detailed descriptions at each level
- Example products/services
- Full titles and explanations

### Fallback Mechanism

The system includes a fallback mechanism that provides mock data when:
- No valid OpenAI API key is provided
- API requests fail due to network issues
- API rate limits are exceeded

## API Endpoints

- **POST /api/unspsc/search**: Search for UNSPSC codes using natural language
- **GET /api/unspsc/details/:code**: Get detailed information about a specific code
- **GET /api/unspsc/favorites**: List saved favorite codes
- **POST /api/unspsc/favorites**: Add a code to favorites
- **DELETE /api/unspsc/favorites/:id**: Remove a code from favorites

## Troubleshooting

If you encounter issues with the OpenAI integration:

1. Check that you have a valid OpenAI API key
2. Verify the OpenAI package is installed (`npm list openai`)
3. Check network connectivity to the OpenAI API
4. Review server logs for specific error messages
5. If using mock data mode, no external API calls will be made

## Dependencies

- OpenAI Node.js SDK (v4.28.0+)
- Node.js v14+ (v16+ recommended)
- PostgreSQL database for storing UNSPSC codes and favorites
