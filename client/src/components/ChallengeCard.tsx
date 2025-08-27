import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { 
  Calendar, 
  DollarSign, 
  Users, 
  Award,
  Clock,
  CheckCircle,
  FileText
} from "lucide-react";

interface ChallengeCardProps {
  challenge: {
    id: string;
    title: string;
    description: string;
    type: string;
    status: string;
    prizePool?: string;
    applicationDeadline?: string;
    finalsDate?: string;
    phases?: any[];
    focusAreas?: string[];
    createdAt: string;
  };
  userApplication?: {
    id: string;
    status: string;
    phase: number;
    createdAt: string;
    feedback?: string;
  };
}

export default function ChallengeCard({ challenge, userApplication }: ChallengeCardProps) {
  const { isAuthenticated, user } = useAuth();
  const [, setLocation] = useLocation();

  const isVendor = user?.role === "vendor";
  const hasApplied = !!userApplication;

  const handleViewDetails = () => {
    setLocation(`/challenges/${challenge.id}`);
  };

  const handleApplyNow = () => {
    setLocation(`/challenges/${challenge.id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "destructive"; // Red for urgency
      case "active":
        return "default"; // Green for active
      case "closed":
        return "secondary"; // Gray for closed
      default:
        return "outline";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "open":
        return "Open";
      case "active":
        return "Active";
      case "closed":
        return "Closed";
      default:
        return status;
    }
  };

  const getChallengeTypeIcon = (type: string) => {
    switch (type) {
      case "xtech":
        return <Users className="w-6 h-6 text-primary" />;
      case "open_call":
        return <FileText className="w-6 h-6 text-primary" />;
      case "aos_call":
        return <Award className="w-6 h-6 text-primary" />;
      default:
        return <FileText className="w-6 h-6 text-primary" />;
    }
  };

  const getChallengeTypeLabel = (type: string) => {
    switch (type) {
      case "xtech":
        return "xTech Competition";
      case "open_call":
        return "Open Call";
      case "aos_call":
        return "AOS Call";
      default:
        return "Competition";
    }
  };

  const formatPrizePool = (prizePool?: string) => {
    if (!prizePool) return "TBD";
    const amount = parseFloat(prizePool);
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const isDeadlineApproaching = () => {
    if (!challenge.applicationDeadline) return false;
    const deadline = new Date(challenge.applicationDeadline);
    const now = new Date();
    const daysUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return daysUntilDeadline <= 30 && daysUntilDeadline > 0;
  };

  return (
    <Card 
      className="hover:shadow-lg transition-shadow"
      data-testid={`card-challenge-${challenge.id}`}
    >
      <CardHeader>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
              {getChallengeTypeIcon(challenge.type)}
            </div>
            <div>
              <CardTitle 
                className="text-xl font-bold cursor-pointer hover:text-primary transition-colors"
                onClick={handleViewDetails}
                data-testid={`text-challenge-title-${challenge.id}`}
              >
                {challenge.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {getChallengeTypeLabel(challenge.type)}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <Badge variant={getStatusColor(challenge.status)}>
              {getStatusText(challenge.status)}
            </Badge>
            {isDeadlineApproaching() && challenge.status === "open" && (
              <Badge variant="destructive" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                Deadline Soon
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p 
          className="text-muted-foreground line-clamp-3"
          data-testid={`text-challenge-description-${challenge.id}`}
        >
          {challenge.description}
        </p>

        {/* Key Details */}
        <div className="grid grid-cols-2 gap-4">
          {challenge.applicationDeadline && (
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Deadline</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(challenge.applicationDeadline).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}

          {challenge.prizePool && (
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Prize Pool</p>
                <p className="text-xs text-muted-foreground">
                  {formatPrizePool(challenge.prizePool)}
                </p>
              </div>
            </div>
          )}

          {challenge.phases && challenge.phases.length > 0 && (
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Phases</p>
                <p className="text-xs text-muted-foreground">
                  {challenge.phases.length} phase{challenge.phases.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          )}

          {challenge.finalsDate && (
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Finals</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(challenge.finalsDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Focus Areas */}
        {challenge.focusAreas && challenge.focusAreas.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Focus Areas:</p>
            <div className="flex flex-wrap gap-1">
              {challenge.focusAreas.slice(0, 3).map((area, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="text-xs"
                  data-testid={`focus-area-${challenge.id}-${index}`}
                >
                  {area}
                </Badge>
              ))}
              {challenge.focusAreas.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{challenge.focusAreas.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Application Status for Vendors */}
        {isVendor && hasApplied && (
          <div className="p-3 bg-secondary rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Your Application</span>
              <Badge variant="outline" className="text-xs">
                Phase {userApplication.phase}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-muted-foreground">
                Status: {userApplication.status}
              </span>
            </div>
            {userApplication.feedback && (
              <p className="text-xs text-muted-foreground mt-2">
                Latest feedback available
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button 
            className="flex-1"
            variant="outline"
            onClick={handleViewDetails}
            data-testid={`button-view-details-${challenge.id}`}
          >
            View Details
          </Button>
          
          {isVendor && challenge.status === "open" && !hasApplied && (
            <Button 
              className="flex-1"
              onClick={handleApplyNow}
              data-testid={`button-apply-${challenge.id}`}
            >
              Apply Now
            </Button>
          )}
          
          {isVendor && hasApplied && (
            <Button 
              className="flex-1"
              variant="secondary"
              onClick={handleViewDetails}
              data-testid={`button-view-application-${challenge.id}`}
            >
              View Application
            </Button>
          )}
          
          {!isAuthenticated && challenge.status === "open" && (
            <Button 
              className="flex-1"
              onClick={handleApplyNow}
              data-testid={`button-apply-signin-${challenge.id}`}
            >
              Sign In to Apply
            </Button>
          )}
        </div>

        {/* Additional Info */}
        <div className="flex justify-between items-center text-xs text-muted-foreground pt-2 border-t border-border">
          <span>Posted {new Date(challenge.createdAt).toLocaleDateString()}</span>
          {challenge.type === "xtech" && (
            <Badge variant="outline" className="text-xs">
              xTech Program
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
