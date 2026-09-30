import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  MapPin, 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  Compass, 
  AlertTriangle, 
  Wind, 
  Activity, 
  ShieldCheck, 
  Thermometer, 
  Droplets, 
  Clock, 
  ChevronRight, 
  Info, 
  Navigation, 
  Radio, 
  LocateFixed, 
  RotateCcw, 
  Sparkles, 
  CheckCircle2, 
  Loader2,
  Search,
  X,
  Globe,
  Building2,
  History,
  Leaf,
  TrendingUp,
  TrendingDown,
  Minus,
  Gauge,
  ArrowLeft
} from 'lucide-react';
import L from 'leaflet';
import { EnvironmentalEvent, RiskLevel } from '../../types';
import { Badge } from '../common/Badge';
import { 
  GeoLocation, 
  SearchPlaceResult,
  POPULAR_GLOBAL_HUBS,
  getRecentSearches,
  saveRecentSearch,
  searchPlacesOnline,
  detectBrowserLocation, 
  generateLocalizedEvents,
  resolveRealPlaceNames,
  reverseGeocodeLatLng,
  calculateDistanceKm, 
  formatDistance 
} from '../../services/geoService';
import { fetchLiveTelemetry, LiveTelemetryData } from '../../services/meteoService';

interface TriggerMapProps {
  events?: EnvironmentalEvent[];
  id?: string;
  onLocationChange?: (locationName: string, radiusKm: number, events: EnvironmentalEvent[]) => void;
  onPinSelect?: (event: EnvironmentalEvent) => void;
}

export const TriggerMap: React.FC<TriggerMapProps> = ({
  events: initialEvents,
  id = 'environmental-trigger-map',
  onLocationChange,
  onPinSelect,
}) => {
  // Current user anchor location (defaults to NIET Greater Noida)
  const [currentLocation, setCurrentLocation] = useState<GeoLocation>({
    lat: 28.4623,
    lng: 77.4904,
    name: 'NIET Greater Noida',
    source: 'preset',
  });

  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [geoStatusMsg, setGeoStatusMsg] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchPlaceResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [recentSearches, setRecentSearches] = useState<SearchPlaceResult[]>(() => getRecentSearches());
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Radius filter in km: 5km, 10km, or 15km (All)
  const [radiusKm, setRadiusKm] = useState<number>(5);
  // Viewport scale zoom radius in km (controls map zoom level)
  const [zoomRadiusKm, setZoomRadiusKm] = useState<number>(8);
  // Risk filter
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'all' | 'inhaler'>('all');
  // Visual map theme
  const [mapStyle, setMapStyle] = useState<'light' | 'dark' | 'terrain'>('light');
  // Only show pins strictly within the selected radius or highlight them
  const [strictRadiusOnly, setStrictRadiusOnly] = useState<boolean>(true);

  // Active environmental events around current location
  const [activeEvents, setActiveEvents] = useState<EnvironmentalEvent[]>(() => {
    return generateLocalizedEvents(28.4623, 77.4904, 'NIET Greater Noida');
  });

  const [selectedEventId, setSelectedEventId] = useState<string>(activeEvents[0]?.id || '');

  // ── My Location & Smart Inhaler Live Panels ──────────────────────────────────
  const [showMyLocationPanel, setShowMyLocationPanel] = useState<boolean>(false);
  const [showInhalerGpsPanel, setShowInhalerGpsPanel] = useState<boolean>(false);
  const [myLocationTelemetry, setMyLocationTelemetry] = useState<LiveTelemetryData | null>(null);
  const [isLoadingMyTelemetry, setIsLoadingMyTelemetry] = useState<boolean>(false);

  // Click outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced online geocoding search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchPlacesOnline(searchQuery);
        setSearchResults(results);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 320);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Calculate distance from user to each event and attach distanceKm
  const eventsWithDistance = useMemo(() => {
    return activeEvents.map((evt) => {
      const dist = calculateDistanceKm(
        currentLocation.lat,
        currentLocation.lng,
        evt.location.lat,
        evt.location.lng
      );
      return {
        ...evt,
        distanceKm: dist,
      };
    });
  }, [activeEvents, currentLocation.lat, currentLocation.lng]);

  // Filter events by radius and risk level
  const displayedEvents = useMemo(() => {
    return eventsWithDistance.filter((evt) => {
      // Radius filter
      if (strictRadiusOnly && (evt.distanceKm ?? 0) > radiusKm) {
        return false;
      }
      // Risk / type filter
      if (riskFilter === 'all') return true;
      if (riskFilter === 'inhaler') return evt.inhalationDetected;
      return evt.riskLevel === riskFilter;
    });
  }, [eventsWithDistance, radiusKm, strictRadiusOnly, riskFilter]);

  // Counts within 5km and 10km
  const countWithin5km = useMemo(() => {
    return eventsWithDistance.filter((e) => (e.distanceKm ?? 0) <= 5).length;
  }, [eventsWithDistance]);

  const countWithin10km = useMemo(() => {
    return eventsWithDistance.filter((e) => (e.distanceKm ?? 0) <= 10).length;
  }, [eventsWithDistance]);

  // Selected event (default to first visible event if current selection is filtered out)
  const selectedEvent = useMemo(() => {
    const found = eventsWithDistance.find((e) => e.id === selectedEventId);
    if (found) return found;
    return displayedEvents[0] || eventsWithDistance[0];
  }, [eventsWithDistance, selectedEventId, displayedEvents]);

  // Notify parent of location/events update
  useEffect(() => {
    if (onLocationChange) {
      onLocationChange(currentLocation.name || 'Current Vicinity', radiusKm, displayedEvents);
    }
  }, [currentLocation, radiusKm, displayedEvents, onLocationChange]);

  // Notify parent when selected event changes (pin tapped)
  useEffect(() => {
    if (onPinSelect && selectedEvent) {
      onPinSelect(selectedEvent);
    }
  }, [selectedEvent?.id]);

  // Asynchronously resolve real locality names (e.g. Chowk, Civil Lines, etc.) via reverse geocoding
  useEffect(() => {
    let isCancelled = false;
    const fetchRealNames = async () => {
      const enriched = await resolveRealPlaceNames(activeEvents, currentLocation.name || 'Current Vicinity');
      if (!isCancelled && enriched && enriched.length > 0) {
        setActiveEvents(enriched);
      }
    };
    fetchRealNames();
    return () => {
      isCancelled = true;
    };
  }, [currentLocation.lat, currentLocation.lng]);

  // Leaflet DOM container and map instance references
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Helper for watermark-free tile URLs (OpenStreetMap & Esri World Maps)
  const getMapTileUrl = (style: 'light' | 'dark' | 'terrain') => {
    if (style === 'dark') {
      return 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';
    }
    if (style === 'terrain') {
      return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}';
    }
    return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  };

  // Initialize real Leaflet interactive map instance
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [currentLocation.lat, currentLocation.lng],
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
      });

      const tileLayer = L.tileLayer(getMapTileUrl(mapStyle), {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c'],
      });
      tileLayer.addTo(map);
      tileLayerRef.current = tileLayer;

      const layersGroup = L.layerGroup().addTo(map);
      layersGroupRef.current = layersGroup;

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map tile style when mapStyle changes
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    tileLayerRef.current.setUrl(getMapTileUrl(mapStyle));
  }, [mapStyle]);

  // Attempt automatic browser location lock on initial load for accurate user location
  useEffect(() => {
    if (navigator.geolocation && currentLocation.source === 'default') {
      detectBrowserLocation()
        .then((loc) => {
          setCurrentLocation(loc);
          const newEvents = generateLocalizedEvents(loc.lat, loc.lng, loc.name);
          setActiveEvents(newEvents);
          setSelectedEventId(newEvents[0]?.id || '');
          setGeoStatusMsg(`GPS Locked: ${loc.name}`);
          setTimeout(() => setGeoStatusMsg(null), 5000);
        })
        .catch(() => {
          reverseGeocodeLatLng(currentLocation.lat, currentLocation.lng).then((realName) => {
            if (realName && !realName.startsWith('Location (')) {
              setCurrentLocation((prev) => ({ ...prev, name: realName }));
            }
          });
        });
    }
  }, []);

  // Fetch live telemetry for current location whenever it changes
  useEffect(() => {
    let cancelled = false;
    const loadTelemetry = async () => {
      setIsLoadingMyTelemetry(true);
      try {
        const data = await fetchLiveTelemetry(
          currentLocation.lat,
          currentLocation.lng,
          currentLocation.name || 'My Location'
        );
        if (!cancelled) setMyLocationTelemetry(data);
      } catch {
        // fallback already handled inside fetchLiveTelemetry
      } finally {
        if (!cancelled) setIsLoadingMyTelemetry(false);
      }
    };
    loadTelemetry();
    return () => { cancelled = true; };
  }, [currentLocation.lat, currentLocation.lng]);

  // Sync Leaflet view, 5km/10km radius circles, and interactive pins
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layers = layersGroupRef.current;
    if (!map || !layers) return;

    layers.clearLayers();

    const targetZoom = radiusKm === 5 ? 13 : radiusKm === 10 ? 12 : 11;
    map.flyTo([currentLocation.lat, currentLocation.lng], targetZoom, {
      animate: true,
      duration: 1.0,
    });

    // 1. Draw 5 km radius circle
    L.circle([currentLocation.lat, currentLocation.lng], {
      radius: 5000,
      color: '#10B981',
      weight: radiusKm === 5 ? 2.5 : 1.2,
      dashArray: '6, 6',
      fillColor: '#10B981',
      fillOpacity: radiusKm === 5 ? 0.08 : 0.02,
    }).addTo(layers);

    // 2. Draw 10 km radius circle
    L.circle([currentLocation.lat, currentLocation.lng], {
      radius: 10000,
      color: '#F59E0B',
      weight: radiusKm === 10 ? 2.5 : 1.2,
      dashArray: '6, 6',
      fillColor: '#F59E0B',
      fillOpacity: radiusKm === 10 ? 0.07 : 0.02,
    }).addTo(layers);

    // 3. User Anchor Marker (clickable — shows My Location risk panel)
    const riskColor = myLocationTelemetry
      ? myLocationTelemetry.riskLevel === 'high'
        ? '#EF4444'
        : myLocationTelemetry.riskLevel === 'moderate'
        ? '#F59E0B'
        : '#10B981'
      : '#0A6847';

    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
          <div style="position: absolute; width: 40px; height: 40px; border-radius: 50%; background: ${riskColor}40; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 30px; height: 30px; border-radius: 50%; background: ${riskColor}; color: white; display: flex; align-items: center; justify-content: center; border: 2.5px solid white; box-shadow: 0 4px 14px rgba(0,0,0,0.35); z-index: 10;">
            <svg style="width: 14px; height: 14px; fill: white;" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
          </div>
          <div style="position: absolute; top: 100%; left: 50%; transform: translateX(-50%); margin-top: 5px; background: #0F172A; color: white; font-size: 10px; font-weight: 700; padding: 3px 9px; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.3); white-space: nowrap; z-index: 20; display: flex; align-items: center; gap: 4px;">
            <span>📍</span><span>My Live Location</span>
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    const userMarker = L.marker([currentLocation.lat, currentLocation.lng], { icon: userIcon });
    userMarker.on('click', () => {
      setShowMyLocationPanel(true);
      setShowInhalerGpsPanel(false);
      setSelectedEventId('');
    });
    userMarker.addTo(layers);

    // 3b. Smart Inhaler Live GPS Marker (with custom pill badge & pulse ring)
    const inhalerIcon = L.divIcon({
      className: 'custom-inhaler-marker',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
          <div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: #0284C740; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #0284C7, #0A6847); color: white; display: flex; align-items: center; justify-content: center; border: 2.5px solid white; box-shadow: 0 4px 14px rgba(2,132,199,0.5); z-index: 12;">
            <span style="font-size: 14px;">💊</span>
          </div>
          <div style="position: absolute; top: 100%; left: 50%; transform: translateX(-50%); margin-top: 5px; background: #0284C7; color: white; font-size: 10px; font-weight: 800; padding: 3px 9px; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.3); white-space: nowrap; z-index: 22; display: flex; align-items: center; gap: 4px;">
            <span>💊 Smart Inhaler (GPS Lock)</span>
          </div>
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 19],
    });

    const inhalerMarker = L.marker([currentLocation.lat + 0.0002, currentLocation.lng + 0.0002], { icon: inhalerIcon });
    inhalerMarker.on('click', () => {
      setShowInhalerGpsPanel(true);
      setShowMyLocationPanel(false);
      setSelectedEventId('');
    });
    inhalerMarker.addTo(layers);

    // 4. Environmental Trigger Station Markers
    displayedEvents.forEach((evt) => {
      const isSelected = evt.id === selectedEventId;
      const distStr = evt.distanceKm !== undefined ? formatDistance(evt.distanceKm) : '';
      const bgColor =
        evt.riskLevel === 'high' ? '#EF4444' : evt.riskLevel === 'moderate' ? '#F59E0B' : '#10B981';

      const eventIcon = L.divIcon({
        className: 'custom-event-marker',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            ${
              isSelected
                ? `<div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: ${bgColor}; opacity: 0.4; animation: ping 1.5s infinite;"></div>`
                : ''
            }
            <div style="width: 26px; height: 26px; border-radius: 50%; background: ${bgColor}; color: white; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.25); z-index: 10; ${
          isSelected ? 'transform: scale(1.25); outline: 2px solid #0F172A;' : ''
        }">
              <span style="font-size: 11px; font-weight: 800;">${
                evt.riskLevel === 'high' ? '!' : evt.riskLevel === 'moderate' ? '⚡' : '✓'
              }</span>
            </div>
            <div style="margin-top: 3px; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 700; ${
              isSelected
                ? 'background: #0F172A; color: white;'
                : 'background: rgba(255,255,255,0.95); color: #1E293B; border: 1px solid #CBD5E1;'
            } box-shadow: 0 1px 4px rgba(0,0,0,0.15); white-space: nowrap;">
              ${evt.location.name} (${distStr})
            </div>
          </div>
        `,
        iconSize: [120, 48],
        iconAnchor: [60, 14],
      });

      const marker = L.marker([evt.location.lat, evt.location.lng], { icon: eventIcon });
      marker.on('click', () => {
        setSelectedEventId(evt.id);
        setShowMyLocationPanel(false);
      });
      marker.addTo(layers);
    });
  }, [currentLocation, displayedEvents, radiusKm, selectedEventId, myLocationTelemetry]);

  // Handler: Detect live browser GPS location
  const handleDetectNearMe = async () => {
    setIsLocating(true);
    setGeoStatusMsg('Requesting GPS coordinate lock from browser...');
    try {
      const loc = await detectBrowserLocation();
      setCurrentLocation(loc);
      const newEvents = generateLocalizedEvents(loc.lat, loc.lng, loc.name || 'Your Location');
      setActiveEvents(newEvents);
      setSelectedEventId(newEvents[0]?.id || '');
      setSearchQuery('');
      setIsSearchOpen(false);
      setGeoStatusMsg(`GPS Lock Acquired: ${loc.name} (±${loc.accuracy || 15}m)`);
      setTimeout(() => setGeoStatusMsg(null), 6000);
    } catch (err: any) {
      const errorText = err.message || 'Location permission denied or unavailable.';
      setGeoStatusMsg(`GPS Notice: ${errorText} You can search any city instead.`);
      setTimeout(() => setGeoStatusMsg(null), 5000);
    } finally {
      setIsLocating(false);
    }
  };

  // Handler: Select a searched place
  const handleSelectPlace = (place: SearchPlaceResult) => {
    const newLoc: GeoLocation = {
      lat: place.lat,
      lng: place.lng,
      name: place.name,
      source: 'search',
    };
    setCurrentLocation(newLoc);
    saveRecentSearch(place);
    setRecentSearches(getRecentSearches());

    const newEvents = generateLocalizedEvents(place.lat, place.lng, place.name);
    setActiveEvents(newEvents);
    setSelectedEventId(newEvents[0]?.id || '');
    setSearchQuery(place.name);
    setIsSearchOpen(false);
    setGeoStatusMsg(`Map centered on ${place.name} • Scanning 5–10 km radius`);
    setTimeout(() => setGeoStatusMsg(null), 4000);
  };

  // Zoom handlers
  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleResetCenter = () =>
    mapInstanceRef.current?.setView(
      [currentLocation.lat, currentLocation.lng],
      radiusKm === 5 ? 13 : 12
    );

  return (
    <div
      id={id}
      className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col transition-all duration-200"
    >
      {/* Top Header Bar */}
      <div className="p-5 border-b border-slate-100 flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#0A6847] flex items-center justify-center border border-emerald-200/80">
                <Radio className="w-4 h-4 animate-pulse" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Environmental Trigger Map
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                5–10 km Proximity Radar
              </span>
            </div>
            <p className="text-xs text-slate-500 font-normal mt-1">
              Real-time geospatial detection of airborne particulates and airway triggers around any city or neighborhood worldwide.
            </p>
          </div>

          {/* Location Actions: Worldwide Search Bar + Detect Near Me */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full lg:w-auto">
            {/* Live GPS Locate Button */}
            <button
              type="button"
              onClick={handleDetectNearMe}
              disabled={isLocating}
              className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs border ${
                currentLocation.source === 'gps'
                  ? 'bg-emerald-700 text-white border-emerald-800 hover:bg-emerald-800 ring-2 ring-emerald-500/30'
                  : 'bg-[#0A6847] text-white border-[#0A6847] hover:bg-[#085238]'
              } ${isLocating ? 'opacity-80 cursor-wait' : ''}`}
              title="Acquire live coordinates from your device GPS"
            >
              {isLocating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Locating...</span>
                </>
              ) : (
                <>
                  <LocateFixed className="w-3.5 h-3.5" />
                  <span>{currentLocation.source === 'gps' ? 'Live GPS' : 'Near Me'}</span>
                </>
              )}
            </button>

            {/* Worldwide Universal Search Bar */}
            <div ref={searchContainerRef} className="relative flex-1 sm:w-80 md:w-96">
              <div className="relative flex items-center">
                <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center">
                  {isSearching ? (
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  placeholder="Search any city, neighborhood, or place..."
                  onFocus={() => setIsSearchOpen(true)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (searchResults.length > 0) {
                        handleSelectPlace(searchResults[0]);
                      } else if (searchQuery.trim().length >= 2) {
                        searchPlacesOnline(searchQuery).then((res) => {
                          if (res.length > 0) handleSelectPlace(res[0]);
                        });
                      }
                    }
                  }}
                  className="w-full bg-slate-50 hover:bg-slate-100/90 focus:bg-white border border-slate-200 focus:border-[#0A6847] rounded-xl pl-9 pr-8 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 shadow-2xs transition-all focus:outline-hidden focus:ring-2 focus:ring-[#0A6847]/20"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    className="absolute right-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Autocomplete Suggestions Dropdown */}
              {isSearchOpen && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100 animate-in fade-in slide-in-from-top-1 duration-150 max-h-80 overflow-y-auto">
                  {/* Pin Option: Use GPS Location */}
                  <div className="p-1.5 bg-slate-50/70 border-b border-slate-100">
                    <button
                      type="button"
                      onClick={handleDetectNearMe}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-left rounded-xl hover:bg-emerald-50 text-emerald-900 transition-colors cursor-pointer text-xs font-bold"
                    >
                      <div className="w-6 h-6 rounded-lg bg-emerald-100 text-[#0A6847] flex items-center justify-center shrink-0">
                        <LocateFixed className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1">
                        <span>Use My Live Location (GPS)</span>
                        <p className="text-[10px] text-emerald-700 font-normal">
                          Acquire coordinates from browser GPS
                        </p>
                      </div>
                    </button>
                  </div>

                  {/* Active Online Search Results */}
                  {searchQuery.trim().length >= 2 ? (
                    <div className="p-1.5">
                      <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Search Results
                      </div>
                      {searchResults.length > 0 ? (
                        searchResults.map((place) => (
                          <button
                            key={place.id}
                            type="button"
                            onClick={() => handleSelectPlace(place)}
                            className="w-full flex items-start gap-2.5 px-3 py-2 text-left rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                          >
                            <MapPin className="w-4 h-4 text-slate-400 group-hover:text-[#0A6847] shrink-0 mt-0.5 transition-colors" />
                            <div className="flex-1 min-w-0">
                              <span className="text-xs font-bold text-slate-900 block truncate">
                                {place.name}
                              </span>
                              <span className="text-[11px] text-slate-500 block truncate">
                                {place.displayName}
                              </span>
                            </div>
                          </button>
                        ))
                      ) : isSearching ? (
                        <div className="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-[#0A6847]" />
                          <span>Searching global directory...</span>
                        </div>
                      ) : (
                        <div className="p-4 text-center text-xs text-slate-400">
                          No places found for "{searchQuery}". Try a city or district name.
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      {/* Recent Searches */}
                      {recentSearches.length > 0 && (
                        <div className="p-1.5">
                          <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <History className="w-3 h-3" /> Recent Searches
                          </div>
                          {recentSearches.slice(0, 4).map((place) => (
                            <button
                              key={`rec-${place.id}`}
                              type="button"
                              onClick={() => handleSelectPlace(place)}
                              className="w-full flex items-start gap-2.5 px-3 py-1.5 text-left rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                            >
                              <History className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700 shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <span className="text-xs font-bold text-slate-800 block truncate">
                                  {place.name}
                                </span>
                                <span className="text-[10px] text-slate-400 block truncate">
                                  {place.displayName}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Popular Global Hubs (Quick Select) */}
                      <div className="p-2 bg-slate-50/50">
                        <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Globe className="w-3 h-3 text-[#0A6847]" /> Popular Metropolitan Hubs
                        </div>
                        <div className="grid grid-cols-2 gap-1 pt-1">
                          {POPULAR_GLOBAL_HUBS.slice(0, 8).map((hub) => (
                            <button
                              key={hub.id}
                              type="button"
                              onClick={() => handleSelectPlace(hub)}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-left hover:bg-white hover:shadow-2xs text-xs font-semibold text-slate-700 hover:text-emerald-900 border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                            >
                              <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{hub.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* GPS / Location Notification Toast Banner (if any) */}
        {geoStatusMsg && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2 text-xs text-emerald-900 flex items-center justify-between gap-2 animate-fadeIn">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{geoStatusMsg}</span>
            </div>
            <button
              onClick={() => setGeoStatusMsg(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold text-xs cursor-pointer"
            >
              ×
            </button>
          </div>
        )}

        {/* Filters & Radius Controls Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1 border-t border-slate-100">
          {/* Radius Selector Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Radio className="w-3 h-3 text-[#0A6847]" />
              Scan Radius:
            </span>
            <div className="inline-flex p-0.5 rounded-xl bg-slate-100 border border-slate-200/80">
              <button
                type="button"
                onClick={() => {
                  setRadiusKm(5);
                  setZoomRadiusKm(7.5);
                }}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  radiusKm === 5
                    ? 'bg-white text-emerald-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                5 km <span className="text-[10px] font-normal opacity-75">({countWithin5km} zones)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setRadiusKm(10);
                  setZoomRadiusKm(13);
                }}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  radiusKm === 10
                    ? 'bg-white text-emerald-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                10 km <span className="text-[10px] font-normal opacity-75">({countWithin10km} zones)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setRadiusKm(15);
                  setZoomRadiusKm(16);
                }}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  radiusKm === 15
                    ? 'bg-white text-emerald-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All (15 km)
              </button>
            </div>

            {/* Toggle to strictly show only pins within radius */}
            <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer select-none ml-2">
              <input
                type="checkbox"
                checked={strictRadiusOnly}
                onChange={(e) => setStrictRadiusOnly(e.target.checked)}
                className="rounded border-slate-300 text-[#0A6847] focus:ring-[#0A6847]"
              />
              <span>Filter pins outside {radiusKm} km</span>
            </label>
          </div>

          {/* Risk Level Filters */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
              Risk:
            </span>
            {(['all', 'low', 'moderate', 'high'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRiskFilter(r)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg capitalize transition-colors cursor-pointer border ${
                  riskFilter === r
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {r === 'all' ? 'All Pins' : r}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setRiskFilter('inhaler')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer border flex items-center gap-1 ${
                riskFilter === 'inhaler'
                  ? 'bg-emerald-800 text-white border-emerald-900'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <Wind className="w-3 h-3" />
              <span>Inhaler Dose</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Map Canvas and Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 min-h-[500px]">
        {/* Geospatial Radar Map Canvas Container (Real Leaflet Interactive Map) */}
        <div className="lg:col-span-2 relative overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-200 min-h-[500px]">
          {/* Leaflet Tile Map DOM Node */}
          <div ref={mapContainerRef} className="w-full h-full min-h-[500px] z-0" />

          {/* Map Controls Floating Overlay */}
          <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-20">
            <button
              type="button"
              onClick={handleZoomIn}
              className="w-8 h-8 rounded-lg bg-white/95 backdrop-blur-xs border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-white shadow-xs cursor-pointer transition-all hover:scale-105 active:scale-95"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              className="w-8 h-8 rounded-lg bg-white/95 backdrop-blur-xs border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-white shadow-xs cursor-pointer transition-all hover:scale-105 active:scale-95"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleResetCenter}
              className="w-8 h-8 rounded-lg bg-white/95 backdrop-blur-xs border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-white shadow-xs cursor-pointer transition-all hover:scale-105 active:scale-95"
              title="Recenter on Location"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() =>
                setMapStyle((prev) => (prev === 'light' ? 'dark' : prev === 'dark' ? 'terrain' : 'light'))
              }
              className="w-8 h-8 rounded-lg bg-white/95 backdrop-blur-xs border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-white shadow-xs cursor-pointer transition-all hover:scale-105 active:scale-95"
              title={`Switch Map Theme (Current: ${mapStyle})`}
            >
              <Layers className="w-4 h-4" />
            </button>
          </div>

          {/* Location & Radius Lock Pill in Bottom-Left */}
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-2 shadow-xs z-10 max-w-[80%] sm:max-w-none">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-slate-900 font-bold truncate">{currentLocation.name}</span>
            <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
              ({currentLocation.lat.toFixed(4)}°, {currentLocation.lng.toFixed(4)}°)
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold shrink-0">
              {radiusKm} km Radius
            </span>
          </div>
        </div>

        {/* Sidebar — Inhaler GPS Panel OR My Location Panel OR Selected Event Panel */}
        <div className="p-5 flex flex-col justify-between bg-white overflow-y-auto">

          {/* ── SMART INHALER GPS LIVE PANEL ── */}
          {showInhalerGpsPanel ? (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowInhalerGpsPanel(false)}
                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                    title="Back"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />
                  </button>
                  <div>
                    <span className="text-[11px] font-bold text-sky-600 uppercase tracking-wider block">
                      Smart Inhaler GPS Module
                    </span>
                    <span className="text-xs font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                      <Radio className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
                      Live Device Beacon
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800 border border-sky-300 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" /> GPS Locked
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-100/60 border border-sky-200 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center text-2xl shadow-md shrink-0">
                    💊
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 leading-tight">
                      AirGuard Smart Inhaler
                    </h3>
                    <p className="text-xs text-sky-800 font-bold mt-0.5">
                      📍 {currentLocation.name}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                      Coordinates: {currentLocation.lat.toFixed(4)}°, {currentLocation.lng.toFixed(4)}°
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="bg-white/80 p-2.5 rounded-xl border border-sky-100">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Proximity to You</span>
                    <span className="text-sm font-extrabold text-slate-900">0 m <span className="text-[10px] font-normal text-emerald-600">(At your side)</span></span>
                  </div>
                  <div className="bg-white/80 p-2.5 rounded-xl border border-sky-100">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Inhaler Battery</span>
                    <span className="text-sm font-extrabold text-emerald-700">92% <span className="text-[10px] font-normal text-slate-500">(Optimal)</span></span>
                  </div>
                  <div className="bg-white/80 p-2.5 rounded-xl border border-sky-100">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Hardware Sleeve</span>
                    <span className="text-xs font-bold text-slate-800">ESP32-AG-84F2</span>
                  </div>
                  <div className="bg-white/80 p-2.5 rounded-xl border border-sky-100">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">GPS Refresh Rate</span>
                    <span className="text-xs font-bold text-slate-800">1 Hz Continuous</span>
                  </div>
                </div>
              </div>

              {/* Acoustic Buzzer Finder Button */}
              <button
                type="button"
                onClick={() => {
                  setGeoStatusMsg('🔊 Smart Inhaler acoustic finder buzzer triggered! Playing location alert tone...');
                  setTimeout(() => setGeoStatusMsg(null), 4000);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Radio className="w-4 h-4 animate-bounce" />
                <span>Ping Inhaler Audio Chime / Finder</span>
              </button>
            </div>
          ) : showMyLocationPanel ? (
            <div className="space-y-4">
              {/* Back button + header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowMyLocationPanel(false)}
                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                    title="Back to event list"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />
                  </button>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      My Current Location
                    </span>
                    <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1 mt-0.5">
                      <LocateFixed className="w-3.5 h-3.5 text-emerald-600" />
                      Live Air Quality Assessment
                    </span>
                  </div>
                </div>
                {isLoadingMyTelemetry ? (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 flex items-center gap-1.5">
                    <Loader2 className="w-3 h-3 animate-spin" /> Loading...
                  </span>
                ) : myLocationTelemetry ? (
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                    myLocationTelemetry.riskLevel === 'high'
                      ? 'bg-red-100 text-red-800 border-red-300'
                      : myLocationTelemetry.riskLevel === 'moderate'
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  }`}>
                    {myLocationTelemetry.riskLevel === 'low' ? '✅ Good'
                     : myLocationTelemetry.riskLevel === 'moderate' ? '⚠️ Moderate Risk'
                     : '🔴 High Risk'}
                  </span>
                ) : null}
              </div>

              {/* Location name */}
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-snug flex items-center gap-1.5">
                  <span>📍</span> {currentLocation.name}
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  {currentLocation.lat.toFixed(5)}°, {currentLocation.lng.toFixed(5)}°
                </p>
                <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Updated: {myLocationTelemetry?.timestamp || 'Fetching...'}</span>
                </div>
              </div>

              {/* Big risk status hero card */}
              {myLocationTelemetry ? (
                <>
                  <div className={`rounded-2xl p-4 border-2 relative overflow-hidden ${
                    myLocationTelemetry.riskLevel === 'high'
                      ? 'bg-gradient-to-br from-red-50 to-red-100/60 border-red-300'
                      : myLocationTelemetry.riskLevel === 'moderate'
                      ? 'bg-gradient-to-br from-amber-50 to-orange-100/60 border-amber-300'
                      : 'bg-gradient-to-br from-emerald-50 to-teal-100/60 border-emerald-300'
                  }`}>
                    {/* decorative bg circle */}
                    <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-20 ${
                      myLocationTelemetry.riskLevel === 'high' ? 'bg-red-500'
                      : myLocationTelemetry.riskLevel === 'moderate' ? 'bg-amber-500'
                      : 'bg-emerald-500'
                    }`} />
                    <div className="flex items-start gap-3 relative z-10">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white text-xl shadow-md shrink-0 ${
                        myLocationTelemetry.riskLevel === 'high' ? 'bg-red-500'
                        : myLocationTelemetry.riskLevel === 'moderate' ? 'bg-amber-500'
                        : 'bg-emerald-600'
                      }`}>
                        {myLocationTelemetry.riskLevel === 'low' ? '🌿'
                         : myLocationTelemetry.riskLevel === 'moderate' ? '⚡'
                         : '⚠️'}
                      </div>
                      <div className="flex-1">
                        <p className={`text-[11px] font-bold uppercase tracking-widest ${
                          myLocationTelemetry.riskLevel === 'high' ? 'text-red-600'
                          : myLocationTelemetry.riskLevel === 'moderate' ? 'text-amber-700'
                          : 'text-emerald-700'
                        }`}>Air Quality Status</p>
                        <p className={`text-2xl font-black leading-tight ${
                          myLocationTelemetry.riskLevel === 'high' ? 'text-red-800'
                          : myLocationTelemetry.riskLevel === 'moderate' ? 'text-amber-900'
                          : 'text-emerald-900'
                        }`}>
                          {myLocationTelemetry.riskLevel === 'low' ? 'Good'
                           : myLocationTelemetry.riskLevel === 'moderate' ? 'Moderate'
                           : 'Unhealthy'}
                        </p>
                        <p className={`text-xs mt-0.5 font-medium ${
                          myLocationTelemetry.riskLevel === 'high' ? 'text-red-700'
                          : myLocationTelemetry.riskLevel === 'moderate' ? 'text-amber-800'
                          : 'text-emerald-700'
                        }`}>
                          {myLocationTelemetry.riskLevel === 'low'
                            ? 'Air quality is satisfactory. Safe for outdoor activities.'
                            : myLocationTelemetry.riskLevel === 'moderate'
                            ? 'Acceptable air quality. Sensitive groups should take caution.'
                            : 'Elevated pollutants detected. Limit prolonged outdoor exposure.'}
                        </p>
                      </div>
                    </div>

                    {/* AQI Bar */}
                    <div className="mt-3 relative z-10">
                      <div className="flex justify-between text-[10px] font-bold mb-1">
                        <span className={myLocationTelemetry.riskLevel === 'high' ? 'text-red-700' : myLocationTelemetry.riskLevel === 'moderate' ? 'text-amber-700' : 'text-emerald-700'}>US AQI</span>
                        <span className="text-slate-600">{myLocationTelemetry.usAqi} / 300</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-black/10 overflow-hidden">
                        <div
                          style={{ width: `${Math.min(100, (myLocationTelemetry.usAqi / 300) * 100)}%` }}
                          className={`h-full rounded-full transition-all duration-700 ${
                            myLocationTelemetry.riskLevel === 'high' ? 'bg-red-500'
                            : myLocationTelemetry.riskLevel === 'moderate' ? 'bg-amber-500'
                            : 'bg-emerald-500'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Telemetry Metrics Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">PM2.5</span>
                      <span className="text-base font-extrabold text-slate-900">{myLocationTelemetry.pm25} <span className="text-[10px] font-medium text-slate-400">µg/m³</span></span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">PM10</span>
                      <span className="text-base font-extrabold text-slate-900">{myLocationTelemetry.pm10} <span className="text-[10px] font-medium text-slate-400">µg/m³</span></span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">Temperature</span>
                      <span className="text-base font-extrabold text-slate-900">{myLocationTelemetry.temperature}°C</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">Humidity</span>
                      <span className="text-base font-extrabold text-slate-900">{myLocationTelemetry.humidity}%</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">Wind</span>
                      <span className="text-base font-extrabold text-slate-900">{myLocationTelemetry.windSpeed} <span className="text-[10px] font-medium text-slate-400">km/h</span></span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">VOC (Est.)</span>
                      <span className="text-base font-extrabold text-slate-900">{myLocationTelemetry.voc} <span className="text-[10px] font-medium text-slate-400">ppb</span></span>
                    </div>
                  </div>

                  {/* Extra pollutants */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Trace Pollutants</p>
                    <div className="grid grid-cols-3 gap-x-4 gap-y-1">
                      {[
                        { label: 'NO₂', val: myLocationTelemetry.no2, unit: 'µg/m³' },
                        { label: 'SO₂', val: myLocationTelemetry.so2, unit: 'µg/m³' },
                        { label: 'O₃', val: myLocationTelemetry.ozone, unit: 'µg/m³' },
                        { label: 'CO', val: myLocationTelemetry.co, unit: 'µg/m³' },
                        { label: 'Dust', val: myLocationTelemetry.dust, unit: 'µg/m³' },
                        { label: 'Pressure', val: myLocationTelemetry.pressure, unit: 'hPa' },
                      ].map((item) => (
                        <div key={item.label} className="text-center">
                          <p className="text-[9px] text-slate-400 font-bold uppercase">{item.label}</p>
                          <p className="text-xs font-extrabold text-slate-800">{item.val}</p>
                          <p className="text-[9px] text-slate-400">{item.unit}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-8 flex flex-col items-center gap-3 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                  <p className="text-xs font-medium">Fetching live air quality data...</p>
                </div>
              )}
            </div>
          ) : (
            /* ── SELECTED EVENT PANEL (default view) ── */
            <>
              {selectedEvent ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Location Observation
                      </span>
                      <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        {selectedEvent.distanceKm !== undefined
                          ? `${formatDistance(selectedEvent.distanceKm)} from anchor point`
                          : 'Near you'}
                      </span>
                    </div>
                    <Badge riskLevel={selectedEvent.riskLevel} size="sm">
                      {selectedEvent.riskLevel === 'low'
                        ? 'Low Risk'
                        : selectedEvent.riskLevel === 'moderate'
                        ? 'Moderate Risk'
                        : 'High Risk'}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {selectedEvent.location.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {selectedEvent.location.area}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {selectedEvent.date} at {selectedEvent.timestamp}
                      </span>
                    </div>
                  </div>

                  {/* Environmental Telemetry Metrics at This Spot */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">
                        PM2.5 Density
                      </span>
                      <span className="text-base font-extrabold text-slate-900 font-['Space_Grotesk']">
                        {selectedEvent.pm25} µg/m³
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">
                        VOC Reading
                      </span>
                      <span className="text-base font-extrabold text-slate-900 font-['Space_Grotesk']">
                        {selectedEvent.voc} ppb
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">
                        Temperature
                      </span>
                      <span className="text-base font-extrabold text-slate-900 font-['Space_Grotesk']">
                        {selectedEvent.temperature}°C
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">
                        Humidity
                      </span>
                      <span className="text-base font-extrabold text-slate-900 font-['Space_Grotesk']">
                        {selectedEvent.humidity}%
                      </span>
                    </div>
                  </div>

                  {/* Proximity Risk Advisory */}
                  <div
                    className={`p-3 rounded-xl border text-xs leading-relaxed ${
                      selectedEvent.riskLevel === 'high'
                        ? 'bg-red-50/70 border-red-200 text-red-950'
                        : selectedEvent.riskLevel === 'moderate'
                        ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                        : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        {selectedEvent.distanceKm && selectedEvent.distanceKm <= 5
                          ? 'Within Immediate 5 km Perimeter'
                          : 'Within Extended 10 km Vicinity'}
                      </span>
                    </div>
                    <p>{selectedEvent.notes}</p>
                    {selectedEvent.recommendationPrompt && (
                      <p className="mt-1.5 pt-1.5 border-t border-slate-200/60 font-medium text-[11px]">
                        Guidance: {selectedEvent.recommendationPrompt}
                      </p>
                    )}
                  </div>

                  {/* Inhalation Actuation Notice */}
                  {selectedEvent.inhalationDetected && (
                    <div className="p-2.5 rounded-xl bg-emerald-100/70 border border-emerald-200 text-xs font-medium text-emerald-900 flex items-center gap-2">
                      <Wind className="w-4 h-4 text-[#0A6847] shrink-0" />
                      <span>
                        Smart inhaler actuation logged at this spot (
                        {selectedEvent.inhalationDoseCount || 1} dose)
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                /* Prompt user to click their location pin */
                <div className="py-10 flex flex-col items-center gap-3 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-2xl border border-emerald-200">
                    📍
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">Check Your Location</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-[180px] leading-relaxed">
                      Click the <strong>📍 My Live Location</strong> pin on the map to see your real-time air quality status.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowMyLocationPanel(true)}
                    className="mt-1 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-2 shadow-sm"
                  >
                    <LocateFixed className="w-3.5 h-3.5" />
                    View My Air Quality
                  </button>
                </div>
              )}
            </>
          )}

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-start gap-1.5">
            <Info className="w-3.5 h-3.5 shrink-0 text-slate-400 mt-0.5" />
            <span>
              Proximity radar continuously updates localized particulate telemetry. Observations do not represent medical diagnosis.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
