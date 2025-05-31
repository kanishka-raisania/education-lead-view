
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { GraduationCap, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AuthPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  const [signupForm, setSignupForm] = useState({
    email: '',
    password: '',
    fullName: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn(loginForm.email, loginForm.password);
      
      if (error) {
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in."
        });
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signUp(signupForm.email, signupForm.password, signupForm.fullName);
      
      if (error) {
        toast({
          title: "Signup Failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Account Created!",
          description: "Please check your email to verify your account."
        });
      }
    } catch (error) {
      toast({
        title: "Signup Failed",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <GraduationCap className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Help Study Abroad</CardTitle>
          <CardDescription>Lead Dashboard Authentication</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Login
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    value={signupForm.fullName}
                    onChange={(e) => setSignupForm(prev => ({ ...prev, fullName: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signupForm.password}
                    onChange={(e) => setSignupForm(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign Up
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
