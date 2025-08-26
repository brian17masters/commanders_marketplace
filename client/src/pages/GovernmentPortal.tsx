import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Solution } from "@shared/schema";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SolutionCard from "@/components/SolutionCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Search, Filter, Star, Shield, Zap, Users, TrendingUp, FileText } from "lucide-react";

type StatsData = {
  solutions: number;
  vendors: number;
  contracts: number;
};

type MatchingResult = {
  matches: Array<{
    title: string;
    score: number;
    explanation: string;
  }>;
};

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  readinessScore: z.number().min(1).max(10),
  interoperabilityScore: z.number().min(1).max(10),
  supportScore: z.number().min(1).max(10),
  fieldTested: z.boolean().default(false),
});

export default function GovernmentPortal() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [activeTab, setActiveTab] = useState("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    trl: "",
    natoCompatible: "",
    securityCleared: "",
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: solutions, isLoading: solutionsLoading } = useQuery<Solution[]>({
    queryKey: ["/api/solutions", { search: searchQuery, ...filters }],
    enabled: !!user?.id,
  });

  const { data: stats } = useQuery<StatsData>({
    queryKey: ["/api/stats"],
    enabled: !!user?.id,
  });

  const { data: matchingResults, refetch: refetchMatching } = useQuery<MatchingResult>({
    queryKey: ["/api/match", { query: searchQuery }],
    enabled: false,
  });

  const reviewForm = useForm<z.infer<typeof reviewSchema>>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 5,
      title: "",
      description: "",
      readinessScore: 8,
      interoperabilityScore: 8,
      supportScore: 8,
      fieldTested: false,
    },
  });

  const createReviewMutation = useMutation({
    mutationFn: async ({ solutionId, data }: { solutionId: string; data: z.infer<typeof reviewSchema> }) => {
      const response = await apiRequest("POST", `/api/solutions/${solutionId}/reviews`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Review submitted successfully",
      });
      reviewForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/solutions"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to submit review",
        variant: "destructive",
      });
    },
  });

  const performAIMatching = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search Required",
        description: "Please enter a search query for AI matching",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await apiRequest("POST", "/api/match", { query: searchQuery });
      const results = await response.json();
      toast({
        title: "AI Matching Complete",
        description: `Found ${results.totalMatches} relevant matches`,
      });
      refetchMatching();
    } catch (error) {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to perform AI matching",
        variant: "destructive",
      });
    }
  };

  if (isLoading || !isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user || !["government", "contracting_officer", "admin"].includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Government access required. Please contact support to update your role.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Government Portal</h1>
          <p className="text-muted-foreground">
            Search acquisition-ready solutions, access government reviews, and utilize procurement tools.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="search" data-testid="tab-search">Search & Discovery</TabsTrigger>
            <TabsTrigger value="reviews" data-testid="tab-reviews">Reviews</TabsTrigger>
            <TabsTrigger value="procurement" data-testid="tab-procurement">Procurement</TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-6">
            {/* AI-Powered Search */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-accent" />
                  <span>AI-Powered Solution Search</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="e.g., 'AI for logistics and supply chain management in contested environments'"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                    data-testid="input-ai-search"
                  />
                  <Button 
                    onClick={performAIMatching}
                    data-testid="button-ai-search"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    AI Search
                  </Button>
                </div>

                {/* Quick Search Suggestions */}
                <div className="grid md:grid-cols-3 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSearchQuery("autonomous vehicle systems")}
                    data-testid="button-search-autonomous"
                  >
                    Autonomous vehicle systems
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSearchQuery("drone defense technologies")}
                    data-testid="button-search-drones"
                  >
                    Drone defense technologies
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSearchQuery("cybersecurity for IoT devices")}
                    data-testid="button-search-cyber"
                  >
                    Cybersecurity for IoT devices
                  </Button>
                </div>

                {/* Filters */}
                <div className="grid md:grid-cols-3 gap-4">
                  <Select value={filters.trl} onValueChange={(value) => setFilters({ ...filters, trl: value })}>
                    <SelectTrigger data-testid="select-filter-trl">
                      <SelectValue placeholder="Technology Readiness Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All TRLs</SelectItem>
                      {Array.from({ length: 9 }, (_, i) => i + 1).map((level) => (
                        <SelectItem key={level} value={level.toString()}>
                          TRL {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select 
                    value={filters.natoCompatible} 
                    onValueChange={(value) => setFilters({ ...filters, natoCompatible: value })}
                  >
                    <SelectTrigger data-testid="select-filter-nato">
                      <SelectValue placeholder="NATO Compatibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Solutions</SelectItem>
                      <SelectItem value="true">NATO Compatible</SelectItem>
                      <SelectItem value="false">Not NATO Compatible</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select 
                    value={filters.securityCleared} 
                    onValueChange={(value) => setFilters({ ...filters, securityCleared: value })}
                  >
                    <SelectTrigger data-testid="select-filter-security">
                      <SelectValue placeholder="Security Clearance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Solutions</SelectItem>
                      <SelectItem value="true">Security Cleared</SelectItem>
                      <SelectItem value="false">Not Security Cleared</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* AI Matching Results */}
            {matchingResults && matchingResults.matches && matchingResults.matches.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>AI Matching Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {matchingResults.matches.map((match: any, index: number) => (
                      <div 
                        key={index} 
                        className="p-3 border border-border rounded-lg"
                        data-testid={`match-result-${index}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{match.title}</h4>
                          <Badge variant="secondary">
                            {Math.round(match.score * 100)}% match
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{match.explanation}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Solutions Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
              {solutions?.map((solution: any) => (
                <SolutionCard 
                  key={solution.id} 
                  solution={solution}
                  showGovernmentFeatures={true}
                />
              ))}
              
              {solutionsLoading && (
                <div className="col-span-full text-center py-8">
                  <p className="text-muted-foreground">Loading solutions...</p>
                </div>
              )}
              
              {!solutionsLoading && (!solutions || solutions.length === 0) && (
                <div className="col-span-full text-center py-8">
                  <p className="text-muted-foreground">No solutions found matching your criteria.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Government Review System</CardTitle>
                <p className="text-muted-foreground">
                  Government-only reviews and ratings for technology solutions
                </p>
              </CardHeader>
              <CardContent>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button data-testid="button-submit-review">
                      <Star className="w-4 h-4 mr-2" />
                      Submit Review
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Submit Government Review</DialogTitle>
                    </DialogHeader>
                    <Form {...reviewForm}>
                      <form className="space-y-4">
                        <FormField
                          control={reviewForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Review Title</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Brief summary of your experience"
                                  {...field}
                                  data-testid="input-review-title"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={reviewForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Detailed Review</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Provide detailed feedback on performance, integration, and operational effectiveness"
                                  className="min-h-[100px]"
                                  {...field}
                                  data-testid="textarea-review-description"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid md:grid-cols-2 gap-4">
                          <FormField
                            control={reviewForm.control}
                            name="rating"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Overall Rating</FormLabel>
                                <Select 
                                  onValueChange={(value) => field.onChange(parseInt(value))}
                                  defaultValue={field.value?.toString()}
                                >
                                  <FormControl>
                                    <SelectTrigger data-testid="select-rating">
                                      <SelectValue placeholder="Select rating" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {Array.from({ length: 5 }, (_, i) => i + 1).map((rating) => (
                                      <SelectItem key={rating} value={rating.toString()}>
                                        {rating} Star{rating !== 1 ? 's' : ''}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={reviewForm.control}
                            name="readinessScore"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Readiness Score (1-10)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    min="1" 
                                    max="10"
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                    data-testid="input-readiness-score"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="flex justify-end space-x-2">
                          <Button 
                            type="submit"
                            disabled={createReviewMutation.isPending}
                            data-testid="button-submit-review-form"
                          >
                            {createReviewMutation.isPending ? "Submitting..." : "Submit Review"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>

                <div className="mt-6">
                  <p className="text-sm text-muted-foreground">
                    Reviews are only visible to verified government users and help inform procurement decisions.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="procurement" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>Procurement Workbench</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full justify-start" data-testid="button-request-assessment">
                    Request Assessment Package
                  </Button>
                  <Button className="w-full justify-start" data-testid="button-generate-memo">
                    Auto-generate Decision Memo
                  </Button>
                  <Button className="w-full justify-start" data-testid="button-competition-binder">
                    Competition Evidence Binder
                  </Button>
                  <Button className="w-full justify-start" data-testid="button-initiate-order">
                    Initiate Order (FAR/OT)
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="w-5 h-5" />
                    <span>Interactive Playbook</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full justify-start" data-testid="button-draid-guide">
                    DRAID Ordering Guide
                  </Button>
                  <Button className="w-full justify-start" data-testid="button-tsm-handbook">
                    TSM Handbook
                  </Button>
                  <Button className="w-full justify-start" data-testid="button-acquisition-guide">
                    Acquisition Guide
                  </Button>
                  <Button className="w-full justify-start" data-testid="button-compliance-checker">
                    Compliance Checker
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card data-testid="card-total-solutions-analytics">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Available Solutions</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.solutions || 0}</div>
                  <p className="text-xs text-muted-foreground">Acquisition-ready technologies</p>
                </CardContent>
              </Card>

              <Card data-testid="card-vendor-ecosystem">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Vendor Ecosystem</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.vendors || 0}</div>
                  <p className="text-xs text-muted-foreground">Registered vendors</p>
                </CardContent>
              </Card>

              <Card data-testid="card-contract-value">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Contract Value</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.contracts || "$284M"}</div>
                  <p className="text-xs text-muted-foreground">Total awarded</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Procurement Analytics Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Advanced analytics and reporting tools for procurement decision-making will be available here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
