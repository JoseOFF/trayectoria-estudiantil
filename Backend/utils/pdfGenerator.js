// ============================================
// UTILIDADES PARA GENERAR PDFs - MEJORADO
// Sistema de Gestión de Expedientes Estudiantiles
// ============================================

const PDFDocument = require('pdfkit');

// ============================================
// CONFIGURACIÓN DE COLORES Y ESTILOS
// ============================================
const COLORS = {
    primary: '#667eea',
    secondary: '#764ba2',
    text: '#333333',
    textLight: '#666666',
    border: '#e0e0e0',
    success: '#198754',
    danger: '#dc3545',
    warning: '#ffc107'
};

// Datos de la institución desde el .env (INSTITUTION_*).
// Se leen al generar cada PDF; si falta alguno, su línea no se imprime.
const datosInstitucion = () => ({
    nombre: process.env.INSTITUTION_NAME || 'Sistema de Expedientes Estudiantiles',
    telefono: process.env.INSTITUTION_PHONE || '',
    correo: process.env.INSTITUTION_EMAIL || ''
});

// ============================================
// CLASE PARA GENERAR PDFs
// ============================================
class PDFGenerator {
    constructor() {
        this.doc = null;
    }
    
    /**
     * Crear nuevo documento PDF
     */
    createDocument() {
        this.doc = new PDFDocument({
            size: 'LETTER',
            margins: {
                top: 50,
                bottom: 50,
                left: 50,
                right: 50
            },
            info: {
                Title: 'Reporte - Sistema de Expedientes',
                Author: datosInstitucion().nombre
            }
        });
        
        return this.doc;
    }
    
    /**
     * Agregar encabezado institucional
     */
    addHeader(titulo, subtitulo = '') {
        const doc = this.doc;
        
        // Logo/Título institucional
        doc.fontSize(20)
           .fillColor(COLORS.primary)
           .text(datosInstitucion().nombre, 50, 50, { align: 'center' });
        
        doc.fontSize(10)
           .fillColor(COLORS.textLight)
           .text('Sistema de Expedientes Estudiantiles', { align: 'center' });
        
        // Línea separadora
        doc.moveDown(0.5);
        doc.moveTo(50, doc.y)
           .lineTo(562, doc.y)
           .strokeColor(COLORS.primary)
           .lineWidth(2)
           .stroke();
        
        // Título del reporte
        doc.moveDown(1);
        doc.fontSize(16)
           .fillColor(COLORS.text)
           .text(titulo, { align: 'center' });
        
        // Subtítulo
        if (subtitulo) {
            doc.fontSize(10)
               .fillColor(COLORS.textLight)
               .text(subtitulo, { align: 'center' });
        }
        
        // Fecha de generación
        const fecha = new Date().toLocaleString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        
        doc.fontSize(9)
           .fillColor(COLORS.textLight)
           .text(`Generado: ${fecha}`, { align: 'center' });
        
        doc.moveDown(2);
    }
    
    /**
     * Agregar pie de página
     */
    addFooter(numeroPagina, totalPaginas) {
        const doc = this.doc;
        const bottom = doc.page.height - 50;
        
        // Línea separadora
        doc.moveTo(50, bottom - 10)
           .lineTo(562, bottom - 10)
           .strokeColor(COLORS.border)
           .lineWidth(0.5)
           .stroke();
        
        // Información institucional (del .env)
        const institucion = datosInstitucion();
        doc.fontSize(8)
           .fillColor(COLORS.textLight)
           .text(institucion.nombre, 50, bottom + 5);

        if (institucion.telefono) doc.text(`Tel: ${institucion.telefono}`, 50, bottom + 15);
        if (institucion.correo) doc.text(institucion.correo, 50, bottom + 24);
        
        // Número de página
        doc.text(`Página ${numeroPagina} de ${totalPaginas}`, 50, bottom, { align: 'right' });
    }
    
    /**
     * Agregar sección con título
     */
    addSection(titulo, contenido) {
        const doc = this.doc;
        
        //  Verificar si hay espacio suficiente (mejorado)
        if (doc.y > 680) {
            doc.addPage();
        }
        
        // Título de sección
        doc.fontSize(14)
           .fillColor(COLORS.primary)
           .text(titulo, 50, doc.y + 10);
        
        doc.moveDown(0.5);
        
        // Línea debajo del título
        doc.moveTo(50, doc.y)
           .lineTo(562, doc.y)
           .strokeColor(COLORS.border)
           .lineWidth(1)
           .stroke();
        
        doc.moveDown(1);
        
        // Contenido (solo si hay)
        if (contenido) {
            doc.fontSize(10)
               .fillColor(COLORS.text)
               .text(contenido, { align: 'justify' });
            
            doc.moveDown(1);
        }
    }
    
    /**
     *  Agregar tabla mejorada (anchos dinámicos)
     */
    addTable(headers, rows, options = {}) {
        const doc = this.doc;
        const startX = options.startX || 50;
        const startY = doc.y;
        const pageWidth = 512; // Ancho útil de la página
        const minRowHeight = options.rowHeight || 22;
        const maxRowHeight = 80; // Altura máxima por fila
        
        // Calcular anchos de columna
        let columnWidths;
        if (options.columnWidths) {
            columnWidths = options.columnWidths;
        } else {
            const defaultWidth = pageWidth / headers.length;
            columnWidths = headers.map(() => defaultWidth);
        }
        
        // Verificar espacio inicial
        if (doc.y > 650) {
            doc.addPage();
        }
        
        let currentY = doc.y;
        
        // ============================================
        // FUNCIÓN AUXILIAR: Calcular altura necesaria para el texto
        // ============================================
        const calculateTextHeight = (text, width, fontSize = 9) => {
            // Crear un documento temporal para medir
            const tempDoc = doc;
            tempDoc.fontSize(fontSize);
            
            // Calcular cuántas líneas necesita el texto
            const textWidth = tempDoc.widthOfString(text);
            const availableWidth = width - 10; // Padding
            const lines = Math.ceil(textWidth / availableWidth);
            
            // Altura por línea (aproximada)
            const lineHeight = fontSize * 1.5;
            return Math.max(minRowHeight, Math.min(lines * lineHeight, maxRowHeight));
        };
        
        // ============================================
        // FUNCIÓN: Dibujar encabezados
        // ============================================
        const drawHeaders = (y) => {
            doc.fillColor(COLORS.primary).fontSize(10);
            
            let currentX = startX;
            headers.forEach((header, i) => {
                // Fondo del encabezado
                doc.rect(currentX, y, columnWidths[i], minRowHeight)
                .fillAndStroke(COLORS.primary, COLORS.border);
                
                // Texto del encabezado
                doc.fillColor('#ffffff')
                .text(header, currentX + 5, y + 7, {
                    width: columnWidths[i] - 10,
                    align: 'center'
                });
                
                currentX += columnWidths[i];
            });
            
            return y + minRowHeight;
        };
        
        // Dibujar encabezados iniciales
        currentY = drawHeaders(currentY);
        
        // ============================================
        // FILAS DE DATOS CON ALTURA VARIABLE
        // ============================================
        doc.fillColor(COLORS.text).fontSize(9);
        
        rows.forEach((row, rowIndex) => {
            // CALCULAR LA ALTURA NECESARIA PARA ESTA FILA
            let maxHeightForRow = minRowHeight;
            row.forEach((cell, colIndex) => {
                const cellText = String(cell || '');
                const cellHeight = calculateTextHeight(
                    cellText, 
                    columnWidths[colIndex], 
                    9
                );
                maxHeightForRow = Math.max(maxHeightForRow, cellHeight);
            });
            
            // Verificar si necesita nueva página
            if (currentY + maxHeightForRow > 700) {
                doc.addPage();
                currentY = 50;
                currentY = drawHeaders(currentY);
                doc.fillColor(COLORS.text).fontSize(9);
            }
            
            // DIBUJAR FILA CON LA ALTURA CALCULADA
            let currentX = startX;
            row.forEach((cell, colIndex) => {
                // Fondo alternado
                const bgColor = rowIndex % 2 === 0 ? '#f9f9f9' : '#ffffff';
                doc.rect(currentX, currentY, columnWidths[colIndex], maxHeightForRow)
                .fillAndStroke(bgColor, COLORS.border);
                
                // TEXTO CON WRAP (sin ellipsis)
                const cellText = String(cell || '');
                doc.fillColor(COLORS.text)
                .fontSize(9)
                .text(cellText, currentX + 5, currentY + 6, {
                    width: columnWidths[colIndex] - 10,
                    height: maxHeightForRow - 6,
                    align: colIndex === 0 ? 'center' : 'left',
                    // SIN ellipsis - el texto hace wrap
                });
                
                currentX += columnWidths[colIndex];
            });
            
            currentY += maxHeightForRow; // ← Usar altura variable
        });
        
        doc.moveDown(2);
    }

    
    /**
     * Agregar información en formato clave-valor
     */
    addKeyValuePairs(data, columns = 2) {
        const doc = this.doc;
        const startX = 50;
        const columnWidth = 256;
        
        let currentX = startX;
        let currentY = doc.y;
        let columnCount = 0;
        
        Object.entries(data).forEach(([key, value]) => {
            // Verificar espacio
            if (currentY > 700) {
                doc.addPage();
                currentY = 50;
                currentX = startX;
                columnCount = 0;
            }
            
            // Clave en negrita
            doc.fontSize(10)
               .fillColor(COLORS.textLight)
               .text(`${key}:`, currentX, currentY, { continued: false });
            
            // Valor
            doc.fontSize(10)
               .fillColor(COLORS.text)
               .text(String(value), currentX, currentY + 15, { 
                   width: columnWidth - 10 
               });
            
            columnCount++;
            
            if (columnCount >= columns) {
                // Nueva fila
                currentY += 50;
                currentX = startX;
                columnCount = 0;
            } else {
                // Nueva columna
                currentX += columnWidth;
            }
        });
        
        doc.moveDown(2);
    }
    
    /**
     * Agregar badge/etiqueta
     */
    addBadge(text, color, x, y) {
        const doc = this.doc;
        const badgeWidth = doc.widthOfString(text) + 20;
        
        doc.roundedRect(x, y, badgeWidth, 20, 5)
           .fillAndStroke(color, color);
        
        doc.fillColor('#ffffff')
           .fontSize(9)
           .text(text, x + 10, y + 5);
    }
    
    /**
     * Finalizar documento
     */
    finalize() {
        this.doc.end();
    }
}

// ============================================
// FUNCIÓN AUXILIAR PARA FORMATEAR FECHAS
// ============================================
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// ============================================
// EXPORTAR CLASE
// ============================================
module.exports = PDFGenerator;