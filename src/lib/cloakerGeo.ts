export type CloakerGeoMetadata = {
  city?: string | null;
  region?: string | null;
  country?: string | null;
  provider?: string | null;
};

type PreciseGeoBlockResult = {
  blocked: boolean;
  attempted: boolean;
  reason?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
};

const VITORIA_DA_CONQUISTA_CENTER = {
  latitude: -14.8619,
  longitude: -40.8442,
};

const VITORIA_DA_CONQUISTA_RADIUS_KM = 35;

const normalizeText = (value?: string | null) =>
  (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const isBahiaGeo = (geo?: CloakerGeoMetadata) => normalizeText(geo?.region) === 'bahia';

const toRadians = (value: number) => (value * Math.PI) / 180;

const distanceInKm = (latitude: number, longitude: number) => {
  const earthRadiusKm = 6371;
  const deltaLat = toRadians(latitude - VITORIA_DA_CONQUISTA_CENTER.latitude);
  const deltaLng = toRadians(longitude - VITORIA_DA_CONQUISTA_CENTER.longitude);

  const startLat = toRadians(VITORIA_DA_CONQUISTA_CENTER.latitude);
  const endLat = toRadians(latitude);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(startLat) * Math.cos(endLat) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const getGeolocationPermissionState = async (): Promise<PermissionState | 'unknown'> => {
  try {
    if (!navigator.permissions?.query) return 'unknown';
    const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
    return result.state;
  } catch {
    return 'unknown';
  }
};

const getCurrentPosition = async (): Promise<GeolocationPosition | null> => {
  if (!('geolocation' in navigator)) return null;

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      () => resolve(null),
      {
        enableHighAccuracy: false,
        timeout: 4000,
        maximumAge: 300000,
      }
    );
  });
};

export const runPreciseGeoBlock = async (
  geo?: CloakerGeoMetadata
): Promise<PreciseGeoBlockResult> => {
  if (!isBahiaGeo(geo)) {
    return { blocked: false, attempted: false };
  }

  const permissionState = await getGeolocationPermissionState();
  if (permissionState === 'denied') {
    return { blocked: false, attempted: true, reason: 'geolocation_denied' };
  }

  const position = await getCurrentPosition();
  if (!position) {
    return { blocked: false, attempted: true, reason: 'geolocation_unavailable' };
  }

  const { latitude, longitude } = position.coords;
  const blocked = distanceInKm(latitude, longitude) <= VITORIA_DA_CONQUISTA_RADIUS_KM;

  return {
    blocked,
    attempted: true,
    reason: blocked ? 'browser_geolocation:vitoria_da_conquista' : 'browser_geolocation_clear',
    coordinates: { latitude, longitude },
  };
};