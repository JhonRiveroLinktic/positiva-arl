import { ProtectedRoute } from '@/lib/components/core/auth/protected-route';

export default function LayoutForms({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
}