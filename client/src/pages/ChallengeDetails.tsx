import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useParams, useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FileUpload from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Calendar, DollarSign, Users, FileText, Video, Award } from "lucide-react";

const applicationSchema = z.object({
  challengeId: z.string(),
  phase: z.number().default(1),
  whitePaperUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  submissionData: z.any().optional(),
});

export default function ChallengeDetails() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

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

  const { data: challenge, isLoading: challengeLoading } = useQuery({
    queryKey: ["/api/challenges", id],
    enabled: !!id,
  });

  const { data: existingApplication } = useQuery({
    queryKey: ["/api/applications", { challengeId: id, vendorId: user?.id }],
    enabled: !!user?.id && !!id,
  });

  const form = useForm<z.infer<typeof applicationSchema>>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      challengeId: id || "",
      phase: 1,
    },
  });

  const submitApplicationMutation = useMutation({
    mutationFn: async (data: z.infer<typeof applicationSchema>) => {
      const response = await apiRequest("POST", "/api/applications", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Application submitted successfully",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
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
        description: "Failed to submit application",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof applicationSchema>) => {
    submitApplicationMutation.mutate(data);
  };

  if (isLoading || challengeLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!challenge) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Challenge not found</p>
            <Button 
              className="w-full mt-4" 
              onClick={() => setLocation("/")}
              data-testid="button-back-home"
            >
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasExistingApplication = existingApplication && existingApplication.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/")}
            className="mb-4"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Challenges
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl mb-2" data-testid="text-challenge-title">
                      {challenge.title}
                    </CardTitle>
                    <div className="flex items-center space-x-4">
                      <Badge variant={challenge.status === "open" ? "destructive" : "default"}>
                        {challenge.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {challenge.type === "xtech" ? "xTech Competition" : "Open Competition"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-muted-foreground leading-relaxed" data-testid="text-challenge-description">
                    {challenge.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Challenge Phases */}
            {challenge.phases && (
              <Card>
                <CardHeader>
                  <CardTitle>Competition Phases</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(challenge.phases as any[]).map((phase: any, index: number) => (
                      <div 
                        key={index} 
                        className="border border-border rounded-lg p-4"
                        data-testid={`phase-${index}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{phase.name}</h4>
                          <Badge variant="outline">{phase.prize}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{phase.description}</p>
                        <p className="text-sm"><strong>Requirements:</strong> {phase.requirements}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Focus Areas */}
            {challenge.focusAreas && (
              <Card>
                <CardHeader>
                  <CardTitle>Technology Focus Areas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {(challenge.focusAreas as string[]).map((area: string, index: number) => (
                      <Badge key={index} variant="secondary" data-testid={`focus-area-${index}`}>
                        {area}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Eligibility Requirements */}
            {challenge.eligibilityRequirements && (
              <Card>
                <CardHeader>
                  <CardTitle>Eligibility Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(challenge.eligibilityRequirements as any).organizations && (
                      <div>
                        <h5 className="font-medium mb-2">Eligible Organizations:</h5>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                          {(challenge.eligibilityRequirements as any).organizations.map((org: string, index: number) => (
                            <li key={index}>{org}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {(challenge.eligibilityRequirements as any).requirements && (
                      <div>
                        <h5 className="font-medium mb-2">Additional Requirements:</h5>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                          {(challenge.eligibilityRequirements as any).requirements.map((req: string, index: number) => (
                            <li key={index}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Key Details */}
            <Card>
              <CardHeader>
                <CardTitle>Challenge Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Application Deadline</p>
                    <p className="text-sm text-muted-foreground">
                      {challenge.applicationDeadline 
                        ? new Date(challenge.applicationDeadline).toLocaleDateString()
                        : "TBD"
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <DollarSign className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Total Prize Pool</p>
                    <p className="text-sm text-muted-foreground">
                      ${challenge.prizePool ? parseFloat(challenge.prizePool).toLocaleString() : "TBD"}
                    </p>
                  </div>
                </div>

                {challenge.finalsDate && (
                  <div className="flex items-center space-x-3">
                    <Award className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">Finals Event</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(challenge.finalsDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Application Status */}
            {isAuthenticated && user?.role === "vendor" && (
              <Card>
                <CardHeader>
                  <CardTitle>Application Status</CardTitle>
                </CardHeader>
                <CardContent>
                  {hasExistingApplication ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Status:</span>
                        <Badge variant="secondary">
                          {existingApplication[0].status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Phase:</span>
                        <span className="text-sm">{existingApplication[0].phase}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Submitted:</span>
                        <span className="text-sm">
                          {new Date(existingApplication[0].createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {existingApplication[0].feedback && (
                        <div className="mt-3 p-3 bg-secondary rounded-lg">
                          <p className="text-sm font-medium mb-1">Feedback:</p>
                          <p className="text-sm text-muted-foreground">
                            {existingApplication[0].feedback}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        You haven't applied to this challenge yet.
                      </p>
                      {challenge.status === "open" && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button className="w-full" data-testid="button-apply-challenge">
                              Apply Now
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Apply to {challenge.title}</DialogTitle>
                            </DialogHeader>
                            <Form {...form}>
                              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <div className="space-y-4">
                                  <div>
                                    <label className="text-sm font-medium">White Paper Upload</label>
                                    <FileUpload
                                      label="Upload White Paper (PDF, DOC, DOCX)"
                                      accept=".pdf,.doc,.docx"
                                      endpoint="/api/upload/document"
                                      onUpload={(url) => form.setValue("whitePaperUrl", url)}
                                    />
                                  </div>

                                  <div>
                                    <label className="text-sm font-medium">Pitch Video (Optional)</label>
                                    <FileUpload
                                      label="Upload Pitch Video (3-5 minutes)"
                                      accept="video/*"
                                      endpoint="/api/upload/video"
                                      onUpload={(url) => form.setValue("videoUrl", url)}
                                    />
                                  </div>

                                  <FormField
                                    control={form.control}
                                    name="submissionData"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Additional Information</FormLabel>
                                        <FormControl>
                                          <Textarea
                                            placeholder="Provide any additional information about your solution and team..."
                                            className="min-h-[100px]"
                                            onChange={(e) => field.onChange({ notes: e.target.value })}
                                            data-testid="textarea-additional-info"
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
                                    disabled={submitApplicationMutation.isPending}
                                    data-testid="button-submit-application"
                                  >
                                    {submitApplicationMutation.isPending ? "Submitting..." : "Submit Application"}
                                  </Button>
                                </div>
                              </form>
                            </Form>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium text-sm">Technical Support</p>
                  <p className="text-sm text-muted-foreground">support@g-tead.army.mil</p>
                </div>
                <div>
                  <p className="font-medium text-sm">Challenge Questions</p>
                  <p className="text-sm text-muted-foreground">challenges@g-tead.army.mil</p>
                </div>
                <Button variant="outline" className="w-full" data-testid="button-contact-support">
                  <Users className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
