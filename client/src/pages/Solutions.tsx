import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Building, Lightbulb } from "lucide-react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import type { Solution } from "@shared/schema";

export default function Solutions() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: solutions = [], isLoading } = useQuery<Solution[]>({
    queryKey: ["/api/solutions"],
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
            {filteredSolutions.map((solution) => (
              <Card 
                key={solution.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setLocation(`/solutions/${solution.id}`)}
                data-testid={`card-solution-${solution.id}`}
              >
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {solution.title}
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                    {solution.description.substring(0, 100)}...
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-500">
                      <Building className="w-4 h-4 mr-2" />
                      Vendor ID: {solution.vendorId}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">
                        TRL {solution.trl || 'TBD'}
                      </Badge>
                      {solution.natoCompatible && (
                        <Badge variant="outline" className="text-blue-600 border-blue-600">
                          NATO Compatible
                        </Badge>
                      )}
                    </div>
                    
                    <Button 
                      size="sm" 
                      className="w-full mt-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocation(`/solutions/${solution.id}`);
                      }}
                      data-testid={`button-view-solution-${solution.id}`}
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