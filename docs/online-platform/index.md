# MCP Online Platform

## Overview

The MCP Online Platform is a comprehensive solution for hosting and managing Model Context Protocol (MCP) services with multi-tenant support. This platform extends the current MCP system to enable user-specific configurations, secure authentication, and comprehensive request logging.

[TOC]

## Core Features

- **Multi-Tenant Architecture**: Support for multiple users/organizations with isolated data and configurations
- **Supabase Integration**: Secure database storage for user credentials and configuration
- **JWT Authentication**: Secure identity verification for all platform requests
- **Comprehensive Logging**: Detailed tracking of all MCP requests and responses
- **VernisAI Integration**: Seamless connectivity with the VernisAI application
- **Extensibility**: Future support for third-party developers and applications

## Purpose

The platform serves as the centralized infrastructure for running MCPs at scale, initially as a backend for VernisAI and subsequently as a service for third-party developers. By implementing proper authentication, database persistence, and logging, the platform provides a secure and scalable foundation for MCP-based applications.

## Documentation Structure

- [Architecture Overview](architecture.md): System design and component interaction
- [Data Models](data-models.md): Database schema and entity relationships
- [Authentication Flow](authentication.md): User registration, login, and token validation
- [API Reference](api-reference.md): Endpoint specifications and usage examples
- [Deployment Guide](deployment.md): Infrastructure setup and configuration
- [Security Considerations](security.md): Best practices and implementation details
- [Logging System](logging.md): Comprehensive request tracking and analysis
- [User Management](user-management.md): Tenant creation and administration

## Getting Started

To understand the system better, start with the [Architecture Overview](architecture.md) to get a high-level understanding of how the components interact, then dive into specific areas based on your role or interest.
