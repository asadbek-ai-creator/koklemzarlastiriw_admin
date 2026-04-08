import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { StatusBadge } from '@/features/applications/components/StatusBadge';
import type { Application } from '@/shared/types/api.types';

// Fix Leaflet default marker icon path issue with bundlers
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface Props {
  application: Application;
}

export function ApplicationMap({ application }: Props) {
  // The swagger defines gps_latitude/longitude on CreateApplicationRequest
  // but they may come through in the Application object via the API.
  const app = application as Application & {
    gps_latitude?: number;
    gps_longitude?: number;
  };

  const lat = app.gps_latitude;
  const lng = app.gps_longitude;

  if (lat == null || lng == null) {
    return (
      <div className="flex h-64 items-center justify-center rounded-md border text-sm text-muted-foreground">
        No GPS coordinates available
      </div>
    );
  }

  return (
    <div className="h-72 w-full overflow-hidden rounded-md border">
      <MapContainer
        center={[lat, lng]}
        zoom={14}
        className="h-full w-full"
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} icon={defaultIcon}>
          <Popup>
            <div className="space-y-1 text-sm">
              <p className="font-semibold">{application.application_no}</p>
              <StatusBadge status={application.status} />
              <p>{application.section}</p>
              <p className="text-xs text-muted-foreground">
                {lat.toFixed(5)}, {lng.toFixed(5)}
              </p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
