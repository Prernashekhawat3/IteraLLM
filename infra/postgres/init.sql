-- Runs automatically on first container start

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Verify extensions loaded
SELECT * FROM pg_extension WHERE extname = 'uuid-ossp';