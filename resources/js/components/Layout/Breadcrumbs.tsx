import React from 'react';
import { usePage, Link } from '@inertiajs/react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface Props {
    items?: BreadcrumbItem[];
}

const Breadcrumbs: React.FC<Props> = ({ items }) => {
    const url = usePage().url;

    // Auto-generate breadcrumbs from URL if not provided
    const breadcrumbs = items ?? generateFromUrl(url);

    if (breadcrumbs.length === 0) return null;

    return (
        <nav aria-label="Breadcrumb" className="flex items-center text-sm text-muted-foreground">
            <Link href="/" className="flex items-center hover:text-foreground transition-colors">
                <Home className="h-4 w-4" />
            </Link>
            {breadcrumbs.map((item, i) => (
                <React.Fragment key={i}>
                    <ChevronRight className="h-4 w-4 mx-1 shrink-0" />
                    {item.href && i < breadcrumbs.length - 1 ? (
                        <Link href={item.href} className="hover:text-foreground transition-colors">
                            {item.label}
                        </Link>
                    ) : (
                        <span className={i === breadcrumbs.length - 1 ? 'text-foreground font-medium' : ''}>
                            {item.label}
                        </span>
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
};

function generateFromUrl(url: string): BreadcrumbItem[] {
    const segments = url.split('/').filter(Boolean);
    const items: BreadcrumbItem[] = [];
    let path = '';

    for (const segment of segments) {
        path += `/${segment}`;
        const label = segment
            .replace(/-/g, ' ')
            .replace(/_/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase());

        // Skip numeric IDs as labels but keep them in the path
        if (/^\d+$/.test(segment)) {
            items.push({ label: `#${segment}` });
        } else {
            items.push({ label, href: path });
        }
    }

    return items;
}

export default Breadcrumbs;
