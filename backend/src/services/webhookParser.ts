/**
 * Mengekstrak kode task dari pesan commit.
 * Contoh yang didukung:
 * - "Fix bug login [done #TASK-02]" -> "TASK-02"
 * - "Selesai halaman dashboard [done TASK-01]" -> "TASK-01"
 * - "Resolves #TASK-03" -> "TASK-03"
 * - "done #TASK-05" -> "TASK-05"
 */
export function extractTaskCode(commitMessage: string): string | null {
  if (!commitMessage) return null;

  // Regex mencari pola [done #TASK-XX] atau done #TASK-XX
  const regexDone = /(?:\[done\s+#?([A-Za-z0-9_-]+)\]|done\s+#?([A-Za-z0-9_-]+)|resolves\s+#?([A-Za-z0-9_-]+)|closes\s+#?([A-Za-z0-9_-]+))/i;
  const match = commitMessage.match(regexDone);

  if (match) {
    const code = match[1] || match[2] || match[3] || match[4];
    return code.toUpperCase();
  }

  return null;
}

