import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.enum(["vendor", "government"], {
    required_error: "Please select a role",
  }),
}).refine((data) => {
  if (data.role === "government" && !data.email.toLowerCase().endsWith('.mil')) {
    return false;
  }
  return true;
}, {
  message: "Government users must use a .mil email address",
  path: ["email"],
});

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;

interface AuthButtonsProps {
  variant?: "header" | "landing";
}

export function AuthButtons({ variant = "header" }: AuthButtonsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      role: undefined,
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await apiRequest("POST", "/api/login", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setIsOpen(false);
      toast({
        title: "Success",
        description: "Logged in successfully!",
      });
      window.location.reload();
    },
    onError: (error: Error) => {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await apiRequest("POST", "/api/register", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setIsOpen(false);
      toast({
        title: "Success",
        description: "Account created and logged in successfully!",
      });
      window.location.reload();
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onLoginSubmit = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterData) => {
    registerMutation.mutate(data);
  };

  if (variant === "header") {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            className="bg-accent text-primary font-medium hover:bg-yellow-500 transition-colors"
            data-testid="button-auth-dialog"
          >
            Sign In / Register
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Welcome to G-TEAD Marketplace</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Sign In</CardTitle>
                  <CardDescription>
                    Enter your credentials to access your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="your.email@example.com"
                        {...loginForm.register("email")}
                        data-testid="input-login-email"
                      />
                      {loginForm.formState.errors.email && (
                        <p className="text-sm text-red-500">{loginForm.formState.errors.email.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="Your password"
                        {...loginForm.register("password")}
                        data-testid="input-login-password"
                      />
                      {loginForm.formState.errors.password && (
                        <p className="text-sm text-red-500">{loginForm.formState.errors.password.message}</p>
                      )}
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={loginMutation.isPending}
                      data-testid="button-login-submit"
                    >
                      {loginMutation.isPending ? "Signing In..." : "Sign In"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Create Account</CardTitle>
                  <CardDescription>
                    Join G-TEAD as a Vendor or Government user
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-firstName">First Name</Label>
                        <Input
                          id="register-firstName"
                          placeholder="John"
                          {...registerForm.register("firstName")}
                          data-testid="input-register-firstName"
                        />
                        {registerForm.formState.errors.firstName && (
                          <p className="text-sm text-red-500">{registerForm.formState.errors.firstName.message}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="register-lastName">Last Name</Label>
                        <Input
                          id="register-lastName"
                          placeholder="Doe"
                          {...registerForm.register("lastName")}
                          data-testid="input-register-lastName"
                        />
                        {registerForm.formState.errors.lastName && (
                          <p className="text-sm text-red-500">{registerForm.formState.errors.lastName.message}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="your.email@example.com"
                        {...registerForm.register("email")}
                        data-testid="input-register-email"
                      />
                      {registerForm.formState.errors.email && (
                        <p className="text-sm text-red-500">{registerForm.formState.errors.email.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="At least 8 characters"
                        {...registerForm.register("password")}
                        data-testid="input-register-password"
                      />
                      {registerForm.formState.errors.password && (
                        <p className="text-sm text-red-500">{registerForm.formState.errors.password.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-role">Role</Label>
                      <Select 
                        onValueChange={(value) => registerForm.setValue("role", value as "vendor" | "government")}
                        data-testid="select-register-role"
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vendor">Vendor / Technology Provider</SelectItem>
                          <SelectItem value="government">Government / Military (.mil required)</SelectItem>
                        </SelectContent>
                      </Select>
                      {registerForm.formState.errors.role && (
                        <p className="text-sm text-red-500">{registerForm.formState.errors.role.message}</p>
                      )}
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={registerMutation.isPending}
                      data-testid="button-register-submit"
                    >
                      {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    );
  }

  // Landing page variant - direct buttons
  return (
    <div className="flex gap-4">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            className="bg-accent text-primary px-8 py-3 text-lg font-semibold hover:bg-yellow-500 transition-colors transform hover:scale-105"
            data-testid="button-landing-auth"
          >
            Get Started
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Join G-TEAD Marketplace</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="register" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="register">Register</TabsTrigger>
              <TabsTrigger value="login">Sign In</TabsTrigger>
            </TabsList>
            
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Create Account</CardTitle>
                  <CardDescription>
                    Join as a Vendor or Government user
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="landing-register-firstName">First Name</Label>
                        <Input
                          id="landing-register-firstName"
                          placeholder="John"
                          {...registerForm.register("firstName")}
                          data-testid="input-landing-register-firstName"
                        />
                        {registerForm.formState.errors.firstName && (
                          <p className="text-sm text-red-500">{registerForm.formState.errors.firstName.message}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="landing-register-lastName">Last Name</Label>
                        <Input
                          id="landing-register-lastName"
                          placeholder="Doe"
                          {...registerForm.register("lastName")}
                          data-testid="input-landing-register-lastName"
                        />
                        {registerForm.formState.errors.lastName && (
                          <p className="text-sm text-red-500">{registerForm.formState.errors.lastName.message}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="landing-register-email">Email</Label>
                      <Input
                        id="landing-register-email"
                        type="email"
                        placeholder="your.email@example.com"
                        {...registerForm.register("email")}
                        data-testid="input-landing-register-email"
                      />
                      {registerForm.formState.errors.email && (
                        <p className="text-sm text-red-500">{registerForm.formState.errors.email.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="landing-register-password">Password</Label>
                      <Input
                        id="landing-register-password"
                        type="password"
                        placeholder="At least 8 characters"
                        {...registerForm.register("password")}
                        data-testid="input-landing-register-password"
                      />
                      {registerForm.formState.errors.password && (
                        <p className="text-sm text-red-500">{registerForm.formState.errors.password.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="landing-register-role">Role</Label>
                      <Select 
                        onValueChange={(value) => registerForm.setValue("role", value as "vendor" | "government")}
                        data-testid="select-landing-register-role"
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vendor">Vendor / Technology Provider</SelectItem>
                          <SelectItem value="government">Government / Military (.mil required)</SelectItem>
                        </SelectContent>
                      </Select>
                      {registerForm.formState.errors.role && (
                        <p className="text-sm text-red-500">{registerForm.formState.errors.role.message}</p>
                      )}
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={registerMutation.isPending}
                      data-testid="button-landing-register-submit"
                    >
                      {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Sign In</CardTitle>
                  <CardDescription>
                    Access your existing account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="landing-login-email">Email</Label>
                      <Input
                        id="landing-login-email"
                        type="email"
                        placeholder="your.email@example.com"
                        {...loginForm.register("email")}
                        data-testid="input-landing-login-email"
                      />
                      {loginForm.formState.errors.email && (
                        <p className="text-sm text-red-500">{loginForm.formState.errors.email.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="landing-login-password">Password</Label>
                      <Input
                        id="landing-login-password"
                        type="password"
                        placeholder="Your password"
                        {...loginForm.register("password")}
                        data-testid="input-landing-login-password"
                      />
                      {loginForm.formState.errors.password && (
                        <p className="text-sm text-red-500">{loginForm.formState.errors.password.message}</p>
                      )}
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={loginMutation.isPending}
                      data-testid="button-landing-login-submit"
                    >
                      {loginMutation.isPending ? "Signing In..." : "Sign In"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}