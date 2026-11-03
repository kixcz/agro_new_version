import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Mail, Lock, Eye, EyeOff, User, Building2, Sprout } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LoginForm {
    email: string;
    password: string;
    remember: boolean;
    [key: string]: string | boolean;
}

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showFarmerJoin, setShowFarmerJoin] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    const { data: farmerData, setData: setFarmerData, processing: farmerProcessing, errors: farmerErrors } = useForm({
        lfid: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    const handleFarmerJoin: FormEventHandler = (e) => {
        e.preventDefault();
        if (farmerData.lfid.trim()) {
            sessionStorage.setItem('pending_lfid', farmerData.lfid);
            window.location.href = route('farmer.login');
        }
    };

    return (
        <>
            <Head title="Log in" />
            <div className="grid min-h-screen lg:grid-cols-2">
                {/* Left Column - Cover Image (Sticky) */}
                <div className="relative hidden lg:block lg:sticky lg:top-0 lg:h-screen">
                    <div className="absolute inset-0 bg-emerald-700">
                        <img
                            src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&h=1600&fit=crop"
                            alt="Agricultural landscape with rice fields"
                            className="absolute inset-0 h-full w-full object-cover mix-blend-overlay opacity-30"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-800 to-emerald-900/95" />
                    </div>
                    
                    {/* Branding Overlay */}
                    <div className="relative z-10 flex h-full flex-col items-center justify-center p-12 text-center text-white">
                        <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                            <Sprout className="h-10 w-10" />
                        </div>
                        <h1 className="mb-4 text-4xl font-bold">Department of Agriculture</h1>
                        <p className="mb-8 max-w-md text-lg text-emerald-100">
                            Farmer Registry Information System
                        </p>
                        <div className="space-y-4 rounded-xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
                            <p className="text-sm text-emerald-50">
                                Secure access to farmer management, crop monitoring, and agricultural services
                            </p>
                            <div className="flex items-center justify-center gap-2 text-xs text-emerald-200">
                                <Building2 className="h-4 w-4" />
                                <span>Republic of the Philippines</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Login Form */}
                <div className="flex flex-col gap-8 p-6 md:p-12 lg:p-16">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-700">
                            <Sprout className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">AgriSystem</h2>
                            <p className="text-sm text-gray-500">Farmer Management Portal</p>
                        </div>
                    </div>

                    {/* Login Form Container */}
                    <div className="flex flex-1 items-center justify-center">
                        <div className="w-full max-w-md">
                            <div className="mb-8">
                                <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
                                <p className="mt-2 text-sm text-gray-600">
                                    Enter your credentials to access your account
                                </p>
                            </div>

                            {status && (
                                <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                                    {status}
                                </div>
                            )}

                            <form onSubmit={submit} className="space-y-5">
                                <div className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                            Email address
                                        </Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                            <Input
                                                id="email"
                                                type="email"
                                                required
                                                autoFocus
                                                tabIndex={1}
                                                autoComplete="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                placeholder="email@example.com"
                                                className="pl-10 h-11"
                                            />
                                        </div>
                                        <InputError message={errors.email} />
                                    </div>

                                    <div className="grid gap-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                                                Password
                                            </Label>
                                            {canResetPassword && (
                                                <TextLink
                                                    href={route('password.request')}
                                                    className="text-sm"
                                                    tabIndex={5}
                                                >
                                                    Forgot password?
                                                </TextLink>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                            <Input
                                                id="password"
                                                type={showPassword ? 'text' : 'password'}
                                                required
                                                tabIndex={2}
                                                autoComplete="current-password"
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                placeholder="Enter your password"
                                                className="pl-10 pr-10 h-11"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                                tabIndex={-1}
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        <InputError message={errors.password} />
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox id="remember" name="remember" tabIndex={3} />
                                    <Label htmlFor="remember" className="text-sm text-gray-600">
                                        Remember me
                                    </Label>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-11 bg-emerald-700 hover:bg-emerald-800"
                                    tabIndex={4}
                                    disabled={processing}
                                >
                                    {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin text-emerald-400" />}
                                    Log in
                                </Button>

                                {!showFarmerJoin ? (
                                    <button
                                        type="button"
                                        onClick={() => setShowFarmerJoin(true)}
                                        className="w-full text-sm text-emerald-700 hover:text-emerald-800 hover:underline"
                                    >
                                        Join as Farmer →
                                    </button>
                                ) : null}
                            </form>

                            {showFarmerJoin && (
                                <div className="mt-5 space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                                    <div className="text-sm font-medium text-center text-gray-700">
                                        Enter your Local Farmer ID (LFID)
                                    </div>
                                    <form onSubmit={handleFarmerJoin} className="space-y-3">
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                            <Input
                                                id="farmer-lfid"
                                                type="text"
                                                value={farmerData.lfid}
                                                className="pl-10 h-11"
                                                autoComplete="lfid"
                                                placeholder="Enter your LFID"
                                                autoFocus
                                                onChange={(e) => setFarmerData('lfid', e.target.value)}
                                            />
                                        </div>
                                        <InputError message={farmerErrors.lfid} />
                                        <div className="flex gap-2">
                                            <Button
                                                type="submit"
                                                className="flex-1 h-10 bg-emerald-700 hover:bg-emerald-800"
                                                disabled={farmerProcessing}
                                                size="sm"
                                            >
                                                {farmerProcessing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin text-emerald-400" />}
                                                Continue
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="flex-1 h-10"
                                                onClick={() => {
                                                    setShowFarmerJoin(false);
                                                    setFarmerData('lfid', '');
                                                }}
                                                size="sm"
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            <div className="mt-8 text-center text-sm text-gray-600">
                                Don't have an account?{' '}
                                <TextLink href={route('register')} tabIndex={5} className="font-medium text-emerald-700 hover:text-emerald-800">
                                    Sign up
                                </TextLink>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center text-xs text-gray-500">
                        © 2026 Department of Agriculture • Republic of the Philippines
                    </div>
                </div>
            </div>
        </>
    );
}
