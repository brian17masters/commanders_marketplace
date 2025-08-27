import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { 
  Star, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Play,
  Award,
  Building
} from "lucide-react";

interface SolutionCardProps {
  solution: {
    id: string;
    title: string;
    description: string;
    trl: number;
    natoCompatible: boolean;
    securityCleared: boolean;
    status: string;
    vendorId: string;
    capabilityAreas?: string[];
    pitchVideoUrl?: string;
    createdAt: string;
  };
  showGovernmentFeatures?: boolean;
  reviews?: any[];
}

export default function SolutionCard({ 
  solution, 
  showGovernmentFeatures = false,
  reviews = []
}: SolutionCardProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const isGovernmentUser = user && ["government", "contracting_officer", "admin"].includes(user.role);
  const isVendorOwner = user && user.id === solution.vendorId;
  
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length
    : 0;

  const handleViewDetails = () => {
    setLocation(`/solutions/${solution.id}`);
  };

  const handleRequestDemo = () => {
    // This would typically open a modal or redirect to a demo request form
    console.log("Request demo for solution:", solution.id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "awardable":
        return "default";
      case "under_review":
        return "secondary";
      case "rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "awardable":
        return "Awardable";
      case "under_review":
        return "Under Review";
      case "rejected":
        return "Rejected";
      case "submitted":
        return "Submitted";
      default:
        return status;
    }
  };

  return (
    <Card 
      className={`hover:shadow-lg transition-shadow cursor-pointer ${
        reviews.length > 0 ? 'ring-2 ring-yellow-200 bg-yellow-50/30' : ''
      }`}
      data-testid={`card-solution-${solution.id}`}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle 
              className="text-lg mb-2 hover:text-primary transition-colors"
              onClick={handleViewDetails}
              data-testid={`text-solution-title-${solution.id}`}
            >
              {solution.title}
            </CardTitle>
            <div className="flex items-center space-x-2 mb-2">
              <Badge variant={getStatusColor(solution.status)}>
                {getStatusText(solution.status)}
              </Badge>
              {reviews.length > 0 && (
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">{averageRating.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
                </div>
              )}
            </div>
          </div>
          {solution.pitchVideoUrl && (
            <Button size="sm" variant="outline" className="ml-2">
              <Play className="w-3 h-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p 
          className="text-sm text-muted-foreground line-clamp-3"
          data-testid={`text-solution-description-${solution.id}`}
        >
          {solution.description}
        </p>

        {/* Technical Specifications */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-medium">TRL:</span>
            <Badge variant="outline" className="text-xs">{solution.trl}</Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="font-medium">NATO:</span>
            {solution.natoCompatible ? (
              <CheckCircle className="w-3 h-3 text-green-500" />
            ) : (
              <XCircle className="w-3 h-3 text-red-500" />
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="font-medium">Security:</span>
            {solution.securityCleared ? (
              <Shield className="w-3 h-3 text-green-500" />
            ) : (
              <Shield className="w-3 h-3 text-gray-400" />
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="font-medium">Submitted:</span>
            <span className="text-muted-foreground">
              {new Date(solution.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Capability Areas */}
        {solution.capabilityAreas && solution.capabilityAreas.length > 0 && (
          <div>
            <span className="text-xs font-medium mb-2 block">Capabilities:</span>
            <div className="flex flex-wrap gap-1">
              {solution.capabilityAreas.slice(0, 3).map((area, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="text-xs"
                  data-testid={`capability-${solution.id}-${index}`}
                >
                  {area}
                </Badge>
              ))}
              {solution.capabilityAreas.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{solution.capabilityAreas.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Government-only Features */}
        {isGovernmentUser && showGovernmentFeatures && (
          <div className="pt-2 border-t border-border">
            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
              <div>
                <span className="font-medium text-green-600">✓ Gov Verified</span>
              </div>
              <div>
                <span className="font-medium">Reviews: {reviews.length}</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            size="sm" 
            className="flex-1"
            onClick={handleViewDetails}
            data-testid={`button-view-solution-${solution.id}`}
          >
            <Eye className="w-3 h-3 mr-1" />
            View Details
          </Button>
          
          {isGovernmentUser && showGovernmentFeatures && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleRequestDemo}
              data-testid={`button-request-demo-${solution.id}`}
            >
              <Award className="w-3 h-3 mr-1" />
              Demo
            </Button>
          )}
          
          {isVendorOwner && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setLocation(`/vendor-portal`)}
              data-testid={`button-edit-solution-${solution.id}`}
            >
              Edit
            </Button>
          )}
        </div>

        {/* Vendor Info for Government Users */}
        {isGovernmentUser && showGovernmentFeatures && (
          <div className="flex items-center space-x-2 pt-2 text-xs text-muted-foreground border-t border-border">
            <Building className="w-3 h-3" />
            <span>Vendor ID: {solution.vendorId.slice(0, 8)}...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
