export default function ComingSoon({ title }) {
  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="panel p-10 text-center">
        <h1 className="text-lg font-semibold mb-2">{title}</h1>
        <p className="text-sm text-text-secondary">
          This screen hasn't been built yet. Send the mockup for {title} and
          it'll be wired up here.
        </p>
      </div>
    </div>
  );
}