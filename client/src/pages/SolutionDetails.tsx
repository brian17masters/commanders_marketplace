import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useParams, useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  ArrowLeft, 
  Star, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Play,
  Download,
  MessageCircle,
  Award,
  Building
} from "lucide-react";

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  readinessScore: z.number().min(1).max(10),
  interoperabilityScore: z.number().min(1).max(10),
  supportScore: z.number().min(1).max(10),
  fieldTested: z.boolean().default(false),
});

export default function SolutionDetails() {
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

  const { data: solution, isLoading: solutionLoading } = useQuery({
    queryKey: ["/api/solutions", id],
    enabled: !!id,
  });

  const { data: reviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ["/api/solutions", id, "reviews"],
    enabled: !!id && !!user && ["government", "contracting_officer", "admin"].includes(user.role),
  });

  const { data: vendor } = useQuery({
    queryKey: ["/api/auth/user", solution?.vendorId],
    enabled: !!solution?.vendorId,
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
    mutationFn: async (data: z.infer<typeof reviewSchema>) => {
      const response = await apiRequest("POST", `/api/solutions/${id}/reviews`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Review submitted successfully",
      });
      reviewForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/solutions", id, "reviews"] });
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

  const onSubmitReview = (data: z.infer<typeof reviewSchema>) => {
    createReviewMutation.mutate(data);
  };

  if (isLoading || solutionLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!solution) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Solution not found</p>
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

  const isGovernmentUser = user && ["government", "contracting_officer", "admin"].includes(user.role);
  const isVendorOwner = user && user.id === solution.vendorId;
  const averageRating = reviews && reviews.length > 0 
    ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length
    : 0;

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
            Back to Solutions
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl mb-2" data-testid="text-solution-title">
                      {solution.title}
                    </CardTitle>
                    <div className="flex items-center space-x-4 mb-4">
                      <Badge variant={
                        solution.status === "awardable" ? "default" : 
                        solution.status === "under_review" ? "secondary" : 
                        solution.status === "rejected" ? "destructive" : "outline"
                      }>
                        {solution.status}
                      </Badge>
                      {isGovernmentUser && reviews && reviews.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">{averageRating.toFixed(1)}</span>
                          <span className="text-sm text-muted-foreground">({reviews.length} reviews)</span>
                        </div>
                      )}
                    </div>
                    {vendor && (
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <Building className="w-4 h-4" />
                        <span className="text-sm">
                          {vendor.organization || `${vendor.firstName} ${vendor.lastName}`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <h3 className="text-lg font-semibold mb-3">Solution Overview</h3>
                  <p className="text-muted-foreground leading-relaxed" data-testid="text-solution-description">
                    {solution.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Technical Specifications */}
            <Card>
              <CardHeader>
                <CardTitle>Technical Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-sm">Technology Readiness Level:</span>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline">TRL {solution.trl}</Badge>
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium text-sm">NATO Compatibility:</span>
                      <div className="flex items-center space-x-2 mt-1">
                        {solution.natoCompatible ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span className="text-sm">{solution.natoCompatible ? "Compatible" : "Not Compatible"}</span>
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium text-sm">Security Clearance:</span>
                      <div className="flex items-center space-x-2 mt-1">
                        {solution.securityCleared ? (
                          <Shield className="w-4 h-4 text-green-500" />
                        ) : (
                          <Shield className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="text-sm">{solution.securityCleared ? "Cleared" : "Not Cleared"}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="font-medium text-sm">Capability Areas:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {solution.capabilityAreas && (solution.capabilityAreas as string[]).map((area: string, index: number) => (
                        <Badge key={index} variant="secondary" data-testid={`capability-${index}`}>
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Media & Documents */}
            {(solution.pitchVideoUrl || solution.documentUrls) && (
              <Card>
                <CardHeader>
                  <CardTitle>Media & Documents</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {solution.pitchVideoUrl && (
                    <div>
                      <h4 className="font-medium mb-2">Pitch Video</h4>
                      <Button variant="outline" data-testid="button-play-video">
                        <Play className="w-4 h-4 mr-2" />
                        Play Video
                      </Button>
                    </div>
                  )}
                  
                  {solution.documentUrls && (
                    <div>
                      <h4 className="font-medium mb-2">Technical Documents</h4>
                      <div className="space-y-2">
                        {(solution.documentUrls as string[]).map((doc: string, index: number) => (
                          <Button 
                            key={index} 
                            variant="outline" 
                            size="sm"
                            data-testid={`button-download-doc-${index}`}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Document {index + 1}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Government Reviews */}
            {isGovernmentUser && (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Government Reviews</CardTitle>
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
                          <form onSubmit={reviewForm.handleSubmit(onSubmitReview)} className="space-y-4">
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
                  </div>
                </CardHeader>
                <CardContent>
                  {reviewsLoading ? (
                    <p className="text-muted-foreground">Loading reviews...</p>
                  ) : reviews && reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map((review: any) => (
                        <div 
                          key={review.id} 
                          className="border border-border rounded-lg p-4"
                          data-testid={`review-${review.id}`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h5 className="font-medium">{review.title}</h5>
                              <div className="flex items-center space-x-1 mt-1">
                                {Array.from({ length: 5 }, (_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                                  />
                                ))}
                              </div>
                            </div>
                            <Badge variant="outline">
                              Verified Government User
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{review.description}</p>
                          
                          <div className="grid grid-cols-3 gap-4 text-xs">
                            <div>
                              <span className="font-medium">Readiness:</span>
                              <div className="w-full bg-secondary rounded-full h-2 mt-1">
                                <div 
                                  className="bg-green-500 h-2 rounded-full" 
                                  style={{ width: `${(review.readinessScore / 10) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                            <div>
                              <span className="font-medium">Interoperability:</span>
                              <div className="w-full bg-secondary rounded-full h-2 mt-1">
                                <div 
                                  className="bg-green-500 h-2 rounded-full" 
                                  style={{ width: `${(review.interoperabilityScore / 10) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                            <div>
                              <span className="font-medium">Support:</span>
                              <div className="w-full bg-secondary rounded-full h-2 mt-1">
                                <div 
                                  className="bg-green-500 h-2 rounded-full" 
                                  style={{ width: `${(review.supportScore / 10) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center mt-3 pt-3 border-t border-border">
                            <span className="text-xs text-muted-foreground">
                              {review.fieldTested ? "Field tested" : "Lab tested"} • 
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No reviews yet.</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Buttons */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isGovernmentUser && (
                  <>
                    <Button className="w-full" data-testid="button-request-demo">
                      <Eye className="w-4 h-4 mr-2" />
                      Request Demo
                    </Button>
                    <Button variant="outline" className="w-full" data-testid="button-request-assessment">
                      <Award className="w-4 h-4 mr-2" />
                      Request Assessment
                    </Button>
                    <Button variant="outline" className="w-full" data-testid="button-contact-vendor">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Contact Vendor
                    </Button>
                  </>
                )}
                
                {isVendorOwner && (
                  <>
                    <Button className="w-full" data-testid="button-edit-solution">
                      Edit Solution
                    </Button>
                    <Button variant="outline" className="w-full" data-testid="button-view-analytics">
                      View Analytics
                    </Button>
                  </>
                )}
                
                {!isGovernmentUser && !isVendorOwner && (
                  <p className="text-sm text-muted-foreground text-center">
                    Sign in to access more features
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Solution Stats */}
            {isGovernmentUser && reviews && reviews.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Review Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-accent">{averageRating.toFixed(1)}</div>
                    <div className="flex justify-center space-x-1 mt-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${i < Math.round(averageRating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const count = reviews.filter((r: any) => r.rating === rating).length;
                      const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                      return (
                        <div key={rating} className="flex items-center space-x-2">
                          <span className="text-sm w-4">{rating}★</span>
                          <div className="flex-1 bg-secondary rounded-full h-2">
                            <div 
                              className="bg-accent h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm w-8 text-muted-foreground">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Vendor Information */}
            {vendor && isGovernmentUser && (
              <Card>
                <CardHeader>
                  <CardTitle>Vendor Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="font-medium text-sm">Organization:</span>
                    <p className="text-sm text-muted-foreground">
                      {vendor.organization || "Individual Vendor"}
                    </p>
                  </div>
                  
                  <div>
                    <span className="font-medium text-sm">Business Size:</span>
                    <p className="text-sm text-muted-foreground">
                      {vendor.businessSize || "Not specified"}
                    </p>
                  </div>
                  
                  {vendor.cage && (
                    <div>
                      <span className="font-medium text-sm">CAGE Code:</span>
                      <p className="text-sm text-muted-foreground">{vendor.cage}</p>
                    </div>
                  )}
                  
                  <div>
                    <span className="font-medium text-sm">NATO Eligible:</span>
                    <p className="text-sm text-muted-foreground">
                      {vendor.natoEligible ? "Yes" : "No"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
