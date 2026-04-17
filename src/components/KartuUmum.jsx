export default function KartuUmum({ className = "", children }) {
  return (
    <div className={`rounded-[28px] bg-white p-6 shadow-sm ${className}`}>
      {children}
    </div>
  );
}
