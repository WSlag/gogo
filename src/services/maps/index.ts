/// <reference types="@types/google.maps" />
// Google Maps Service
// This service provides a centralized interface for all Google Maps functionality

export interface LatLng {
  lat: number;
  lng: number;
}

export interface PlaceResult {
  placeId: string;
  name: string;
  address: string;
  coordinates: LatLng;
}

export interface DirectionsResult {
  distance: number; // meters
  duration: number; // seconds
  polyline: string;
  steps: DirectionStep[];
}

export interface DirectionStep {
  instruction: string;
  distance: number;
  duration: number;
  startLocation: LatLng;
  endLocation: LatLng;
}

// Singleton for Google Maps services
class GoogleMapsService {
  private static instance: GoogleMapsService;
  private placesService: google.maps.places.PlacesService | null = null;
  private autocompleteService: google.maps.places.AutocompleteService | null = null;
  private directionsService: google.maps.DirectionsService | null = null;
  private geocoder: google.maps.Geocoder | null = null;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): GoogleMapsService {
    if (!GoogleMapsService.instance) {
      GoogleMapsService.instance = new GoogleMapsService();
    }
    return GoogleMapsService.instance;
  }

  // Initialize services - call this after Google Maps script loads
  initialize(mapElement?: HTMLElement): void {
    if (this.isInitialized) return;

    if (!window.google?.maps) {
      console.warn('Google Maps not loaded yet');
      return;
    }

    try {
      // Create a hidden map for PlacesService
      const mapDiv = mapElement || document.createElement('div');
      const map = new google.maps.Map(mapDiv, {
        center: { lat: 7.2047, lng: 124.2530 }, // Cotabato City default
        zoom: 15,
      });

      this.placesService = new google.maps.places.PlacesService(map);
      this.autocompleteService = new google.maps.places.AutocompleteService();
      this.directionsService = new google.maps.DirectionsService();
      this.geocoder = new google.maps.Geocoder();
      this.isInitialized = true;

      console.log('Google Maps services initialized');
    } catch (error) {
      console.error('Failed to initialize Google Maps services:', error);
    }
  }

  // Check if services are ready
  isReady(): boolean {
    return this.isInitialized;
  }

  // Search for places with autocomplete
  async searchPlaces(query: string): Promise<PlaceResult[]> {
    if (!this.autocompleteService) {
      return this.fallbackPlaceSearch(query);
    }

    return new Promise((resolve) => {
      this.autocompleteService!.getPlacePredictions(
        {
          input: query,
          componentRestrictions: { country: 'ph' },
          types: ['geocode', 'establishment'],
        },
        (predictions: google.maps.places.AutocompletePrediction[] | null, status: google.maps.places.PlacesServiceStatus) => {
          if (status !== google.maps.places.PlacesServiceStatus.OK || !predictions) {
            resolve([]);
            return;
          }

          resolve(
            predictions.map((p) => ({
              placeId: p.place_id,
              name: p.structured_formatting.main_text,
              address: p.description,
              coordinates: { lat: 0, lng: 0 }, // Will be populated on selection
            }))
          );
        }
      );
    });
  }

  // Fallback place search using mock data
  private fallbackPlaceSearch(query: string): PlaceResult[] {
    const mockPlaces: PlaceResult[] = [
      { placeId: 'p1', name: 'SM City Cotabato', address: 'SM City, Cotabato City', coordinates: { lat: 7.2097, lng: 124.2580 } },
      { placeId: 'p2', name: 'Cotabato City Hall', address: 'City Hall, Cotabato City', coordinates: { lat: 7.2047, lng: 124.2530 } },
      { placeId: 'p3', name: 'Notre Dame Hospital', address: 'Notre Dame Ave, Cotabato City', coordinates: { lat: 7.2080, lng: 124.2520 } },
    ];

    return mockPlaces.filter((p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.address.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Get place details including coordinates
  async getPlaceDetails(placeId: string): Promise<PlaceResult | null> {
    if (!this.placesService) {
      // Return mock data
      return {
        placeId,
        name: 'Selected Location',
        address: 'Cotabato City, Philippines',
        coordinates: { lat: 7.2047, lng: 124.2530 },
      };
    }

    return new Promise((resolve) => {
      this.placesService!.getDetails(
        {
          placeId,
          fields: ['formatted_address', 'geometry', 'name'],
        },
        (place: google.maps.places.PlaceResult | null, status: google.maps.places.PlacesServiceStatus) => {
          if (status !== google.maps.places.PlacesServiceStatus.OK || !place?.geometry?.location) {
            resolve(null);
            return;
          }

          resolve({
            placeId,
            name: place.name || '',
            address: place.formatted_address || '',
            coordinates: {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            },
          });
        }
      );
    });
  }

  // Reverse geocode coordinates to address
  async reverseGeocode(lat: number, lng: number): Promise<string> {
    if (!this.geocoder) {
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }

    return new Promise((resolve) => {
      this.geocoder!.geocode(
        { location: { lat, lng } },
        (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
          if (status === google.maps.GeocoderStatus.OK && results?.[0]) {
            resolve(results[0].formatted_address);
          } else {
            resolve(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
          }
        }
      );
    });
  }

  // Get directions between two points
  async getDirections(
    origin: LatLng,
    destination: LatLng,
    mode: google.maps.TravelMode = google.maps.TravelMode.DRIVING
  ): Promise<DirectionsResult | null> {
    if (!this.directionsService) {
      return this.calculateFallbackDirections(origin, destination);
    }

    return new Promise((resolve) => {
      this.directionsService!.route(
        {
          origin,
          destination,
          travelMode: mode,
        },
        (result: google.maps.DirectionsResult | null, status: google.maps.DirectionsStatus) => {
          if (status !== google.maps.DirectionsStatus.OK || !result?.routes?.[0]?.legs?.[0]) {
            resolve(this.calculateFallbackDirections(origin, destination));
            return;
          }

          const leg = result.routes[0].legs[0];
          const route = result.routes[0];

          resolve({
            distance: leg.distance?.value || 0,
            duration: leg.duration?.value || 0,
            polyline: route.overview_polyline || '',
            steps:
              leg.steps?.map((step) => ({
                instruction: step.instructions || '',
                distance: step.distance?.value || 0,
                duration: step.duration?.value || 0,
                startLocation: {
                  lat: step.start_location.lat(),
                  lng: step.start_location.lng(),
                },
                endLocation: {
                  lat: step.end_location.lat(),
                  lng: step.end_location.lng(),
                },
              })) || [],
          });
        }
      );
    });
  }

  // Fallback directions calculation using Haversine formula
  private calculateFallbackDirections(
    origin: LatLng,
    destination: LatLng
  ): DirectionsResult {
    const distance = this.calculateDistance(origin, destination);
    const averageSpeed = 30; // km/h
    const duration = (distance / 1000 / averageSpeed) * 3600; // seconds

    return {
      distance: Math.round(distance),
      duration: Math.round(duration),
      polyline: '',
      steps: [],
    };
  }

  // Calculate straight-line distance between two points (Haversine formula)
  calculateDistance(point1: LatLng, point2: LatLng): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (point1.lat * Math.PI) / 180;
    const φ2 = (point2.lat * Math.PI) / 180;
    const Δφ = ((point2.lat - point1.lat) * Math.PI) / 180;
    const Δλ = ((point2.lng - point1.lng) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  // Get current location
  async getCurrentLocation(): Promise<LatLng | null> {
    if (!navigator.geolocation) {
      console.warn('Geolocation not supported');
      return null;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.warn('Geolocation error:', error.message);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        }
      );
    });
  }
}

// Export singleton instance
export const mapsService = GoogleMapsService.getInstance();

// Export helper to load Google Maps script
export function loadGoogleMapsScript(apiKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.maps) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      mapsService.initialize();
      resolve();
    };

    script.onerror = () => {
      reject(new Error('Failed to load Google Maps script'));
    };

    document.head.appendChild(script);
  });
}
