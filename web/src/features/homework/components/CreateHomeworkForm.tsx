"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCurrentProfile } from "@/features/auth/hooks/useCurrentProfile";
import { useCreateHomework } from "@/features/homework/hooks/useHomework";
import { useTeacherClasses } from "@/features/teacher-analytics/hooks/useTeacherAnalytics";

const homeworkSchema = z.object({
  title: z.string().min(2, "Title is required."),
  description: z.string().optional(),
  class_id: z.string().optional(),
  subject_id: z.string().optional(),
  due_at: z.string().optional(),
  maxHints: z.number().min(1).max(5),
  directAnswerAllowed: z.boolean(),
  teacherInstructions: z.string().optional(),
  questions: z
    .array(
      z.object({
        prompt: z.string().min(5, "Question prompt is required."),
      }),
    )
    .min(1, "Add at least one question."),
});

type HomeworkFormValues = z.infer<typeof homeworkSchema>;

export function CreateHomeworkForm() {
  const { data: profile } = useCurrentProfile();
  const classesQuery = useTeacherClasses();
  const createMutation = useCreateHomework();
  const form = useForm<HomeworkFormValues>({
    resolver: zodResolver(homeworkSchema),
    defaultValues: {
      title: "",
      description: "",
      class_id: "",
      subject_id: "",
      due_at: "",
      maxHints: 3,
      directAnswerAllowed: false,
      teacherInstructions: "",
      questions: [{ prompt: "" }],
    },
  });
  const fieldArray = useFieldArray({
    control: form.control,
    name: "questions",
  });

  async function onSubmit(values: HomeworkFormValues) {
    if (!profile?.school_id) {
      toast.error("Your LearnLoop profile is missing a school_id.");
      return;
    }

    try {
      await createMutation.mutateAsync({
        title: values.title,
        description: values.description || null,
        school_id: profile.school_id,
        class_id: values.class_id || null,
        subject_id: values.subject_id || null,
        due_at: values.due_at ? new Date(values.due_at).toISOString() : null,
        questions: values.questions.map((question, index) => ({
          prompt: question.prompt,
          order_index: index + 1,
        })),
      });
      toast.success("Homework created.");
      form.reset({
        title: "",
        description: "",
        class_id: "",
        subject_id: "",
        due_at: "",
        maxHints: 3,
        directAnswerAllowed: false,
        teacherInstructions: "",
        questions: [{ prompt: "" }],
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Homework could not be created.");
    }
  }

  if (!profile?.school_id) {
    return (
      <EmptyState
        title="School profile required"
        description="This teacher account needs a school_id in the backend profile before homework can be created."
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create homework</CardTitle>
        <CardDescription>
          This form sends the core homework payload to the backend and keeps a few teacher policy
          fields visible in the UI for the next backend iteration.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...form.register("title")} placeholder="Fractions review set" />
              <p className="text-sm text-rose-600">{form.formState.errors.title?.message}</p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...form.register("description")}
                placeholder="A short overview of the task and what students should focus on."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="class_id">Class</Label>
              <select
                id="class_id"
                {...form.register("class_id")}
                className="flex h-11 w-full rounded-2xl border border-input bg-white px-4 py-2 text-sm"
              >
                <option value="">Select a class</option>
                {(classesQuery.data ?? []).map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} {item.subject ? `- ${item.subject}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_at">Due date</Label>
              <Input id="due_at" type="datetime-local" {...form.register("due_at")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject_id">Subject ID</Label>
              <Input
                id="subject_id"
                {...form.register("subject_id")}
                placeholder="Optional backend subject UUID"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxHints">Max hints</Label>
              <Input
                id="maxHints"
                type="number"
                {...form.register("maxHints", { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="teacherInstructions">Teacher instructions</Label>
              <Textarea
                id="teacherInstructions"
                {...form.register("teacherInstructions")}
                placeholder="Optional classroom guidance for the homework coach."
              />
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-border bg-background/80 p-4">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">Questions</p>
                <p className="text-sm text-muted-foreground">
                  Add one or more questions in the order students should see them.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fieldArray.append({ prompt: "" })}
              >
                <Plus className="h-4 w-4" />
                Add question
              </Button>
            </div>

            <div className="space-y-4">
              {fieldArray.fields.map((field, index) => (
                <div key={field.id} className="rounded-2xl border border-border bg-white p-4">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <Label htmlFor={`question-${field.id}`}>Question {index + 1}</Label>
                    {fieldArray.fields.length > 1 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => fieldArray.remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    ) : null}
                  </div>
                  <Textarea
                    id={`question-${field.id}`}
                    {...form.register(`questions.${index}.prompt`)}
                    placeholder="Write the homework question prompt."
                  />
                  <p className="mt-2 text-sm text-rose-600">
                    {form.formState.errors.questions?.[index]?.prompt?.message}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-3 rounded-2xl border border-border bg-background/80 px-4 py-3">
            <input
              type="checkbox"
              {...form.register("directAnswerAllowed")}
              className="h-4 w-4 rounded border-input"
            />
            <span className="text-sm text-muted-foreground">
              Direct answer allowed
              <span className="ml-2 text-xs text-muted-foreground/80">
                This stays UI-visible for now; the backend currently defaults to guided support.
              </span>
            </span>
          </label>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={createMutation.isPending}>
              Create homework
            </Button>
            <Button type="button" variant="outline" onClick={() => form.reset()}>
              Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
