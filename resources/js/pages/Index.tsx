import { Head, Link } from '@inertiajs/react';

export default function Index() {
  return (
    <>
      <Head title="Welcome to FeeYangu" />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-background">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to FeeYangu</h1>
          <p className="text-muted-foreground mb-8">School Fee Management System</p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </div>
    </>
  );
}
