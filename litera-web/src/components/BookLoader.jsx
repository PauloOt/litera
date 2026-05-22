import './BookLoader.css';

export function BookLoader({ texto = 'Carregando...' }) {
  return (
    <div className="book-loader">
      <div className="book">
        <div className="book__pg-shadow" />
        <div className="book__pg" />
        <div className="book__pg book__pg--2" />
        <div className="book__pg book__pg--3" />
        <div className="book__pg book__pg--4" />
        <div className="book__pg book__pg--5" />
      </div>
      {texto && <p className="book-loader__text">{texto}</p>}
    </div>
  );
}
