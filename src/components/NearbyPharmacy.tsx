import { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Loader2, Phone, AlertCircle, ExternalLink } from 'lucide-react';
import { useSeniorMode } from '@/contexts/SeniorModeContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface PharmacyInfo {
  id: string;
  name: string;
  address: string;
  phone: string;
  distance: number;
  lat: number;
  lng: number;
}

const KAKAO_REST_KEY = import.meta.env.VITE_KAKAO_REST_KEY;

/** 카카오 로컬 REST API로 주변 약국 검색 (PM9 = 약국 카테고리) */
const searchPharmaciesKakao = async (lat: number, lng: number): Promise<PharmacyInfo[]> => {
  const res = await fetch(
    `/kakao-api/v2/local/search/category.json?category_group_code=PM9&x=${lng}&y=${lat}&radius=3000&sort=distance&size=15`,
    { headers: { Authorization: `KakaoAK ${KAKAO_REST_KEY}` } }
  );
  if (!res.ok) throw new Error(`카카오 API ${res.status}`);
  const data = await res.json();

  return data.documents.map((p: Record<string, string>) => ({
    id: p.id,
    name: p.place_name,
    address: p.road_address_name || p.address_name,
    phone: p.phone || '',
    distance: parseInt(p.distance) || 0,
    lat: parseFloat(p.y),
    lng: parseFloat(p.x),
  }));
};

/** Overpass API fallback (전화번호 없을 수 있음) */
const searchPharmaciesOSM = async (lat: number, lng: number): Promise<PharmacyInfo[]> => {
  const query = `[out:json][timeout:10];node["amenity"="pharmacy"](around:3000,${lat},${lng});out body;`;
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: `data=${encodeURIComponent(query)}`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  if (!res.ok) throw new Error('검색 실패');
  const data = await res.json();
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  return data.elements
    .map((el: { id: number; lat: number; lon: number; tags?: Record<string, string> }) => {
      const dLat = toRad(el.lat - lat);
      const dLon = toRad(el.lon - lng);
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat)) * Math.cos(toRad(el.lat)) * Math.sin(dLon / 2) ** 2;
      const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return {
        id: String(el.id),
        name: el.tags?.name || el.tags?.['name:ko'] || '약국',
        address: el.tags?.['addr:full'] || el.tags?.['addr:street'] || '',
        phone: el.tags?.phone || el.tags?.['contact:phone'] || '',
        distance: Math.round(dist),
        lat: el.lat,
        lng: el.lon,
      };
    })
    .sort((a: PharmacyInfo, b: PharmacyInfo) => a.distance - b.distance)
    .slice(0, 20);
};

/** 카카오 먼저 시도, 실패 시 OSM fallback */
const searchPharmacies = async (lat: number, lng: number): Promise<PharmacyInfo[]> => {
  if (KAKAO_REST_KEY) {
    try {
      return await searchPharmaciesKakao(lat, lng);
    } catch (e) {
      console.warn('카카오 API 실패, OSM fallback:', e);
    }
  }
  return searchPharmaciesOSM(lat, lng);
};

// Leaflet 기본 마커 아이콘 fix
delete (L.Icon.Default.prototype as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const myIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const pharmacyIcon = L.divIcon({
  html: `<div style="background:#4f7942;color:white;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:bold;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);">💊</div>`,
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -16],
});

const NearbyPharmacy = () => {
  const { isSeniorMode: sr } = useSeniorMode();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pharmacies, setPharmacies] = useState<PharmacyInfo[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('이 브라우저에서 위치 서비스를 지원하지 않습니다.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        if (!mapRef.current) return;

        // 지도 생성
        const map = L.map(mapRef.current).setView([latitude, longitude], 15);
        mapInstanceRef.current = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap',
          maxZoom: 19,
        }).addTo(map);

        // 현재 위치 마커
        L.marker([latitude, longitude], { icon: myIcon })
          .addTo(map)
          .bindPopup('<strong>현재 위치</strong>')
          .openPopup();

        // 약국 검색
        try {
          const list = await searchPharmacies(latitude, longitude);
          setPharmacies(list);

          list.forEach((p) => {
            const naverUrl = `https://map.naver.com/p/search/${encodeURIComponent(p.name)}?c=${p.lng},${p.lat},15,0,0,0,dh`;
            const popupContent = `<div style="min-width:160px;">
              <strong>${p.name}</strong>
              ${p.address ? `<br/><span style="color:#666;font-size:12px;">${p.address}</span>` : ''}
              ${p.phone ? `<br/><a href="tel:${p.phone}" style="color:#4f7942;font-size:12px;">${p.phone}</a>` : ''}
              <br/><span style="color:#4f7942;font-size:12px;font-weight:600;">${p.distance}m</span>
              <br/><a href="${naverUrl}" target="_blank" style="display:inline-block;margin-top:4px;padding:4px 10px;background:#4f7942;color:white;border-radius:6px;font-size:12px;text-decoration:none;">길찾기</a>
            </div>`;
            const marker = L.marker([p.lat, p.lng], { icon: pharmacyIcon })
              .addTo(map)
              .bindPopup(popupContent);
            marker.on('click', () => setSelectedId(p.id));
            markersRef.current.push(marker);
          });
        } catch {
          setPharmacies([]);
        }

        setLoading(false);
      },
      () => {
        setError('위치 정보를 가져올 수 없습니다.\n브라우저 설정에서 위치 권한을 허용해주세요.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );

    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  const focusPharmacy = (pharmacy: PharmacyInfo) => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView([pharmacy.lat, pharmacy.lng], 17);
    setSelectedId(pharmacy.id);

    const idx = pharmacies.findIndex((p) => p.id === pharmacy.id);
    if (idx >= 0 && markersRef.current[idx]) {
      markersRef.current[idx].openPopup();
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <AlertCircle className={`text-muted-foreground mb-4 ${sr ? 'w-12 h-12' : 'w-10 h-10'}`} />
        <p className={`text-muted-foreground whitespace-pre-line ${sr ? 'text-base' : 'text-sm'}`}>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 지도 */}
      <div className="relative rounded-2xl overflow-hidden border border-border" style={{ height: sr ? '320px' : '260px' }}>
        {loading && (
          <div className="absolute inset-0 bg-muted flex items-center justify-center z-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className={`ml-2 text-muted-foreground ${sr ? 'text-base' : 'text-sm'}`}>주변 약국을 찾고 있어요...</span>
          </div>
        )}
        <div ref={mapRef} className="w-full h-full" />
      </div>

      {/* 약국 리스트 */}
      {pharmacies.length > 0 && (
        <div className="space-y-2">
          <p className={`font-semibold text-foreground ${sr ? 'text-lg' : 'text-sm'}`}>
            <MapPin className="w-4 h-4 inline mr-1" />
            주변 약국 {pharmacies.length}곳
          </p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {pharmacies.map((p) => (
              <button
                key={p.id}
                onClick={() => focusPharmacy(p)}
                className={`w-full text-left rounded-xl border p-3 transition-all active:scale-[0.98] ${
                  selectedId === p.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card hover:border-primary/30'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-foreground truncate ${sr ? 'text-base' : 'text-sm'}`}>
                      {p.name}
                    </p>
                    <p className={`text-muted-foreground truncate ${sr ? 'text-sm' : 'text-xs'}`}>
                      {p.address}
                    </p>
                    {p.phone && (
                      <p className={`text-primary ${sr ? 'text-sm' : 'text-xs'}`}>{p.phone}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-primary font-medium ${sr ? 'text-sm' : 'text-xs'}`}>
                      {p.distance >= 1000
                        ? `${(p.distance / 1000).toFixed(1)}km`
                        : `${p.distance}m`}
                    </span>
                    {p.phone && (
                      <a
                        href={`tel:${p.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-full bg-primary/10 text-primary"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <a
                      href={`https://map.naver.com/p/search/${encodeURIComponent(p.name)}?c=${p.lng},${p.lat},15,0,0,0,dh`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-full bg-primary/10 text-primary"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {!loading && pharmacies.length === 0 && !error && (
        <div className="text-center py-8">
          <Navigation className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className={`text-muted-foreground ${sr ? 'text-base' : 'text-sm'}`}>주변에 약국이 없습니다</p>
        </div>
      )}
    </div>
  );
};

export default NearbyPharmacy;
