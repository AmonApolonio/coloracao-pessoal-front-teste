import React, { useState, useRef } from 'react';
import { RegionDetail } from '../../types/coloracaoSimplificado';

interface ExtractionResultsProps {
  combinedResult: any;
  barbaDetected: boolean;
  regionNames: Record<string, string>;
  error: string;
  onProceedToManualInput: () => void;
}


const ExtractionResults: React.FC<ExtractionResultsProps> = ({
  combinedResult,
  barbaDetected,
  regionNames,
  error,
  onProceedToManualInput,
}) => {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  // Track image natural size and render dimensions for correct scaling - separate for frontal and eye images
  const [frontalNaturalSize, setFrontalNaturalSize] = useState<{ width: number; height: number }>({ width: 400, height: 500 });
  const [eyeNaturalSize, setEyeNaturalSize] = useState<{ width: number; height: number }>({ width: 400, height: 500 });
  const [frontalRenderInfo, setFrontalRenderInfo] = useState<{ scale: number; offsetX: number; offsetY: number }>({ scale: 1, offsetX: 0, offsetY: 0 });
  const [eyeRenderInfo, setEyeRenderInfo] = useState<{ scale: number; offsetX: number; offsetY: number }>({ scale: 1, offsetX: 0, offsetY: 0 });
  const imgRef = useRef<HTMLImageElement>(null);

  if (!combinedResult) return null;

  const successfulRegions = Object.entries(combinedResult.frontalResult.output.details) as [string, RegionDetail][];
  const expectedRegions = Object.keys(regionNames);
  const presentRegions = Object.keys(combinedResult.frontalResult.output.details);
  const missingRegions = expectedRegions.filter(region => !presentRegions.includes(region));

  // Only show regions that are not omitted by barba
  const filteredRegions = barbaDetected
    ? successfulRegions.filter(([regionKey]) => regionKey !== 'mouth_contour' && regionKey !== 'chin')
    : successfulRegions;

  // Determine which image to show based on hovered region
  const isEyeRegion = hoveredRegion === 'iris';
  const imageUrl = isEyeRegion 
    ? combinedResult.eyeResult.output.image_url 
    : combinedResult.frontalResult.output.image_url;
  const naturalSize = isEyeRegion ? eyeNaturalSize : frontalNaturalSize;
  const renderInfo = isEyeRegion ? eyeRenderInfo : frontalRenderInfo;




  return (

    <div>
      <div className="flex gap-8 justify-center items-start flex-wrap">
        {/* Left: Just the image, no overlay */}
        <div style={{ position: 'relative', width: 400, height: 500, borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 16px #0001' }}>
          <img
            ref={imgRef}
            key={imageUrl}
            src={imageUrl}
            alt={isEyeRegion ? "Foto do olho (close-up)" : "Foto de entrada"}
            width={400}
            height={500}
            style={{
              display: 'block',
              borderRadius: 16,
              width: 400,
              height: 500,
              objectFit: 'cover',
              background: '#eee',
              filter: hoveredRegion ? 'grayscale(1) brightness(0.92)' : undefined,
              transition: 'filter 0.2s, opacity 0.2s',
              opacity: 1,
            }}
            onLoad={e => {
              const img = e.currentTarget;
              const size = { width: img.naturalWidth, height: img.naturalHeight };
              
              // Calculate how the image is rendered with object-fit: cover
              const containerWidth = 400;
              const containerHeight = 500;
              const imageAspect = size.width / size.height;
              const containerAspect = containerWidth / containerHeight;
              
              let scale, offsetX, offsetY;
              
              if (imageAspect > containerAspect) {
                // Image is wider - height fills container, width is cropped
                scale = containerHeight / size.height;
                const renderedWidth = size.width * scale;
                offsetX = (containerWidth - renderedWidth) / 2;
                offsetY = 0;
              } else {
                // Image is taller - width fills container, height is cropped
                scale = containerWidth / size.width;
                const renderedHeight = size.height * scale;
                offsetX = 0;
                offsetY = (containerHeight - renderedHeight) / 2;
              }
              
              if (isEyeRegion) {
                setEyeNaturalSize(size);
                setEyeRenderInfo({ scale, offsetX, offsetY });
              } else {
                setFrontalNaturalSize(size);
                setFrontalRenderInfo({ scale, offsetX, offsetY });
              }
            }}
          />
          {/* Overlay: show both the hovered region's landmark_region (yellow) and processed_region (red), supporting polygon and donut types */}
          {hoveredRegion && (() => {
            // Get region data from the correct result (eye or frontal)
            let regionData: RegionDetail | undefined;
            if (hoveredRegion === 'iris') {
              regionData = combinedResult.eyeResult.output.details['iris'];
            } else {
              regionData = filteredRegions.find(([regionKey]) => regionKey === hoveredRegion)?.[1];
            }
            
            if (!regionData || !regionData.region_coordinates) return null;
            const { landmark_region, processed_region } = regionData.region_coordinates;
            
            // Use the calculated render info to properly scale and offset coordinates
            const { scale, offsetX, offsetY } = renderInfo;
            const scaleX = scale;
            const scaleY = scale;

            // Helper to expand polygon outward for a smoother, larger overlay
            function expandPolygon(points: [number, number][], factor = 1.06): [number, number][] {
              // Find centroid
              const n = points.length;
              const centroid = points.reduce((acc, [x, y]) => [acc[0] + x, acc[1] + y], [0, 0]);
              const cx = centroid[0] / n;
              const cy = centroid[1] / n;
              // Move each point away from centroid
              return points.map(([x, y]) => {
                const dx = x - cx;
                const dy = y - cy;
                return [cx + dx * factor, cy + dy * factor] as [number, number];
              });
            }

            // Helper to render a polygon, donut, or circle overlay
            function renderOverlay(coords: any, color: string, maskId: string) {
              if (!coords) return null;

              // Handle landmark_region format: {type: 'polygon'/'donut'/'circle', coordinates: ...}
              if (coords.type === 'polygon' && Array.isArray(coords.coordinates)) {
                let points = coords.coordinates.map((pair: [number, number]) => {
                  const [x, y] = pair;
                  return [x * scaleX + offsetX, y * scaleY + offsetY];
                });
                points = expandPolygon(points, 1.08);
                return (
                  <polygon
                    points={points.map(([x, y]: [number, number]) => `${x},${y}`).join(' ')}
                    fill={color}
                    fillOpacity={color === '#ffe600' ? 0.4 : 0.22}
                    stroke="none"
                    style={{ filter: 'blur(7px)', transition: 'all 0.2s' }}
                  />
                );
              } else if (coords.type === 'circle' && coords.metadata) {
                // Handle circle type - use center and radius
                const [cx, cy] = coords.metadata.center;
                const radius = coords.metadata.radius;
                const scaledCx = cx * scaleX + offsetX;
                const scaledCy = cy * scaleY + offsetY;
                const scaledRadius = radius * scaleX * 1.08; // Expand by 8%
                return (
                  <circle
                    cx={scaledCx}
                    cy={scaledCy}
                    r={scaledRadius}
                    fill={color}
                    fillOpacity={color === '#ffe600' ? 0.4 : 0.22}
                    stroke="none"
                    style={{ filter: 'blur(7px)', transition: 'all 0.2s' }}
                  />
                );
              } else if (coords.type === 'donut' && coords.coordinates && coords.coordinates.outer && coords.coordinates.inner) {
                let outerPoints = coords.coordinates.outer.map((pair: [number, number]) => {
                  const [x, y] = pair;
                  return [x * scaleX + offsetX, y * scaleY + offsetY];
                });
                let innerPoints = coords.coordinates.inner.map((pair: [number, number]) => {
                  const [x, y] = pair;
                  return [x * scaleX + offsetX, y * scaleY + offsetY];
                });
                outerPoints = expandPolygon(outerPoints, 1.08);
                innerPoints = expandPolygon(innerPoints, 1.04);
                return (
                  <g>
                    <defs>
                      <mask id={maskId}>
                        <rect x="0" y="0" width="400" height="500" fill="white" />
                        <polygon
                          points={innerPoints.map(([x, y]: [number, number]) => `${x},${y}`).join(' ')}
                          fill="black"
                        />
                      </mask>
                    </defs>
                    <polygon
                      points={outerPoints.map(([x, y]: [number, number]) => `${x},${y}`).join(' ')}
                      fill={color}
                      fillOpacity={color === '#ffe600' ? 0.4 : 0.22}
                      stroke="none"
                      style={{ filter: 'blur(7px)', transition: 'all 0.2s' }}
                      mask={`url(#${maskId})`}
                    />
                  </g>
                );
              }

              // Handle processed_region format: array of polygons [[[x,y], ...], [[x,y], ...]] or single polygon [[x,y], ...]
              if (Array.isArray(coords)) {
                // Check if it's an array of polygons (first element is an array of coordinates)
                if (coords.length > 0 && Array.isArray(coords[0])) {
                  // Check if first element is a coordinate pair [x, y] or another array (polygon)
                  const isArrayOfPolygons = Array.isArray(coords[0][0]);

                  if (isArrayOfPolygons) {
                    // Multiple polygons: [[[x,y], ...], [[x,y], ...]]
                    return (
                      <g>
                        {coords.map((polygonCoords: any, idx: number) => {
                          if (polygonCoords.length > 0 && Array.isArray(polygonCoords[0]) && polygonCoords[0].length === 2) {
                            const points: [number, number][] = polygonCoords.map((pair: any) => {
                              const [x, y] = pair;
                              return [x * scaleX + offsetX, y * scaleY + offsetY] as [number, number];
                            });
                            return (
                              <polygon
                                key={idx}
                                points={points.map(([x, y]) => `${x},${y}`).join(' ')}
                                fill={color}
                                fillOpacity={0.35}
                                stroke="none"
                                style={{ transition: 'all 0.2s' }}
                              />
                            );
                          }
                          return null;
                        })}
                      </g>
                    );
                  } else {
                    // Single polygon: [[x,y], [x,y], ...]
                    if (coords[0].length === 2) {
                      const points: [number, number][] = coords.map((pair: any) => {
                        const [x, y] = pair;
                        return [x * scaleX + offsetX, y * scaleY + offsetY] as [number, number];
                      });
                      return (
                        <polygon
                          points={points.map(([x, y]) => `${x},${y}`).join(' ')}
                          fill={color}
                          fillOpacity={0.35}
                          stroke="none"
                          style={{ transition: 'all 0.2s' }}
                        />
                      );
                    }
                  }
                }
              }

              return null;
            }

            // Render both overlays in the same SVG with masking to prevent overlap
            const yellowOverlay = renderOverlay(landmark_region, '#ffe600', 'landmark-mask');
            const redOverlay = renderOverlay(processed_region, '#ff0000', 'processed-mask');

            return (
              <svg width={400} height={500} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
                <defs>
                  {/* Create a mask that excludes the red regions from yellow */}
                  <mask id="yellow-cutout-mask">
                    <rect x="0" y="0" width="400" height="500" fill="white" />
                    {/* Black out the red regions so yellow won't show there */}
                    {processed_region && Array.isArray(processed_region) && processed_region.length > 0 && (() => {
                      const isArrayOfPolygons = Array.isArray(processed_region[0]) && Array.isArray(processed_region[0][0]);
                      if (isArrayOfPolygons) {
                        return processed_region.map((polygonCoords: any, idx: number) => {
                          if (polygonCoords.length > 0 && Array.isArray(polygonCoords[0]) && polygonCoords[0].length === 2) {
                            const points: [number, number][] = polygonCoords.map((pair: any) => {
                              const [x, y] = pair;
                              return [x * scaleX + offsetX, y * scaleY + offsetY] as [number, number];
                            });
                            return (
                              <polygon
                                key={idx}
                                points={points.map(([x, y]) => `${x},${y}`).join(' ')}
                                fill="black"
                              />
                            );
                          }
                          return null;
                        });
                      } else if (processed_region[0] && processed_region[0].length === 2) {
                        const points: [number, number][] = processed_region.map((pair: any) => {
                          const [x, y] = pair;
                          return [x * scaleX + offsetX, y * scaleY + offsetY] as [number, number];
                        });
                        return (
                          <polygon
                            points={points.map(([x, y]) => `${x},${y}`).join(' ')}
                            fill="black"
                          />
                        );
                      }
                      return null;
                    })()}
                  </mask>
                </defs>
                {/* Yellow with cutout mask */}
                <g mask="url(#yellow-cutout-mask)">
                  {yellowOverlay}
                </g>
                {/* Red on top, more transparent */}
                {redOverlay}
              </svg>
            );
          })()}
        </div>

        {/* Right: Color list */}
        <div className="flex-1 min-w-[220px] max-w-[320px] text-left">
          <div className="flex flex-col gap-2">
            {filteredRegions.map(([regionKey, regionData]) => {
              return (
                <div
                  key={regionKey}
                  className={`flex items-center gap-3 p-2 rounded-lg border border-gray-200 transition-all bg-gray-50 hover:bg-[#7a6650] ${hoveredRegion === regionKey ? 'bg-[#7a6650] text-white' : ''}`}
                  onMouseEnter={() => {
                    setHoveredRegion(regionKey);
                    if (regionData.region_coordinates) {
                      // Log both landmark and processed regions
                      const coords = regionData.region_coordinates;
                      console.log('Region:', regionKey);
                      if (coords.landmark_region) {
                        console.log('landmark_region:', coords.landmark_region);
                      }
                      if (coords.processed_region) {
                        console.log('processed_region:', coords.processed_region);
                      }
                    }
                  }}
                  onMouseLeave={() => setHoveredRegion(null)}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  <div className={`w-7 h-7 rounded border border-gray-300 shadow-sm ${hoveredRegion === regionKey ? 'text-white' : ''}`} style={{ backgroundColor: regionData.color_palette.result }} />
                  <div className="flex flex-col">
                    <span className={`font-medium text-sm ${hoveredRegion === regionKey ? 'text-white' : 'text-gray-700'}`}>{regionNames[regionKey] || regionKey}</span>
                    <span className={`text-xs ${hoveredRegion === regionKey ? 'text-white' : 'text-gray-500'}`}>{regionData.color_palette.result}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Show missing regions if any */}
          {missingRegions.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-6">
              <h3 className="text-sm font-semibold text-yellow-800 mb-2">
                Regiões não detectadas ({missingRegions.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {missingRegions.map((regionKey) => (
                  <span key={regionKey} className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                    {regionNames[regionKey] || regionKey}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Metadata */}
      {filteredRegions.length > 0 && (
        <div className="text-center text-xs text-gray-500 mt-6">
          <span>⚡ Frontal: {combinedResult.frontalResult.processing_time_seconds ?? '-'}s</span>
          <span className="ml-4">⚡ Olho: {combinedResult.eyeResult.processing_time_seconds ?? '-'}s</span>
          {barbaDetected && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-yellow-800 mt-3">
              ⚠️ Barba detectada — "Contorno da Boca" e "Queixo" omitidos
            </div>
          )}
        </div>
      )}

      {/* Show message if no regions were successful */}
      {filteredRegions.length === 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center mt-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Nenhuma região foi detectada
          </h3>
          <p className="text-red-600">
            A análise não conseguiu detectar nenhuma região facial nas imagens.
            Tente com imagens diferentes com melhor qualidade e iluminação.
          </p>
        </div>
      )}

      <div className="flex justify-center mt-8">
        <button
          onClick={onProceedToManualInput}
          className="px-8 py-3 rounded-lg bg-[#947B62] text-white font-semibold hover:bg-[#7a6650] transition-colors"
        >
          Testar a classificação com estas cores
        </button>
      </div>
    </div>
  );
};

export default ExtractionResults;
