"use client";

import { useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContentList } from "@/features/content/components/ContentList";
import { ContentUpload } from "@/features/content/components/ContentUpload";
import { useContentChunks, useContentList, useProcessContent } from "@/features/content/hooks/useContent";
import { isFeatureUnavailableError } from "@/lib/api/errors";

export default function TeacherContentPage() {
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const contentQuery = useContentList();
  const chunksQuery = useContentChunks(selectedContentId);
  const processMutation = useProcessContent();

  async function handleProcess(contentId: string) {
    try {
      await processMutation.mutateAsync({ contentId, rawText: "" });
      toast.success("Processing request sent.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not process content.");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Content"
        title="Teacher content library"
        description="Register uploaded files, trigger chunk processing, and inspect generated content chunks before wider use."
      />

      <div className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
        <div className="space-y-6">
          <ContentUpload />

          {contentQuery.isLoading ? <LoadingState title="Loading content library" description="Fetching teacher uploads." /> : null}
          {contentQuery.error ? (
            isFeatureUnavailableError(contentQuery.error) ? (
              <EmptyState
                title="Content upload is being connected"
                description="This feature is being connected to the backend."
              />
            ) : (
              <ErrorState onRetry={() => void contentQuery.refetch()} />
            )
          ) : null}

          {!contentQuery.isLoading && !contentQuery.error ? (
            <ContentList items={contentQuery.data ?? []} onProcess={handleProcess} onSelect={setSelectedContentId} />
          ) : null}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Generated chunks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {chunksQuery.isLoading ? <LoadingState title="Loading chunks" description="Opening processed content chunks." /> : null}
            {!chunksQuery.isLoading && chunksQuery.data?.length ? (
              chunksQuery.data.map((chunk) => (
                <div key={chunk.id} className="rounded-2xl border border-border bg-background/80 px-4 py-3">
                  <p className="text-sm font-medium">Chunk {chunk.chunk_index}</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                    {chunk.chunk_text}
                  </p>
                </div>
              ))
            ) : null}
            {!chunksQuery.isLoading && !chunksQuery.data?.length ? (
              <EmptyState
                title="No chunks selected"
                description="Choose a content item from the list to inspect its processed chunks."
              />
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
