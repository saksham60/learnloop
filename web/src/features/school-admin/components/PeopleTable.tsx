"use client";

import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isFeatureUnavailableError } from "@/lib/api/errors";

type Row = Record<string, unknown>;

export function PeopleTable({
  title,
  description,
  rows,
  columns,
  isLoading = false,
  error,
  onRetry,
  loadingTitle = "Loading records",
  loadingDescription = "Preparing this directory for review.",
  emptyTitle = "No records yet",
  emptyDescription = "This section will populate as the school starts using LearnLoop.",
  unavailableTitle = "This directory is being connected",
  unavailableDescription = "This feature is being connected to the backend.",
}: {
  title: string;
  description: string;
  rows: Row[];
  columns: Array<{ key: string; label: string; render?: (row: Row) => React.ReactNode }>;
  isLoading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  loadingTitle?: string;
  loadingDescription?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  unavailableTitle?: string;
  unavailableDescription?: string;
}) {
  if (isLoading) {
    return <LoadingState title={loadingTitle} description={loadingDescription} />;
  }

  if (error) {
    if (isFeatureUnavailableError(error)) {
      return <EmptyState title={unavailableTitle} description={unavailableDescription} />;
    }

    return (
      <ErrorState
        title="We could not load this directory"
        description="Try again. If this keeps happening, the backend may still be warming up."
        onRetry={onRetry}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {rows.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  {columns.map((column) => (
                    <th key={column.key} className="px-3 py-3 font-medium">
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((row, index) => (
                  <tr key={String(row.id ?? index)}>
                    {columns.map((column) => (
                      <td key={column.key} className="px-3 py-3 align-top">
                        {column.render
                          ? column.render(row)
                          : column.key === "status" || column.key === "approval_status"
                            ? <StatusBadge status={String(row[column.key] ?? "")} />
                            : String(row[column.key] ?? "N/A")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title={emptyTitle} description={emptyDescription} />
        )}
      </CardContent>
    </Card>
  );
}
