import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://vhlahndcjmtvbbrkvogd.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY // service role key
);

async function main() {
  // Get users
  const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
  
  if (usersError) {
    console.error("Error fetching users:", usersError);
    return;
  }

  const user = usersData.users.find(u => u.email === "spdetailing8@gmail.com");
  
  if (!user) {
    console.error("User not found!");
    return;
  }

  // Update user to confirm email
  const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
    email_confirm: true
  });

  if (error) {
    console.error("Error confirming user:", error);
  } else {
    console.log("User email successfully confirmed!");
  }
}

main();
