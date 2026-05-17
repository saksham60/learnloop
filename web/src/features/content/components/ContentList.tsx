import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProcessingStatus } from "@/features/content/components/ProcessingStatus";
import type { ContentUpload } from "@/features/content/types";

export function ContentList({
  items,
  onProcess,
  onSelect,
}: {
  items: ContentUpload[];
  onProcess?: (contentId: string) => void;
  onSelect?: (contentId: string) => void;
}) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Card key={item.id}>
          <CardHeader>
            <CardTitle>{item.filename}</CardTitle>
            <CardDescription>Uploaded teacher content ready for chunk processing.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-between gap-3">
            <ProcessingStatus status={item.status} />
            <div className="flex flex-wrap gap-2">
              {onSelect ? (
                <Button variant="outline" size="sm" onClick={() => onSelect(item.id)}>
                  View chunks
                </Button>
              ) : null}
              {onProcess ? (
                <Button size="sm" onClick={() => onProcess(item.id)}>
                  Process
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
