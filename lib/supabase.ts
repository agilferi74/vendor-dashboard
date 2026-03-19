import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let _supabase: SupabaseClient | null = null

function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return _supabase
}

const BUCKET = "vendor-dashboard"

export async function uploadFile(file: File, folder: string): Promise<string> {
  const supabase = getSupabase()
  const timestamp = Date.now()
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
  const filePath = `${folder}/${timestamp}_${safeName}`

  const { error } = await supabase.storage.from(BUCKET).upload(filePath, file)
  if (error) throw new Error(`Upload failed: ${error.message}`)

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath)
  return data.publicUrl
}
