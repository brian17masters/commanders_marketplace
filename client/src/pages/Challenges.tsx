import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Calendar, Trophy } from "lucide-react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import type { Challenge } from "@shared/schema";

export default function Challenges() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: challenges = [], isLoading } = useQuery<Challenge[]>({
    queryKey: ["/api/challenges"],
  });

  const filteredChallenges = challenges.filter(challenge =>
    challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    challenge.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen circuit-board circuit-nodes">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Technology Challenges
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Explore current challenges and innovation opportunities
          </p>
          
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search challenges..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-challenges"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredChallenges.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? "No challenges found" : "No challenges available"}
            </h3>
            <p className="text-gray-500">
              {searchTerm 
                ? "Try adjusting your search criteria" 
                : "Check back later for new innovation opportunities"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChallenges.map((challenge) => (
              <Card 
                key={challenge.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setLocation(`/challenges/${challenge.id}`)}
                data-testid={`card-challenge-${challenge.id}`}
              >
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {challenge.title}
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                    {challenge.description.substring(0, 100)}...
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      Deadline: {challenge.applicationDeadline ? new Date(challenge.applicationDeadline).toLocaleDateString() : 'TBD'}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">
                        {challenge.status}
                      </Badge>
                      <Badge variant="outline">
                        ${challenge.prizePool ? Number(challenge.prizePool).toLocaleString() : 'TBD'}
                      </Badge>
                    </div>
                    
                    <Button 
                      size="sm" 
                      className="w-full mt-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocation(`/challenges/${challenge.id}`);
                      }}
                      data-testid={`button-view-challenge-${challenge.id}`}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}