# Supabase Database Setup

This directory contains the database migrations and configuration for the AI Browser Agent System.

## Schema Overview

### Tables
- `profiles`: Extended user information linked to auth.users
- `sessions`: Chat/browser interaction sessions
- `session_steps`: Individual steps within a session
- `knowledge_base`: Persistent user information storage
- `api_keys`: Provider API key management

### Security
- Row Level Security (RLS) enabled on all tables
- Policies ensuring users can only access their own data
- Encryption support for sensitive knowledge base entries
- Secure API key storage

## Migration Process

1. Configure Supabase CLI:
```bash
npm install -g supabase
supabase login
```

2. Link your project:
```bash
supabase link --project-ref your-project-ref
```

3. Run migrations:
```bash
supabase db push
```

## Database Updates

When making changes to the schema:

1. Create a new migration:
```bash
supabase migration new your_migration_name
```

2. Add SQL changes to the generated file in `migrations/`

3. Apply changes:
```bash
supabase db push
```

## Row Level Security (RLS) Policies

All tables have RLS enabled with policies that:
- Restrict users to only accessing their own data
- Use EXISTS clauses for related table checks
- Implement proper security definer functions

## Indexes

Performance-optimized indexes are created for:
- User ID foreign keys
- Session relationships
- Category-based queries
- Provider-specific searches

## Development Notes

- Always test RLS policies when adding new features
- Use parameterized queries to prevent SQL injection
- Keep migrations idempotent for reliable deployments
- Monitor query performance with Supabase Dashboard
