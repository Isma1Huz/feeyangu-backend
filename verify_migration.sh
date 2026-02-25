#!/bin/bash

echo "=== Navigation Components Migration Verification ==="
echo ""

echo "1. AppSidebar.tsx"
echo "   ✓ Inertia imports:" && grep -c "import { Link, usePage }" resources/js/components/AppSidebar.tsx && echo "   ✓ usePage().url:" && grep -c "const { url } = usePage()" resources/js/components/AppSidebar.tsx && echo "   ✓ Link href:" && grep -c 'href={item.url}' resources/js/components/AppSidebar.tsx

echo ""
echo "2. BottomNav.tsx"
echo "   ✓ Inertia imports:" && grep -c "import { router, usePage }" resources/js/components/BottomNav.tsx && echo "   ✓ usePage().url:" && grep -c "const { url } = usePage()" resources/js/components/BottomNav.tsx && echo "   ✓ router.visit:" && grep -c "router.visit" resources/js/components/BottomNav.tsx

echo ""
echo "3. Header.tsx"
echo "   ✓ Inertia imports:" && grep -c "import { router, usePage }" resources/js/components/Header.tsx && echo "   ✓ usePage().url:" && grep -c "const { url } = usePage()" resources/js/components/Header.tsx && echo "   ✓ router.visit calls:" && grep -c "router.visit" resources/js/components/Header.tsx

echo ""
echo "4. NavLink.tsx"
echo "   ✓ Inertia Link import:" && grep -c "import { Link, usePage }" resources/js/components/NavLink.tsx && echo "   ✓ usePage() usage:" && grep -c "usePage()" resources/js/components/NavLink.tsx && echo "   ✓ Link component:" && grep -c '<Link' resources/js/components/NavLink.tsx

echo ""
echo "=== No React Router Imports Remaining ==="
grep -r "from 'react-router-dom'" resources/js/components/ 2>/dev/null | wc -l
echo "   ✓ Count should be 0"

echo ""
echo "=== Migration Complete ==="
