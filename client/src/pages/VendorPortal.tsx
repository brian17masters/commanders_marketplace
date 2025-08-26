import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import FileUpload from "@/components/FileUpload";
import { Plus, Upload, Eye, Edit, Clock, CheckCircle, XCircle } from "lucide-react";

const solutionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  trl: z.number().min(1).max(9),
  natoCompatible: z.boolean().default(false),
  securityCleared: z.boolean().default(false),
  capabilityAreas: z.array(z.string()).min(1, "At least one capability area required"),
});

export default function VendorPortal() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

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

  const { data: solutions, isLoading: solutionsLoading } = useQuery({
    queryKey: ["/api/solutions", { vendorId: user?.id }],
    enabled: !!user?.id,
  });

  const { data: applications, isLoading: applicationsLoading } = useQuery({
    queryKey: ["/api/applications"],
    enabled: !!user?.id,
  });

  const { data: challenges } = useQuery({
    queryKey: ["/api/challenges"],
  });

  const form = useForm<z.infer<typeof solutionSchema>>({
    resolver: zodResolver(solutionSchema),
    defaultValues: {
      title: "",
      description: "",
      trl: 1,
      natoCompatible: false,
      securityCleared: false,
      capabilityAreas: [],
    },
  });

  const createSolutionMutation = useMutation({
    mutationFn: async (data: z.infer<typeof solutionSchema>) => {
      const response = await apiRequest("POST", "/api/solutions", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Solution submitted successfully",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/solutions"] });
      setActiveTab("solutions");
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
        description: "Failed to submit solution",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof solutionSchema>) => {
    createSolutionMutation.mutate(data);
  };

  if (isLoading || !isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (user?.role !== "vendor") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Vendor access required. Please contact support to update your role.
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Vendor Portal</h1>
          <p className="text-muted-foreground">
            Manage your solutions, track applications, and engage with government buyers.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" data-testid="tab-dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="solutions" data-testid="tab-solutions">Solutions</TabsTrigger>
            <TabsTrigger value="applications" data-testid="tab-applications">Applications</TabsTrigger>
            <TabsTrigger value="submit" data-testid="tab-submit">Submit New</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card data-testid="card-total-solutions">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Solutions</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{solutions?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">Solutions submitted</p>
                </CardContent>
              </Card>

              <Card data-testid="card-active-applications">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Applications</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {applications?.filter((app: any) => app.status === "submitted").length || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Under review</p>
                </CardContent>
              </Card>

              <Card data-testid="card-open-challenges">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Open Challenges</CardTitle>
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {challenges?.filter((c: any) => c.status === "open").length || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Available to apply</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {solutions?.slice(0, 3).map((solution: any) => (
                    <div key={solution.id} className="flex items-center space-x-4" data-testid={`activity-solution-${solution.id}`}>
                      <div className="w-2 h-2 bg-accent rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{solution.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Status: {solution.status} • Created {new Date(solution.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {(!solutions || solutions.length === 0) && (
                    <p className="text-muted-foreground text-sm">No recent activity</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="solutions" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Your Solutions</h2>
              <Button 
                onClick={() => setActiveTab("submit")}
                data-testid="button-add-solution"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Solution
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {solutions?.map((solution: any) => (
                <Card key={solution.id} className="hover:shadow-lg transition-shadow" data-testid={`card-solution-${solution.id}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg" data-testid={`text-solution-title-${solution.id}`}>
                        {solution.title}
                      </CardTitle>
                      <Badge variant={
                        solution.status === "awardable" ? "default" : 
                        solution.status === "under_review" ? "secondary" : 
                        solution.status === "rejected" ? "destructive" : "outline"
                      }>
                        {solution.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4" data-testid={`text-solution-description-${solution.id}`}>
                      {solution.description.slice(0, 100)}...
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="font-medium">TRL:</span> {solution.trl}
                      </div>
                      <div>
                        <span className="font-medium">NATO:</span> {solution.natoCompatible ? "Yes" : "No"}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" className="flex-1" data-testid={`button-view-solution-${solution.id}`}>
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1" data-testid={`button-edit-solution-${solution.id}`}>
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {solutionsLoading && (
                <div className="col-span-full text-center py-8">
                  <p className="text-muted-foreground">Loading solutions...</p>
                </div>
              )}
              
              {!solutionsLoading && (!solutions || solutions.length === 0) && (
                <div className="col-span-full text-center py-8">
                  <p className="text-muted-foreground">No solutions submitted yet.</p>
                  <Button 
                    className="mt-4"
                    onClick={() => setActiveTab("submit")}
                    data-testid="button-submit-first-solution"
                  >
                    Submit Your First Solution
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <h2 className="text-2xl font-bold">Challenge Applications</h2>
            
            <div className="space-y-4">
              {applications?.map((application: any) => (
                <Card key={application.id} data-testid={`card-application-${application.id}`}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg" data-testid={`text-application-challenge-${application.id}`}>
                          Challenge: {application.challengeId}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Phase {application.phase} • Applied {new Date(application.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={
                        application.status === "accepted" ? "default" :
                        application.status === "under_review" ? "secondary" :
                        application.status === "rejected" ? "destructive" : "outline"
                      }>
                        {application.status}
                      </Badge>
                    </div>
                    {application.feedback && (
                      <div className="mt-4 p-3 bg-secondary rounded-lg">
                        <p className="text-sm font-medium mb-1">Feedback:</p>
                        <p className="text-sm text-muted-foreground">{application.feedback}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              
              {applicationsLoading && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading applications...</p>
                </div>
              )}
              
              {!applicationsLoading && (!applications || applications.length === 0) && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No applications submitted yet.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="submit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Submit New Solution</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Solution Title</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter solution title" 
                              {...field} 
                              data-testid="input-solution-title"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe your solution, its capabilities, and military applications"
                              className="min-h-[120px]"
                              {...field} 
                              data-testid="textarea-solution-description"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="trl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Technology Readiness Level (TRL)</FormLabel>
                            <Select 
                              onValueChange={(value) => field.onChange(parseInt(value))} 
                              defaultValue={field.value?.toString()}
                            >
                              <FormControl>
                                <SelectTrigger data-testid="select-trl">
                                  <SelectValue placeholder="Select TRL" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Array.from({ length: 9 }, (_, i) => i + 1).map((level) => (
                                  <SelectItem key={level} value={level.toString()}>
                                    TRL {level}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="capabilityAreas"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Capability Areas</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., AI/ML, Cybersecurity, Drones"
                                onChange={(e) => field.onChange(e.target.value.split(',').map(s => s.trim()))}
                                data-testid="input-capability-areas"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <Label>Files & Media</Label>
                      <div className="grid md:grid-cols-2 gap-4">
                        <FileUpload 
                          label="Pitch Video (5 min max)"
                          accept="video/*"
                          endpoint="/api/upload/video"
                        />
                        <FileUpload 
                          label="Technical Documents"
                          accept=".pdf,.doc,.docx"
                          endpoint="/api/upload/document"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-4">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => form.reset()}
                        data-testid="button-reset-form"
                      >
                        Reset
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createSolutionMutation.isPending}
                        data-testid="button-submit-solution"
                      >
                        {createSolutionMutation.isPending ? "Submitting..." : "Submit Solution"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
