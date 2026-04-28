import { TableSkeleton } from '@/components/ui/table';
import { Skeleton }      from '@/components/ui/skeleton';

export default function UsersAdminLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div className="space-y-1">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-10 w-44 rounded-lg" />
      </div>
      <Skeleton className="h-10 w-72 rounded-lg" />
      <TableSkeleton rows={8} cols={5} />
    </div>
  );
}