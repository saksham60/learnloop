"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { isFeatureUnavailableError } from "@/lib/api/errors";
import { registerSchool } from "@/features/schools/api";

export function SchoolRegistrationForm() {
  const router = useRouter();
  const [schoolName, setSchoolName] = useState("");
  const [schoolCode, setSchoolCode] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPersonName, setContactPersonName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (!schoolName.trim() || !contactEmail.trim() || !contactPersonName.trim()) {
      toast.error("Add the school name, contact email, and contact person before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      await registerSchool({
        school_name: schoolName.trim(),
        school_code: schoolCode.trim() || null,
        city: city.trim() || null,
        state: state.trim() || null,
        country: country.trim() || null,
        contact_email: contactEmail.trim(),
        contact_person_name: contactPersonName.trim(),
        contact_phone: contactPhone.trim() || null,
        message: message.trim() || null,
      });
      toast.success("School registration submitted.");
      router.replace("/onboarding/school-registration-submitted");
    } catch (error) {
      if (isFeatureUnavailableError(error)) {
        toast.error("School registration is being connected to the backend.");
      } else {
        toast.error(error instanceof Error ? error.message : "Could not submit school registration.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="rounded-[2rem] border-white/70 bg-white/85 shadow-glass">
      <CardHeader>
        <CardTitle>Register your school</CardTitle>
        <CardDescription>
          School registration will be reviewed before activation.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="school-name">School name</Label>
          <Input id="school-name" value={schoolName} onChange={(event) => setSchoolName(event.target.value)} placeholder="Green Valley Public School" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="school-code">School code</Label>
          <Input id="school-code" value={schoolCode} onChange={(event) => setSchoolCode(event.target.value)} placeholder="Optional school code" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-email">School contact email</Label>
          <Input id="contact-email" value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} placeholder="hello@school.edu" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" value={city} onChange={(event) => setCity(event.target.value)} placeholder="City" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input id="state" value={state} onChange={(event) => setState(event.target.value)} placeholder="State" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input id="country" value={country} onChange={(event) => setCountry(event.target.value)} placeholder="Country" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-person">Contact person name</Label>
          <Input id="contact-person" value={contactPersonName} onChange={(event) => setContactPersonName(event.target.value)} placeholder="Contact person" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-phone">Contact phone</Label>
          <Input id="contact-phone" value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} placeholder="Optional phone" />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="school-message">Message</Label>
          <Textarea
            id="school-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Optional context for the LearnLoop team."
            className="min-h-[120px]"
          />
        </div>
        <div className="md:col-span-2">
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            Submit School Registration
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
