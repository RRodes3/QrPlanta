import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import './QrScanner.css';

function QrScanner({ onScanSuccess, onCancel }) {
    const scannerIdRef = useRef(`qr-reader-${Date.now()}`);
    const scannerRef = useRef(null);
    const hasScannedRef = useRef(false);

    const [error, setError] = useState('');
    const [isStarting, setIsStarting] = useState(true);

    useEffect(() => {
        const startScanner = async () => {
            try {
                setError('');
                setIsStarting(true);

                const cameras = await Html5QrCode.getCameras();

                if (!cameras || cameras.Length === 0) {
                    setError('No se encontró ningúna cámara disponible');
                    return;
                }

                const backCamera = 
                    cameras.find((camera) => 
                        camera.label.toLowerCase().includes('back')
                ) || cameras[0];

                const scanner = new Html5QrCode(scannerIdRef.current);
                scannerRef.current = scanner;

                await scanner.start(
                    backCamera.id,
                    {
                        fps: 10,
                        qrbox: {
                            witdh: 250,
                            height: 250,
                        },
                    },
                    async (decodedText) => {
                        if (hasScannedRef.current) {
                            return;
                        }

                        hasScannedRef.current = true;

                        await scanner.stop();
                        await scanner.clear();

                        onScanSuccess(decodedText);
                    },
                    () => {
                        // Esta función se ejecuta cuando no detecta QR en un frame.
                        //  No mostramos error aquí para no saturar la pantalla
                    }
                );
            } catch (error) {
                console.error('Error al iniciar el escáner QR:', error);
                setError('Error al iniciar el escáner QR. Asegúrate de que tu cámara esté funcionando y que hayas dado permiso para usarla.'
                );
            } finally {
                setIsStarting(false);
            }
        };

        startScanner();

        return () => {
            const stopScanner = async () => {
                try {
                    if (scannerRef.current?.isScanning()) {
                        await scannerRef.current.stop();
                    }

                    await scannerRef.current?.clear();
                } catch (error) {
                    console.error('Error al cerrar escáner QR:', error);
                }
            };

            stopScanner();
        };
    }, [onScanSuccess]);

    return (
        <div className="qr-scanner">
        <div className="qr-scanner-header">
            <h3>Escanear código QR</h3>
            <p>Apunta la cámara al código QR del vehículo.</p>
        </div>

        {isStarting && (
            <p className="qr-scanner-message">Iniciando cámara...</p>
        )}

        {error && <p className="qr-scanner-error">{error}</p>}

        <div id={scannerIdRef.current} className="qr-scanner-box" />

        <button
            type="button"
            className="qr-scanner-manual-button"
            onClick={onCancel}
        >
            Escribir código QR
        </button>
        </div>
    );
}

export default QrScanner;