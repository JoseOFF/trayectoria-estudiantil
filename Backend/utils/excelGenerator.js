// ============================================
// UTILIDADES PARA GENERAR ARCHIVOS EXCEL
// Sistema de Gestión de Expedientes Estudiantiles
// ============================================

const ExcelJS = require('exceljs');

// ============================================
// CLASE PARA GENERAR EXCEL
// ============================================
class ExcelGenerator {
    constructor() {
        this.workbook = null;
        this.worksheet = null;
    }
    
    /**
     * Crear nuevo libro de Excel
     */
    createWorkbook(titulo = 'Reporte') {
        this.workbook = new ExcelJS.Workbook();
        
        // Metadatos
        this.workbook.creator = 'Sistema de Expedientes';
        this.workbook.lastModifiedBy = 'Sistema de Expedientes';
        this.workbook.created = new Date();
        this.workbook.modified = new Date();
        
        // Crear hoja
        this.worksheet = this.workbook.addWorksheet(titulo, {
            pageSetup: {
                paperSize: 9,
                orientation: 'landscape'
            }
        });
        
        return this.workbook;
    }
    
    /**
     * Agregar encabezado institucional
     */
    addHeader(titulo, subtitulo = '') {
        const ws = this.worksheet;
        
        // Título principal
        ws.mergeCells('A1:H1');
        const titleCell = ws.getCell('A1');
        // Nombre de la institución desde el .env (INSTITUTION_NAME)
        titleCell.value = (process.env.INSTITUTION_NAME || 'Sistema de Expedientes Estudiantiles').toUpperCase();
        titleCell.font = {
            name: 'Arial',
            size: 16,
            bold: true,
            color: { argb: 'FF667eea' }
        };
        titleCell.alignment = {
            vertical: 'middle',
            horizontal: 'center'
        };
        
        // Subtítulo institucional
        ws.mergeCells('A2:H2');
        const subtitleCell = ws.getCell('A2');
        subtitleCell.value = 'Sistema de Expedientes Estudiantiles';
        subtitleCell.font = {
            name: 'Arial',
            size: 10,
            color: { argb: 'FF666666' }
        };
        subtitleCell.alignment = {
            vertical: 'middle',
            horizontal: 'center'
        };
        
        // Título del reporte
        ws.mergeCells('A4:H4');
        const reportTitleCell = ws.getCell('A4');
        reportTitleCell.value = titulo;
        reportTitleCell.font = {
            name: 'Arial',
            size: 14,
            bold: true
        };
        reportTitleCell.alignment = {
            vertical: 'middle',
            horizontal: 'center'
        };
        
        if (subtitulo) {
            ws.mergeCells('A5:H5');
            const reportSubtitleCell = ws.getCell('A5');
            reportSubtitleCell.value = subtitulo;
            reportSubtitleCell.font = {
                name: 'Arial',
                size: 11
            };
            reportSubtitleCell.alignment = {
                vertical: 'middle',
                horizontal: 'center'
            };
        }
        
        // Fecha de generación
        ws.mergeCells('A6:H6');
        const dateCell = ws.getCell('A6');
        const fecha = new Date().toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        dateCell.value = `Generado: ${fecha}`;
        dateCell.font = {
            name: 'Arial',
            size: 9,
            italic: true,
            color: { argb: 'FF666666' }
        };
        dateCell.alignment = {
            vertical: 'middle',
            horizontal: 'right'
        };
        
        // Espacio
        ws.addRow([]);
    }
    
    /**
     * Agregar tabla con encabezados
     */
    addTable(headers, data, startRow = 8) {
        const ws = this.worksheet;
        
        // Agregar encabezados
        const headerRow = ws.addRow(headers);
        headerRow.font = {
            name: 'Arial',
            size: 11,
            bold: true,
            color: { argb: 'FFFFFFFF' }
        };
        headerRow.alignment = {
            vertical: 'middle',
            horizontal: 'center'
        };
        
        // Estilo de encabezados
        headerRow.eachCell((cell) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF667eea' }
            };
            cell.border = {
                top: { style: 'thin', color: { argb: 'FF000000' } },
                left: { style: 'thin', color: { argb: 'FF000000' } },
                bottom: { style: 'thin', color: { argb: 'FF000000' } },
                right: { style: 'thin', color: { argb: 'FF000000' } }
            };
        });
        
        // Agregar datos
        data.forEach((row, index) => {
            const dataRow = ws.addRow(row);
            
            // Alternar colores de fila
            const bgColor = index % 2 === 0 ? 'FFF9F9F9' : 'FFFFFFFF';
            
            dataRow.eachCell((cell) => {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: bgColor }
                };
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
                    left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
                    bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
                    right: { style: 'thin', color: { argb: 'FFE0E0E0' } }
                };
                cell.alignment = {
                    vertical: 'middle'
                };
            });
        });
        
        // Auto-ajustar ancho de columnas
        ws.columns.forEach((column) => {
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, (cell) => {
                const columnLength = cell.value ? String(cell.value).length : 10;
                if (columnLength > maxLength) {
                    maxLength = columnLength;
                }
            });
            column.width = Math.min(maxLength + 2, 50);
        });
    }
    
    /**
     * Agregar estadísticas al final
     */
    addStatistics(stats) {
        const ws = this.worksheet;
        
        ws.addRow([]);
        ws.addRow([]);
        
        // Título de estadísticas
        const statsTitle = ws.addRow(['ESTADÍSTICAS']);
        statsTitle.font = {
            name: 'Arial',
            size: 12,
            bold: true,
            color: { argb: 'FF667eea' }
        };
        
        ws.addRow([]);
        
        // Agregar cada estadística
        Object.entries(stats).forEach(([key, value]) => {
            const row = ws.addRow([key, value]);
            row.getCell(1).font = { bold: true };
            row.getCell(2).alignment = { horizontal: 'right' };
        });
    }
    
    /**
     * Obtener buffer del archivo
     */
    async getBuffer() {
        return await this.workbook.xlsx.writeBuffer();
    }
}

// ============================================
// EXPORTAR CLASE
// ============================================
module.exports = ExcelGenerator;