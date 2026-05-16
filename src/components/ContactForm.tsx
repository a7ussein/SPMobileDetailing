import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Valid phone number is required"),
  message: z.string().min(10, "Please provide more details"),
});

type FormData = z.infer<typeof schema>;

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (_data: FormData) => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="rounded-lg border border-[var(--color-accent)] bg-[var(--color-surface)] p-8 text-center">
        <h3 className="text-xl font-semibold text-[var(--color-ink)]">
          Message sent!
        </h3>
        <p className="mt-2 text-[var(--color-ink-muted)]">
          We'll get back to you shortly to schedule your service.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-[var(--color-ink)]"
        >
          Name
        </label>
        <input
          {...register("name")}
          id="name"
          className="mt-2 block w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] focus:outline-none"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-[var(--color-accent)]">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-[var(--color-ink)]"
          >
            Email
          </label>
          <input
            {...register("email")}
            id="email"
            type="email"
            className="mt-2 block w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] focus:outline-none"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-[var(--color-accent)]">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-[var(--color-ink)]"
          >
            Phone
          </label>
          <input
            {...register("phone")}
            id="phone"
            type="tel"
            className="mt-2 block w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] focus:outline-none"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-[var(--color-accent)]">
              {errors.phone.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="message"
          className="block text-sm font-medium text-[var(--color-ink)]"
        >
          How can we help?
        </label>
        <textarea
          {...register("message")}
          id="message"
          rows={4}
          className="mt-2 block w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] focus:outline-none"
        ></textarea>
        {errors.message && (
          <p className="mt-1 text-sm text-[var(--color-accent)]">
            {errors.message.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-[var(--color-accent)] px-6 py-3.5 font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-70"
      >
        {isSubmitting ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
