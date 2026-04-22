import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Loader2, Mail, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
        setSubmitted(true);
        setLoading(false);
    }, 1500);
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Panel - Hero/Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-between p-12 text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/40"></div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary-600 rounded-lg">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold">ML Provisioner</span>
          </div>
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-6 leading-tight">
            Account Recovery<br/>
            <span className="text-primary-400">Secure & Fast</span>
          </h1>
          <p className="text-slate-300 text-lg max-w-md">
            Don't worry, it happens to the best of us. 
            We'll help you get back to your notebooks in no time.
          </p>
        </div>

        <div className="relative z-10 text-sm text-slate-500">
          © 2024 ML Provisioner Inc.
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 bg-white">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="lg:hidden mb-8">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-primary-600 rounded-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">ML Provisioner</span>
            </div>
          </div>

          {!submitted ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
                <div className="mb-8">
                    <Link to="/login" className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 mb-6">
                        <ArrowLeft className="mr-1 h-4 w-4" />
                        Back to sign in
                    </Link>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Forgot password?</h2>
                    <p className="mt-2 text-sm text-slate-600">
                    No worries, we'll send you reset instructions.
                    </p>
                </div>

                <form onSubmit={submitHandler} className="space-y-6">
                    <div>
                    <Label htmlFor="email">Email address</Label>
                    <div className="relative mt-2">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-400" />
                        </div>
                        <Input
                        id="email"
                        type="email"
                        required
                        className="pl-10"
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    </div>

                    <Button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center items-center py-2.5"
                    >
                    {loading ? (
                        <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                        </>
                    ) : (
                        <>
                        Reset password
                        <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                    )}
                    </Button>
                </form>
            </motion.div>
          ) : (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
            >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-medium leading-6 text-slate-900">Check your email</h3>
                <p className="mt-2 text-sm text-slate-500">
                    We sent a password reset link to <span className="font-medium text-slate-900">{email}</span>
                </p>
                <div className="mt-6">
                    <Link to="/login">
                        <Button variant="outline" className="w-full">
                            Back to sign in
                        </Button>
                    </Link>
                </div>
                <div className="mt-4 text-sm text-slate-500">
                    Didn't receive the email?{' '}
                    <button onClick={() => setSubmitted(false)} className="text-primary-600 font-medium hover:text-primary-500">
                        Click to resend
                    </button>
                </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordScreen;