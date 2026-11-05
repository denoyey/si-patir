export class CommitParserService {
  // Regex dibatasi panjang dan pola aman (ReDoS Immune)
  private readonly TASK_REGEX = /(?:\[done\s+#?([A-Za-z0-9_-]{2,20})\]|done\s+#?([A-Za-z0-9_-]{2,20})|resolves\s+#?([A-Za-z0-9_-]{2,20})|closes\s+#?([A-Za-z0-9_-]{2,20}))/i;

  public extractTaskCode(commitMessage: string): string | null {
    if (!commitMessage || typeof commitMessage !== 'string') {
      return null;
    }

    // Batasi input panjang agar tidak terjadi catastrophic backtracking
    const truncatedMsg = commitMessage.slice(0, 1000);
    const match = truncatedMsg.match(this.TASK_REGEX);

    if (match) {
      const captured = match[1] || match[2] || match[3] || match[4];
      return captured ? captured.toUpperCase() : null;
    }

    return null;
  }

  public sanitizeCommitMessage(message: string): string {
    if (!message) return '';
    return message
      .replace(/<[^>]*>?/gm, '') // Strip HTML tags (anti-XSS)
      .slice(0, 500)
      .trim();
  }

  public sanitizeAuthor(author: string): string {
    if (!author) return 'unknown_dev';
    return author
      .replace(/[^a-zA-Z0-9_\-\.]/g, '') // Hanya izinkan karakter username git aman
      .slice(0, 50);
  }
}

