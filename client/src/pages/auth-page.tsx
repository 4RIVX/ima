import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, type InsertUser } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScanSearch, ShieldCheck, Zap } from "lucide-react";
import { useLocation } from "wouter";

export default function AuthPage() {
  const { login, register, isLoggingIn, isRegistering, user, isLoading } = useAuth();
  const [_, setLocation] = useLocation();

  if (isLoading) return null;
  if (user) {
    setLocation("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 lg:p-8">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
        
        {/* Left Side: Marketing */}
        <div className="hidden lg:flex flex-col space-y-8">
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
              <ScanSearch className="w-7 h-7" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
              MorphyDetector <br />
              <span className="text-muted-foreground">2026 Edition</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-md leading-relaxed">
              Advanced AI image analysis for enterprise security. Detect manipulated media with 99.9% accuracy.
            </p>
          </div>

          <div className="grid gap-6">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-secondary/50 border border-border">
              <ShieldCheck className="w-6 h-6 text-primary mt-1" />
              <div>
                <h3 className="font-semibold text-lg">Bank-Grade Security</h3>
                <p className="text-muted-foreground">Your data is encrypted and processed securely in our private cloud.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-xl bg-secondary/50 border border-border">
              <Zap className="w-6 h-6 text-primary mt-1" />
              <div>
                <h3 className="font-semibold text-lg">Instant Analysis</h3>
                <p className="text-muted-foreground">Get results in milliseconds. Powered by our proprietary Morphy Engine.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Forms */}
        <div className="w-full max-w-md mx-auto">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Create Account</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <AuthForm 
                mode="login" 
                onSubmit={login} 
                isLoading={isLoggingIn} 
              />
            </TabsContent>
            
            <TabsContent value="register">
              <AuthForm 
                mode="register" 
                onSubmit={register} 
                isLoading={isRegistering} 
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function AuthForm({ mode, onSubmit, isLoading }: { mode: "login" | "register", onSubmit: (data: InsertUser) => void, isLoading: boolean }) {
  const form = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  return (
    <Card className="border-border shadow-xl shadow-black/5">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">
          {mode === "login" ? "Welcome back" : "Create an account"}
        </CardTitle>
        <CardDescription>
          {mode === "login" 
            ? "Enter your credentials to access your dashboard" 
            : "Enter your email and choose a password to get started"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="jdoe" {...field} className="bg-secondary/20" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} className="bg-secondary/20" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full font-semibold shadow-lg shadow-primary/20" 
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : (mode === "login" ? "Sign In" : "Create Account")}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-center w-full text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </CardFooter>
    </Card>
  );
}
