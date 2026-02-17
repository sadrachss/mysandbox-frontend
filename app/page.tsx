import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h1 className="text-6xl font-bold tracking-tight">
          MySandbox<span className="text-primary">.codes</span>
        </h1>
        <p className="text-2xl text-muted-foreground">
          Link Hub for Developers
        </p>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Create your developer profile with custom themes, unlimited links, and analytics.
          Perfect for GitHub profiles, resumes, and portfolios.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/auth/register">Get Started Free</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/auth/login">Sign In</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
