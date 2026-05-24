import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import './QrScanner.css';

function QrScanner({ onScanSuccess, onCancel }) {
  const scannerIdRef = useRef(`qr-reader-${Date.now()}`);
  const scannerRef = useRef(null);
  const hasScannedRef = useRef(false);

  const [error, setError] = useState('');
  const [isStarting, setIsStarting] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const startScanner = async () => {
      try {
        setError('');
        setIsStarting(true);

        const cameras = await Html5Qrcode.getCameras();

        if (!isMounted) return;

        if (!cameras || cameras.length === 0) {
          setError('No se encontró ninguna cámara disponible.');
          return;
        }

        const backCamera =
          cameras.find((camera) =>
            camera.label.toLowerCase().includes('back')
          ) || cameras[0];

        const scanner = new Html5Qrcode(scannerIdRef.current);
        scannerRef.current = scanner;

        await scanner.start(
          backCamera.id,
          {
            fps: 10,
            qrbox: {
              width: 250,
              height: 250,
            },
          },
          async (decodedText) => {
            if (hasScannedRef.current) {
              return;
            }

            hasScannedRef.current = true;

            try {
              await scanner.stop();
              await scanner.clear();
            } catch (error) {
              console.error('Error al cerrar cámara después del escaneo:', error);
            }

            onScanSuccess(decodedText);
          },
          () => {
            // No hacemos nada aquí porque esta función se ejecuta
            // muchas veces mientras la cámara no detecta un QR.
          }
        );
      } catch (error) {
        console.error('Error al iniciar el escáner QR:', error);

        if (isMounted) {
          setError(
            'No se pudo iniciar la cámara. Verifica permisos o usa la entrada manual.'
          );
        }
      } finally {
        if (isMounted) {
          setIsStarting(false);
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;

      const stopScanner = async () => {
        try {
          if (scannerRef.current) {
            await scannerRef.current.stop();
            await scannerRef.current.clear();
          }
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