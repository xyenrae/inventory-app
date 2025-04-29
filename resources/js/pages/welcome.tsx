import { Head } from '@inertiajs/react';
import { LineChart, ShieldCheck, Users } from 'lucide-react';
import { Copyright } from 'lucide-react';

export default function Welcome({ title = 'Welcome', children }: { title?: string, children?: React.ReactNode }) {
    return (
        <>
            <Head title={title} />
            <div className="max-h-screen md:min-h-screen flex flex-col md:flex-row">
                {/* Left Side */}
                <div className="flex-1 flex flex-col justify-between px-8 py-12 bg-muted ">
                    <div className="max-w-md mx-auto  my-auto">
                        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                            Manage Your Inventory with Ease
                        </h1>
                        <p className="text-muted-foreground text-lg mb-8">
                            Simplify your company's inventory management with our modern platform.
                        </p>

                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <LineChart className="w-5 h-5 text-primary" />
                                <span className="text-muted-foreground">Real-time data tracking</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <ShieldCheck className="w-5 h-5 text-primary" />
                                <span className="text-muted-foreground">Detailed reporting & analytics</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Users className="w-5 h-5 text-primary" />
                                <span className="text-muted-foreground">Multi-user access control</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-center mt-8 text-sm text-muted-foreground hidden md:flex justify-center">
                        <div className="flex items-center justify-center space-x-1">
                            <Copyright className="w-4 h-4" />
                            <span>{new Date().getFullYear()} xyenrae. All rights reserved.</span>
                        </div>
                    </div>
                </div>

                {/* Right Side */}
                <div className="flex-1 flex flex-col justify-center px-8 py-12">
                    <div className="w-full max-w-md mx-auto">
                        {children}
                    </div>
                </div>

                <div className="text-center mt-8 text-sm text-muted-foreground flex md:hidden justify-center pb-4">
                    <div className="flex items-center justify-center space-x-1">
                        <Copyright className="w-4 h-4" />
                        <span>{new Date().getFullYear()} xyenrae. All rights reserved.</span>
                    </div>
                </div>
            </div>
        </>
    );
}
