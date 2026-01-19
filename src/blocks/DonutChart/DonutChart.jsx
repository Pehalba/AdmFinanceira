import { formatCurrency } from "../../scripts/utils/dateUtils";
import "./DonutChart.css";

/**
 * Componente de gráfico donut/pie usando SVG puro
 * @param {Object} props
 * @param {Array} props.data - Array de objetos { categoryId, categoryName, total, count }
 * @param {number} props.total - Valor total para calcular percentuais
 */
export function DonutChart({ data = [], total = 0 }) {
  if (!data || data.length === 0 || total === 0) {
    return (
      <div className="donut-chart">
        <div className="donut-chart__empty">Nenhuma despesa neste mês</div>
      </div>
    );
  }

  const colors = [
    "#3b82f6", // azul
    "#ef4444", // vermelho
    "#10b981", // verde
    "#f59e0b", // laranja
    "#8b5cf6", // roxo
    "#ec4899", // rosa
    "#06b6d4", // ciano
    "#84cc16", // limão
  ];

  // Calcular percentuais
  const slices = data.map((item, index) => {
    const percentage = (item.total / total) * 100;
    return {
      ...item,
      percentage,
      color: colors[index % colors.length],
    };
  });

  // Raio, centro e circunferência
  const radius = 60;
  const size = 160;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  // Calcular offsets: cada círculo renderiza apenas sua fatia
  // Usar stroke-dasharray: [comprimento visível] [comprimento invisível]
  // stroke-dashoffset: onde começar o traço (0 = início padrão)
  
  // Começar no topo: -90 graus = -25% da circunferência
  // stroke-dashoffset negativo move no sentido horário
  const startOffset = -(circumference * 0.25);
  
  let accumulatedLength = 0;
  
  const slicesWithOffset = slices.map((slice) => {
    const sliceLength = (slice.percentage / 100) * circumference;
    
    // O offset é onde começar o traço
    // Começamos no topo e vamos acumulando o comprimento de cada fatia
    const sliceOffset = startOffset - accumulatedLength;
    accumulatedLength += sliceLength;
    
    // O gap invisível deve ser o restante da circunferência
    // Isso garante que as fatias se conectem perfeitamente
    const gapLength = circumference - sliceLength;
    
    return {
      ...slice,
      dashArray: `${sliceLength} ${gapLength}`,
      dashOffset: sliceOffset,
    };
  });

  return (
    <div className="donut-chart">
      <div className="donut-chart__container">
        <svg
          className="donut-chart__svg"
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Círculo de fundo (cinza claro) */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth="20"
          />
          
          {/* Fatias do gráfico - renderizar em sequência */}
          {slicesWithOffset.map((slice) => (
            <circle
              key={slice.categoryId}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={slice.color}
              strokeWidth="20"
              strokeDasharray={slice.dashArray}
              strokeDashoffset={slice.dashOffset}
              strokeLinecap="round"
              className="donut-chart__slice"
              transform={`rotate(-90 ${center} ${center})`}
            />
          ))}
        </svg>
      </div>
      
      {/* Legenda */}
      <div className="donut-chart__legend">
        {slices.map((slice) => (
          <div key={slice.categoryId} className="donut-chart__legend-item">
            <div className="donut-chart__legend-color" style={{ backgroundColor: slice.color }} />
            <div className="donut-chart__legend-content">
              <div className="donut-chart__legend-name">{slice.categoryName || "Sem nome"}</div>
              <div className="donut-chart__legend-value">
                {formatCurrency(slice.total)} ({slice.percentage.toFixed(1)}%)
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
