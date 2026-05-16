import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Valid phone number is required"),
  vehicleMake: z.string().min(2, "Vehicle make is required"),
  vehicleModel: z.string().min(2, "Vehicle model is required"),
  serviceType: z.string().min(1, "Please select a primary service"),
  location: z.string().min(2, "Service location is required"),
  message: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function BookingForm() {
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
          Booking request received!
        </h3>
        <p className="mt-2 text-[var(--color-ink-muted)]">
          We'll contact you shortly to confirm your appointment details.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-[var(--color-ink)]"
          >
            Full Name
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

        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-[var(--color-ink)]"
          >
            Phone Number
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
          htmlFor="email"
          className="block text-sm font-medium text-[var(--color-ink)]"
        >
          Email Address
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

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label
            htmlFor="vehicleMake"
            className="block text-sm font-medium text-[var(--color-ink)]"
          >
            Vehicle Make
          </label>
          <input
            {...register("vehicleMake")}
            id="vehicleMake"
            placeholder="e.g. Toyota"
            className="mt-2 block w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] focus:outline-none"
          />
          {errors.vehicleMake && (
            <p className="mt-1 text-sm text-[var(--color-accent)]">
              {errors.vehicleMake.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="vehicleModel"
            className="block text-sm font-medium text-[var(--color-ink)]"
          >
            Vehicle Model & Year
          </label>
          <input
            {...register("vehicleModel")}
            id="vehicleModel"
            placeholder="e.g. Camry 2022"
            className="mt-2 block w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] focus:outline-none"
          />
          {errors.vehicleModel && (
            <p className="mt-1 text-sm text-[var(--color-accent)]">
              {errors.vehicleModel.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label
            htmlFor="serviceType"
            className="block text-sm font-medium text-[var(--color-ink)]"
          >
            Primary Service
          </label>
          <select
            {...register("serviceType")}
            id="serviceType"
            className="mt-2 block w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] focus:outline-none"
          >
            <option value="">Select a service...</option>
            <option value="exterior">Exterior Wash</option>
            <option value="interior">Interior Detail</option>
            <option value="full">Full Detail (Int + Ext)</option>
            <option value="ceramic">Ceramic Sealant</option>
          </select>
          {errors.serviceType && (
            <p className="mt-1 text-sm text-[var(--color-accent)]">
              {errors.serviceType.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-[var(--color-ink)]"
          >
            Service City / Zip
          </label>
          <input
            {...register("location")}
            id="location"
            placeholder="e.g. Portland, 04101"
            className="mt-2 block w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] focus:outline-none"
          />
          {errors.location && (
            <p className="mt-1 text-sm text-[var(--color-accent)]">
              {errors.location.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="message"
          className="block text-sm font-medium text-[var(--color-ink)]"
        >
          Additional Details (Optional)
        </label>
        <textarea
          {...register("message")}
          id="message"
          rows={3}
          placeholder="Any specific stains, pet hair, or areas of concern?"
          className="mt-2 block w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] focus:outline-none"
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-[var(--color-accent)] px-6 py-4 font-bold tracking-wide text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-70"
      >
        {isSubmitting ? "Submitting Request..." : "Request Appointment"}
      </button>
    </form>
  );
}
