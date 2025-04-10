import { useState, useEffect } from "react";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { useNavigate } from "react-router-dom";
import Input from "../../components/input/Input";
import InputDD from "../../components/input/InputDD";
import Modal from "../../components/modal/Modal";
import Button from "../../components/button/Button";
import { getStoredData } from "../../data/getMasterData";
import "./Home.css";
import { v4 as uuidv4 } from "uuid";

function Home() {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState("No");
  const [storeName, setStoreName] = useState("");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState("5.551157");
  const [longitude, setLongitude] = useState("-73.3572938");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [products, setProducts] = useState([]);
  const [loadProductsModalOpen, setLoadProductsModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [apiKeyAvailable, setApiKeyAvailable] = useState(false);
  const [existingWarehouses, setExistingWarehouses] = useState([]);
  const [mapCenter, setMapCenter] = useState({
    lat: 5.551157,
    lng: -73.3572938,
  });
  const [markerPosition, setMarkerPosition] = useState({
    lat: 5.551157,
    lng: -73.3572938,
  });

  // Al iniciar, verificamos si la API key está disponible y cargamos los almacenes existentes
  useEffect(() => {
    if (process.env.REACT_APP_GOOGLE_MAPS_API_KEY) {
      setApiKeyAvailable(true);
    } else {
      console.error("Google Maps API key not found in environment variables");
    }

    // Cargar almacenes existentes
    const fetchExistingWarehouses = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("No hay token de autenticación");

        const response = await fetch(`${process.env.REACT_APP_API_URL}/almacenes`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Error al obtener almacenes: ${response.status}`);
        }

        const data = await response.json();
        setExistingWarehouses(Array.isArray(data) ? data : [data]);
      } catch (err) {
        console.error("Error fetching warehouses:", err);
      }
    };

    fetchExistingWarehouses();

    // Cargar los datos del JSON solo si existen
    const storeData = getStoredData();
    if (storeData && typeof storeData === "object" && storeData.coordinates) {
      if (!storeData.id) {
        storeData.id = uuidv4();
      }
      setStoreName(storeData.name || "");
      setLocation(storeData.location || "");
      setProducts(storeData.products || []);
      setSelectedOption("Sí");
    }
  }, []);

  // Función para cargar productos desde el JSON
  const loadProducts = async () => {
    const jsonProducts = [
      {
        id: 1,
        name: "Producto X",
        category: "Electrónicos",
        price: 299.99,
        stock: 100,
      },
      {
        id: 2,
        name: "Producto Y",
        category: "Hogar",
        price: 49.99,
        stock: 50,
      },
    ];

    setProducts(jsonProducts);
    console.log("Productos cargados desde JSON:", jsonProducts);
    return Promise.resolve();
  };

  // Función para no cargar productos (vaciar el array)
  const doNotLoadProducts = async () => {
    setProducts([]);
    console.log("No se cargarán productos");
    return Promise.resolve();
  };

  // Función para manejar el arrastre del marcador
  const handleMarkerDrag = (e) => {
    const newLat = e.latLng.lat();
    const newLng = e.latLng.lng();

    setLatitude(newLat.toFixed(6));
    setLongitude(newLng.toFixed(6));
    setMarkerPosition({ lat: newLat, lng: newLng });
  };

  // Función para manejar el movimiento del mapa
  const handleMapDrag = (map) => {
    const center = map.getCenter();
    setMapCenter({
      lat: center.lat(),
      lng: center.lng(),
    });
  };

  // Función para manejar el clic en el mapa
  const handleMapClick = (e) => {
    const newLat = e.detail.latLng.lat;
    const newLng = e.detail.latLng.lng;

    setLatitude(newLat.toFixed(6));
    setLongitude(newLng.toFixed(6));
    setMarkerPosition({ lat: newLat, lng: newLng });
  };

  // Función para navegar a un almacén existente
  const handleWarehouseClick = (warehouseId) => {
    navigate(`/warehouse/${warehouseId}`);
  };

  // Modificar handleSubmit para incluir la descripción
  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      // Validar campos requeridos
      if (!storeName || !location) {
        throw new Error("El nombre y la ubicación son campos obligatorios");
      }

      const storeData = {
        name: storeName,
        location: location,
        coordinates: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
        },
        products: selectedOption === "Sí" ? products : [],
      };

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/almacenes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(storeData),
        }
      );

      if (!response.ok) {
        throw new Error(`Error al crear Almacén: ${response.statusText}`);
      }

      const data = await response.json();
      setSuccessModalOpen(true);
      console.log("Almacén creado:", data);

      // Actualizar la lista de almacenes existentes
      setExistingWarehouses(prev => [...prev, data]);
    } catch (err) {
      setError("No se pudo crear el Almacén. Intenta nuevamente.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    width: "100%",
    height: "100%",
    border: "1px solid #ccc",
    borderRadius: "8px",
    overflow: "hidden",
    backgroundColor: "#f5f5f5",
  };

  return (
    <div className="home-container">
      <h2>Crear Nuevo Almacén</h2>

      <div className="create-store-layout">
        {/* Formulario de creación de Almacén */}
        <div className="form-section">
          <div className="form-content">
            <h3>Información del Almacén</h3>

            <label htmlFor="storeName">Nombre del Almacén:</label>
            <Input
              id="storeName"
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="Ingrese el nombre del almacén"
            />

            <label htmlFor="location">Ubicación:</label>
            <Input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ejemplo: Calle 123, Ciudad"
            />

            <label htmlFor="latitude">Latitud:</label>
            <Input
              id="latitude"
              type="text"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="Ingrese la latitud"
            />

            <label htmlFor="longitude">Longitud:</label>
            <Input
              id="longitude"
              type="text"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="Ingrese la longitud"
            />

            <label htmlFor="dropdown">¿Cargar productos precargados?</label>
            <InputDD
              options={["Sí", "No"]}
              value={selectedOption}
              onChange={(value) => setSelectedOption(value)}
            />

            <div className="products-info">
              <h4>Productos precargados: {products.length}</h4>
            </div>

            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Cargando..." : "Crear Almacén"}
            </Button>

            {error && <p className="error">{error}</p>}
          </div>
        </div>

        {/* Mapa */}
        <div className="map-section">
          <h3>Ubicación en el Mapa</h3>
          <p className="map-instructions">
            Arrastra el marcador para seleccionar la ubicación exacta
          </p>
          <div className="map-container">
            {apiKeyAvailable ? (
              <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
                <div style={containerStyle}>
                  <Map
                    defaultCenter={mapCenter}
                    defaultZoom={15}
                    gestureHandling="greedy"
                    mapId={process.env.REACT_APP_GOOGLE_MAPS_ID || "default-map-id"}
                    onDragEnd={(map) => handleMapDrag(map)}
                    onClick={handleMapClick}
                  >
                    {/* Mostrar los almacenes existentes */}
                    {existingWarehouses.map((warehouse) => (
                      <AdvancedMarker
                        key={warehouse.id}
                        position={{
                          lat: warehouse.coordinates.latitude,
                          lng: warehouse.coordinates.longitude
                        }}
                        onClick={() => handleWarehouseClick(warehouse.id)}
                        title={warehouse.name}
                      >
                        <div className="property existing">
                          <div className="icon">
                            <i className="fas fa-warehouse"></i>
                          </div>
                        </div>
                      </AdvancedMarker>
                    ))}

                    {/* Marcador del nuevo almacén */}
                    <AdvancedMarker
                      position={markerPosition}
                      draggable={true}
                      onDragEnd={handleMarkerDrag}
                      title="Ubicación del nuevo almacén"
                    >
                      <div className="property new">
                        <div className="icon">
                          <i className="fas fa-plus"></i>
                        </div>
                      </div>
                    </AdvancedMarker>
                  </Map>
                </div>
              </APIProvider>
            ) : (
              <div style={containerStyle}>
                <p>
                  No se puede cargar el mapa: Falta la clave API de Google Maps
                </p>
                <p>
                  Configura REACT_APP_GOOGLE_MAPS_API_KEY en el archivo .env
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal para preguntar si cargar productos precargados */}
      <Modal
        title="Cargar Productos"
        content="¿Desea cargar los productos precargados guardados en el sistema?"
        buttonLabel="Sí, cargar productos"
        onConfirm={() => {
          loadProducts();
          setLoadProductsModalOpen(false);
        }}
        onClose={() => {
          doNotLoadProducts();
          setLoadProductsModalOpen(false);
        }}
        open={loadProductsModalOpen}
      />

      {/* Modal de éxito */}
      <Modal
        title="Almacén creado"
        content="¡el Almacén ha sido creado exitosamente!"
        buttonLabel="Aceptar"
        onConfirm={() => {
          setSuccessModalOpen(false);
          return Promise.resolve();
        }}
        open={successModalOpen}
      />
    </div>
  );
}

export default Home;
