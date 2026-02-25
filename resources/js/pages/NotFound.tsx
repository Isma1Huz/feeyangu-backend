import { useEffect } from "react";
import { Head, Link } from '@inertiajs/react';
import { useT } from '@/contexts/LanguageContext';

const NotFound = () => {
  const { COMMON_TEXT } = useT();

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <Head title={COMMON_TEXT.notFoundTitle} />
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">{COMMON_TEXT.notFoundTitle}</h1>
        <p className="mb-4 text-xl text-muted-foreground">{COMMON_TEXT.notFoundMessage}</p>
        <Link href="/" className="text-primary underline hover:text-primary/90">
          {COMMON_TEXT.notFoundLink}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
