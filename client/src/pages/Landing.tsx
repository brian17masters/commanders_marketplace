import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AIChat from "@/components/AIChat";
import { AuthButtons } from "@/components/AuthButtons";
import logoImage from "@assets/image_1756341515234.png";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  Zap, 
  Users, 
  FileText, 
  Search, 
  Star,
  CheckCircle,
  MessageCircle,
  TrendingUp,
  Target,
  Layers,
  Loader2
} from "lucide-react";

interface CapabilityMatch {
  id: string;
  title: string;
  description: string;
  matchPercentage: number;
  relevanceExplanation: string;
  capabilityAreas: string[];
  trl: number;
  natoCompatible: boolean;
  securityCleared: boolean;
  reviews?: any[];
}

interface CapabilitySearchResult {
  matches: CapabilityMatch[];
  multiVendorScenario?: {
    description: string;
    recommendedCombinations: {
      primarySolution: string;
      supportingSolutions: string[];
      explanation: string;
    }[];
  };
  totalMatches: number;
}

export default function Landing() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [, setLocation] = useLocation();
  const [requirement, setRequirement] = useState("");
  const [searchResults, setSearchResults] = useState<CapabilitySearchResult | null>(null);
  const { toast } = useToast();
  
  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
  });

  const { data: challenges } = useQuery({
    queryKey: ["/api/challenges"],
  });

  const capabilitySearchMutation = useMutation({
    mutationFn: async (requirement: string) => {
      const response = await apiRequest("POST", "/api/capability-search", { requirement });
      return response.json();
    },
    onSuccess: (data: CapabilitySearchResult) => {
      setSearchResults(data);
      toast({
        title: "Search Complete",
        description: `Found ${data.totalMatches} matching solutions`,
      });
    },
    onError: (error) => {
      toast({
        title: "Search Failed",
        description: "Unable to perform capability search. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCapabilitySearch = () => {
    if (!requirement.trim()) {
      toast({
        title: "Requirement Required",
        description: "Please describe your operational requirement or capability need.",
        variant: "destructive",
      });
      return;
    }
    capabilitySearchMutation.mutate(requirement);
  };

  const exampleRequirements = [
    "Real-time battlefield situational awareness for urban operations",
    "Autonomous supply convoy protection in contested environments",
    "Multi-domain intelligence fusion for strategic planning",
    "Rapid deployment air defense against drone swarms"
  ];

  const featuredChallenges = Array.isArray(challenges) ? challenges.slice(0, 2) : [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Commander's Capability Search Hero */}
      <section className="hero-gradient text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            {/* Main Logo */}
            <div className="flex justify-center mb-8">
              <img 
                src={logoImage} 
                alt="Commanders Marketplace" 
                className="w-48 h-48 object-contain drop-shadow-2xl"
              />
            </div>
            <div className="flex items-center justify-center space-x-2 mb-6">
              <Target className="w-10 h-10 text-accent" />
              <span className="army-gold-text font-bold text-2xl">Commander's Capability Search</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Describe Your <span className="army-gold-text">Operational Need</span><br />
              Find the <span className="army-gold-text">Right Solutions</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              AI-powered capability matching across {(stats as any)?.solutions || 46} military technology solutions. 
              Describe your requirement and discover technologies that meet your mission needs.
            </p>
          </div>

          {/* Search Interface */}
          <Card className="max-w-4xl mx-auto bg-card/95 backdrop-blur-sm border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-foreground">
                <Search className="w-5 h-5" />
                <span>Operational Requirement Search</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Textarea
                  placeholder="Describe your operational requirement, capability gap, or mission need. Be specific about the environment, constraints, and desired outcomes..."
                  value={requirement}
                  onChange={(e) => setRequirement(e.target.value)}
                  className="min-h-[120px] text-base"
                  data-testid="textarea-requirement"
                />
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    onClick={handleCapabilitySearch}
                    disabled={capabilitySearchMutation.isPending}
                    className="bg-accent text-primary hover:bg-yellow-500 flex-1"
                    data-testid="button-search-capabilities"
                  >
                    {capabilitySearchMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Search Capabilities
                      </>
                    )}
                  </Button>
                  
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setLocation("/government-portal")}
                      data-testid="button-government-portal"
                    >
                      Government Portal
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setLocation("/vendor-portal")}
                      data-testid="button-vendor-portal"
                    >
                      Vendor Portal
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Example Requirements */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">Example Requirements:</p>
                <div className="grid md:grid-cols-2 gap-2">
                  {exampleRequirements.map((example, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="text-left justify-start h-auto p-3 text-muted-foreground hover:text-foreground"
                      onClick={() => setRequirement(example)}
                      data-testid={`button-example-${index}`}
                    >
                      <span className="text-xs">"{example}"</span>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Search Results Section */}
      {searchResults && (
        <section className="py-16 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Capability Search Results
              </h2>
              <p className="text-muted-foreground text-lg">
                Found {searchResults.totalMatches} solutions matching your requirements
              </p>
            </div>

            {/* Solution Matches */}
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
              {searchResults.matches.map((match) => (
                <Card key={match.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-lg leading-tight">{match.title}</CardTitle>
                      <div className="flex flex-col items-end space-y-1">
                        <Badge variant="default" className="text-xs">
                          {match.matchPercentage}% Match
                        </Badge>
                        <Progress value={match.matchPercentage} className="w-16 h-2" />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {match.capabilityAreas.map((area) => (
                        <Badge key={area} variant="outline" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {match.description}
                    </p>
                    
                    {/* Show reviews if available */}
                    {match.reviews && match.reviews.length > 0 && (
                      <div className="flex items-center space-x-2 mb-3 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">
                          {(match.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / match.reviews.length).toFixed(1)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({match.reviews.length} government review{match.reviews.length !== 1 ? 's' : ''})
                        </span>
                        <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                          Reviewed
                        </Badge>
                      </div>
                    )}
                    
                    <div className="space-y-3">
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <h4 className="text-sm font-medium mb-2">Why this matches:</h4>
                        <p className="text-xs text-muted-foreground">{match.relevanceExplanation}</p>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center p-2 bg-muted/30 rounded">
                          <div className="font-medium">TRL {match.trl}</div>
                          <div className="text-muted-foreground">Readiness</div>
                        </div>
                        <div className="text-center p-2 bg-muted/30 rounded">
                          <div className="font-medium">{match.natoCompatible ? "Yes" : "No"}</div>
                          <div className="text-muted-foreground">NATO</div>
                        </div>
                        <div className="text-center p-2 bg-muted/30 rounded">
                          <div className="font-medium">{match.securityCleared ? "Yes" : "No"}</div>
                          <div className="text-muted-foreground">Cleared</div>
                        </div>
                      </div>
                      
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => setLocation(`/solutions/${match.id}`)}
                        data-testid={`button-view-solution-${match.id}`}
                      >
                        View Solution Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Multi-Vendor Scenario */}
            {searchResults.multiVendorScenario && (
              <Card className="bg-accent/10 border-accent/20">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Layers className="w-5 h-5 text-accent" />
                    <span>Multi-Vendor Solution Recommendation</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">
                    {searchResults.multiVendorScenario.description}
                  </p>
                  
                  <div className="space-y-4">
                    {searchResults.multiVendorScenario.recommendedCombinations.map((combo, index) => (
                      <div key={index} className="border border-accent/20 rounded-lg p-4">
                        <h4 className="font-medium mb-2">Recommended Combination {index + 1}</h4>
                        <p className="text-sm text-muted-foreground mb-3">{combo.explanation}</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="default">Primary: {combo.primarySolution}</Badge>
                          {combo.supportingSolutions.map((support) => (
                            <Badge key={support} variant="outline">Supporting: {support}</Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      )}

      {/* Stats Section */}
      <section className="py-16 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center" data-testid="stat-vendors">
              <div className="text-4xl font-bold text-primary mb-2">
                {(stats as any)?.vendors || "2,156"}
              </div>
              <div className="text-muted-foreground">Registered Vendors</div>
            </div>
            <div className="text-center" data-testid="stat-solutions">
              <div className="text-4xl font-bold text-primary mb-2">
                {(stats as any)?.solutions || "1,247"}
              </div>
              <div className="text-muted-foreground">Active Solutions</div>
            </div>
            <div className="text-center" data-testid="stat-challenges">
              <div className="text-4xl font-bold text-primary mb-2">
                {(stats as any)?.challenges || "47"}
              </div>
              <div className="text-muted-foreground">Open Challenges</div>
            </div>
            <div className="text-center" data-testid="stat-contracts">
              <div className="text-4xl font-bold text-primary mb-2">
                {(stats as any)?.contracts || "$284M"}
              </div>
              <div className="text-muted-foreground">Contracts Awarded</div>
            </div>
          </div>
        </div>
      </section>

      {/* Challenges Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Active Challenges & Onramps</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Participate in cutting-edge technology competitions and demonstrate your innovations to the U.S. Army and NATO partners.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {featuredChallenges.map((challenge: any) => (
              <Card key={challenge.id} className="shadow-lg hover:shadow-xl transition-shadow" data-testid={`card-challenge-${challenge.id}`}>
                <CardContent className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                        {challenge.title.includes("Humanoid") ? (
                          <Users className="w-6 h-6 text-primary" />
                        ) : (
                          <Search className="w-6 h-6 text-primary" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground" data-testid={`text-challenge-title-${challenge.id}`}>
                          {challenge.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {challenge.type === "xtech" ? "xTech Competition" : "Open Competition"}
                        </p>
                      </div>
                    </div>
                    <Badge variant={challenge.status === "open" ? "destructive" : "default"}>
                      {challenge.status}
                    </Badge>
                  </div>
                  
                  <p className="text-muted-foreground mb-6" data-testid={`text-challenge-description-${challenge.id}`}>
                    {challenge.description.slice(0, 200)}...
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm font-medium text-foreground">Application Deadline</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(challenge.applicationDeadline).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Prize Pool</p>
                      <p className="text-sm text-muted-foreground">
                        ${parseFloat(challenge.prizePool).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button 
                      className="flex-1"
                      onClick={() => setLocation(`/challenges/${challenge.id}`)}
                      data-testid={`button-apply-challenge-${challenge.id}`}
                    >
                      Apply Now
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setLocation(`/challenges/${challenge.id}`)}
                      data-testid={`button-view-details-${challenge.id}`}
                    >
                      Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button 
              variant="secondary"
              className="px-8 py-3 text-lg font-semibold"
              onClick={() => setLocation("/challenges")}
              data-testid="button-view-all-challenges"
            >
              View All Challenges ({Array.isArray(challenges) ? challenges.length : 47})
            </Button>
          </div>
        </div>
      </section>

      {/* Portals Section */}
      <section className="py-20 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Access Your Portal</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Role-specific interfaces designed for vendors, government buyers, and contracting officers with tailored workflows and secure access.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Vendor Portal */}
            <Card className="text-center hover:shadow-xl transition-shadow" data-testid="card-vendor-portal">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Vendor Portal</h3>
                <p className="text-muted-foreground mb-6">
                  Submit solutions, track applications, upload pitch videos, and receive feedback from government evaluators. Access compliance forms and NATO eligibility requirements.
                </p>
                <ul className="text-left space-y-2 mb-8 text-sm">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-accent" />
                    <span>Solution submission workspace</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-accent" />
                    <span>5-minute pitch video uploads</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-accent" />
                    <span>Application status tracking</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-accent" />
                    <span>Government feedback portal</span>
                  </li>
                </ul>
                <Button 
                  className="w-full"
                  onClick={() => setLocation("/vendor-portal")}
                  data-testid="button-vendor-portal-access"
                >
                  Access Vendor Portal
                </Button>
              </CardContent>
            </Card>

            {/* Government Portal */}
            <Card className="text-center hover:shadow-xl transition-shadow" data-testid="card-government-portal">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Government Portal</h3>
                <p className="text-muted-foreground mb-6">
                  Search and discover acquisition-ready solutions with AI-powered matching, access government-only reviews, and utilize procurement workbench tools.
                </p>
                <ul className="text-left space-y-2 mb-8 text-sm">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-accent" />
                    <span>AI-powered solution matching</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-accent" />
                    <span>Amazon-style reviews (gov-only)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-accent" />
                    <span>Procurement workbench tools</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-accent" />
                    <span>Interactive acquisition playbook</span>
                  </li>
                </ul>
                <Button 
                  className="w-full"
                  onClick={() => setLocation("/government-portal")}
                  data-testid="button-government-portal-access"
                >
                  Access Government Portal
                </Button>
              </CardContent>
            </Card>

            {/* Contracting Portal */}
            <Card className="text-center hover:shadow-xl transition-shadow" data-testid="card-contracting-portal">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Contracting Portal</h3>
                <p className="text-muted-foreground mb-6">
                  Specialized tools for contracting and agreements officers to execute FAR and Other Transaction agreements with automated documentation and compliance checks.
                </p>
                <ul className="text-left space-y-2 mb-8 text-sm">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-accent" />
                    <span>Automated decision memos</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-accent" />
                    <span>Competition evidence binders</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-accent" />
                    <span>FAR & OT agreement templates</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-accent" />
                    <span>Order initiation workflows</span>
                  </li>
                </ul>
                <Button 
                  className="w-full"
                  onClick={() => setLocation("/contracting-portal")}
                  data-testid="button-contracting-portal-access"
                >
                  Access Contracting Portal
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* AI Assistant Demo */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-foreground mb-6">AI-Powered Assistance</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Get instant help with submissions, procurement guidance, and technology matching using advanced AI capabilities integrated throughout the platform.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Smart Chat Assistant</h3>
                    <p className="text-muted-foreground">Get submission tips, procurement guidance, and answers to complex acquisition questions in real-time.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
                    <Search className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Semantic Matching</h3>
                    <p className="text-muted-foreground">Advanced AI understands your needs and matches you with relevant challenges or solutions using natural language processing.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Intelligent Recommendations</h3>
                    <p className="text-muted-foreground">Receive personalized suggestions for opportunities, partnerships, and technology solutions based on your profile and history.</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Demo Chat Interface */}
            <Card className="shadow-lg" data-testid="card-ai-chat-demo">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-foreground">AI Assistant</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-muted-foreground">Online</span>
                  </div>
                </div>
                
                <div className="space-y-4 mb-6 h-64 overflow-y-auto">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                      <Zap className="w-4 h-4 text-primary" />
                    </div>
                    <div className="bg-secondary rounded-lg p-3 max-w-xs">
                      <p className="text-sm text-foreground">Hi! I'm your AI assistant. How can I help you with your submission or procurement needs today?</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 justify-end">
                    <div className="bg-primary text-primary-foreground rounded-lg p-3 max-w-xs">
                      <p className="text-sm">I need help understanding the requirements for the xTechHumanoid challenge.</p>
                    </div>
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                      <Zap className="w-4 h-4 text-primary" />
                    </div>
                    <div className="bg-secondary rounded-lg p-3 max-w-xs">
                      <p className="text-sm text-foreground">Great question! The xTechHumanoid challenge focuses on transformative humanoid technologies. For Phase 1, you'll need to submit a 5-page concept white paper plus an optional 3-5 minute video. The deadline is October 1, 2025. Would you like me to break down the specific technical requirements?</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Input 
                    placeholder="Type your question here..."
                    className="flex-1"
                    data-testid="input-chat-message"
                  />
                  <Button data-testid="button-send-message">
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />

      {/* Floating AI Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          className="chat-bubble bg-accent text-primary w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          onClick={() => setIsChatOpen(true)}
          data-testid="button-open-chat"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>

      {/* AI Chat Sidebar */}
      <AIChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}
