"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProcessContent, useRegisterContentUpload } from "@/features/content/hooks/useContent";

export function ContentUpload() {
  const [filename, setFilename] = useState("");
  const [contentType, setContentType] = useState("application/pdf");
  const [storagePath, setStoragePath] = useState("");
  const [rawText, setRawText] = useState("");
  const [latestUploadId, setLatestUploadId] = useState<string | null>(null);

  const uploadMutation = useRegisterContentUpload();
  const processMutation = useProcessContent();

  async function handleUpload() {
    if (!filename.trim() || !contentType.trim() || !storagePath.trim()) return;

    try {
      const result = await uploadMutation.mutateAsync({
        filename: filename.trim(),
        content_type: contentType.trim(),
        storage_path: storagePath.trim(),
      });
      setLatestUploadId(result?.id ?? null);
      toast.success("Content registered.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not register content.");
    }
  }

  async function handleProcess() {
    if (!latestUploadId) return;
    try {
      await processMutation.mutateAsync({ contentId: latestUploadId, rawText });
      toast.success("Content processing started.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not process content.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Register teacher content</CardTitle>
        <CardDescription>
          This UI is ready for Supabase storage integration. For now it registers content metadata
          and supports text-based processing for backend chunking.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="content-file">File</Label>
          <Input
            id="content-file"
            type="file"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              setFilename(file.name);
              setContentType(file.type || "application/octet-stream");
              setStoragePath(`teacher-content/${Date.now()}-${file.name}`);
            }}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="filename">Filename</Label>
            <Input id="filename" value={filename} onChange={(event) => setFilename(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contentType">Content type</Label>
            <Input
              id="contentType"
              value={contentType}
              onChange={(event) => setContentType(event.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="storagePath">Storage path</Label>
          <Input
            id="storagePath"
            value={storagePath}
            onChange={(event) => setStoragePath(event.target.value)}
            placeholder="teacher-content/worksheet-1.pdf"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rawText">Raw text for processing</Label>
          <Textarea
            id="rawText"
            value={rawText}
            onChange={(event) => setRawText(event.target.value)}
            placeholder="Paste the extracted content text here if you want to test chunk processing immediately."
            className="min-h-[160px]"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={handleUpload} disabled={uploadMutation.isPending}>
            Register content
          </Button>
          <Button
            variant="outline"
            onClick={handleProcess}
            disabled={!latestUploadId || processMutation.isPending}
          >
            Process latest upload
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
