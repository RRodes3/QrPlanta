const { drawPage, normalizeAppearance } = require('pdf-lib');
const { toDataURL } = require('qrcode');
const XLSX = require('xlsx');
const prisma = require('../config/prisma');

const cleanText = (value) => {
    return String(value || '')
        .trim()
        .replace(/\s+/g, ' ');
};

const normalizeNiv = (value) => {
    return cleanText(value)
        .toUpperCase()
        .replace(/\s+/g, '');
};

const generateQrValue = (niv) => {
    return `QR-${niv}`;
};

const normalizeStageName = (value) => {
    const normalizedValue = cleanText(value)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase();

    const stageMap = {
        SOLDADURA: 'SOLDADURA',
        PINTURA: 'PINTURA',
        MONTAJE: 'MONTAJE',
        'CONTROL DE CALIDAD': 'CONTROL_DE_CALIDAD',
        CONTROL_DE_CALIDAD: 'CONTROL_DE_CALIDAD',
    };

    return stageMap[normalizedValue] || null;
};

const parseImportedDateTime = (dateValue, timeValue) => {
    const dateText = cleanText(dateValue);
    const timeText = cleanText(timeValue).toLowerCase();

    if(!dateText || !timeText){
        return null;
    }

    const dateParts = dateText.split(/[/-]/).map((part) => Number(part));
    
    if(dateParts.length !== 3 || dateParts.some((part) => Number.isNaN(part))) {
        return null;
    }

    const [month, day, year] = dateParts;

    const normalizedTimeText = timeText
        .replace(/\./g, '')
        .replace(/\s+/g, '')
        .trim();

    const isPM = /p\s*m/.test(normalizedTimeText);
    const isAM = /a\s*m/.test(normalizedTimeText);

    const onlyTime = normalizedTimeText
        .replace(/a\s*m/g, '')
        .replace(/p\s*m/g, '')
        .trim();

    const timeParts = onlyTime.split(':').map((part) => Number(part));

    if(timeParts.length < 2 || timeParts.some((part) => Number.isNaN(part))) {
        return null;
    }

    let [hour, minute, second = 0] = timeParts;

    if(isPM && hour !== 12) {
        hour += 12;
    }
    
    if (isAM && hour === 12) {
        hour = 0;
    }

    const date = new Date(year, month - 1, day, hour, minute, second);

    if(Number.isNaN(date.getTime())) {
        return null;
    }

    return date;
};

const extractProcessBlocks = (row) => {
    const processes = [];

    for(let columnIndex = 1; columnIndex < row.length; columnIndex += 4) {
        const date = cleanText(row[columnIndex]);
        const time = cleanText(row[columnIndex + 1]);
        const area = cleanText(row[columnIndex + 2]);
        const operator = cleanText(row[columnIndex + 3]);

        const hasAnyProcessData = date || time || area || operator;

        if (!hasAnyProcessData) {
            continue;
        }

        const processNumber = Math.floor((columnIndex - 1) / 4) + 1;
        const stageName = normalizeStageName(area);
        const registeredAt = parseImportedDateTime(date, time);

        processes.push({
            processNumber,
            registeredAt,
            isValidDateTime: Boolean(registeredAt),
            area,
            stageName,
            isValidStage: Boolean(stageName),
            operator,
        });
    }

    return processes;
};

const buildNormalizedPreview = (dataRows) => {
    return dataRows.slice(0, 3).map((row, index) => {
        const originalNiv = row[0];
        const normalizedNivValue = normalizeNiv(originalNiv);
        const processes = extractProcessBlocks(row);

        return {
            excelRow: index + 2,
            originalNiv,
            normalizedNiv: normalizedNivValue,
            qrValue: normalizedNivValue ? generateQrValue(normalizedNivValue) : null,
            processes,
        };
    });
};

const importCarsFromFile = async (req, res) => {
    try {
        if (!req.file){
            return res.status(400).json({
                message: 'Debes subir un archivo CSV o Excel',
            });    
        }

        const fileName = req.file.originalname.toLowerCase();

        const isValidFile = 
            fileName.endsWith('.csv') ||
            fileName.endsWith('.xslx') ||
            fileName.endsWith('.xls');

        if(!isValidFile) {
            return res.status(400).json({
                message: 'Formato no permitido. Usa CSV, XLSX o XLS',
            });
        }

        const workbook = XLSX.read(req.file.buffer, {
            type: 'buffer',
            raw: true,
        });

        const firstSheetName = workbook.SheetNames[0];

        if(!firstSheetName) {
            return res.status(400).json({
                message: 'El archivo no contiene hojas válidas',
            });
        }

        const sheet = workbook.Sheets[firstSheetName];

        const rows = XLSX.utils.sheet_to_json( sheet, {
            header: 1,
            defval: '',
            raw: true,
        });

        if(rows.length <= 1){
            return res.status(400).json({
                message: 'El archivo no contiene registros para importar',
            });
        }

        const headers = rows[0].map((header) => cleanText(header));
        const dataRows = rows.slice(1);
        
        const summary = {
            totalRows: dataRows.length,
            carsCreated: 0,
            carsExisting: 0,
            movementsCreated: 0,
            movementsSkipped: 0,
            rowsSkipped: 0,
            warnings: [],
        };
        

        await prisma.$transaction(async (tx) => {
            for (let rowIndex = 0; rowIndex < dataRows.length; rowIndex += 1) {
                const row = dataRows[rowIndex];
                const excelRowNumber = rowIndex + 2;
                const niv = normalizeNiv(row[0]);

                if (!niv) {
                    summary.rowsSkipped += 1;
                    summary.warnings.push(`Fila ${excelRowNumber}: no se encontró VIN/NIV.`);
                    continue;
                }

                const existingCar = await tx.car.findUnique({
                    where: {
                    niv,
                    },
                });

                let car = existingCar;

                if (!existingCar) {
                    car = await tx.car.create({
                    data: {
                        niv,
                        qrValue: generateQrValue(niv),
                        qrExported: false,
                    },
                    });

                    summary.carsCreated += 1;
                } else {
                    summary.carsExisting += 1;
                }

                const processes = extractProcessBlocks(row);

                for (const process of processes) {
                    if (!process.stageName) {
                    summary.movementsSkipped += 1;
                    summary.warnings.push(
                        `Fila ${excelRowNumber}, proceso ${process.processNumber}: etapa no reconocida "${process.area}".`
                    );
                    continue;
                    }

                    if (!process.registeredAt) {
                    summary.movementsSkipped += 1;
                    summary.warnings.push(
                        `Fila ${excelRowNumber}, proceso ${process.processNumber}: fecha u hora inválida.`
                    );
                    continue;
                    }

                    const duplicatedMovement = await tx.movement.findFirst({
                    where: {
                        carId: car.id,
                        stageName: process.stageName,
                        registeredAt: process.registeredAt,
                        sourceType: 'IMPORT',
                    },
                    });

                    if (duplicatedMovement) {
                    summary.movementsSkipped += 1;
                    continue;
                    }

                    await tx.movement.create({
                    data: {
                        carId: car.id,
                        stageName: process.stageName,
                        registeredAt: process.registeredAt,
                        registeredByUserId: null,
                        registeredByName: process.operator || null,
                        sourceType: 'IMPORT',
                    },
                    });

                    summary.movementsCreated += 1;
                }
                }
        });


        const warningLimit = 20;
        const warningsPreview = summary.warnings.slice(0, warningLimit);
        const hasMoreWarnings = summary.warnings.length > warningLimit;
        const normalizedPreview = buildNormalizedPreview(dataRows);


        return res.status(201).json({
            success: true,
            message: 'Importación completada correctamente',
            file: {
                originalName: req.file.originalname,
                mimeType: req.file.mimetype,
                size: req.file.size,
            },
            sheet: {
                name: firstSheetName,
                totalRowsIncludingHeader: rows.length,
                totalDataRows: dataRows.length,
            },
            summary: {
                totalRows: summary.totalRows,
                carsCreated: summary.carsCreated,
                carsExisting: summary.carsExisting,
                movementsCreated: summary.movementsCreated,
                movementsSkipped: summary.movementsSkipped,
                rowsSkipped: summary.rowsSkipped,
                warningsCount: summary.warnings.length,
                warnings: warningsPreview,
                hasMoreWarnings,
            },
        });
    } catch (error) {
        console.error('Error en importación:', error);

        if(error.code === 'P2002') {
            return res.status(409).json({
                message: 'Hay un conflicto con un dato único, posiblemente un NIV o QR repetido.'
            });
        }

        return res.status(500).json({
            message: 'Error interno del servidor',
        });
    }
};

module.exports = {
    importCarsFromFile,
};