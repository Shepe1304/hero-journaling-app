import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  req: Request,
  { params }: { params: Record<string, string> }
) {
  const { id } = params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("id", id)
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(
  req: Request,
  { params }: { params: Record<string, string> }
) {
  const { id } = params;
  const supabase = await createClient();
  const { content, mood, title, is_draft } = await req.json();

  const { data, error } = await supabase
    .from("journal_entries")
    .update({
      content,
      mood,
      title,
      is_draft,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  req: Request,
  { params }: { params: Record<string, string> }
) {
  const { id } = params;
  const supabase = await createClient();

  const { error } = await supabase
    .from("journal_entries")
    .delete()
    .eq("id", id);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ message: "Entry deleted successfully" });
}
