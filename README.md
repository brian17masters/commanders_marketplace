# Commanders Marketplace

A full-stack web application for connecting military technology needs with innovative solutions. The platform facilitates challenge-based acquisitions and vendor submissions through a modern, secure interface.

## Features

- **Challenge Management**
  - Create and manage technology challenges
  - Multi-phase submission process
  - Automated deadline tracking
  - Prize pool management

- **Vendor Portal**
  - Solution submission workspace
  - Application tracking
  - Capability showcase
  - NATO compatibility flagging

- **Government Portal**
  - Challenge creation and management
  - Vendor evaluation tools
  - Solution review system
  - Automated compliance checking

- **AI-Powered Matching**
  - Natural language requirement processing
  - Intelligent solution matching
  - Capability area analysis
  - Automated initial screening

## Technology Stack

- **Frontend**
  - React with TypeScript
  - TailwindCSS for styling
  - Shadcn/ui component library
  - Tanstack Query for data fetching

- **Backend**
  - Node.js/Express
  - PostgreSQL with Drizzle ORM
  - AWS RDS for database hosting
  - AWS Secrets Manager for credentials

- **Authentication & Security**
  - Session-based authentication
  - Role-based access control
  - AWS security best practices
  - PostgreSQL-backed sessions

## Getting Started

### Prerequisites

- Node.js v20 or higher
- PostgreSQL 16
- AWS CLI configured with appropriate credentials

### Environment Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/brian17masters/commanders_marketplace.git
   cd commanders_marketplace
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   # Create .env file with the following variables
   DATABASE_URL=postgresql://user:password@host:5432/dbname
   DB_SECRET_ARN=arn:aws:secretsmanager:region:account:secret:name
   ```

4. Initialize the database:
   ```bash
   # Create tables
   psql -h your-host -U your-user -d your-database -f schema.sql

   # Run migrations
   npx ts-node server/migrateToPostgres.ts
   ```

### Development

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## Database Schema

- **Users**: Authentication and profile information
- **Vendors**: Company and capability information
- **Challenges**: Technology requirements and competition details
- **Applications**: Vendor submissions and evaluations
- **Solutions**: Technology offerings and capabilities
- **Reviews**: Evaluation feedback and ratings
- **Chat Messages**: AI assistance conversations

## AWS Configuration

1. Configure AWS Secrets Manager:
   ```bash
   # Store database credentials
   aws secretsmanager create-secret --name commanders-marketplace-db-credentials \
     --description "Database credentials for Commanders Marketplace" \
     --secret-string '{"username":"user","password":"pass","host":"host","dbname":"db"}'
   ```

2. Set up environment variables for AWS:
   ```bash
   export AWS_REGION=us-east-1
   export DB_SECRET_ARN=your-secret-arn
   ```

## Contributing

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit:
   ```bash
   git commit -m "Description of your changes"
   ```

3. Push to GitHub:
   ```bash
   git push origin feature/your-feature-name
   ```

4. Create a Pull Request

## Security

- All database credentials are managed through AWS Secrets Manager
- Environment variables for sensitive information
- SSL/TLS encryption for database connections
- Regular security audits and updates

## License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

## Contact

For questions or support, please contact the development team.
