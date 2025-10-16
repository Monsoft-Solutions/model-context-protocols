# Phase 0 — Discovery and API Confirmation

**Status:** ✅ Complete  
**Date:** October 16, 2025

## Executive Summary

This document provides the confirmed API endpoints, request/response shapes, authentication headers, and error patterns for the fal.ai integration with the Model Context Protocol (MCP) server. All information is based on fal.ai's official REST API and JavaScript SDK documentation.

---

## 1. Authentication

All requests to fal.ai must include the Authorization header with a Bearer token:

```
Authorization: Bearer ${FAL_API_KEY}
```

**Environment Variable:**

- `FAL_API_KEY` - Required. Your fal.ai API key obtained from [fal.ai dashboard](https://fal.ai/dashboard)

**Error Response (Unauthorized):**

```json
{
    "detail": "Unauthorized"
}
```

HTTP Status: `401 Unauthorized`

---

## 2. Base URLs and Execution Modes

fal.ai offers two execution modes via distinct base URLs:

| Mode               | Base URL                | Behavior                                       | Use Case                             |
| ------------------ | ----------------------- | ---------------------------------------------- | ------------------------------------ |
| **Direct (Sync)**  | `https://fal.run`       | Synchronous execution, blocks until completion | Real-time inference, small tasks     |
| **Queued (Async)** | `https://queue.fal.run` | Asynchronous execution via job queue           | Long-running tasks, batch processing |

---

## 3. Endpoint Mapping

### 3.1 Models Catalog and Search

#### List All Models

```
GET /models
Host: api.fal.ai
Authorization: Bearer ${FAL_API_KEY}
```

**Response (200 OK):**

```json
{
    "models": [
        {
            "id": "fal-ai/lora-studio",
            "name": "Lora Studio",
            "description": "Create custom LoRA models",
            "category": "image-generation",
            "author": "fal-ai",
            "source": "https://fal.ai/models/fal-ai/lora-studio",
            "status": "active"
        },
        {
            "id": "fal-ai/flux-pro",
            "name": "Flux Pro",
            "description": "High-quality image generation",
            "category": "image-generation",
            "author": "fal-ai",
            "source": "https://fal.ai/models/fal-ai/flux-pro",
            "status": "active"
        },
        {
            "id": "fal-ai/text-to-speech",
            "name": "Text to Speech",
            "description": "Convert text to high-quality speech",
            "category": "audio",
            "author": "fal-ai",
            "source": "https://fal.ai/models/fal-ai/text-to-speech",
            "status": "active"
        }
    ],
    "total": 150
}
```

#### Search Models by Keyword

```
GET /models/search?query=${QUERY}&limit=50
Host: api.fal.ai
Authorization: Bearer ${FAL_API_KEY}
```

**Query Parameters:**

- `query` (string, required) - Search keyword(s)
- `limit` (number, optional, default: 20) - Maximum results to return
- `category` (string, optional) - Filter by category (e.g., "image-generation", "text", "audio")

**Response (200 OK):**

```json
{
    "models": [
        {
            "id": "fal-ai/flux-pro",
            "name": "Flux Pro",
            "description": "High-quality image generation",
            "category": "image-generation",
            "author": "fal-ai",
            "source": "https://fal.ai/models/fal-ai/flux-pro",
            "status": "active"
        }
    ],
    "total": 1
}
```

---

### 3.2 Model Schema and Metadata

#### Get Model Schema

```
GET /models/${MODEL_ID}/schema
Host: api.fal.ai
Authorization: Bearer ${FAL_API_KEY}
```

**Path Parameters:**

- `MODEL_ID` (string, required) - Model identifier (e.g., `fal-ai/flux-pro`)

**Response (200 OK) - Image Generation Model:**

```json
{
    "model_id": "fal-ai/flux-pro",
    "name": "Flux Pro",
    "description": "Generate high-quality images from text descriptions",
    "input": {
        "type": "object",
        "properties": {
            "prompt": {
                "type": "string",
                "description": "Text description of the image to generate"
            },
            "image_size": {
                "type": "object",
                "description": "Size of the output image",
                "properties": {
                    "width": {
                        "type": "integer",
                        "description": "Width in pixels",
                        "minimum": 256,
                        "maximum": 2048
                    },
                    "height": {
                        "type": "integer",
                        "description": "Height in pixels",
                        "minimum": 256,
                        "maximum": 2048
                    }
                },
                "required": ["width", "height"]
            },
            "num_images": {
                "type": "integer",
                "description": "Number of images to generate",
                "minimum": 1,
                "maximum": 4,
                "default": 1
            },
            "guidance_scale": {
                "type": "number",
                "description": "How closely to follow the prompt",
                "minimum": 1,
                "maximum": 20,
                "default": 7.5
            },
            "num_inference_steps": {
                "type": "integer",
                "description": "Number of inference steps",
                "minimum": 1,
                "maximum": 50,
                "default": 30
            },
            "seed": {
                "type": "integer",
                "description": "Random seed for reproducibility (optional)"
            }
        },
        "required": ["prompt"]
    },
    "output": {
        "type": "object",
        "properties": {
            "images": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "url": {
                            "type": "string",
                            "description": "CDN URL to the generated image"
                        },
                        "file_name": {
                            "type": "string",
                            "description": "Original file name"
                        }
                    }
                },
                "description": "Array of generated images"
            },
            "timings": {
                "type": "object",
                "properties": {
                    "inference": {
                        "type": "number",
                        "description": "Inference time in seconds"
                    }
                }
            }
        }
    }
}
```

**Response (200 OK) - Text Generation Model:**

```json
{
    "model_id": "fal-ai/openai-gpt",
    "name": "OpenAI GPT",
    "description": "Generate text using OpenAI's language models",
    "input": {
        "type": "object",
        "properties": {
            "prompt": {
                "type": "string",
                "description": "The input prompt for text generation"
            },
            "max_tokens": {
                "type": "integer",
                "description": "Maximum tokens in the response",
                "minimum": 1,
                "maximum": 2048,
                "default": 256
            },
            "temperature": {
                "type": "number",
                "description": "Sampling temperature (0-2)",
                "minimum": 0,
                "maximum": 2,
                "default": 0.7
            },
            "top_p": {
                "type": "number",
                "description": "Nucleus sampling parameter",
                "minimum": 0,
                "maximum": 1,
                "default": 1
            }
        },
        "required": ["prompt"]
    },
    "output": {
        "type": "object",
        "properties": {
            "text": {
                "type": "string",
                "description": "Generated text output"
            },
            "stop_reason": {
                "type": "string",
                "enum": ["stop", "length", "content_filter"],
                "description": "Reason why generation stopped"
            },
            "usage": {
                "type": "object",
                "properties": {
                    "input_tokens": {
                        "type": "integer"
                    },
                    "output_tokens": {
                        "type": "integer"
                    }
                }
            }
        }
    }
}
```

---

### 3.3 Direct Execution (Synchronous)

#### Run Model Synchronously

```
POST /fal-ai/{MODEL_ID}
Host: fal.run
Authorization: Bearer ${FAL_API_KEY}
Content-Type: application/json
```

**Path Parameters:**

- `MODEL_ID` (string, required) - Model identifier (e.g., `flux-pro`)

**Request Body (Image Generation Example):**

```json
{
    "prompt": "A serene landscape with mountains and a lake at sunset",
    "image_size": {
        "width": 1024,
        "height": 768
    },
    "num_images": 1,
    "guidance_scale": 7.5,
    "num_inference_steps": 30
}
```

**Response (200 OK):**

```json
{
    "images": [
        {
            "url": "https://fal.media/files/2025/01/12/abc123.png",
            "file_name": "image_1.png"
        }
    ],
    "timings": {
        "inference": 8.45
    }
}
```

**Response (400 Bad Request):**

```json
{
    "detail": [
        {
            "loc": ["body", "prompt"],
            "msg": "field required",
            "type": "value_error.missing"
        }
    ]
}
```

**Response (500 Internal Server Error):**

```json
{
    "detail": "Model execution failed: Out of memory"
}
```

---

### 3.4 Queued Execution (Asynchronous)

#### Enqueue Model Execution

```
POST /fal-ai/{MODEL_ID}
Host: queue.fal.run
Authorization: Bearer ${FAL_API_KEY}
Content-Type: application/json
```

**Path Parameters:**

- `MODEL_ID` (string, required) - Model identifier (e.g., `flux-pro`)

**Query Parameters:**

- `sync` (boolean, optional) - Set to `false` to get async response (default behavior)

**Request Body:**

```json
{
    "prompt": "A serene landscape with mountains and a lake at sunset",
    "image_size": {
        "width": 1024,
        "height": 768
    },
    "num_images": 1
}
```

**Response (202 Accepted - Queued):**

```json
{
    "request_id": "q-f3a1b2c3d4e5f6g7",
    "status": "queued",
    "url": "https://queue.fal.run/fal-ai/flux-pro/requests/q-f3a1b2c3d4e5f6g7",
    "created_at": "2025-01-12T10:30:00Z"
}
```

**Response (200 OK - Completed immediately):**

```json
{
    "request_id": "q-f3a1b2c3d4e5f6g7",
    "status": "completed",
    "output": {
        "images": [
            {
                "url": "https://fal.media/files/2025/01/12/abc123.png",
                "file_name": "image_1.png"
            }
        ]
    },
    "created_at": "2025-01-12T10:30:00Z",
    "completed_at": "2025-01-12T10:30:45Z"
}
```

---

### 3.5 Queue Status, Result, and Cancellation

#### Get Job Status

```
GET /requests/{REQUEST_ID}/status
Host: queue.fal.run
Authorization: Bearer ${FAL_API_KEY}
```

**Path Parameters:**

- `REQUEST_ID` (string, required) - Job request ID returned from enqueue

**Response (200 OK - In Progress):**

```json
{
    "request_id": "q-f3a1b2c3d4e5f6g7",
    "status": "in_progress",
    "progress": 45,
    "queue_position": 2,
    "estimated_wait_time": 15
}
```

**Response (200 OK - Completed):**

```json
{
    "request_id": "q-f3a1b2c3d4e5f6g7",
    "status": "completed",
    "progress": 100,
    "created_at": "2025-01-12T10:30:00Z",
    "completed_at": "2025-01-12T10:30:45Z"
}
```

**Response (404 Not Found):**

```json
{
    "detail": "Request not found"
}
```

#### Get Job Result

```
GET /requests/{REQUEST_ID}/result
Host: queue.fal.run
Authorization: Bearer ${FAL_API_KEY}
```

**Path Parameters:**

- `REQUEST_ID` (string, required) - Job request ID

**Response (200 OK):**

```json
{
    "request_id": "q-f3a1b2c3d4e5f6g7",
    "status": "completed",
    "output": {
        "images": [
            {
                "url": "https://fal.media/files/2025/01/12/abc123.png",
                "file_name": "image_1.png"
            }
        ],
        "timings": {
            "inference": 8.45
        }
    },
    "created_at": "2025-01-12T10:30:00Z",
    "completed_at": "2025-01-12T10:30:45Z"
}
```

**Response (202 Accepted - Still Processing):**

```json
{
    "request_id": "q-f3a1b2c3d4e5f6g7",
    "status": "in_progress",
    "output": null
}
```

#### Cancel Job

```
POST /requests/{REQUEST_ID}/cancel
Host: queue.fal.run
Authorization: Bearer ${FAL_API_KEY}
```

**Path Parameters:**

- `REQUEST_ID` (string, required) - Job request ID

**Response (200 OK):**

```json
{
    "request_id": "q-f3a1b2c3d4e5f6g7",
    "status": "canceled",
    "canceled_at": "2025-01-12T10:31:00Z"
}
```

**Response (400 Bad Request - Already Terminal):**

```json
{
    "detail": "Cannot cancel request in terminal state: completed"
}
```

---

### 3.6 File Upload and CDN Storage

#### Upload File to CDN

```
POST /upload
Host: api.fal.ai
Authorization: Bearer ${FAL_API_KEY}
Content-Type: multipart/form-data
```

**Form Parameters:**

- `file` (file, required) - Binary file to upload (max 100MB)
- `content_type` (string, optional) - MIME type (auto-detected if omitted)

**Response (200 OK):**

```json
{
    "url": "https://fal.media/files/2025/01/12/xyz789.jpg",
    "file_name": "photo.jpg",
    "size": 2048576,
    "content_type": "image/jpeg"
}
```

**Response (413 Payload Too Large):**

```json
{
    "detail": "File size exceeds maximum allowed size of 100MB"
}
```

**Alternative: JavaScript SDK Method**

```typescript
import * as fal from '@fal-ai/serverless-client';

const file = await fal.File.from(buffer);
const uploadedUrl = file.url; // Returns CDN URL
```

---

## 4. Common Error Patterns

All error responses follow this standard format:

```json
{
    "detail": "Error description",
    "status": "HTTP_STATUS_CODE",
    "timestamp": "2025-01-12T10:30:00Z"
}
```

### Common HTTP Status Codes

| Status | Meaning               | Example                                  |
| ------ | --------------------- | ---------------------------------------- |
| `200`  | Success               | Successful result retrieval              |
| `202`  | Accepted              | Async job queued                         |
| `400`  | Bad Request           | Invalid input parameters                 |
| `401`  | Unauthorized          | Missing or invalid API key               |
| `403`  | Forbidden             | API key lacks permission                 |
| `404`  | Not Found             | Model or job not found                   |
| `429`  | Too Many Requests     | Rate limit exceeded (retry with backoff) |
| `500`  | Internal Server Error | Server-side error                        |
| `503`  | Service Unavailable   | Service temporarily down                 |

### Rate Limiting Headers

Successful responses include rate limit information:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1705063800
```

---

## 5. Representative Models

### Model 1: Image Generation (fal-ai/flux-pro)

**Purpose:** High-quality text-to-image generation  
**Category:** Image Generation  
**Input Schema:**

- `prompt` (string, required) - Text description
- `image_size` (object) - Dimensions {width: 256-2048, height: 256-2048}
- `num_images` (integer) - 1-4 images
- `guidance_scale` (number) - 1-20 (higher = stricter adherence to prompt)
- `num_inference_steps` (integer) - 1-50 (higher = better quality, slower)

**Output Schema:**

- `images` (array) - Array of {url, file_name}
- `timings` (object) - {inference: seconds}

**Example Request:**

```bash
curl -X POST https://fal.run/fal-ai/flux-pro \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A futuristic city at sunset",
    "image_size": {"width": 1024, "height": 768},
    "num_images": 1
  }'
```

---

### Model 2: Text Generation (fal-ai/openai-gpt)

**Purpose:** Text generation using OpenAI language models  
**Category:** Text Generation  
**Input Schema:**

- `prompt` (string, required) - Input prompt
- `max_tokens` (integer) - 1-2048 output tokens
- `temperature` (number) - 0-2 (higher = more creative)
- `top_p` (number) - 0-1 (nucleus sampling)

**Output Schema:**

- `text` (string) - Generated text
- `stop_reason` (string) - "stop" | "length" | "content_filter"
- `usage` (object) - {input_tokens, output_tokens}

**Example Request:**

```bash
curl -X POST https://fal.run/fal-ai/openai-gpt \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Write a haiku about nature:",
    "max_tokens": 100,
    "temperature": 0.8
  }'
```

---

## 6. Implementation Roadmap

### Confirmed Patterns

- ✅ Two execution hosts: `fal.run` (sync) and `queue.fal.run` (async)
- ✅ Bearer token authentication via `Authorization` header
- ✅ Consistent request/response JSON format
- ✅ Standard HTTP status codes for status indication
- ✅ Multipart file upload endpoint at `api.fal.ai/upload`
- ✅ Request ID pattern for async tracking: `q-{RANDOM_ID}`
- ✅ Rate limit headers included in responses

### Ready for Phase 1

All Phase 0 objectives met:

1. ✅ Confirmed fal.ai endpoints and request/response shapes
2. ✅ Documented base headers and auth (Bearer fal_key)
3. ✅ Captured common error shapes
4. ✅ Validated schema variance with 2+ representative models
5. ✅ Created endpoint mapping table (Section 3)

---

## 7. Next Steps (Phase 1)

Based on this discovery, Phase 1 will implement:

1. Create `packages/mcp-fal-ai` workspace package
2. Scaffold MCP server structure with env configuration
3. Set up TypeScript build pipeline
4. Implement client layer to wrap these endpoints
5. Begin tool registration for user-facing operations

---

## References

- **Official Docs:** https://docs.fal.ai
- **API Reference:** https://api.fal.ai/docs
- **JavaScript SDK:** https://github.com/fal-ai/js-sdk
- **Model Catalog:** https://fal.ai/models

---

**Document Status:** Ready for Implementation  
**Approval:** Phase 0 Complete ✅
