import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { LogIn, UserPlus, User, Cloud, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
// import { signIn, signUp, getCurrentUser, syncData } from '@/services/firebase';
import { useProjects } from '@/contexts/ProjectContext';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

interface AuthModalProps {
  children: React.ReactNode;
}

export function AuthModal({ children }: AuthModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [authStatus, setAuthStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [authMessage, setAuthMessage] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { exportUserData, importUserData } = useProjects();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleLogin = async (data: LoginFormData) => {
    setAuthStatus('loading');
    setAuthMessage('Signing in...');

    // Temporarily disabled Firebase
    setAuthStatus('error');
    setAuthMessage('Firebase integration temporarily disabled');
    
    // const result = await signIn(data.email, data.password);
    
    // if (result.success) {
    //   setAuthStatus('success');
    //   setAuthMessage('Successfully signed in!');
    //   setCurrentUser(result.user);
      
    //   // Sync data with cloud
    //   await handleDataSync(result.user.uid);
      
    //   setTimeout(() => {
    //     setIsOpen(false);
    //     setAuthStatus('idle');
    //     setAuthMessage('');
    //     loginForm.reset();
    //   }, 2000);
    // } else {
    //   setAuthStatus('error');
    //   setAuthMessage(result.error);
    // }
  };

  const handleSignup = async (data: SignupFormData) => {
    setAuthStatus('loading');
    setAuthMessage('Creating account...');

    // Temporarily disabled Firebase
    setAuthStatus('error');
    setAuthMessage('Firebase integration temporarily disabled');
    
    // const result = await signUp(data.email, data.password);
    
    // if (result.success) {
    //   setAuthStatus('success');
    //   setAuthMessage('Account created successfully!');
    //   setCurrentUser(result.user);
      
    //   // Sync data with cloud
    //   await handleDataSync(result.user.uid);
      
    //   setTimeout(() => {
    //     setIsOpen(false);
    //     setAuthStatus('idle');
    //     setAuthMessage('');
    //     signupForm.reset();
    //   }, 2000);
    // } else {
    //   setAuthStatus('error');
    //   setAuthMessage(result.error);
    // }
  };

  // const handleDataSync = async (userId: string) => {
  //   try {
  //     // Export current local data
  //     const localData = {
  //       projects: JSON.parse(localStorage.getItem('deadline-bloom-data') || '{}'),
  //       lastUpdated: new Date().toISOString()
  //     };

  //     const syncResult = await syncData(userId, localData);
      
  //     if (syncResult.success && syncResult.action === 'downloaded') {
  //       // Import cloud data if it's newer
  //       const dataBlob = new Blob([JSON.stringify(syncResult.data)], { type: 'application/json' });
  //       const file = new File([dataBlob], 'cloud-data.json', { type: 'application/json' });
  //       await importUserData(file);
  //     }
  //   } catch (error) {
  //     console.error('Error syncing data:', error);
  //   }
  // };

  const handleSignOut = async () => {
    // Export current data before signing out
    exportUserData();
    setCurrentUser(null);
  };

  const getStatusIcon = () => {
    switch (authStatus) {
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (authStatus) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {currentUser ? <User className="h-5 w-5" /> : <LogIn className="h-5 w-5" />}
            {currentUser ? 'Account' : 'Sign In'}
          </DialogTitle>
        </DialogHeader>

        {currentUser ? (
          // User is signed in
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <User className="h-8 w-8 text-blue-600" />
              <div>
                <p className="font-medium">{currentUser.email}</p>
                <Badge variant="secondary" className="flex items-center gap-1 mt-1">
                  <Cloud className="h-3 w-3" />
                  Cloud Sync Enabled
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                onClick={() => exportUserData()}
                className="w-full"
                variant="outline"
              >
                Export Data
              </Button>
              
              <Button
                onClick={handleSignOut}
                className="w-full"
                variant="destructive"
              >
                Sign Out
              </Button>
            </div>
          </div>
        ) : (
          // User is not signed in
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'signup')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter your email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter your password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={authStatus === 'loading'}
                  >
                    {authStatus === 'loading' ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      <>
                        <LogIn className="h-4 w-4 mr-2" />
                        Sign In
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <Form {...signupForm}>
                <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
                  <FormField
                    control={signupForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter your email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter your password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Confirm your password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={authStatus === 'loading'}
                  >
                    {authStatus === 'loading' ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Create Account
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            {authStatus !== 'idle' && (
              <Alert className={getStatusColor()}>
                <div className="flex items-center gap-2">
                  {getStatusIcon()}
                  <AlertDescription>{authMessage}</AlertDescription>
                </div>
              </Alert>
            )}
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
