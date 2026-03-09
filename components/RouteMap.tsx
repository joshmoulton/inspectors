'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapMarker {
    id: string;
    lat: number;
    lng: number;
    label: string;
    sublabel?: string;
    color?: string;
}

interface RouteMapProps {
    markers: MapMarker[];
    selectedId?: string | null;
    onMarkerClick?: (id: string) => void;
    height?: number;
}

// Custom colored markers using SVG
function createMarkerIcon(color: string, isSelected: boolean) {
    const size = isSelected ? 32 : 24;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" stroke="rgba(0,0,0,0.3)" stroke-width="1">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
        <circle cx="12" cy="9" r="3" fill="white" stroke="none"/>
    </svg>`;
    return L.divIcon({
        html: svg,
        className: 'custom-map-marker',
        iconSize: [size, size],
        iconAnchor: [size / 2, size],
        popupAnchor: [0, -size],
    });
}

export default function RouteMap({ markers, selectedId, onMarkerClick, height = 500 }: RouteMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markersLayerRef = useRef<L.LayerGroup | null>(null);

    // Initialize map
    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        const map = L.map(mapRef.current, {
            center: [39.8283, -98.5795], // Center of US
            zoom: 4,
            zoomControl: true,
            attributionControl: true,
        });

        // Dark tile layer that matches our UI
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19,
        }).addTo(map);

        markersLayerRef.current = L.layerGroup().addTo(map);
        mapInstanceRef.current = map;

        return () => {
            map.remove();
            mapInstanceRef.current = null;
        };
    }, []);

    // Update markers
    useEffect(() => {
        const map = mapInstanceRef.current;
        const layer = markersLayerRef.current;
        if (!map || !layer) return;

        layer.clearLayers();

        if (markers.length === 0) return;

        const bounds: [number, number][] = [];

        markers.forEach((m) => {
            const isSelected = m.id === selectedId;
            const color = m.color || (isSelected ? '#6366f1' : '#06b6d4');
            const icon = createMarkerIcon(color, isSelected);

            const marker = L.marker([m.lat, m.lng], { icon, zIndexOffset: isSelected ? 1000 : 0 })
                .bindPopup(`
                    <div style="font-family: Inter, system-ui, sans-serif; min-width: 160px;">
                        <div style="font-weight: 700; font-size: 13px; margin-bottom: 4px;">${m.label}</div>
                        ${m.sublabel ? `<div style="font-size: 11px; color: #666;">${m.sublabel}</div>` : ''}
                    </div>
                `, { className: 'route-map-popup' });

            if (onMarkerClick) {
                marker.on('click', () => onMarkerClick(m.id));
            }

            marker.addTo(layer);
            bounds.push([m.lat, m.lng]);
        });

        if (bounds.length > 0) {
            map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
        }
    }, [markers, selectedId, onMarkerClick]);

    return (
        <div
            ref={mapRef}
            style={{
                height,
                width: '100%',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                border: '1px solid var(--border-default)',
            }}
        />
    );
}
