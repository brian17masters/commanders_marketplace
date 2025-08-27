import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Building, Lightbulb, Star } from "lucide-react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import SolutionCard from "@/components/SolutionCard";
import type { Solution } from "@shared/schema";

export default function Solutions() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: solutions = [], isLoading } = useQuery<Solution[]>({
    queryKey: ["/api/solutions"],
  });

  // Fetch reviews for all solutions
  const { data: solutionReviews = {} } = useQuery({
    queryKey: ['/api/solutions-reviews'],
    queryFn: async () => {
      const reviewsData: {[key: string]: any[]} = {};
      if (solutions.length > 0) {
        await Promise.all(
          solutions.map(async (solution) => {
            try {
              const response = await fetch(`/api/solutions/${solution.id}/reviews`);
              if (response.ok) {
                reviewsData[solution.id] = await response.json();
              } else {
                reviewsData[solution.id] = [];
              }
            } catch {
              reviewsData[solution.id] = [];
            }
          })
        );
      }
      return reviewsData;
    },
    enabled: solutions.length > 0,
  });

  const filteredSolutions = solutions.filter(solution =>
    solution.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    solution.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Technology Solutions
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Browse innovative solutions from vendors worldwide
          </p>
          
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search solutions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-solutions"
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
        ) : filteredSolutions.length === 0 ? (
          <div className="text-center py-12">
            <Lightbulb className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? "No solutions found" : "No solutions available"}
            </h3>
            <p className="text-gray-500">
              {searchTerm 
                ? "Try adjusting your search criteria" 
                : "Check back later for new technology solutions"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSolutions.map((solution) => {
              const reviews = solutionReviews[solution.id] || [];
              return (
                <SolutionCard
                  key={solution.id}
                  solution={solution}
                  reviews={reviews}
                  showGovernmentFeatures={true}
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}