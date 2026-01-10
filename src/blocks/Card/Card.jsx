import './Card.css';

export function Card({ children, className = '', title, actions }) {
  return (
    <div className={`card ${className}`.trim()}>
      {(title || actions) && (
        <div className="card__header">
          {title && <h3 className="card__title">{title}</h3>}
          {actions && <div className="card__actions">{actions}</div>}
        </div>
      )}
      <div className="card__body">{children}</div>
    </div>
  );
}
