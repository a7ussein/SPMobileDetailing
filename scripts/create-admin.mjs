import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://vhlahndcjmtvbbrkvogd.supabase.co",
  "sb_publishable_2BcsetiSo-Idn1pWu3ePRQ_lBQtHUYR"
);

const { data, error } = await supabase.auth.signUp({
  email: "spdetailing8@gmail.com",
  password: "SPDetailing@Automyte",
});

if (error) {
  console.error("Error creating admin user:", error.message);
} else {
  console.log("Admin user created successfully!");
  console.log("User ID:", data.user?.id);
  console.log("Email:", data.user?.email);
  console.log("\nNote: If email confirmation is enabled in Supabase,");
  console.log("you may need to confirm the email in the Supabase Dashboard");
  console.log("(Authentication > Users > click the user > Confirm email).");
}
