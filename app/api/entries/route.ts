import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";


export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const supabase = await createClient(); // This reads auth cookies

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, content, mood } = await req.json();

  if (!content || !mood) {
  return NextResponse.json(
    { error: "Content and mood are required fields" },
    { status: 400 }
  );
}

  const { data, error } = await supabase
    .from("journal_entries")
    .insert([{ title, content, mood, user_id: user.id }]) // associate with user
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}