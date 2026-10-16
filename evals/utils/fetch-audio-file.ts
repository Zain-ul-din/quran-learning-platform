export async function fetchAudioFile(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`audio file download failed: ${url}`);
  const blob = await res.blob();
  const ext = new URL(url).pathname.split(".").pop() ?? "mp3"; // "mp3"
  return new File([blob], `ayah.${ext}`, {
    type: blob.type || "audio/mpeg",
  });
}
