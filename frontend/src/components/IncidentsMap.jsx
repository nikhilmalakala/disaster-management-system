import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useQuery } from '../hooks/useQuery';
import { getIncidents } from '../services/api';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const statusColor = {
  pending: '#f59e0b',
  verified: '#3b82f6',
  resolved: '#22c55e',
  rejected: '#ef4444',
};

function StatusMarker({ incident }) {
  if (!incident) return null;
  if (!incident.location) return null;
  if (!Array.isArray(incident.location.coordinates)) return null;

  const [lng, lat] = incident.location.coordinates;
  if (typeof lat !== 'number' || typeof lng !== 'number') return null;

  const icon = L.divIcon({
    className: 'custom-marker',
    html: `<div style="width:24px;height:24px;border-radius:50%;background:${
      statusColor[incident.status] || '#94a3b8'
    };border:2px solid white;"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  return (
    <Marker position={[lat, lng]} icon={icon}>
      <Popup>
        <strong>{incident.title}</strong>
        <br />
        {incident.status}
      </Popup>
    </Marker>
  );
}

export default function IncidentsMap({
  incidents,
  height = '400px',
  center = [20, 0],
  zoom = 2,
}) {
  const { data } = useQuery(getIncidents);

  // SAFE ARRAY
  const list = Array.isArray(incidents)
    ? incidents
    : Array.isArray(data)
    ? data
    : [];

  // SAFE center
  let mapCenter = center;
  let mapZoom = zoom;

  if (
    list.length > 0 &&
    list[0]?.location?.coordinates &&
    Array.isArray(list[0].location.coordinates)
  ) {
    const [lng, lat] = list[0].location.coordinates;
    if (typeof lat === 'number' && typeof lng === 'number') {
      mapCenter = [lat, lng];
      mapZoom = 10;
    }
  }

  return (
    <div style={{ height }} className="rounded-xl overflow-hidden shadow-md border bg-white">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {list.map((inc) => (
          <StatusMarker key={inc?._id || Math.random()} incident={inc} />
        ))}
      </MapContainer>
    </div>
  );
}