import { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { GeographicData } from '@/types/dashboard';
import MapWrapper from './MapWrapper';

// Fix Leaflet default marker icon issue
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface GeographicMapProps {
  data: GeographicData;
  title?: string;
  metric?: 'farmers' | 'area';
  height?: number;
  bare?: boolean;
}

const LEGEND_STEPS_FARMERS = [
  { label: '≥ 30', color: '#15803d', min: 30 },
  { label: '24 – 29', color: '#16a34a', min: 24 },
  { label: '18 – 23', color: '#22c55e', min: 18 },
  { label: '12 – 17', color: '#4ade80', min: 12 },
  { label: '6 – 11', color: '#86efac', min: 6 },
  { label: '≤ 5', color: '#dcfce7', min: 0 },
];

export default function GeographicMap({
  data,
  title,
  metric = 'farmers',
  height = 340,
  bare = false,
}: GeographicMapProps) {
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [MapContainer, setMapContainer] = useState<any>(null);
  const [TileLayer, setTileLayer] = useState<any>(null);
  const [GeoJSON, setGeoJSON] = useState<any>(null);

  useEffect(() => {
    // Dynamically import Leaflet components to avoid SSR issues
    import('react-leaflet').then((mod) => {
      setMapContainer(() => mod.MapContainer);
      setTileLayer(() => mod.TileLayer);
      setGeoJSON(() => mod.GeoJSON);
    });

    // Load GeoJSON file
    fetch('/Digos_City.geojson')
      .then((res) => res.json())
      .then((data) => setGeoJsonData(data))
      .catch((err) => console.error('Error loading GeoJSON:', err));
  }, []);

  const getColor = (value: number) => {
    if (metric === 'area') {
      const maxArea = Math.max(...data.by_barangay.map((b) => Number(b.total_area) || 0), 1);
      const ratio = value / maxArea;
      if (ratio >= 0.8) return '#15803d';
      if (ratio >= 0.6) return '#16a34a';
      if (ratio >= 0.4) return '#22c55e';
      if (ratio >= 0.25) return '#4ade80';
      if (ratio >= 0.1) return '#86efac';
      return '#dcfce7';
    }

    const maxCount = Math.max(...data.by_barangay.map((b) => b.farmer_count), 1);
    // If dataset has smaller numbers, scale proportionally across the 6 green tiers
    if (maxCount < 30) {
      const ratio = value / maxCount;
      if (ratio >= 0.85) return '#15803d';
      if (ratio >= 0.68) return '#16a34a';
      if (ratio >= 0.5) return '#22c55e';
      if (ratio >= 0.33) return '#4ade80';
      if (ratio >= 0.15) return '#86efac';
      return '#dcfce7';
    }

    for (const step of LEGEND_STEPS_FARMERS) {
      if (value >= step.min) return step.color;
    }
    return '#dcfce7';
  };

  const style = (feature: any) => {
    const barangayName = feature.properties.name || feature.properties.BRGY_NAME || '';
    const barangayData = data.by_barangay.find(
      (b) => b.barangay?.toLowerCase() === barangayName?.toLowerCase()
    );
    const val =
      metric === 'area'
        ? Number(barangayData?.total_area || 0)
        : Number(barangayData?.farmer_count || 0);

    return {
      fillColor: getColor(val),
      weight: 1.5,
      opacity: 1,
      color: '#ffffff',
      fillOpacity: 0.88,
    };
  };

  const onEachFeature = (feature: any, layer: any) => {
    const barangayName = feature.properties.name || feature.properties.BRGY_NAME || '';
    const barangayData = data.by_barangay.find(
      (b) => b.barangay?.toLowerCase() === barangayName?.toLowerCase()
    );
    const farmerCount = barangayData?.farmer_count || 0;
    const totalArea = Number(barangayData?.total_area || 0);

    if (layer.bindTooltip) {
      layer.bindTooltip(`
        <div class="font-semibold text-slate-900">${barangayName}</div>
        <div class="text-xs text-slate-700">Farmers: <strong>${farmerCount}</strong></div>
        <div class="text-xs text-slate-700">Total Area: <strong>${totalArea.toFixed(2)} ha</strong></div>
      `);
    }
  };

  if (!MapContainer || !TileLayer || !GeoJSON || !geoJsonData) {
    return (
      <div className={bare ? 'relative' : 'rounded-lg border bg-card p-4 shadow-sm'}>
        {title && !bare && <h3 className="mb-4 font-semibold">{title}</h3>}
        <div className="flex items-center justify-center rounded-xl bg-sky-50/60 dark:bg-slate-900/50" style={{ height }}>
          <p className="text-sm text-muted-foreground">Loading Digos City map...</p>
        </div>
      </div>
    );
  }

  const content = (
    <div className="relative overflow-hidden rounded-xl border border-emerald-100/80 bg-[#eaf4f8] dark:border-border dark:bg-slate-900">
      <MapWrapper>
        <MapContainer
          center={[6.765, 125.335]}
          zoom={11}
          style={{ height: `${height}px`, width: '100%', background: '#eaf4f8' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
          />
          <GeoJSON key={metric} data={geoJsonData} style={style} onEachFeature={onEachFeature} />
        </MapContainer>
      </MapWrapper>

      {/* Floating Legend Box on the Right (matching reference image) */}
      <div className="pointer-events-auto absolute bottom-3 right-3 z-[400] rounded-xl border border-slate-200/90 bg-white/95 p-3 shadow-md backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/95">
        <p className="mb-2 text-[11px] font-bold text-slate-800 dark:text-slate-100">
          {metric === 'area' ? 'Farm Area per Brgy' : 'Farmers per Barangay'}
        </p>
        <div className="space-y-1.5">
          {LEGEND_STEPS_FARMERS.map((step) => (
            <div key={step.label} className="flex items-center gap-2 text-[11px] font-medium text-slate-600 dark:text-slate-300">
              <span
                className="inline-block h-3.5 w-3.5 rounded-[3px] border border-black/5"
                style={{ backgroundColor: step.color }}
              />
              <span>{step.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (bare) {
    return content;
  }

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      {title && <h3 className="mb-4 font-semibold">{title}</h3>}
      {content}
    </div>
  );
}
