import "./Fab.css";

export function Fab({ onClick, label = "Nova Transação", icon = "+" }) {
  return (
    <button 
      className="fab" 
      onClick={onClick} 
      aria-label={label} 
      title={label}
    >
      <span className="fab__icon">{icon}</span>
    </button>
  );
}
