export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4 px-4">
        <h1 className="text-4xl md:text-6xl font-bold text-foreground" data-testid="text-heading">
          Blank Page
        </h1>
        <p className="text-xl md:text-2xl font-light text-muted-foreground" data-testid="text-subtitle">
          Halaman kosong yang siap diisi
        </p>
      </div>
    </div>
  );
}
