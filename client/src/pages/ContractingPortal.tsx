import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Solution, Application } from "@shared/schema";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  FileText, 
  Shield, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Download,
  Upload,
  Users,
  DollarSign,
  Calendar
} from "lucide-react";

type StatsData = {
  solutions: number;
  vendors: number;
  contracts: number;
};

export default function ContractingPortal() {
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

  const { data: solutions } = useQuery<Solution[]>({
    queryKey: ["/api/solutions"],
    enabled: !!user?.id,
  });

  const { data: applications } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
    enabled: !!user?.id,
  });

  const { data: stats } = useQuery<StatsData>({
    queryKey: ["/api/stats"],
    enabled: !!user?.id,
  });

  if (isLoading || !isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user || !["contracting_officer", "admin"].includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Contracting officer access required. Please contact support to update your role.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const awardableSolutions = solutions?.filter((s: any) => s.status === "awardable") || [];
  const pendingApplications = applications?.filter((a: any) => a.status === "submitted") || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Contracting Portal</h1>
          <p className="text-muted-foreground">
            Execute FAR and Other Transaction agreements with automated documentation and compliance tools.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard" data-testid="tab-dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="awards" data-testid="tab-awards">Awards</TabsTrigger>
            <TabsTrigger value="documentation" data-testid="tab-documentation">Documentation</TabsTrigger>
            <TabsTrigger value="compliance" data-testid="tab-compliance">Compliance</TabsTrigger>
            <TabsTrigger value="templates" data-testid="tab-templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card data-testid="card-awardable-solutions">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Awardable Solutions</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{awardableSolutions.length}</div>
                  <p className="text-xs text-muted-foreground">Ready for contract award</p>
                </CardContent>
              </Card>

              <Card data-testid="card-pending-applications">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingApplications.length}</div>
                  <p className="text-xs text-muted-foreground">Applications awaiting review</p>
                </CardContent>
              </Card>

              <Card data-testid="card-total-value">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Contract Value</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.contracts || "$284M"}</div>
                  <p className="text-xs text-muted-foreground">Cumulative awarded</p>
                </CardContent>
              </Card>

              <Card data-testid="card-active-vendors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
                  <Users className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.vendors || "2,156"}</div>
                  <p className="text-xs text-muted-foreground">Registered in system</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Priority Actions Required</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {awardableSolutions.slice(0, 3).map((solution: any) => (
                      <div 
                        key={solution.id} 
                        className="flex items-center justify-between p-3 border border-border rounded-lg"
                        data-testid={`priority-action-${solution.id}`}
                      >
                        <div className="flex items-center space-x-3">
                          <AlertTriangle className="w-5 h-5 text-yellow-500" />
                          <div>
                            <p className="font-medium text-sm">{solution.title}</p>
                            <p className="text-xs text-muted-foreground">Ready for contract award</p>
                          </div>
                        </div>
                        <Button size="sm" data-testid={`button-process-award-${solution.id}`}>
                          Process Award
                        </Button>
                      </div>
                    ))}
                    {awardableSolutions.length === 0 && (
                      <p className="text-muted-foreground text-sm">No priority actions at this time</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Deadlines</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="font-medium text-sm">xTechHumanoid Phase 1</p>
                          <p className="text-xs text-muted-foreground">Application deadline</p>
                        </div>
                      </div>
                      <Badge variant="destructive">Oct 1, 2025</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-green-500" />
                        <div>
                          <p className="font-medium text-sm">xTechSearch 9 Applications</p>
                          <p className="text-xs text-muted-foreground">Final submission deadline</p>
                        </div>
                      </div>
                      <Badge variant="secondary">Dec 15, 2025</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="awards" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Contract Awards Management</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button data-testid="button-initiate-award">
                    <FileText className="w-4 h-4 mr-2" />
                    Initiate New Award
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Initiate Contract Award</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="award-type">Award Type</Label>
                        <Select>
                          <SelectTrigger data-testid="select-award-type">
                            <SelectValue placeholder="Select award type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="far">FAR-based Contract</SelectItem>
                            <SelectItem value="ot">Other Transaction Agreement</SelectItem>
                            <SelectItem value="sbir">SBIR Phase I</SelectItem>
                            <SelectItem value="sbir2">SBIR Phase II</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="contract-value">Estimated Contract Value</Label>
                        <Input 
                          id="contract-value" 
                          placeholder="$0.00"
                          data-testid="input-contract-value"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="justification">Award Justification</Label>
                      <Textarea 
                        id="justification"
                        placeholder="Provide justification for this award..."
                        className="min-h-[100px]"
                        data-testid="textarea-award-justification"
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" data-testid="button-cancel-award">Cancel</Button>
                      <Button data-testid="button-process-award">Process Award</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Awardable Solutions */}
            <div className="grid lg:grid-cols-2 gap-6">
              {awardableSolutions.map((solution: any) => (
                <Card key={solution.id} data-testid={`card-awardable-${solution.id}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{solution.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">Vendor ID: {solution.vendorId}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Awardable</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-medium">TRL:</span> {solution.trl}
                        </div>
                        <div>
                          <span className="font-medium">NATO:</span> {solution.natoCompatible ? "Compatible" : "Not Compatible"}
                        </div>
                        <div>
                          <span className="font-medium">Security:</span> {solution.securityCleared ? "Cleared" : "Not Cleared"}
                        </div>
                        <div>
                          <span className="font-medium">Status:</span> {solution.status}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" className="flex-1" data-testid={`button-award-${solution.id}`}>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Award Contract
                        </Button>
                        <Button size="sm" variant="outline" data-testid={`button-view-details-${solution.id}`}>
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {awardableSolutions.length === 0 && (
                <div className="col-span-full text-center py-8">
                  <p className="text-muted-foreground">No solutions currently ready for award.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="documentation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Automated Documentation Tools</CardTitle>
                <p className="text-muted-foreground">
                  Generate procurement documentation and evidence packages automatically
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Button className="h-20 flex-col space-y-2" data-testid="button-decision-memo">
                    <FileText className="w-6 h-6" />
                    <span>Auto-generate Decision Memo</span>
                  </Button>
                  
                  <Button className="h-20 flex-col space-y-2" data-testid="button-evidence-binder">
                    <Download className="w-6 h-6" />
                    <span>Competition Evidence Binder</span>
                  </Button>
                  
                  <Button className="h-20 flex-col space-y-2" data-testid="button-justification">
                    <FileText className="w-6 h-6" />
                    <span>Source Selection Justification</span>
                  </Button>
                  
                  <Button className="h-20 flex-col space-y-2" data-testid="button-performance-work">
                    <Upload className="w-6 h-6" />
                    <span>Performance Work Statement</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Document Repository</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-medium text-sm">Standard Acquisition Template</p>
                        <p className="text-xs text-muted-foreground">Last updated: Today</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" data-testid="button-download-template">
                      Download
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-medium text-sm">OT Agreement Template</p>
                        <p className="text-xs text-muted-foreground">Last updated: Yesterday</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" data-testid="button-download-ot">
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Compliance Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Button className="h-16 flex-col space-y-1" data-testid="button-far-compliance">
                    <span className="font-medium">FAR Compliance Check</span>
                    <span className="text-xs">Verify Federal Acquisition Regulation compliance</span>
                  </Button>
                  
                  <Button className="h-16 flex-col space-y-1" data-testid="button-ot-compliance">
                    <span className="font-medium">OT Authority Check</span>
                    <span className="text-xs">Validate Other Transaction authority</span>
                  </Button>
                  
                  <Button className="h-16 flex-col space-y-1" data-testid="button-security-review">
                    <span className="font-medium">Security Review</span>
                    <span className="text-xs">Assess security clearance requirements</span>
                  </Button>
                  
                  <Button className="h-16 flex-col space-y-1" data-testid="button-export-control">
                    <span className="font-medium">Export Control Review</span>
                    <span className="text-xs">Check ITAR and EAR restrictions</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="font-medium">FAR Part 15 Compliance</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Compliant</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="font-medium">Security Requirements</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Verified</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                      <span className="font-medium">Export Control Review</span>
                    </div>
                    <Badge variant="secondary">Pending</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contract Templates & Forms</CardTitle>
                <p className="text-muted-foreground">
                  Access standardized templates for various contract types and procurement methods
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <div className="text-center space-y-2">
                      <FileText className="w-8 h-8 mx-auto text-blue-500" />
                      <h3 className="font-medium">FAR Contract Template</h3>
                      <p className="text-xs text-muted-foreground">Standard federal acquisition contract</p>
                      <Button size="sm" className="w-full" data-testid="button-far-template">
                        Use Template
                      </Button>
                    </div>
                  </Card>
                  
                  <Card className="p-4">
                    <div className="text-center space-y-2">
                      <FileText className="w-8 h-8 mx-auto text-green-500" />
                      <h3 className="font-medium">OT Agreement Template</h3>
                      <p className="text-xs text-muted-foreground">Other Transaction agreement form</p>
                      <Button size="sm" className="w-full" data-testid="button-ot-template">
                        Use Template
                      </Button>
                    </div>
                  </Card>
                  
                  <Card className="p-4">
                    <div className="text-center space-y-2">
                      <FileText className="w-8 h-8 mx-auto text-purple-500" />
                      <h3 className="font-medium">SBIR Template</h3>
                      <p className="text-xs text-muted-foreground">Small Business Innovation Research</p>
                      <Button size="sm" className="w-full" data-testid="button-sbir-template">
                        Use Template
                      </Button>
                    </div>
                  </Card>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Template Library</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    "Performance Work Statement Template",
                    "Statement of Objectives Template",
                    "Requirements Document Template",
                    "Market Research Report Template",
                    "Independent Government Cost Estimate Template"
                  ].map((template, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 border border-border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                        <span className="font-medium text-sm">{template}</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" data-testid={`button-preview-${index}`}>
                          Preview
                        </Button>
                        <Button size="sm" data-testid={`button-use-${index}`}>
                          Use
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
