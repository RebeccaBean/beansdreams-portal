-- Students table
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100),
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(20) CHECK (role IN ('student','admin','teacher')) DEFAULT 'student',
  credits INT DEFAULT 0,
  remainingCredits JSONB DEFAULT '{"total":0,"byType":{}}',
  paymentHistory JSONB DEFAULT '[]',
  subscriptions JSONB DEFAULT '[]',
  downloads TEXT[] DEFAULT '{}'
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uid UUID REFERENCES students(id) ON DELETE CASCADE,
  email VARCHAR(255),
  cart JSONB,
  paypalOrder JSONB,
  status VARCHAR(50) DEFAULT 'pending',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Single Class Purchases table
CREATE TABLE single_class_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uid UUID REFERENCES students(id) ON DELETE CASCADE,
  email VARCHAR(255),
  classType VARCHAR(100),
  status VARCHAR(50) DEFAULT 'created',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PayPal Webhooks table
CREATE TABLE paypal_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  body JSONB,
  receivedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Printify Events table
CREATE TABLE printify_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event JSONB,
  receivedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Calendly Events table
CREATE TABLE calendly_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event JSONB,
  email VARCHAR(255),
  uid UUID,
  receivedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
