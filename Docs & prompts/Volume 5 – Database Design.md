Volume 5 – Database Design

Project: L AI

Document Type: Database Design Document (DDD)

Database: Supabase PostgreSQL

Authentication: Supabase Auth

Version: 1.0

Purpose

This document defines the logical and physical database architecture of L AI. It specifies the relational schema, entity relationships, indexing strategy, Row Level Security (RLS), authentication integration, query optimization techniques, caching strategy, storage architecture, backup considerations, and scalability roadmap.

The database has been designed specifically for deployment on the Supabase Free Tier, prioritizing minimal network egress, efficient query execution, reduced authentication overhead, and straightforward migration to higher-capacity infrastructure.

Chapter 1 – Database Overview
1.1 Introduction
1.2 Purpose of the Database
1.3 Database Philosophy
Simplicity
Normalization where appropriate
Low Egress
Low Latency
Security First
Future Scalability
Provider Independence
1.4 Database Objectives
1.5 Database Scope
1.6 Design Constraints
1.7 Free Tier Considerations
Chapter 2 – Database Architecture
2.1 Overall Database Architecture
2.2 PostgreSQL Overview
2.3 Supabase Database Services
2.4 Authentication Integration
2.5 Storage Architecture
2.6 Database Communication Flow
2.7 Backend Data Access Layer
2.8 Future Database Expansion
Chapter 3 – Entity Relationship Design
3.1 Entity Relationship Diagram (ERD)
3.2 Entity Identification
3.3 Relationships
3.4 Cardinality
3.5 Normalization Strategy
3.6 Denormalization Considerations
3.7 Primary Keys
3.8 Foreign Keys
Chapter 4 – Database Schema
4.1 Auth Schema (Managed by Supabase)
4.2 Profiles Table
4.3 Conversations Table
4.4 Messages Table
4.5 User Preferences
4.6 Future Documents Table
4.7 Future AI Memory Table
4.8 Future Agents Table

Each table should include:

Purpose
Fields
Data Types
Constraints
Relationships
Default Values
Future Expansion Notes
Chapter 5 – Authentication Database Design
5.1 Supabase Auth Architecture
5.2 User Lifecycle
5.3 JWT Integration
5.4 Session Persistence
5.5 Profile Synchronization
5.6 Authentication Events
5.7 Future OAuth Providers
Chapter 6 – Row Level Security (RLS)
6.1 Security Philosophy
6.2 RLS Architecture
6.3 Ownership Model
6.4 Profiles Policies
6.5 Conversations Policies
6.6 Messages Policies
6.7 Policy Testing
6.8 Security Validation
Chapter 7 – Query Architecture
7.1 Query Design Philosophy
7.2 Read Optimization
7.3 Write Optimization
7.4 Pagination
7.5 Lazy Loading
7.6 Conversation Loading
7.7 Message Retrieval
7.8 Search Queries (Future)
7.9 Batch Operations
7.10 Transaction Management
Chapter 8 – Indexing Strategy
8.1 Primary Indexes
8.2 Foreign Key Indexes
8.3 Conversation Indexes
8.4 Timestamp Indexes
8.5 Composite Indexes
8.6 Query Planner Considerations
8.7 Index Maintenance
Chapter 9 – Performance Optimization
9.1 Supabase Free Tier Optimization
9.2 Low Egress Strategy
9.3 Minimized SELECT Queries
9.4 Column Projection
9.5 Pagination
9.6 Query Caching
9.7 Backend Memory Cache
9.8 Authentication Optimization
9.9 Streaming Write Optimization
9.10 Connection Reuse
Chapter 10 – Storage Architecture
10.1 Relational Data
10.2 Future File Storage
10.3 Image Storage
10.4 Document Storage
10.5 Avatar Storage
10.6 Storage Access Policies
10.7 CDN Integration (Future)
Chapter 11 – Database Security
11.1 Authentication
11.2 Authorization
11.3 Encryption
11.4 JWT Validation
11.5 Row Level Security
11.6 Secure Queries
11.7 Environment Variables
11.8 Audit Logging (Future)
Chapter 12 – Backup & Recovery
12.1 Backup Philosophy
12.2 Supabase Backups
12.3 Schema Versioning
12.4 Data Recovery
12.5 Disaster Recovery
12.6 Migration Strategy
Chapter 13 – Database Scalability
13.1 Vertical Scaling
13.2 Horizontal Scaling
13.3 Read Replicas
13.4 Connection Pooling
13.5 Background Workers
13.6 Redis Integration
13.7 Vector Database Integration
13.8 Distributed Storage
Chapter 14 – AI Database Extensions
14.1 Conversation Memory
14.2 AI Context Storage
14.3 Prompt Templates
14.4 Embedding Storage
14.5 pgvector Integration
14.6 RAG Database Design
14.7 Knowledge Base Schema
14.8 Semantic Search

These features are intentionally deferred to future versions but should fit naturally into the existing schema.

Chapter 15 – Database Standards
Naming Conventions
Table Naming
Column Naming
Foreign Key Naming
Timestamp Standards
UUID Standards
Migration Standards
Query Standards
Indexing Standards
Security Standards

These standards ensure consistency across all database objects and simplify future maintenance.

Chapter 16 – Database Decision Records (DDR)

Document the reasoning behind major database design decisions.

Examples:

DDR-001

Supabase PostgreSQL selected over Firebase Firestore.

DDR-002

UUIDs selected instead of sequential integers.

DDR-003

Conversation metadata separated from messages.

DDR-004

Supabase Auth used instead of a custom authentication system.

DDR-005

Pagination chosen instead of loading complete chat histories.

DDR-006

Backend-managed caching selected to reduce Supabase egress.

DDR-007

One database write per completed AI response instead of token-by-token persistence.

Capturing these decisions helps future contributors understand the rationale behind the schema and optimization strategy.

Chapter 17 – Conclusion
Database Design Summary
Security Assessment
Performance Assessment
Scalability Assessment
Transition to AI System Design

This chapter concludes the database design by demonstrating how a carefully structured relational schema, combined with Supabase Authentication, Row Level Security, optimized query patterns, and free-tier-aware engineering practices, provides a secure and efficient persistence layer for L AI. The design balances current development needs with a clear path toward future capabilities such as Retrieval-Augmented Generation (RAG), vector search, AI memory, and enterprise-scale deployments.