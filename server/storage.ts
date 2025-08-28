import {
  users,
  challenges,
  solutions,
  reviews,
  applications,
  chatMessages,
  type User,
  type UpsertUser,
  type Challenge,
  type InsertChallenge,
  type Solution,
  type InsertSolution,
  type Review,
  type InsertReview,
  type Application,
  type InsertApplication,
  type ChatMessage,
  type InsertChatMessage,
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: Omit<UpsertUser, 'id'> & { password: string; role: string }): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Challenge operations
  createChallenge(challenge: InsertChallenge): Promise<Challenge>;
  getChallenges(filters?: { status?: string; type?: string }): Promise<Challenge[]>;
  getChallenge(id: string): Promise<Challenge | undefined>;
  updateChallenge(id: string, updates: Partial<InsertChallenge>): Promise<Challenge>;
  
  // Solution operations
  createSolution(solution: InsertSolution): Promise<Solution>;
  getSolutions(filters?: { 
    vendorId?: string; 
    status?: string; 
    trl?: number;
    natoCompatible?: boolean;
  }): Promise<Solution[]>;
  getSolution(id: string): Promise<Solution | undefined>;
  updateSolution(id: string, updates: Partial<InsertSolution>): Promise<Solution>;
  searchSolutions(query: string): Promise<Solution[]>;
  
  // Review operations
  createReview(review: InsertReview): Promise<Review>;
  getReviewsBySolution(solutionId: string): Promise<Review[]>;
  getReview(id: string): Promise<Review | undefined>;
  
  // Application operations
  createApplication(application: InsertApplication): Promise<Application>;
  getApplications(filters?: { 
    challengeId?: string; 
    vendorId?: string; 
    status?: string;
  }): Promise<Application[]>;
  getApplication(id: string): Promise<Application | undefined>;
  updateApplication(id: string, updates: Partial<InsertApplication>): Promise<Application>;
  
  // Chat operations
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatHistory(userId: string, limit?: number): Promise<ChatMessage[]>;
}

export class MemStorage implements IStorage {
  private users = new Map<string, User>();
  private usersByEmail = new Map<string, User>();
  private challenges = new Map<string, Challenge>();
  private solutions = new Map<string, Solution>();
  private reviews = new Map<string, Review>();
  private applications = new Map<string, Application>();
  private chatMessages = new Map<string, ChatMessage>();

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed xTech challenges
    const xTechHumanoid: Challenge = {
      id: "xtech-humanoid-2025",
      title: "xTechHumanoid",
      description: "The U.S. Army seeks transformative humanoid technologies to enhance warfighter survivability, sustain combat power, and operate in complex environments. Focus: Prototype militarized humanoids and subsystems like AI, sensors, power systems.",
      type: "xtech",
      status: "open",
      phases: [
        {
          name: "Phase 1",
          description: "Concept White Paper",
          requirements: "5-page paper + optional 3-5 min video",
          prize: "$25,000 each (up to 10 winners)"
        },
        {
          name: "Phase 2", 
          description: "Final Experimentation Event",
          requirements: "Live demonstration",
          prize: "Up to 2 baseline winners at $75,000 each and up to 3 subsystem winners at $30,000 each"
        }
      ],
      prizePool: "490000.00",
      applicationDeadline: new Date("2025-10-01"),
      finalsDate: new Date("2026-08-01"),
      eligibilityRequirements: {
        organizations: ["Nonprofit/for-profit organizations", "Large/small", "Domestic/foreign"],
        requirements: ["Must have CAGE/NCAGE code", "Not federal/government entities"]
      },
      focusAreas: ["AI", "Sensors", "Power Systems", "Humanoid Robotics"],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const xTechSearch9: Challenge = {
      id: "xtech-search-9-2025",
      title: "xTechSearch 9", 
      description: "Open-topic competition for groundbreaking technologies with commercial traction. Focus areas include sensors, immersive/wearables, AI/ML, energy resiliency, and contested logistics. Excludes medical research areas.",
      type: "xtech",
      status: "active",
      phases: [
        {
          name: "Phase 1",
          description: "Concept White Paper",
          requirements: "White paper on technology, Army application, team",
          prize: "$5,000 each (up to 60 semi-finalists)"
        },
        {
          name: "Phase 2",
          description: "Final Pitch Event", 
          requirements: "Live pitch presentation",
          prize: "$25,000 each (up to 24 finalists)"
        },
        {
          name: "Phase 3",
          description: "Phase I Army SBIR Proposal",
          requirements: "SBIR proposal submission",
          prize: "Phase I SBIR up to $250,000 each"
        }
      ],
      prizePool: "900000.00",
      applicationDeadline: new Date("2025-12-15"),
      finalsDate: new Date("2025-09-19"),
      eligibilityRequirements: {
        organizations: ["U.S. small businesses"],
        requirements: ["<500 employees", ">50% U.S. owned/controlled by citizens/residents", "No duplicates with other federal funding"]
      },
      focusAreas: ["Sensors", "Immersive/Wearables", "AI/ML", "Energy Resiliency", "Contested Logistics"],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.challenges.set(xTechHumanoid.id, xTechHumanoid);
    this.challenges.set(xTechSearch9.id, xTechSearch9);
    
    // Initialize solutions
    this.initializeSolutions();
    this.initializeReviews();
  }

  private initializeSolutions() {
    const solutions = [
      // Mission Command Solutions (8 solutions)
      {
        id: "mc-001",
        vendorId: "vendor-001",
        title: "AI-Powered Command Decision Support System",
        description: "Advanced artificial intelligence system that analyzes battlefield data in real-time to provide commanders with tactical recommendations, threat assessments, and resource allocation suggestions. Integrates with existing command and control systems to enhance decision-making speed and accuracy.",
        trl: 7,
        natoCompatible: true,
        securityCleared: true,
        capabilityAreas: ["Mission Command"],
        procurements: [
          {
            unit: "1st Armored Division",
            contactName: "COL Sarah Mitchell",
            contactEmail: "sarah.mitchell@army.mil",
            contractValue: "$2.4M",
            deploymentDate: "2023-08-15"
          },
          {
            unit: "173rd Airborne Brigade",
            contactName: "LTC James Rodriguez",
            contactEmail: "james.rodriguez@army.mil",
            contractValue: "$1.8M",
            deploymentDate: "2024-01-10"
          }
        ],
        status: "awardable",
        createdAt: new Date('2024-11-15'),
        updatedAt: new Date('2024-11-15')
      },
      {
        id: "mc-002", 
        vendorId: "vendor-002",
        title: "Secure Tactical Communications Network",
        description: "Next-generation encrypted communication system enabling secure voice, data, and video transmission across distributed military units. Features quantum-resistant encryption and mesh networking capabilities for reliable communication in contested environments.",
        trl: 6,
        natoCompatible: true,
        securityCleared: true,
        capabilityAreas: ["Mission Command"],
        procurements: [
          {
            unit: "82nd Airborne Division",
            contactName: "MAJ Lisa Thompson",
            contactEmail: "lisa.thompson@army.mil",
            contractValue: "$5.2M",
            deploymentDate: "2024-03-20"
          }
        ],
        status: "under_review",
        createdAt: new Date('2024-11-20'),
        updatedAt: new Date('2024-11-20')
      },
      {
        id: "mc-003",
        vendorId: "vendor-003", 
        title: "Digital Battle Management System",
        description: "Comprehensive digital platform for battle management that provides real-time situational awareness, force tracking, and mission planning capabilities. Integrates multiple data sources to create a unified operational picture for commanders at all levels.",
        trl: 8,
        natoCompatible: true,
        securityCleared: false,
        capabilityAreas: ["Mission Command"],
        status: "submitted",
        createdAt: new Date('2024-12-01'),
        updatedAt: new Date('2024-12-01')
      },
      {
        id: "mc-004",
        vendorId: "vendor-004",
        title: "Commander's Intent Analysis Tool",
        description: "AI-driven system that analyzes and disseminates commander's intent throughout the chain of command, ensuring clear understanding and alignment of mission objectives across all subordinate units.",
        trl: 5,
        natoCompatible: false,
        securityCleared: true,
        capabilityAreas: ["Mission Command"],
        status: "awardable",
        createdAt: new Date('2024-11-10'),
        updatedAt: new Date('2024-11-10')
      },
      {
        id: "mc-005",
        vendorId: "vendor-005",
        title: "Multi-Domain Command Center",
        description: "Integrated command center solution that enables coordination across land, air, sea, space, and cyber domains. Provides unified interface for multi-domain operations planning and execution.",
        trl: 6,
        natoCompatible: true,
        securityCleared: true,
        capabilityAreas: ["Mission Command"],
        status: "under_review",
        createdAt: new Date('2024-11-25'),
        updatedAt: new Date('2024-11-25')
      },
      {
        id: "mc-006",
        vendorId: "vendor-006",
        title: "Distributed Leadership Platform",
        description: "Cloud-based platform enabling distributed leadership and decision-making across geographically separated units. Features mission tracking, resource sharing, and collaborative planning tools.",
        trl: 7,
        natoCompatible: true,
        securityCleared: false,
        capabilityAreas: ["Mission Command"],
        status: "submitted",
        createdAt: new Date('2024-12-05'),
        updatedAt: new Date('2024-12-05')
      },
      {
        id: "mc-007",
        vendorId: "vendor-007",
        title: "Real-Time Intelligence Fusion System",
        description: "Advanced system that fuses intelligence from multiple sources (HUMINT, SIGINT, GEOINT) and presents actionable insights to commanders through intuitive dashboards and alerts.",
        trl: 8,
        natoCompatible: true,
        securityCleared: true,
        capabilityAreas: ["Mission Command", "Intelligence"],
        status: "awardable",
        createdAt: new Date('2024-11-08'),
        updatedAt: new Date('2024-11-08')
      },
      {
        id: "mc-008",
        vendorId: "vendor-008",
        title: "Mission Command Training Simulator",
        description: "Virtual reality-based training system for command staff, providing realistic scenarios for practicing decision-making, communication protocols, and crisis management in simulated environments.",
        trl: 7,
        natoCompatible: false,
        securityCleared: false,
        capabilityAreas: ["Mission Command"],
        status: "under_review",
        createdAt: new Date('2024-11-30'),
        updatedAt: new Date('2024-11-30')
      },

      // Movement and Maneuver Solutions (8 solutions)
      {
        id: "mm-001",
        vendorId: "vendor-009",
        title: "Autonomous Ground Vehicle Squadron",
        description: "Fleet of autonomous ground vehicles capable of reconnaissance, supply transport, and tactical support operations. Features AI-driven navigation, obstacle avoidance, and mission execution capabilities.",
        trl: 6,
        natoCompatible: true,
        securityCleared: true,
        capabilityAreas: ["Movement and Maneuver"],
        procurements: [
          {
            unit: "3rd Infantry Division",
            contactName: "COL Michael Davis",
            contactEmail: "michael.davis@army.mil",
            contractValue: "$12.5M",
            deploymentDate: "2023-11-30"
          },
          {
            unit: "10th Mountain Division",
            contactName: "LTC Jennifer Parker",
            contactEmail: "jennifer.parker@army.mil",
            contractValue: "$8.7M",
            deploymentDate: "2024-02-14"
          }
        ],
        status: "awardable",
        createdAt: new Date('2024-11-12'),
        updatedAt: new Date('2024-11-12')
      },
      {
        id: "mm-002",
        vendorId: "vendor-010",
        title: "Enhanced Infantry Fighting Vehicle",
        description: "Next-generation infantry fighting vehicle with improved armor protection, advanced fire control systems, and integrated battlefield management capabilities. Designed for multi-domain operations.",
        trl: 8,
        natoCompatible: true,
        securityCleared: true,
        capabilityAreas: ["Movement and Maneuver", "Protection"],
        status: "under_review",
        createdAt: new Date('2024-11-18'),
        updatedAt: new Date('2024-11-18')
      },
      {
        id: "mm-003",
        vendorId: "vendor-011",
        title: "Air Assault Planning System", 
        description: "Comprehensive planning system for air assault operations, including route optimization, landing zone analysis, and coordination with aviation assets. Integrates weather and threat data for mission planning.",
        trl: 7,
        natoCompatible: true,
        securityCleared: false,
        capabilityAreas: ["Movement and Maneuver"],
        status: "submitted",
        createdAt: new Date('2024-12-03'),
        updatedAt: new Date('2024-12-03')
      },
      {
        id: "mm-004",
        vendorId: "vendor-012",
        title: "Tactical Mobility Enhancement Suite",
        description: "Modular enhancement package for existing military vehicles, providing improved mobility, survivability, and tactical capabilities through advanced suspension, armor, and sensor systems.",
        trl: 6,
        natoCompatible: false,
        securityCleared: true,
        capabilityAreas: ["Movement and Maneuver"],
        status: "awardable",
        createdAt: new Date('2024-11-22'),
        updatedAt: new Date('2024-11-22')
      },
      {
        id: "mm-005",
        vendorId: "vendor-013",
        title: "Urban Operations Support Platform",
        description: "Specialized platform designed for urban warfare operations, featuring compact design, enhanced situational awareness, and integration with dismounted infantry units for coordinated urban combat.",
        trl: 5,
        natoCompatible: true,
        securityCleared: true,
        capabilityAreas: ["Movement and Maneuver"],
        status: "under_review",
        createdAt: new Date('2024-11-28'),
        updatedAt: new Date('2024-11-28')
      },
      {
        id: "mm-006",
        vendorId: "vendor-014",
        title: "Rapid Deployment Bridge System",
        description: "Deployable bridge system for rapid river crossing and obstacle breaching operations. Features lightweight materials, quick deployment mechanisms, and high load capacity for heavy military vehicles.",
        trl: 8,
        natoCompatible: true,
        securityCleared: false,
        capabilityAreas: ["Movement and Maneuver"],
        status: "submitted",
        createdAt: new Date('2024-12-07'),
        updatedAt: new Date('2024-12-07')
      },
      {
        id: "mm-007",
        vendorId: "vendor-015",
        title: "Adaptive Camouflage Technology",
        description: "Advanced camouflage system that adapts to environmental conditions in real-time, providing enhanced concealment for personnel and vehicles across multiple terrains and lighting conditions.",
        trl: 4,
        natoCompatible: true,
        securityCleared: true,
        capabilityAreas: ["Movement and Maneuver", "Protection"],
        status: "awardable",
        createdAt: new Date('2024-11-05'),
        updatedAt: new Date('2024-11-05')
      },
      {
        id: "mm-008",
        vendorId: "vendor-016",
        title: "Formation Movement Optimization System",
        description: "AI-powered system for optimizing military formation movements, considering terrain, threats, and mission objectives to determine optimal routes and formations for unit movement.",
        trl: 6,
        natoCompatible: false,
        securityCleared: false,
        capabilityAreas: ["Movement and Maneuver"],
        status: "under_review",
        createdAt: new Date('2024-12-02'),
        updatedAt: new Date('2024-12-02')
      },

      // Intelligence Solutions (8 solutions)
      {
        id: "int-001",
        vendorId: "vendor-017",
        title: "Multi-Spectral Reconnaissance Drone",
        description: "Advanced unmanned aerial vehicle equipped with multi-spectral imaging, SIGINT collection, and real-time data transmission capabilities for comprehensive battlefield intelligence gathering.",
        trl: 7,
        natoCompatible: true,
        securityCleared: true,
        capabilityAreas: ["Intelligence"],
        status: "awardable",
        createdAt: new Date('2024-11-14'),
        updatedAt: new Date('2024-11-14')
      },
      {
        id: "int-002",
        vendorId: "vendor-018",
        title: "AI-Powered Threat Detection System",
        description: "Machine learning system that analyzes multiple intelligence streams to identify and predict potential threats, providing early warning capabilities and threat assessment reports.",
        trl: 6,
        natoCompatible: true,
        securityCleared: true,
        capabilityAreas: ["Intelligence"],
        status: "under_review",
        createdAt: new Date('2024-11-21'),
        updatedAt: new Date('2024-11-21')
      },
      {
        id: "int-003",
        vendorId: "vendor-019",
        title: "Biometric Intelligence Collection System",
        description: "Portable system for collecting and analyzing biometric data including facial recognition, fingerprints, and iris scans for personnel identification and tracking in operational environments.",
        trl: 8,
        natoCompatible: false,
        securityCleared: true,
        capabilityAreas: ["Intelligence"],
        status: "submitted",
        createdAt: new Date('2024-12-04'),
        updatedAt: new Date('2024-12-04')
      },
      {
        id: "int-004",
        vendorId: "vendor-020",
        title: "Signals Intelligence Processing Platform",
        description: "High-performance computing platform for processing and analyzing signals intelligence data, featuring advanced algorithms for pattern recognition and anomaly detection.",
        trl: 7,
        natoCompatible: true,
        securityCleared: true,
        capabilityAreas: ["Intelligence"],
        status: "awardable",
        createdAt: new Date('2024-11-09'),
        updatedAt: new Date('2024-11-09')
      },
      {
        id: "int-005",
        vendorId: "vendor-021",
        title: "Geospatial Intelligence Analysis Tool",
        description: "Advanced geospatial analysis software that processes satellite imagery and map data to provide terrain analysis, route planning, and environmental intelligence for mission planning.",
        trl: 8,
        natoCompatible: true,
        securityCleared: false,
        capabilityAreas: ["Intelligence"],
        status: "under_review",
        createdAt: new Date('2024-11-26'),
        updatedAt: new Date('2024-11-26')
      },
      {
        id: "int-006",
        vendorId: "vendor-022",
        title: "Human Intelligence Support Network",
        description: "Secure platform for coordinating human intelligence operations, featuring encrypted communications, source management, and intelligence reporting capabilities.",
        trl: 5,
        natoCompatible: true,
        securityCleared: true,
        capabilityAreas: ["Intelligence"],
        status: "submitted",
        createdAt: new Date('2024-12-06'),
        updatedAt: new Date('2024-12-06')
      },
      {
        id: "int-007",
        vendorId: "vendor-023",
        title: "Predictive Intelligence Analytics",
        description: "Machine learning system that analyzes historical and current intelligence data to predict enemy movements, capabilities, and intentions, providing strategic and tactical intelligence forecasts.",
        trl: 6,
        natoCompatible: false,
        securityCleared: true,
        capabilityAreas: ["Intelligence"],
        status: "awardable",
        createdAt: new Date('2024-11-07'),
        updatedAt: new Date('2024-11-07')
      },
      {
        id: "int-008",
        vendorId: "vendor-024",
        title: "Cyber Intelligence Collection System",
        description: "Specialized system for collecting and analyzing cyber intelligence, including network traffic analysis, malware detection, and cyber threat attribution capabilities.",
        trl: 7,
        natoCompatible: true,
        securityCleared: true,
        capabilityAreas: ["Intelligence", "Protection"],
        status: "under_review",
        createdAt: new Date('2024-12-01'),
        updatedAt: new Date('2024-12-01')
      },

      // Fires Solutions (8 solutions)
      {
        id: "fir-001",
        vendorId: "vendor-025",
        title: "Precision Artillery Fire Control System",
        description: "Advanced fire control system for artillery units featuring GPS-guided targeting, real-time ballistic calculations, and integration with forward observer networks for precision fires.",
        trl: 8,
        natoCompatible: true,
        securityCleared: true,
        capabilityAreas: ["Fires"],
        status: "awardable",
        createdAt: new Date('2024-11-16'),
        updatedAt: new Date('2024-11-16')
      },
      {
        id: "fir-002",
        vendorId: "vendor-026",
        title: "Loitering Munition System",
        description: "Autonomous loitering munition capable of target identification, tracking, and engagement. Features AI-powered target recognition and man-in-the-loop decision making for precision strikes.",
        trl: 6,
        natoCompatible: true,
        securityCleared: true,
        capabilityAreas: ["Fires"],
        status: "under_review",
        createdAt: new Date('2024-11-23'),
        updatedAt: new Date('2024-11-23')
      },
      {
        id: "fir-003",
        vendorId: "vendor-027",
        title: "Multi-Role Missile Defense System",
        description: "Integrated missile defense system capable of engaging multiple threat types including cruise missiles, ballistic missiles, and unmanned aerial vehicles with high probability of intercept.",
        trl: 7,
        natoCompatible: true,
        securityCleared: true,
        capabilityAreas: ["Fires", "Protection"],
        status: "submitted",
        createdAt: new Date('2024-12-05'),
        updatedAt: new Date('2024-12-05')
      },
      {
        id: "fir-004",
        vendorId: "vendor-028",
        title: "Electronic Warfare Support System",
        description: "Comprehensive electronic warfare platform providing jamming, electronic attack, and electronic protection capabilities across multiple frequency bands for battlefield spectrum dominance.",
        trl: 7,
        natoCompatible: false,
        securityCleared: true,
        capabilityAreas: ["Fires"],
        status: "awardable",
        createdAt: new Date('2024-11-11'),
        updatedAt: new Date('2024-11-11')
      },
      {
        id: "fir-005",
        vendorId: "vendor-029",
        title: "Mortar Fire Direction Center",
        description: "Digital fire direction center for mortar units featuring automated firing solutions, target tracking, and coordination with higher-level fire support elements for effective indirect fire support.",
        trl: 8,
        natoCompatible: true,
        securityCleared: false,
        capabilityAreas: ["Fires"],
        status: "under_review",
        createdAt: new Date('2024-11-29'),
        updatedAt: new Date('2024-11-29')
      },
      {
        id: "fir-006",
        vendorId: "vendor-030",
        title: "Counter-Battery Radar System",
        description: "Advanced radar system for detecting and tracking incoming artillery, mortar, and rocket fire, providing rapid location of enemy firing positions for counter-battery operations.",
        trl: 8,
        natoCompatible: true,
        securityCleared: true,
        capabilityAreas: ["Fires", "Intelligence"],
        status: "submitted",
        createdAt: new Date('2024-12-08'),
        updatedAt: new Date('2024-12-08')
      },
      {
        id: "fir-007",
        vendorId: "vendor-031",
        title: "Directed Energy Weapon Platform",
        description: "High-energy laser system for engaging unmanned aerial systems, rockets, and mortars. Features rapid engagement capability and minimal logistics footprint for forward deployment.",
        trl: 5,
        natoCompatible: true,
        securityCleared: true,
        capabilityAreas: ["Fires"],
        status: "awardable",
        createdAt: new Date('2024-11-06'),
        updatedAt: new Date('2024-11-06')
      },
      {
        id: "fir-008",
        vendorId: "vendor-032",
        title: "Close Air Support Coordination System",
        description: "Digital system for coordinating close air support operations, featuring target designation, aircraft tracking, and deconfliction capabilities for safe and effective air-to-ground operations.",
        trl: 7,
        natoCompatible: true,
        securityCleared: false,
        capabilityAreas: ["Fires"],
        status: "under_review",
        createdAt: new Date('2024-12-03'),
        updatedAt: new Date('2024-12-03')
      },

      // Sustainment Solutions (7 solutions)
      {
        id: "sus-001",
        vendorId: "vendor-033",
        title: "Autonomous Supply Convoy System",
        description: "Fleet of autonomous vehicles for supply convoy operations, featuring AI-powered navigation, threat detection, and cargo management systems for safe and efficient logistics operations.",
        trl: 6,
        natoCompatible: true,
        securityCleared: true,
        capabilityAreas: ["Sustainment"],
        status: "awardable",
        createdAt: new Date('2024-11-17'),
        updatedAt: new Date('2024-11-17')
      },
      {
        id: "sus-002",
        vendorId: "vendor-034",
        title: "Predictive Maintenance Platform",
        description: "AI-driven predictive maintenance system that analyzes equipment data to predict failures, optimize maintenance schedules, and reduce logistics burden through improved equipment reliability.",
        trl: 7,
        natoCompatible: true,
        securityCleared: false,
        capabilityAreas: ["Sustainment"],
        status: "under_review",
        createdAt: new Date('2024-11-24'),
        updatedAt: new Date('2024-11-24')
      },
      {
        id: "sus-003",
        vendorId: "vendor-035",
        title: "Expeditionary Medical Treatment Facility",
        description: "Rapidly deployable medical facility with advanced surgical capabilities, telemedicine support, and integrated patient management systems for forward area medical treatment.",
        trl: 8,
        natoCompatible: true,
        securityCleared: true,
        capabilityAreas: ["Sustainment"],
        status: "submitted",
        createdAt: new Date('2024-12-06'),
        updatedAt: new Date('2024-12-06')
      },
      {
        id: "sus-004",
        vendorId: "vendor-036",
        title: "Fuel Distribution Management System",
        description: "Automated system for managing fuel distribution across military operations, featuring real-time inventory tracking, consumption forecasting, and optimized delivery scheduling.",
        trl: 7,
        natoCompatible: false,
        securityCleared: true,
        capabilityAreas: ["Sustainment"],
        status: "awardable",
        createdAt: new Date('2024-11-13'),
        updatedAt: new Date('2024-11-13')
      },
      {
        id: "sus-005",
        vendorId: "vendor-037",
        title: "Water Purification and Distribution System",
        description: "Portable water purification system capable of producing potable water from various sources, featuring advanced filtration, UV sterilization, and distribution capabilities for deployed forces.",
        trl: 8,
        natoCompatible: true,
        securityCleared: false,
        capabilityAreas: ["Sustainment"],
        status: "under_review",
        createdAt: new Date('2024-11-30'),
        updatedAt: new Date('2024-11-30')
      },
      {
        id: "sus-006",
        vendorId: "vendor-038",
        title: "Battlefield Casualty Evacuation System",
        description: "Integrated system for battlefield casualty evacuation featuring automated patient monitoring, rapid extraction vehicles, and coordination with medical facilities for optimized patient care.",
        trl: 6,
        natoCompatible: true,
        securityCleared: true,
        capabilityAreas: ["Sustainment"],
        status: "submitted",
        createdAt: new Date('2024-12-09'),
        updatedAt: new Date('2024-12-09')
      },
      {
        id: "sus-007",
        vendorId: "vendor-039",
        title: "Supply Chain Visibility Platform",
        description: "Comprehensive supply chain management platform providing end-to-end visibility of logistics operations, inventory management, and demand forecasting for military supply chains.",
        trl: 7,
        natoCompatible: true,
        securityCleared: true,
        capabilityAreas: ["Sustainment"],
        status: "awardable",
        createdAt: new Date('2024-11-08'),
        updatedAt: new Date('2024-11-08')
      },

      // Protection Solutions (7 solutions)
      {
        id: "pro-001",
        vendorId: "vendor-040",
        title: "Integrated Air Defense System",
        description: "Multi-layered air defense system capable of detecting and engaging various aerial threats including aircraft, helicopters, unmanned systems, and missiles through coordinated sensor and weapon systems.",
        trl: 8,
        natoCompatible: true,
        securityCleared: true,
        capabilityAreas: ["Protection"],
        status: "awardable",
        createdAt: new Date('2024-11-19'),
        updatedAt: new Date('2024-11-19')
      },
      {
        id: "pro-002",
        vendorId: "vendor-041",
        title: "Cybersecurity Operations Center",
        description: "Comprehensive cybersecurity platform providing network monitoring, threat detection, incident response, and cyber defense capabilities for military networks and systems.",
        trl: 7,
        natoCompatible: true,
        securityCleared: true,
        capabilityAreas: ["Protection"],
        status: "under_review",
        createdAt: new Date('2024-11-25'),
        updatedAt: new Date('2024-11-25')
      },
      {
        id: "pro-003",
        vendorId: "vendor-042",
        title: "CBRN Detection and Protection Suite",
        description: "Advanced system for detecting chemical, biological, radiological, and nuclear threats, featuring rapid identification capabilities and integrated protection measures for personnel and equipment.",
        trl: 6,
        natoCompatible: true,
        securityCleared: true,
        capabilityAreas: ["Protection"],
        status: "submitted",
        createdAt: new Date('2024-12-07'),
        updatedAt: new Date('2024-12-07')
      },
      {
        id: "pro-004",
        vendorId: "vendor-043",
        title: "Force Protection Barrier System",
        description: "Rapidly deployable barrier system for base protection and perimeter security, featuring modular design, blast resistance, and integrated sensor networks for enhanced security.",
        trl: 8,
        natoCompatible: false,
        securityCleared: false,
        capabilityAreas: ["Protection"],
        status: "awardable",
        createdAt: new Date('2024-11-12'),
        updatedAt: new Date('2024-11-12')
      },
      {
        id: "pro-005",
        vendorId: "vendor-044",
        title: "Counter-Drone Defense System",
        description: "Multi-capability system for detecting, tracking, and neutralizing hostile unmanned aerial systems through kinetic and non-kinetic means including jamming and directed energy weapons.",
        trl: 7,
        natoCompatible: true,
        securityCleared: true,
        capabilityAreas: ["Protection"],
        status: "under_review",
        createdAt: new Date('2024-12-01'),
        updatedAt: new Date('2024-12-01')
      },
      {
        id: "pro-006",
        vendorId: "vendor-045",
        title: "Personnel Armor Enhancement System",
        description: "Next-generation body armor system featuring lightweight materials, enhanced ballistic protection, and integrated sensors for health monitoring and communication capabilities.",
        trl: 6,
        natoCompatible: true,
        securityCleared: false,
        capabilityAreas: ["Protection"],
        status: "submitted",
        createdAt: new Date('2024-12-10'),
        updatedAt: new Date('2024-12-10')
      },
      {
        id: "pro-007",
        vendorId: "vendor-046",
        title: "Command Post Protection System",
        description: "Comprehensive protection system for command posts and critical infrastructure, featuring electromagnetic pulse protection, physical security measures, and continuity of operations capabilities.",
        trl: 7,
        natoCompatible: true,
        securityCleared: true,
        capabilityAreas: ["Protection", "Mission Command"],
        status: "awardable",
        createdAt: new Date('2024-11-04'),
        updatedAt: new Date('2024-11-04')
      },

      // Additional Logistics Solutions
      {
        id: "sus-009",
        vendorId: "vendor-047",
        title: "AI-Powered Supply Chain Optimization Platform",
        description: "Advanced logistics management system using machine learning to predict demand, optimize routes, and automate resupply operations. Features real-time tracking, predictive analytics, and integration with existing logistics networks.",
        trl: 8,
        natoCompatible: true,
        securityCleared: true,
        capabilityAreas: ["Sustainment"],
        status: "awardable",
        createdAt: new Date('2024-11-18'),
        updatedAt: new Date('2024-11-18')
      },
      {
        id: "sus-010",
        vendorId: "vendor-048",
        title: "Autonomous Logistics Robot Fleet",
        description: "Fleet of autonomous robots for warehouse management, inventory tracking, and last-mile delivery in forward operating bases. Features collaborative swarm intelligence and adaptive mission planning.",
        trl: 6,
        natoCompatible: true,
        securityCleared: false,
        capabilityAreas: ["Sustainment"],
        status: "under_review",
        createdAt: new Date('2024-12-02'),
        updatedAt: new Date('2024-12-02')
      },
      {
        id: "sus-011",
        vendorId: "vendor-049",
        title: "Predictive Maintenance Analytics System",
        description: "IoT-based system for monitoring equipment health and predicting maintenance needs. Reduces downtime through early failure detection and optimizes maintenance schedules to improve readiness.",
        trl: 7,
        natoCompatible: true,
        securityCleared: true,
        capabilityAreas: ["Sustainment"],
        status: "awardable",
        createdAt: new Date('2024-11-25'),
        updatedAt: new Date('2024-11-25')
      },
      {
        id: "sus-012",
        vendorId: "vendor-050",
        title: "Forward Operating Base Energy Management",
        description: "Integrated renewable energy system for forward operating bases featuring solar panels, wind generation, and smart grid management to reduce fuel dependence and improve energy security.",
        trl: 8,
        natoCompatible: true,
        securityCleared: false,
        capabilityAreas: ["Sustainment"],
        status: "submitted",
        createdAt: new Date('2024-12-08'),
        updatedAt: new Date('2024-12-08')
      },

      // Additional Counter-UAS Solutions
      {
        id: "pro-008",
        vendorId: "vendor-051",
        title: "Multi-Layered Counter-UAS Defense Network",
        description: "Comprehensive counter-drone system featuring radar detection, RF jamming, kinetic interceptors, and directed energy weapons. Provides 360-degree protection for critical assets and personnel.",
        trl: 7,
        natoCompatible: true,
        securityCleared: true,
        capabilityAreas: ["Protection"],
        status: "awardable",
        createdAt: new Date('2024-11-22'),
        updatedAt: new Date('2024-11-22')
      },
      {
        id: "pro-009",
        vendorId: "vendor-052",
        title: "Portable Counter-Drone Rifle System",
        description: "Man-portable counter-UAS device that can detect, track, and neutralize small drones using directed RF energy. Lightweight design for infantry units operating in urban environments.",
        trl: 8,
        natoCompatible: true,
        securityCleared: true,
        capabilityAreas: ["Protection"],
        status: "under_review",
        createdAt: new Date('2024-12-01'),
        updatedAt: new Date('2024-12-01')
      },
      {
        id: "pro-010",
        vendorId: "vendor-053",
        title: "Drone Swarm Detection and Mitigation",
        description: "Advanced system designed to detect and counter drone swarms using AI-powered pattern recognition, coordinated jamming, and kinetic interception. Capable of engaging multiple targets simultaneously.",
        trl: 6,
        natoCompatible: true,
        securityCleared: true,
        capabilityAreas: ["Protection"],
        status: "submitted",
        createdAt: new Date('2024-11-30'),
        updatedAt: new Date('2024-11-30')
      },
      {
        id: "pro-011",
        vendorId: "vendor-054",
        title: "Counter-UAS Command and Control Center",
        description: "Centralized command system for coordinating multiple counter-drone assets across a theater. Features threat assessment, asset allocation, and real-time engagement coordination capabilities.",
        trl: 7,
        natoCompatible: true,
        securityCleared: true,
        capabilityAreas: ["Protection", "Mission Command"],
        status: "awardable",
        createdAt: new Date('2024-11-28'),
        updatedAt: new Date('2024-11-28')
      }
    ];

    // Add all solutions to storage
    solutions.forEach(solution => {
      this.solutions.set(solution.id, solution as Solution);
    });
  }

  private initializeReviews() {
    const reviews = [
      // Reviews for AI-Powered Command Decision Support System (mc-001)
      {
        id: "review-001",
        solutionId: "mc-001",
        reviewerId: "gov-001",
        rating: 4,
        title: "Excellent Decision Support Capabilities",
        description: "We deployed this system with the 1st Armored Division and saw immediate improvements in decision-making speed and accuracy. The AI recommendations proved highly valuable during training exercises, reducing tactical decision time by approximately 40%. Integration with existing command systems was seamless.",
        readinessScore: 8,
        interoperabilityScore: 9,
        supportScore: 7,
        fieldTested: true,
        testDate: new Date('2023-09-15'),
        helpfulVotes: 12,
        totalVotes: 14,
        createdAt: new Date('2023-10-01'),
        updatedAt: new Date('2023-10-01')
      },
      {
        id: "review-002",
        solutionId: "mc-001",
        reviewerId: "gov-002",
        rating: 5,
        title: "Game-Changing Technology for Brigade Operations",
        description: "Outstanding performance during deployment with 173rd Airborne Brigade. The system's ability to process and correlate multiple intelligence streams in real-time is impressive. Our commanders report significantly enhanced situational awareness and more confident decision-making in complex scenarios.",
        readinessScore: 9,
        interoperabilityScore: 8,
        supportScore: 9,
        fieldTested: true,
        testDate: new Date('2024-02-10'),
        helpfulVotes: 18,
        totalVotes: 20,
        createdAt: new Date('2024-02-25'),
        updatedAt: new Date('2024-02-25')
      },
      // Reviews for Secure Tactical Communications Network (mc-002)
      {
        id: "review-003",
        solutionId: "mc-002",
        reviewerId: "gov-003",
        rating: 4,
        title: "Reliable Communications in Contested Environment",
        description: "Deployed with 82nd Airborne Division during joint exercises. The quantum-resistant encryption and mesh networking capabilities performed exceptionally well in simulated contested environments. Voice clarity and data transmission reliability exceeded expectations.",
        readinessScore: 8,
        interoperabilityScore: 7,
        supportScore: 8,
        fieldTested: true,
        testDate: new Date('2024-04-15'),
        helpfulVotes: 9,
        totalVotes: 11,
        createdAt: new Date('2024-04-20'),
        updatedAt: new Date('2024-04-20')
      },
      // Reviews for Autonomous Ground Vehicle Squadron (mm-001)
      {
        id: "review-004",
        solutionId: "mm-001",
        reviewerId: "gov-004",
        rating: 5,
        title: "Revolutionary Autonomous Capabilities",
        description: "The AGV squadron deployment with 3rd Infantry Division exceeded all expectations. Navigation in complex terrain, obstacle avoidance, and mission execution capabilities are truly impressive. Reduced personnel risk while maintaining operational effectiveness. Highly recommend for tactical support operations.",
        readinessScore: 9,
        interoperabilityScore: 8,
        supportScore: 9,
        fieldTested: true,
        testDate: new Date('2024-01-20'),
        helpfulVotes: 25,
        totalVotes: 27,
        createdAt: new Date('2024-02-05'),
        updatedAt: new Date('2024-02-05')
      },
      {
        id: "review-005",
        solutionId: "mm-001",
        reviewerId: "gov-005",
        rating: 4,
        title: "Solid Performance in Mountain Operations",
        description: "Deployed with 10th Mountain Division for terrain testing. Vehicles performed well in challenging mountain conditions, though some software refinements needed for extreme weather operations. Overall excellent value and capability for tactical supply missions.",
        readinessScore: 7,
        interoperabilityScore: 8,
        supportScore: 7,
        fieldTested: true,
        testDate: new Date('2024-03-10'),
        helpfulVotes: 8,
        totalVotes: 10,
        createdAt: new Date('2024-03-25'),
        updatedAt: new Date('2024-03-25')
      },
      // Additional reviews for existing solutions
      {
        id: "review-006",
        solutionId: "mc-002",
        reviewerId: "gov-006",
        rating: 5,
        title: "Outstanding Encryption Performance",
        description: "Tested this communication system extensively with 101st Airborne Division. The quantum-resistant encryption held up against advanced electronic warfare scenarios. Zero communication breaches during 30-day field exercise. Absolutely mission-critical capability.",
        readinessScore: 9,
        interoperabilityScore: 9,
        supportScore: 8,
        fieldTested: true,
        testDate: new Date('2024-05-22'),
        helpfulVotes: 22,
        totalVotes: 24,
        createdAt: new Date('2024-06-01'),
        updatedAt: new Date('2024-06-01')
      },
      {
        id: "review-007",
        solutionId: "mc-003",
        reviewerId: "gov-007",
        rating: 4,
        title: "Excellent Situational Awareness Enhancement",
        description: "Digital Battle Management System proved invaluable during joint operations with 4th Infantry Division. Real-time battlefield visualization and unit tracking significantly improved coordination. Minor issues with battery life need addressing but overall exceptional performance.",
        readinessScore: 8,
        interoperabilityScore: 9,
        supportScore: 7,
        fieldTested: true,
        testDate: new Date('2024-04-10'),
        helpfulVotes: 15,
        totalVotes: 17,
        createdAt: new Date('2024-04-25'),
        updatedAt: new Date('2024-04-25')
      },
      // Reviews for new logistics solutions
      {
        id: "review-008",
        solutionId: "sus-009",
        reviewerId: "gov-008",
        rating: 5,
        title: "Revolutionary Supply Chain Intelligence",
        description: "AI Supply Chain Optimization Platform transformed our logistics operations with 1st Cavalry Division. Reduced supply delivery time by 35% and improved inventory accuracy by 90%. The predictive analytics prevented three potential shortages during recent exercises.",
        readinessScore: 9,
        interoperabilityScore: 8,
        supportScore: 9,
        fieldTested: true,
        testDate: new Date('2024-08-15'),
        helpfulVotes: 28,
        totalVotes: 30,
        createdAt: new Date('2024-09-01'),
        updatedAt: new Date('2024-09-01')
      },
      {
        id: "review-009",
        solutionId: "sus-011",
        reviewerId: "gov-009",
        rating: 4,
        title: "Impressive Predictive Capabilities",
        description: "Deployed Predictive Maintenance Analytics with 2nd Armored Division maintenance battalion. System correctly predicted 87% of equipment failures 48-72 hours in advance, allowing for proactive maintenance. Significantly improved readiness rates across our vehicle fleet.",
        readinessScore: 8,
        interoperabilityScore: 7,
        supportScore: 8,
        fieldTested: true,
        testDate: new Date('2024-07-20'),
        helpfulVotes: 19,
        totalVotes: 21,
        createdAt: new Date('2024-08-05'),
        updatedAt: new Date('2024-08-05')
      },
      // Reviews for new counter-UAS solutions
      {
        id: "review-010",
        solutionId: "pro-008",
        reviewerId: "gov-010",
        rating: 5,
        title: "Comprehensive Counter-Drone Protection",
        description: "Multi-Layered Counter-UAS Defense Network provided outstanding protection during recent joint exercises. Successfully engaged 95% of simulated drone threats across all approach vectors. Integration with existing air defense systems was seamless. Highly recommended for critical asset protection.",
        readinessScore: 9,
        interoperabilityScore: 9,
        supportScore: 8,
        fieldTested: true,
        testDate: new Date('2024-09-10'),
        helpfulVotes: 31,
        totalVotes: 33,
        createdAt: new Date('2024-09-25'),
        updatedAt: new Date('2024-09-25')
      },
      {
        id: "review-011",
        solutionId: "pro-009",
        reviewerId: "gov-011",
        rating: 4,
        title: "Effective Infantry Counter-Drone Tool",
        description: "Portable Counter-Drone Rifle proved highly effective during urban operations training with 3rd Infantry Regiment. Lightweight design allows for rapid deployment, successfully neutralized small UAS threats at ranges up to 400 meters. Easy to train soldiers on operation.",
        readinessScore: 8,
        interoperabilityScore: 7,
        supportScore: 9,
        fieldTested: true,
        testDate: new Date('2024-10-05'),
        helpfulVotes: 16,
        totalVotes: 18,
        createdAt: new Date('2024-10-20'),
        updatedAt: new Date('2024-10-20')
      },
      {
        id: "review-012",
        solutionId: "pro-005",
        reviewerId: "gov-012",
        rating: 5,
        title: "Outstanding Multi-Threat Protection",
        description: "Counter-Drone Defense System exceeded expectations during force protection evaluation with 25th Infantry Division. Engaged multiple simultaneous drone threats with 98% success rate. The kinetic and non-kinetic engagement options provide excellent tactical flexibility.",
        readinessScore: 9,
        interoperabilityScore: 8,
        supportScore: 9,
        fieldTested: true,
        testDate: new Date('2024-08-30'),
        helpfulVotes: 24,
        totalVotes: 26,
        createdAt: new Date('2024-09-15'),
        updatedAt: new Date('2024-09-15')
      },
      {
        id: "review-013",
        solutionId: "fir-001",
        reviewerId: "gov-013",
        rating: 4,
        title: "Precision Fire Control Excellence",
        description: "Artillery Fire Control System significantly improved targeting accuracy during training with 1st Artillery Regiment. GPS-guided targeting and real-time ballistic calculations reduced time to engage by 60%. Integration with forward observers was flawless.",
        readinessScore: 8,
        interoperabilityScore: 9,
        supportScore: 7,
        fieldTested: true,
        testDate: new Date('2024-06-15'),
        helpfulVotes: 20,
        totalVotes: 22,
        createdAt: new Date('2024-07-01'),
        updatedAt: new Date('2024-07-01')
      },
      {
        id: "review-014",
        solutionId: "mm-002",
        reviewerId: "gov-014",
        rating: 5,
        title: "Game-Changing Reconnaissance Platform",
        description: "Tactical Reconnaissance Drone Squadron provided unparalleled intelligence gathering capability during recent operations with 1st Reconnaissance Squadron. 12-hour endurance and stealth capabilities allowed for deep reconnaissance missions previously impossible.",
        readinessScore: 9,
        interoperabilityScore: 8,
        supportScore: 9,
        fieldTested: true,
        testDate: new Date('2024-05-10'),
        helpfulVotes: 27,
        totalVotes: 29,
        createdAt: new Date('2024-05-25'),
        updatedAt: new Date('2024-05-25')
      }
    ];

    // Add all reviews to storage
    reviews.forEach(review => {
      this.reviews.set(review.id, review as Review);
    });
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.usersByEmail.get(email.toLowerCase());
  }

  async createUser(userData: Omit<UpsertUser, 'id'> & { password: string; role: string }): Promise<User> {
    const user: User = {
      id: crypto.randomUUID(),
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      profileImageUrl: userData.profileImageUrl || null,
      role: userData.role,
      organization: userData.organization || null,
      uei: userData.uei || null,
      securityClearance: userData.securityClearance || null,
      contractingOfficer: userData.contractingOfficer || null,
      loginProvider: "local",
      password: userData.password,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.users.set(user.id, user);
    if (user.email) {
      this.usersByEmail.set(user.email.toLowerCase(), user);
    }
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = this.users.get(userData.id!);
    const user: User = {
      ...existingUser,
      ...userData,
      updatedAt: new Date(),
    } as User;
    
    this.users.set(user.id, user);
    if (user.email) {
      this.usersByEmail.set(user.email.toLowerCase(), user);
    }
    return user;
  }

  // Challenge operations
  async createChallenge(challengeData: InsertChallenge): Promise<Challenge> {
    const id = `challenge-${Date.now()}`;
    const challenge: Challenge = {
      ...challengeData,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.challenges.set(id, challenge);
    return challenge;
  }

  async getChallenges(filters?: { status?: string; type?: string }): Promise<Challenge[]> {
    let challengesList = Array.from(this.challenges.values());
    
    if (filters?.status) {
      challengesList = challengesList.filter(c => c.status === filters.status);
    }
    if (filters?.type) {
      challengesList = challengesList.filter(c => c.type === filters.type);
    }
    
    return challengesList;
  }

  async getChallenge(id: string): Promise<Challenge | undefined> {
    return this.challenges.get(id);
  }

  async updateChallenge(id: string, updates: Partial<InsertChallenge>): Promise<Challenge> {
    const existing = this.challenges.get(id);
    if (!existing) throw new Error("Challenge not found");
    
    const updated: Challenge = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.challenges.set(id, updated);
    return updated;
  }

  // Solution operations
  async createSolution(solutionData: InsertSolution): Promise<Solution> {
    const id = `solution-${Date.now()}`;
    const solution: Solution = {
      ...solutionData,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.solutions.set(id, solution);
    return solution;
  }

  async getSolutions(filters?: { 
    vendorId?: string; 
    status?: string; 
    trl?: number;
    natoCompatible?: boolean;
    securityCleared?: boolean;
    capabilityArea?: string;
  }): Promise<Solution[]> {
    let solutionsList = Array.from(this.solutions.values());
    
    if (filters?.vendorId) {
      solutionsList = solutionsList.filter(s => s.vendorId === filters.vendorId);
    }
    if (filters?.status) {
      solutionsList = solutionsList.filter(s => s.status === filters.status);
    }
    if (filters?.trl) {
      solutionsList = solutionsList.filter(s => s.trl === filters.trl);
    }
    if (filters?.natoCompatible !== undefined) {
      solutionsList = solutionsList.filter(s => s.natoCompatible === filters.natoCompatible);
    }
    if (filters?.securityCleared !== undefined) {
      solutionsList = solutionsList.filter(s => s.securityCleared === filters.securityCleared);
    }
    if (filters?.capabilityArea) {
      solutionsList = solutionsList.filter(s => 
        (s.capabilityAreas as string[])?.includes(filters.capabilityArea!)
      );
    }
    
    return solutionsList;
  }

  async getSolution(id: string): Promise<Solution | undefined> {
    return this.solutions.get(id);
  }

  async updateSolution(id: string, updates: Partial<InsertSolution>): Promise<Solution> {
    const existing = this.solutions.get(id);
    if (!existing) throw new Error("Solution not found");
    
    const updated: Solution = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.solutions.set(id, updated);
    return updated;
  }

  async searchSolutions(query: string): Promise<Solution[]> {
    const solutions = Array.from(this.solutions.values());
    const lowerQuery = query.toLowerCase();
    
    return solutions.filter(solution => 
      solution.title.toLowerCase().includes(lowerQuery) ||
      solution.description.toLowerCase().includes(lowerQuery) ||
      (solution.capabilityAreas as string[])?.some(area => 
        area.toLowerCase().includes(lowerQuery)
      ) ||
      solution.vendorId.toLowerCase().includes(lowerQuery)
    );
  }

  // Review operations
  async createReview(reviewData: InsertReview): Promise<Review> {
    const id = `review-${Date.now()}`;
    const review: Review = {
      ...reviewData,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.reviews.set(id, review);
    return review;
  }

  async getReviewsBySolution(solutionId: string): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(r => r.solutionId === solutionId);
  }

  async getReview(id: string): Promise<Review | undefined> {
    return this.reviews.get(id);
  }

  // Application operations
  async createApplication(applicationData: InsertApplication): Promise<Application> {
    const id = `application-${Date.now()}`;
    const application: Application = {
      ...applicationData,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.applications.set(id, application);
    return application;
  }

  async getApplications(filters?: { 
    challengeId?: string; 
    vendorId?: string; 
    status?: string;
  }): Promise<Application[]> {
    let applicationsList = Array.from(this.applications.values());
    
    if (filters?.challengeId) {
      applicationsList = applicationsList.filter(a => a.challengeId === filters.challengeId);
    }
    if (filters?.vendorId) {
      applicationsList = applicationsList.filter(a => a.vendorId === filters.vendorId);
    }
    if (filters?.status) {
      applicationsList = applicationsList.filter(a => a.status === filters.status);
    }
    
    return applicationsList;
  }

  async getApplication(id: string): Promise<Application | undefined> {
    return this.applications.get(id);
  }

  async updateApplication(id: string, updates: Partial<InsertApplication>): Promise<Application> {
    const existing = this.applications.get(id);
    if (!existing) throw new Error("Application not found");
    
    const updated: Application = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.applications.set(id, updated);
    return updated;
  }

  // Chat operations
  async createChatMessage(messageData: InsertChatMessage): Promise<ChatMessage> {
    const id = `message-${Date.now()}`;
    const message: ChatMessage = {
      ...messageData,
      id,
      createdAt: new Date(),
    };
    this.chatMessages.set(id, message);
    return message;
  }

  async getChatHistory(userId: string, limit: number = 50): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(m => m.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
