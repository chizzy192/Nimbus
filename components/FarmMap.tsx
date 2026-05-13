'use client';

import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

export interface FarmPin {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  status: 'pending' | 'active' | 'trigger' | 'expired';
}

const STATUS_COLOR: Record<FarmPin['status'], string> = {
  pending: '#6ee7b7',
  active: '#10b981',
  trigger: '#f87171',
  expired: '#34d39955',
};

function FitBounds({ pins }: { pins: FarmPin[] }) {
  const map = useMap();
  useEffect(() => {
    if (pins.length === 0) return;
    if (pins.length === 1) {
      map.setView([pins[0].latitude, pins[0].longitude], 8);
      return;
    }
    const bounds = L.latLngBounds(pins.map((p) => [p.latitude, p.longitude] as [number, number]));
    map.fitBounds(bounds.pad(0.25));
  }, [pins, map]);
  return null;
}

function PinDrop({ onPick }: { onPick: (lat: number, lon: number) => void }) {
  useMapEvents({
    click(e: L.LeafletMouseEvent) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function FarmMap({
  pins,
  height = 360,
  pickable,
  picked,
  onPick,
}: {
  pins: FarmPin[];
  height?: number;
  pickable?: boolean;
  picked?: { lat: number; lon: number } | null;
  onPick?: (lat: number, lon: number) => void;
}) {
  const center = useMemo<[number, number]>(() => {
    if (picked) return [picked.lat, picked.lon];
    if (pins[0]) return [pins[0].latitude, pins[0].longitude];
    return [9.082, 8.6753]; // central Nigeria
  }, [pins, picked]);

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)]" style={{ height }}>
      <MapContainer
        center={center}
        zoom={6}
        scrollWheelZoom
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds pins={pins} />
        {pickable && onPick && <PinDrop onPick={onPick} />}
        {pins.map((p) => (
          <CircleMarker
            key={p.id}
            center={[p.latitude, p.longitude]}
            radius={9}
            pathOptions={{
              color: STATUS_COLOR[p.status],
              fillColor: STATUS_COLOR[p.status],
              fillOpacity: 0.6,
              weight: 2,
            }}
          >
            <Popup>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{p.name}</div>
              <div style={{ fontFamily: 'Fira Code, monospace', fontSize: 11, color: '#047857' }}>
                {p.latitude.toFixed(4)}, {p.longitude.toFixed(4)}
              </div>
            </Popup>
          </CircleMarker>
        ))}
        {picked && (
          <CircleMarker
            center={[picked.lat, picked.lon]}
            radius={11}
            pathOptions={{
              color: '#22d3ee',
              fillColor: '#22d3ee',
              fillOpacity: 0.7,
              weight: 3,
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}
