export default function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto py-8 text-center font-body text-xs uppercase tracking-widest text-on-surface-variant/60">
      © {year} The Archivist · Your Private Digital Library
    </footer>
  )
}
