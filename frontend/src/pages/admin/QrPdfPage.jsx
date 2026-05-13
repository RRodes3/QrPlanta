import { useEffect, useState } from 'react';
import {
  exportCarQrsPdfRequest,
  searchCarsForQrExportRequest,
} from '../../api/car.api';
import './QrPdfPage.css';

function QrPdfPage() {
  const [search, setSearch] = useState('');
  const [cars, setCars] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  const [loading, setLoading] = useState(false);
  const [downloadingMode, setDownloadingMode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const selectedCount = selectedIds.length;

  const allVisibleSelected =
    cars.length > 0 && cars.every((car) => selectedIds.includes(car.id));

  const getErrorMessage = async (error) => {
    const fallbackMessage = 'Ocurrió un error inesperado';

    if (!error.response?.data) {
      return error.message || fallbackMessage;
    }

    if (error.response.data instanceof Blob) {
      const text = await error.response.data.text();

      try {
        const parsedError = JSON.parse(text);
        return parsedError.message || fallbackMessage;
      } catch {
        return text || fallbackMessage;
      }
    }

    return error.response.data.message || fallbackMessage;
  };

  const loadCars = async (searchValue = '') => {
    try {
      setLoading(true);
      setError('');
      setMessage('');

      const data = await searchCarsForQrExportRequest(searchValue.trim());

      setCars(data);

      setSelectedIds((currentSelectedIds) =>
        currentSelectedIds.filter((id) => data.some((car) => car.id === id))
      );
    } catch (error) {
      console.error('Error al buscar vehículos:', error);
      const errorMessage = await getErrorMessage(error);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
        loadCars(search);
    }, 350);
    
    return () => clearTimeout(timeoutId);
  }, [search]);

  const handleToggleSelection = (carId) => {
    setSelectedIds((currentSelectedIds) => {
      if (currentSelectedIds.includes(carId)) {
        return currentSelectedIds.filter((id) => id !== carId);
      }

      return [...currentSelectedIds, carId];
    });
  };

  const handleToggleAllVisible = () => {
    if (allVisibleSelected) {
      setSelectedIds([]);
      return;
    }

    setSelectedIds(cars.map((car) => car.id));
  };

  const downloadPdfBlob = (blob, fileName) => {
    const pdfBlob = new Blob([blob], {
      type: 'application/pdf',
    });

    const url = window.URL.createObjectURL(pdfBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleExport = async (mode) => {
    try {
      setError('');
      setMessage('');

      if (mode === 'SELECTED' && selectedIds.length === 0) {
        setError('Selecciona al menos un vehículo para exportar.');
        return;
      }

      setDownloadingMode(mode);

      const pdfBlob = await exportCarQrsPdfRequest({
        mode,
        carIds: mode === 'SELECTED' ? selectedIds : [],
      });

      const fileName = `qr-vehiculos-${mode.toLowerCase()}.pdf`;

      downloadPdfBlob(pdfBlob, fileName);

      setMessage('PDF generado correctamente.');

      await loadCars(search);
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      const errorMessage = await getErrorMessage(error);
      setError(errorMessage);
    } finally {
      setDownloadingMode('');
    }
  };

  const highlightText = (text) => {
    const value = String(text || '');
    const searchValue = search.trim();

    if (!searchValue) {
      return value;
    }

    const lowerValue = value.toLowerCase();
    const lowerSearch = searchValue.toLowerCase();

    const matchIndex = lowerValue.indexOf(lowerSearch);

    if (matchIndex === -1) {
      return value;
    }

    const beforeMatch = value.slice(0, matchIndex);
    const match = value.slice(matchIndex, matchIndex + searchValue.length);
    const afterMatch = value.slice(matchIndex + searchValue.length);

    return (
        <>
            {beforeMatch}
            <mark className='qr-pdf-highlight'>{match}</mark>
            {afterMatch}
        </>
    );
  };

  return (
    <div className="qr-pdf-page">
      <section className="qr-pdf-card">
        <div className="qr-pdf-header">
          <div>
            <h1>Exportar PDF de QRs</h1>
            <p>
              Genera códigos QR para los vehículos registrados. Puedes exportar
              todos, solo los pendientes o seleccionar vehículos específicos.
            </p>
          </div>
        </div>

        <div className="qr-pdf-actions">
          <button
            type="button"
            className="qr-pdf-button qr-pdf-button-dark"
            onClick={() => handleExport('NOT_EXPORTED')}
            disabled={Boolean(downloadingMode)}
          >
            {downloadingMode === 'NOT_EXPORTED'
              ? 'Generando...'
              : 'Exportar solo no exportados'}
          </button>
        </div>

        <div className="qr-pdf-search">
          <div className="qr-pdf-field">
            <label htmlFor="search">Buscar vehículo</label>
            <input
              id="search"
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por NIV o código QR"
            />
          </div>
        </div>

        {message && <p className="qr-pdf-message">{message}</p>}
        {error && <p className="qr-pdf-error">{error}</p>}

        <div className="qr-pdf-selection-bar">
          <p>
            Vehículos encontrados: <strong>{cars.length}</strong>
          </p>

          <p>
            Seleccionados: <strong>{selectedCount}</strong>
          </p>

          <button
            type="button"
            className="qr-pdf-link-button"
            onClick={handleToggleAllVisible}
            disabled={cars.length === 0}
          >
            {allVisibleSelected
              ? 'Quitar selección'
              : 'Seleccionar visibles'}
          </button>
        </div>

        {loading ? (
          <p className="qr-pdf-empty">Cargando vehículos...</p>
        ) : cars.length === 0 ? (
          <p className="qr-pdf-empty">
            No hay vehículos para mostrar. Intenta con otra búsqueda.
          </p>
        ) : (
          <div className="qr-pdf-table-wrapper">
            <table className="qr-pdf-table">
              <thead>
                <tr>
                  <th>Seleccionar</th>
                  <th>NIV</th>
                  <th>Código QR</th>
                  <th>Estado</th>
                  <th>Exportado en</th>
                </tr>
              </thead>

              <tbody>
                {cars.map((car) => (
                  <tr key={car.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(car.id)}
                        onChange={() => handleToggleSelection(car.id)}
                      />
                    </td>

                    <td>{car.niv}</td>

                    <td>{car.qrValue}</td>

                    <td>
                      <span
                        className={
                          car.qrExported
                            ? 'qr-pdf-badge qr-pdf-badge-exported'
                            : 'qr-pdf-badge qr-pdf-badge-pending'
                        }
                      >
                        {car.qrExported ? 'Exportado' : 'Pendiente'}
                      </span>
                    </td>

                    <td>
                      {car.qrExportedAt
                        ? new Date(car.qrExportedAt).toLocaleString('es-MX')
                        : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="qr-pdf-footer-actions">
          <button
            type="button"
            className="qr-pdf-button qr-pdf-button-dark"
            onClick={() => handleExport('SELECTED')}
            disabled={Boolean(downloadingMode) || selectedCount === 0}
          >
            {downloadingMode === 'SELECTED'
              ? 'Generando...'
              : `Exportar seleccionados (${selectedCount})`}
          </button>
        </div>
      </section>
    </div>
  );
}

export default QrPdfPage;