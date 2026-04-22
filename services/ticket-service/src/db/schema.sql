CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tickets (
  id SERIAL PRIMARY KEY,
  
  -- Identity
  reference_number VARCHAR(20) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Content
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  channel VARCHAR(20) CHECK (channel IN ('email','chat','api','web')) DEFAULT 'web',

  -- Classification
  category_id INTEGER REFERENCES categories(id),
  priority VARCHAR(20) CHECK (priority IN ('low','medium','high','critical')) DEFAULT 'medium',
  status VARCHAR(20) CHECK (status IN ('open','in_progress','resolved','closed')) DEFAULT 'open',
  tags TEXT[],

  -- Ownership
  created_by INTEGER NOT NULL,
  assigned_to INTEGER,
  team_id INTEGER REFERENCES teams(id),

  -- ML Metadata
  auto_category_confidence FLOAT CHECK (auto_category_confidence BETWEEN 0 AND 1),
  auto_priority_score FLOAT CHECK (auto_priority_score BETWEEN 0 AND 1),
  is_manually_overridden BOOLEAN DEFAULT FALSE,

  -- Soft delete
  is_deleted BOOLEAN DEFAULT FALSE
);


CREATE TABLE IF NOT EXISTS ticket_events (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  old_value JSONB,
  new_value JSONB,
  changed_by INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ticket
    FOREIGN KEY(ticket_id)
    REFERENCES tickets(id)
    ON DELETE CASCADE
);
o

-- -- Common filters
-- CREATE INDEX idx_tickets_status ON tickets(status);
-- CREATE INDEX idx_tickets_priority ON tickets(priority);
-- CREATE INDEX idx_tickets_assigned_to ON tickets(assigned_to);
-- CREATE INDEX idx_tickets_team_id ON tickets(team_id);
-- CREATE INDEX idx_tickets_created_at ON tickets(created_at);

-- -- For soft delete filtering
-- CREATE INDEX idx_tickets_is_deleted ON tickets(is_deleted);

-- -- For searching subject/description
-- CREATE INDEX idx_tickets_search 
-- ON tickets 
-- USING GIN (to_tsvector('english', subject || ' ' || description));