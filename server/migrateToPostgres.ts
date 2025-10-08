// Migration script to move in-memory users and solutions to PostgreSQL
// Place this file in your server directory and run with: node migrateToPostgres.js

import { Pool } from 'pg';
import { storage } from './storage';

// Get data from storage
const users = Array.from(storage.getUsers().values());
const vendors = Array.from(storage.getVendors().values());
const solutions = Array.from(storage.getSolutions().values());
const challenges = Array.from(storage.getChallenges().values());
const applications = Array.from(storage.getApplications().values());
const chatMessages = Array.from(storage.getChatMessages().values());

const pool = new Pool({
  host: process.env.PGHOST || 'commanders-marketplace-db.clg044gmyrhs.us-east-1.rds.amazonaws.com',
  user: process.env.PGUSER || 'commander',
  password: process.env.PGPASSWORD || '-kjb0Wnni0WNCm#ANv$>i2gYv3i$',
  database: process.env.PGDATABASE || 'postgres', // Connect to default database first
  port: process.env.PGPORT || 5432,
  ssl: {
    rejectUnauthorized: false // Required for AWS RDS SSL certificates
  }
});

async function migrateUsers(client) {
  for (const user of users) {
    await client.query(
      `INSERT INTO users (id, username, email, password_hash, role, vendor_id, approved, branch, rank, job_description, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       ON CONFLICT (id) DO NOTHING`,
      [
        user.id,
        user.username,
        user.email,
        user.password_hash || '',
        user.role,
        user.vendor_id || null,
        user.approved || false,
        user.branch || null,
        user.rank || null,
        user.job_description || null,
        user.created_at || new Date(),
        user.updated_at || new Date(),
      ]
    );
  }
  console.log('Users migrated');
}

async function migrateSolutions(client) {
  for (const solution of solutions) {
    await client.query(
      `INSERT INTO solutions (id, vendor_id, title, description, trl, nato_compatible, security_cleared, capability_areas, status, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT (id) DO NOTHING`,
      [
        solution.id,
        solution.vendorId,
        solution.title,
        solution.description,
        solution.trl,
        solution.natoCompatible || false,
        solution.securityCleared || false,
        solution.capabilityAreas || [],
        solution.status || 'submitted',
        solution.createdAt || new Date(),
        solution.updatedAt || new Date(),
      ]
    );
  }
  console.log('Solutions migrated');
}

async function migrateChallenges(client) {
  for (const challenge of challenges) {
    await client.query(
      `INSERT INTO challenges (id, title, description, type, status, phases, prize_pool, application_deadline, finals_date, eligibility_requirements, focus_areas, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       ON CONFLICT (id) DO NOTHING`,
      [
        challenge.id,
        challenge.title,
        challenge.description,
        challenge.type,
        challenge.status,
        challenge.phases || [],
        challenge.prize_pool || null,
        challenge.application_deadline || null,
        challenge.finals_date || null,
        challenge.eligibility_requirements || {},
        challenge.focus_areas || [],
        challenge.created_at || new Date(),
        challenge.updated_at || new Date(),
      ]
    );
  }
  console.log('Challenges migrated');
}

async function migrateApplications(client) {
  for (const application of applications) {
    await client.query(
      `INSERT INTO applications (id, challenge_id, vendor_id, title, description, capability_areas, status, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (id) DO NOTHING`,
      [
        application.id,
        application.challenge_id,
        application.vendor_id,
        application.title,
        application.description,
        application.capability_areas || [],
        application.status || 'submitted',
        application.created_at || new Date(),
        application.updated_at || new Date(),
      ]
    );
  }
  console.log('Applications migrated');
}

async function migrateChatMessages(client) {
  for (const message of chatMessages) {
    await client.query(
      `INSERT INTO chat_messages (id, user_id, content, role, created_at)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (id) DO NOTHING`,
      [
        message.id,
        message.user_id,
        message.content,
        message.role,
        message.created_at || new Date(),
      ]
    );
  }
  console.log('Chat messages migrated');
}

async function main() {
  let currentPool = pool;
  
  try {
    // Create database if it doesn't exist
    await currentPool.query(`
      CREATE DATABASE "commanders-marketplace-db"
      WITH 
      ENCODING = 'UTF8'
      LC_COLLATE = 'en_US.UTF-8'
      LC_CTYPE = 'en_US.UTF-8';
    `).catch(err => {
      if (err.code !== '42P04') { // 42P04 is the error code when database already exists
        throw err;
      }
      console.log('Database already exists, continuing...');
    });
    
    // Close connection to postgres database
    await currentPool.end();
    
    // Reconnect to our new database
    currentPool = new Pool({
      host: process.env.PGHOST || 'commanders-marketplace-db.clg044gmyrhs.us-east-1.rds.amazonaws.com',
      user: process.env.PGUSER || 'commander',
      password: process.env.PGPASSWORD, // Password should be set via environment variable
      database: 'commanders-marketplace-db',
      port: process.env.PGPORT || 5432,
      ssl: {
        rejectUnauthorized: false
      }
    });

    // Create tables
    await currentPool.query(`
      -- Enable UUID generation
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";

      -- Vendors table
      CREATE TABLE IF NOT EXISTS vendors (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_name VARCHAR(255) NOT NULL,
        uei VARCHAR(64),
        cage VARCHAR(64),
        nato_eligible BOOLEAN DEFAULT FALSE,
        nontraditional BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(64) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(32) NOT NULL,
        vendor_id UUID REFERENCES vendors(id),
        approved BOOLEAN DEFAULT FALSE,
        branch VARCHAR(64),
        rank VARCHAR(64),
        job_description TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Solutions table
      CREATE TABLE IF NOT EXISTS solutions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        vendor_id UUID REFERENCES vendors(id),
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        trl INTEGER,
        nato_compatible BOOLEAN DEFAULT FALSE,
        security_cleared BOOLEAN DEFAULT FALSE,
        capability_areas TEXT[],
        status VARCHAR(32) DEFAULT 'submitted',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Reviews table
      CREATE TABLE IF NOT EXISTS reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        solution_id UUID REFERENCES solutions(id),
        user_id UUID REFERENCES users(id),
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        title VARCHAR(255),
        description TEXT,
        readiness_score INTEGER CHECK (readiness_score >= 1 AND readiness_score <= 10),
        interoperability_score INTEGER CHECK (interoperability_score >= 1 AND interoperability_score <= 10),
        support_score INTEGER CHECK (support_score >= 1 AND support_score <= 10),
        field_tested BOOLEAN DEFAULT FALSE,
        test_date TIMESTAMP,
        helpful_votes INTEGER DEFAULT 0,
        total_votes INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Challenges table
      CREATE TABLE IF NOT EXISTS challenges (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        type VARCHAR(64) NOT NULL,
        status VARCHAR(32) NOT NULL,
        phases JSONB,
        prize_pool DECIMAL(12,2),
        application_deadline TIMESTAMP,
        finals_date TIMESTAMP,
        eligibility_requirements JSONB,
        focus_areas TEXT[],
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Applications table
      CREATE TABLE IF NOT EXISTS applications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        challenge_id UUID REFERENCES challenges(id),
        vendor_id UUID REFERENCES vendors(id),
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        capability_areas TEXT[],
        status VARCHAR(32) DEFAULT 'submitted',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Chat Messages table
      CREATE TABLE IF NOT EXISTS chat_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        content TEXT NOT NULL,
        role VARCHAR(32) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    console.log('Tables created successfully');
    
    // Migrate vendors first
    for (const vendor of vendors) {
      await currentPool.query(
        `INSERT INTO vendors (id, company_name, uei, cage, nato_eligible, nontraditional, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO NOTHING`,
        [
          vendor.id,
          vendor.company_name,
          vendor.uei,
          vendor.cage,
          vendor.nato_eligible,
          vendor.nontraditional,
          vendor.created_at,
          vendor.updated_at
        ]
      );
    }
    console.log('Vendors migrated');
    
    await migrateUsers(currentPool);
    await migrateSolutions(currentPool);
    await migrateChallenges(currentPool);
    await migrateApplications(currentPool);
    await migrateChatMessages(currentPool);
    
    await currentPool.end();
  } catch (err) {
    console.error('Migration error:', err);
    if (currentPool) {
      await currentPool.end().catch(console.error);
    }
  }
}

main();
