export function Card({ children, className = '', padding = 'p-6' }) {
  return (
    <div className={`glass-card ${padding} ${className}`}>
      {children}
    </div>
  );
}
