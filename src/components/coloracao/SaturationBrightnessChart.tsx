import React, { useState, useCallback } from 'react';
import { scaleLinear } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { Grid } from '@visx/grid';
import { Group } from '@visx/group';
import { Circle } from '@visx/shape';
import { ParentSize } from '@visx/responsive';
import { useTooltip, TooltipWithBounds, defaultStyles } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { ColoracaoClassificacaoResponse } from '../../types/coloracaoSimplificado';
import { COLORACAO_AREAS } from '../../config/coloracaoAreas';

interface ChartDataPoint {
  region: string;
  saturation: number;
  brightness: number;
  color: string;
  displayName: string;
}

interface SaturationBrightnessChartProps {
  finalResults: ColoracaoClassificacaoResponse;
}

const SaturationBrightnessChart: React.FC<SaturationBrightnessChartProps> = ({
  finalResults,
}) => {
  return (
    <div className="w-full">
      <h4 className="text-md font-semibold text-gray-800 text-center">
        Gráfico de Saturação vs Brilho
      </h4>
  <div className="w-full h-[900px]">
        <ParentSize>
          {({ width, height }) => (
            <ChartInner 
              finalResults={finalResults} 
              width={width} 
              height={height} 
            />
          )}
        </ParentSize>
      </div>
    </div>
  );
};

interface ChartInnerProps {
  finalResults: ColoracaoClassificacaoResponse;
  width: number;
  height: number;
}

const ChartInner: React.FC<ChartInnerProps> = ({
  finalResults,
  width,
  height,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);
  const [hoveredArea, setHoveredArea] = useState<string | null>(null);
  
  const {
    tooltipOpen,
    tooltipLeft,
    tooltipTop,
    tooltipData,
    hideTooltip,
    showTooltip,
  } = useTooltip<ChartDataPoint>();

  // Tooltip styles
  const tooltipStyles = {
    ...defaultStyles,
    minWidth: 60,
    backgroundColor: 'rgba(0,0,0,0.9)',
    color: 'white',
    fontSize: '12px',
    padding: '8px 12px',
    borderRadius: '4px',
  };
  // Region display names (same as AnalysisResultsTab.tsx)
  const regionNames: Record<string, string> = {
    cheek: 'Bochecha',
    chin: 'Queixo',
    forehead: 'Testa',
    hair_root: 'Pelo (Cabelo e Sobrancelha)',
    iris: 'Íris',
    mouth: 'Boca',
    mouth_contour: 'Contorno da Boca',
    under_eye_skin: 'Pele Abaixo dos Olhos',
  };

  // Increase margins for a larger chart
  const margin = { top: 20, right: 0, bottom: 60, left: 20 };
  // Calculate the maximum square size for the plot area
  const availableWidth = width - margin.left - margin.right;
  const availableHeight = height - margin.top - margin.bottom;
  const squareSize = Math.min(availableWidth, availableHeight);
  // Center the square plot area
  const xOffset = margin.left + (availableWidth > availableHeight ? (availableWidth - squareSize) / 2 : 0);
  const yOffset = margin.top + (availableHeight > availableWidth ? (availableHeight - squareSize) / 2 : 0);
  const xMax = squareSize;
  const yMax = squareSize;

  // Prepare data points from the analysis results
  const dataPoints: ChartDataPoint[] = [];
  
  // Add individual region points
  Object.entries(finalResults.output.colors).forEach(([region, color]) => {
    let saturationKey = `${region}_saturation`;
    let brightnessKey = `${region}_brightness`;
    // Special case for hair_root: use hair_saturation and hair_brightness
    if (region === 'hair_root') {
      saturationKey = 'hair_saturation';
      brightnessKey = 'hair_brightness';
    }
    const saturation = finalResults.output.details['saturation-details'][saturationKey as keyof typeof finalResults.output.details['saturation-details']];
    const brightness = finalResults.output.details['brightness-details'][brightnessKey as keyof typeof finalResults.output.details['brightness-details']];
    if (typeof saturation === 'number' && typeof brightness === 'number') {
      dataPoints.push({
        region,
        saturation,
        brightness,
        color,
        displayName: regionNames[region] || region,
      });
    }
  });

  // Add final result point
  const finalResultPoint: ChartDataPoint = {
    region: 'final_result',
    saturation: finalResults.output.result.saturation,
    brightness: finalResults.output.result.brightness,
    color: '#ff8000ff', 
    displayName: `Resultado Final`,
  };
  
  dataPoints.push(finalResultPoint);

  // Fixed scales from 0 to 100 for both axes
  const xScale = scaleLinear<number>({
    domain: [0, 100],
    range: [0, xMax],
  });

  const yScale = scaleLinear<number>({
    domain: [0, 100],
    range: [yMax, 0], // Inverted for SVG coordinates
  });

  // Use coloração areas from config file

  // Helper function to create path string from points
  const createPath = (points: number[][]) => {
    return points
      .map((point, index) => {
        const x = xScale(point[0]);
        const y = yScale(point[1]);
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ') + ' Z';
  };

  return (
    <>
      <div className="flex justify-center relative">
  <svg width={width} height={height}>
          {/* Gradient definition */}
          <defs>
            {/* 2D gradient using two linear gradients and a blend mode */}
            <linearGradient id="sb-gradient-x" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#808080" /> {/* gray: low saturation */}
              <stop offset="100%" stopColor="#ff8000" /> {/* orange: high saturation */}
            </linearGradient>
            <linearGradient id="sb-gradient-y" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#000" stopOpacity="1" /> {/* black: low brightness */}
              <stop offset="100%" stopColor="#fff" stopOpacity="1" /> {/* white: high brightness */}
            </linearGradient>
            <filter id="sb-gradient-multiply" x="-20%" y="-20%" width="140%" height="140%">
              <feImage result="sat" xlinkHref="#sb-gradient-x" x="0" y="0" width={xMax} height={yMax} />
              <feImage result="bri" xlinkHref="#sb-gradient-y" x="0" y="0" width={xMax} height={yMax} />
              <feBlend in="sat" in2="bri" mode="multiply" />
            </filter>
          </defs>
          <Group left={xOffset} top={yOffset}>
            {/* Gradient background (using two rects and blend mode for 2D effect) */}
            <g>
              <rect
                x={0}
                y={0}
                width={xMax}
                height={yMax}
                fill="url(#sb-gradient-x)"
                opacity={0.8}
              />
              <rect
                x={0}
                y={0}
                width={xMax}
                height={yMax}
                fill="url(#sb-gradient-y)"
                opacity={0.8}
                style={{ mixBlendMode: 'multiply' }}
              />
            </g>
            {/* Grid */}
            <Grid
              xScale={xScale}
              yScale={yScale}
              width={xMax}
              height={yMax}
              stroke="#e0e0e0"
              strokeOpacity={0.3}
            />
            {/* Coloração areas - with transparent fill to keep gradient visible */}
            {COLORACAO_AREAS.map((area, index) => {
              const isHoveredArea = hoveredArea === area.name;
              return (
                <g key={`area-${index}`}>
                  <path
                    d={createPath(area.points)}
                    fill={isHoveredArea ? area.color : "transparent"}
                    stroke={area.strokeColor}
                    strokeWidth={isHoveredArea ? 3 : 1.5}
                    strokeDasharray={isHoveredArea ? "6,3" : "4,2"}
                    opacity={isHoveredArea ? 0.8 : 0.7}
                    style={{ 
                      pointerEvents: 'all',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                      filter: isHoveredArea ? 'drop-shadow(0 2px 8px rgba(0,0,0,0.2))' : 'none',
                    }}
                    onMouseEnter={(event) => {
                      setHoveredArea(area.name);
                      const eventSvgCoords = localPoint(event);
                      showTooltip({
                        tooltipData: {
                          region: area.name,
                          saturation: 0,
                          brightness: 0,
                          color: area.strokeColor,
                          displayName: area.name,
                        },
                        tooltipTop: eventSvgCoords?.y,
                        tooltipLeft: eventSvgCoords?.x,
                      });
                    }}
                    onMouseLeave={() => {
                      setHoveredArea(null);
                      hideTooltip();
                    }}
                  />
                  {/* Area label */}
                  <text
                    x={xScale(area.points.reduce((sum, point) => sum + point[0], 0) / area.points.length)}
                    y={yScale(area.points.reduce((sum, point) => sum + point[1], 0) / area.points.length)}
                    textAnchor="middle"
                    fontSize={isHoveredArea ? 12 : 10}
                    fontWeight={isHoveredArea ? "700" : "600"}
                    fill={area.strokeColor}
                    opacity={isHoveredArea ? 1 : 0.85}
                    style={{ 
                      pointerEvents: 'none',
                      transition: 'all 0.2s ease-in-out',
                      filter: isHoveredArea ? 'drop-shadow(0 1px 3px rgba(255,255,255,0.8))' : 'none',
                    }}
                  >
                    {area.name}
                  </text>
                </g>
              );
            })}
            {/* Data points */}
            {dataPoints.map((point, i) => {
              const cx = xScale(point.saturation);
              const cy = yScale(point.brightness);
              const isFinalResult = point.region === 'final_result';
              const isHovered = hoveredPoint === point.region;
              // Use white border for dark backgrounds, black for light backgrounds
              // Simple heuristic: if brightness < 80, use white border
              const borderColor = point.brightness < 80 ? '#fff' : '#111';
              const shadowColor = point.brightness < 80 ? '#0008' : '#fff8';
              return (
                <g key={i}>
                  {/* Shadow for better contrast */}
                  <Circle
                    cx={cx}
                    cy={cy}
                    r={isFinalResult ? (isHovered ? 13 : 11) : (isHovered ? 11 : 9)}
                    fill={shadowColor}
                    opacity={0.35}
                  />
                  <Circle
                    cx={cx}
                    cy={cy}
                    r={isFinalResult ? (isHovered ? 10 : 8) : (isHovered ? 8 : 6)}
                    fill={point.color}
                    stroke={borderColor}
                    strokeWidth={isFinalResult ? 3.5 : (isHovered ? 2.5 : 2)}
                    opacity={isHovered ? 1 : (isFinalResult ? 1 : 0.9)}
                    style={{ 
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                      filter: isHovered ? 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))' : 'none',
                    }}
                    onMouseEnter={(event) => {
                      const eventSvgCoords = localPoint(event);
                      setHoveredPoint(point.region);
                      showTooltip({
                        tooltipData: point,
                        tooltipTop: eventSvgCoords?.y,
                        tooltipLeft: eventSvgCoords?.x,
                      });
                    }}
                    onMouseLeave={() => {
                      setHoveredPoint(null);
                      hideTooltip();
                    }}
                  />
                  {/* Label for final result */}
                  {isFinalResult && (
                    <text
                      x={cx}
                      y={cy - (isHovered ? 14 : 12)}
                      textAnchor="middle"
                      fontSize={12}
                      fontWeight="bold"
                      fill="#333"
                      style={{ 
                        pointerEvents: 'none',
                        transition: 'all 0.2s ease-in-out'
                      }}
                    >
                    </text>
                  )}
                </g>
              );
            })}
            {/* Axes */}
            <AxisBottom
              top={yMax}
              scale={xScale}
              tickFormat={(value) => Number(value).toFixed(2)}
              stroke="#333"
              tickStroke="#333"
              tickLabelProps={{
                fill: '#333',
                fontSize: 11,
                textAnchor: 'middle',
              }}
            />
            <AxisLeft
              scale={yScale}
              tickFormat={(value) => Number(value).toFixed(2)}
              stroke="#333"
              tickStroke="#333"
              tickLabelProps={{
                fill: '#333',
                fontSize: 11,
                textAnchor: 'end',
              }}
            />
            {/* Axis labels */}
            <text
              x={xMax / 2}
              y={yMax + 38}
              textAnchor="middle"
              fontSize={14}
              fontWeight="600"
              fill="#333"
            >
              Saturação
            </text>
            <text
              x={-(yMax / 2)}
              y={-60}
              textAnchor="middle"
              fontSize={14}
              fontWeight="600"
              fill="#333"
              transform={`rotate(-90)`}
              style={{ pointerEvents: 'none' }}
            >
              Brilho
            </text>
          </Group>
        </svg>
        {/* Tooltip */}
        {tooltipOpen && tooltipData && (
          <TooltipWithBounds
            top={tooltipTop}
            left={tooltipLeft}
            style={tooltipStyles}
          >
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                {tooltipData.displayName}
              </div>
              {tooltipData.saturation > 0 || tooltipData.brightness > 0 ? (
                <div style={{ fontSize: '11px' }}>
                  <div>Saturação: {tooltipData.saturation.toFixed(2)}</div>
                  <div>Brilho: {tooltipData.brightness.toFixed(2)}</div>
                  <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        backgroundColor: tooltipData.color,
                        border: '1px solid rgba(255,255,255,0.3)',
                        borderRadius: '2px',
                      }}
                    />
                    <span>{tooltipData.color}</span>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '11px', fontStyle: 'italic' }}>
                  Área de classificação de coloração pessoal
                </div>
              )}
            </div>
          </TooltipWithBounds>
        )}
      </div>
    </>
  );
};

export default SaturationBrightnessChart;
