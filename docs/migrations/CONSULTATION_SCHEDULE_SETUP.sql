-- ============================================
-- CONSULTATION AVAILABILITY & BOOKINGS TABLES
-- ============================================
-- Stores owner availability windows and client consultation bookings.
-- Admin dashboard calendar + Wedding \"Schedule a Consultation\" use these.
--
-- Run this in your Supabase project before deploying.
-- ============================================

-- Owner availability per day (single window per date)
CREATE TABLE IF NOT EXISTS owner_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  availability_date DATE NOT NULL UNIQUE,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE owner_availability IS 'Owner availability windows per day for consultations (wedding & events).';

-- Client consultation bookings
CREATE TABLE IF NOT EXISTS consultation_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  notes TEXT,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consultation_bookings_scheduled_date
  ON consultation_bookings (scheduled_date, scheduled_time);

COMMENT ON TABLE consultation_bookings IS 'Client consultation bookings coming from the wedding page and other flows.';

