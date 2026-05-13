const prisma = require('../config/prisma');
const QRCode = require('qrcode');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

const getCars = async (req, res) => {
  try {
    const cars = await prisma.car.findMany({
      include: {
        movements: {
          include: {
            registeredByUser: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy:{
            registeredAt: 'desc',
          },
        },
      },
      orderBy: {
        id: 'desc',
      },
    });

    return res.status(200).json(cars);
  } catch (error) {
    console.error('Error al obtener carros:', error);
    return res.status(500).json({
      message: 'Error interno del servidor',
    });
  }
};

const getCarById = async (req, res) => {
  try {
    const carId = Number(req.params.id);

    if (Number.isNaN(carId)) {
      return res.status(400).json({
        message: 'ID inválido',
      });
    }

    const car = await prisma.car.findUnique({
      where: { id: carId },
      include: {
        movements: {
          include:{
            registeredByUser:{
              select:{
                id: true,
                name: true,
                email: true,
              }
            }
          },
          orderBy: {
            registeredAt: 'asc',
          },
        },
      },
    });

    if (!car) {
      return res.status(404).json({
        message: 'Vehículo no encontrado',
      });
    }

    return res.status(200).json(car);
  } catch (error) {
    console.error('Error al obtener carro por ID:', error);
    return res.status(500).json({
      message: 'Error interno del servidor',
    });
  }
};

const getCarByQrValue = async (req, res) => {
  try {
    const { qrValue } = req.params;

    const car = await prisma.car.findUnique({
      where: { qrValue },
      include: {
        movements: {
          include: {
            registeredByUser: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            registeredAt: 'asc',
          },
        },
      },
    });

    if (!car) {
      return res.status(404).json({
        message: 'Vehículo no encontrado para ese QR',
      });
    }

    return res.status(200).json(car);
  } catch (error) {
    console.error('Error al obtener carro por QR:', error);
    return res.status(500).json({
      message: 'Error interno del servidor',
    });
  }
};

const searchCarsForQrExport = async (req, res) => {
  try {
    const { search = '' } = req.query;

    const cars = await prisma.car.findMany({
      where: {
        OR:[
          {
            niv: {
              contains: search,
            },
          },
          /*{
            chasis: {
              contains: search,
            },
          },*/
          {
            qrValue: {
              contains: search,
            },
          },
        ],
      },
      select: {
        id: true,
        niv: true,
        //chasis: true,
        qrValue: true,
        qrExported: true,
        qrExportedAt: true,
      },
      orderBy: {
        id: 'desc',
      },
      take: 50,
    });
    
    return res.status(200).json(cars);
  } catch (error) {
    console.error('Error al buscar carros para exportar QR: ', error);
    return res.status(500).json({
      message: 'Error interno del servidor',
    });
  }
};

const exportCarQrsPdf = async (req, res) => {
  try {
    const { mode, carIds = [] } = req.body;

    let where = {};

    if (mode == 'NOT_EXPORTED') {
      where = {
        qrExported: false,
      };
    } else if (mode == 'SELECTED') {
      if (!Array.isArray(carIds) || carIds.length === 0) {
        return res.status(400).json({
          message: 'Debes seleccionar al menos un vehículo para exportar su QR',
        });
      }

      const parsedCarIds = carIds.map((id) => Number(id));
      
      const hasInvalidId = parsedCarIds.some((id) => Number.isNaN(id));

      if(hasInvalidId) {
        return res.status(400).json({
          message: 'La lista de vehículos seleccionados contiene IDs inválidos',
        });
      }

      where = {
        id: {
          in: parsedCarIds,
        },
      };
    } else {
      return res.status(400).json({
        message: 'Modo de exportación inválido',
      });
    }

    const cars = await prisma.car.findMany({
      where,
      select: {
        id: true,
        niv: true,
        //chasis: true,
        qrValue: true,
      },
      orderBy: {
        id: 'asc',
      },
    });

    if (cars.length === 0) {
      return res.status(404).json({
        message: 'No hay vehículos para exportar',
      });
    }

    const pdfDoc = await PDFDocument.create();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const pageWidth = 612;
    const pageHeight = 792;
    const halfPageHeight = pageHeight / 2;

    const qrSize = 210;

    let page = null;

    for (let index = 0; index < cars.length; index +=1)
    {
      const car = cars[index];

      const positionInPage = index % 2;

      if(positionInPage === 0){
        page = pdfDoc.addPage([pageWidth, pageHeight])
      }

      const slotBottom = positionInPage === 0 ? halfPageHeight : 0;
      const slotTop = slotBottom + halfPageHeight;
      const slotCenterX = pageWidth / 2;

      if (positionInPage === 1) {
        page.drawLine({
          start: { x: 40, y: halfPageHeight },
          thickness: 1,
          color: rgb(0.75, 0.75, 0.75),
        });
      }

      page.drawText('QR Planta - Identificación de vehículo', {
        x: 40,
        y: slotTop - 45,
        size: 12,
        font,
        color: rgb(0.3, 0.3, 0.3),
      });

      const nivText = `NIV: ${car.niv}`;
      const nivTextWidth = boldFont.widthOfTextAtSize(nivText, 18);

      page.drawText(nivText, {
        x: slotCenterX - nivTextWidth / 2,
        y: slotTop - 85,
        size: 18,
        font: boldFont,
        color: rgb(0, 0, 0),
      });

      const qrDataUrl = await QRCode.toDataURL(car.qrValue, {
        errorCorrectionLevel: 'M',
        margin: 1,
        width: 500,
      });

      const qrBase64 = qrDataUrl.split(',')[1];
      const qrImage = await pdfDoc.embedPng(qrBase64);

      const qrX = slotCenterX - qrSize / 2;
      const qrY = slotBottom + 85;

      page.drawImage(qrImage, {
        x: qrX,
        y: qrY,
        width: qrSize,
        height: qrSize,
      });

      const qrValueText = `Código QR: ${car.qrValue}`;
      const qrValueTextWidth = font.widthOfTextAtSize(qrValueText, 12);

      page.drawText(qrValueText, {
        x: slotCenterX - qrValueTextWidth / 2,
        y: qrY - 25,
        size: 12,
        font,
        color: rgb(0.15, 0.15, 0.15),
      });

      /*if(car.chasis){
        const chasisText = `Chasis: ${car.chasis}`;
        const chasisTextWidth = font.widthOfTextAtSize(chasisText, 11);

        page.drawText(chasisText, {
          x: slotCenterX - chasisTextWidth / 2,
          y: qrY - 45,
          size: 11,
          font,
          color: rgb(0.25, 0.25, 0.25),
        });
      }*/
    }

    const exportedCarIds = cars.map((car) => car.id);

    await prisma.car.updateMany({
      where: {
        id: {
          in: exportedCarIds,
        },
      },
      data: {
        qrExported: true,
        qrExportedAt: new Date(),
      },
    });

    const pdfBytes = await pdfDoc.save ();

    const fileName = `qr-vehiculos-${Date.now()}.pdf`;
    
    res.setHeader('Content-Type', 'Aplication/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${fileName}`
    );

    return res.status(200).send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error('Error al exportar QRs en PDF: ', error);
    return res.status(500).json({
      message: 'Error interno del servidor',
    });
  }
};


module.exports = {
  getCars,
  getCarById,
  getCarByQrValue,
  searchCarsForQrExport,
  exportCarQrsPdf,
};