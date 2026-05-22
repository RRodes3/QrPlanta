import { useState } from 'react';
import { importCarsFromFileRequest } from '../../api/import.api';
import './ImportPage.css';

function ImportPage () {

    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [status, setStatus] = useState('idle');
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const isLoading = status === 'uploading' || status === 'processing';

    const getStatusText = () => {
        if (status === 'uploading') {
            return `Subiendo Archivo... ${uploadProgress}%`;
        }
        if (status === 'processing') {
            return 'Procesando registros. Esto puede tardar un momento...';
        }
        if (status === 'completed') {
            return 'Importación completada correctamente.';
        }
        if (status === 'error') {
            return 'No se pudo completar la importación.';
        }
        return 'Selecciona un archivo CSV o Excel para comenzar.';
    };

    const getErrorMessage = (error) => {
        return (
            error.response?.data?.message ||
            error.message ||
            'Ocurrión un error inesperado al importart el archivo.'
        );
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];

        setError('');
        setResult(null);
        setUploadProgress(0);
        setStatus('idle');

        if(!file) {
            setSelectedFile(null);
            return;
        }

        const validExtensions = ['csv', 'xlsx', 'xls'];
        const fileName = file.name.toLowerCase();

        const isValidFile = validExtensions.some((extension) => 
            fileName.endsWith(extension)
        );

        if (!isValidFile) {
            setSelectedFile(null);
            setStatus('error');
            setError('Formato no permitido. Selecciona un archivo CSV, XLS o XLSX.');
            return;
        }
        
        setSelectedFile(file);
    };

    const handleImport = async () => {
        try {
            if (!selectedFile) {
                setStatus('error');
                setError('Debes seleccionar un archivo antes de importar.');
                return;
            }

            setError('');
            setResult(null);
            setUploadProgress(0);
            setStatus('uploading');

            const response = await importCarsFromFileRequest( selectedFile, (progres) => {
                setUploadProgress(progress);

                if (progress >= 100) {
                    setStatus('processing');
                }
            });

            setResult(response);
            setStatus('completed');
        } catch (error) {
            console.error('Error al importar el archivo:', error);

            setStatus('error');
            setError (getErrorMessage(error));
        }
    };

    const handleClear = () => {
        setSelectedFile(null);
        setUploadProgress(0);
        setStatus('idle');
        setResult(null);
        setError('');
    };

    return (
        <div className="import-page">
            <section className="import-card">
                <div className="import-header">
                <h1>Importar vehículos</h1>
                <p>
                    Sube un archivo CSV o Excel para registrar vehículos y cargar su
                    historial de movimientos dentro de la planta.
                </p>
                </div>

                <div className="import-info-box">
                <strong>Formato esperado:</strong>
                <span>
                    VIN, DIA, HORA, AREA, OPERADOR, repitiendo los bloques de proceso
                    según el historial del vehículo.
                </span>
                </div>

                <div className="import-file-section">
                <label htmlFor="file" className="import-file-label">
                    Archivo CSV / Excel
                </label>

                <input
                    id="file"
                    type="file"
                    accept=".csv,.xls,.xlsx"
                    onChange={handleFileChange}
                    disabled={isLoading}
                />

                {selectedFile && (
                    <div className="import-file-preview">
                    <p>
                        <strong>Archivo seleccionado:</strong> {selectedFile.name}
                    </p>
                    <p>
                        <strong>Tamaño:</strong>{' '}
                        {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                    </div>
                )}
                </div>

                <div className="import-status">
                <p>{getStatusText()}</p>

                {(status === 'uploading' || status === 'processing') && (
                    <div className="import-progress-wrapper">
                    <div className="import-progress-bar">
                        <div
                        className="import-progress-fill"
                        style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                    <span>{uploadProgress}%</span>
                    </div>
                )}
                </div>

                {error && <div className="import-error">{error}</div>}

                <div className="import-actions">
                <button
                    type="button"
                    className="import-button import-button-primary"
                    onClick={handleImport}
                    disabled={!selectedFile || isLoading}
                >
                    {isLoading ? 'Importando...' : 'Importar archivo'}
                </button>

                <button
                    type="button"
                    className="import-button import-button-secondary"
                    onClick={handleClear}
                    disabled={isLoading}
                >
                    Limpiar
                </button>
                </div>

                {result && (
                <section className="import-result">
                    <h2>Resumen de importación</h2>

                    <div className="import-summary-grid">
                    <article>
                        <span>Filas procesadas</span>
                        <strong>{result.summary.totalRows}</strong>
                    </article>

                    <article>
                        <span>Vehículos creados</span>
                        <strong>{result.summary.carsCreated}</strong>
                    </article>

                    <article>
                        <span>Vehículos existentes</span>
                        <strong>{result.summary.carsExisting}</strong>
                    </article>

                    <article>
                        <span>Movimientos creados</span>
                        <strong>{result.summary.movementsCreated}</strong>
                    </article>

                    <article>
                        <span>Movimientos omitidos</span>
                        <strong>{result.summary.movementsSkipped}</strong>
                    </article>

                    <article>
                        <span>Filas omitidas</span>
                        <strong>{result.summary.rowsSkipped}</strong>
                    </article>
                    </div>

                    <div className="import-file-result">
                    <p>
                        <strong>Archivo:</strong> {result.file.originalName}
                    </p>
                    <p>
                        <strong>Hoja:</strong> {result.sheet.name}
                    </p>
                    <p>
                        <strong>Filas totales:</strong>{' '}
                        {result.sheet.totalRowsIncludingHeader}
                    </p>
                    </div>

                    {result.summary.warningsCount > 0 && (
                    <div className="import-warnings">
                        <h3>Advertencias ({result.summary.warningsCount})</h3>

                        <ul>
                        {result.summary.warnings.map((warning, index) => (
                            <li key={`${warning}-${index}`}>{warning}</li>
                        ))}
                        </ul>

                        {result.summary.hasMoreWarnings && (
                        <p>
                            Hay más advertencias. Solo se muestran las primeras para no
                            saturar la pantalla.
                        </p>
                        )}
                    </div>
                    )}
                </section>
                )}
            </section>
            </div>
    );
   
}

export default ImportPage;