# G-TEAD Marketplace

## Overview

The G-TEAD Marketplace is a full-stack web application designed as the Army's global digital environment for rapidly sourcing, evaluating, and procuring innovative technologies from U.S., NATO, and foreign vendors. The platform supports USAREUR-AF's mission by streamlining technology competitions, providing a compliant marketplace for "post-competitive" solutions, and offering role-specific portals for different user types including Vendors, Government Buyers, and Contracting Officers.

The application implements a comprehensive marketplace with features including technology challenges (inspired by xTech competitions), solution submissions with pitch videos, Amazon-style government reviews, and AI-powered assistance for procurement guidance.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom Army branding (deep greens #003300/#004d00, gold accents #D4AF37)
- **State Management**: TanStack React Query for server state, React Hook Form for form management
- **Routing**: Wouter for client-side navigation
- **Client Structure**: Organized into pages (Landing, VendorPortal, GovernmentPortal, etc.), reusable components, and custom hooks

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful API with role-based endpoints
- **Authentication**: Replit Authentication with OpenID Connect integration and session management
- **File Handling**: Multer middleware for video/document uploads with 50MB limits
- **Server Structure**: Modular route handlers, authentication middleware, and storage abstraction layer

### Database & ORM
- **Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Schema Design**: 
  - Users with role-based access (vendor, government, contracting_officer, admin)
  - Challenges with multi-phase competition workflows
  - Solutions with TRL ratings, NATO compatibility flags
  - Reviews system restricted to government users
  - Applications tracking challenge submissions
  - Chat messages for AI assistant interactions

### Authentication & Authorization
- **Provider**: Replit Auth with OIDC integration
- **Session Management**: PostgreSQL-backed sessions with 7-day TTL
- **Role-Based Access**: Four user roles with different portal access and permissions
- **Security**: HTTP-only secure cookies, CSRF protection

### AI Integration
- **Provider**: OpenAI API (GPT-5 model)
- **Features**: 
  - Role-specific chat assistant (procurement guidance for government, submission tips for vendors)
  - Solution matching using embeddings for recommendation engine
  - Context-aware responses based on user role and marketplace data

### File Upload System
- **Storage**: Local filesystem with configurable upload directory
- **Supported Formats**: Videos (mp4, mov, avi), documents (pdf, doc, docx, txt), images (jpg, jpeg, png, gif)
- **Validation**: File type filtering, size limits, and progress tracking
- **Use Cases**: Pitch videos, white papers, technical documentation

### UI Component System
- **Design System**: shadcn/ui with Radix UI primitives
- **Theming**: CSS custom properties with Army-specific color palette
- **Components**: Comprehensive set including forms, dialogs, cards, badges, file uploads
- **Responsive Design**: Mobile-first approach with breakpoint-aware components

## External Dependencies

### Core Infrastructure
- **Database**: Neon PostgreSQL serverless database
- **Authentication**: Replit Authentication service with OpenID Connect
- **AI Services**: OpenAI API for chat assistance and embeddings

### Frontend Libraries
- **React Ecosystem**: React 18, React DOM, React Hook Form, TanStack React Query
- **UI Framework**: Radix UI primitives, Tailwind CSS, class-variance-authority
- **Utilities**: Wouter (routing), zod (validation), clsx/tailwind-merge (styling)

### Backend Libraries
- **Express Stack**: Express.js, session management, CORS handling
- **Authentication**: OpenID Client, Passport.js strategies
- **Database**: Drizzle ORM, Drizzle Kit, PostgreSQL drivers
- **File Handling**: Multer for multipart uploads
- **Security**: bcrypt for password hashing, connect-pg-simple for session storage

### Development Tools
- **Build System**: Vite with React plugin and runtime error overlay
- **TypeScript**: Full type safety across frontend and backend
- **Code Quality**: ESBuild for production builds, PostCSS for CSS processing
- **Replit Integration**: Cartographer plugin for development, runtime banner injection

### Third-Party Integrations
- **Email Services**: Nodemailer for notification systems
- **Memory Optimization**: Memoizee for caching expensive operations
- **Development**: Replit-specific plugins for enhanced development experience