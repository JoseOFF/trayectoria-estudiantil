// ============================================
// DATOS DE ESTADOS Y MUNICIPIOS DE MÉXICO
// Sistema de Gestión de Expedientes Estudiantiles
// ============================================

const ESTADOS_MUNICIPIOS = {
    "Aguascalientes": ["Aguascalientes", "Asientos", "Calvillo", "Cosío", "El Llano", "Jesús María", "Pabellón de Arteaga", "Rincón de Romos", "San Francisco de los Romo", "San José de Gracia", "Tepezalá"],
    
    "Baja California": ["Ensenada", "Mexicali", "Playas de Rosarito", "Tecate", "Tijuana"],
    
    "Baja California Sur": ["Comondú", "La Paz", "Loreto", "Los Cabos", "Mulegé"],
    
    "Campeche": ["Calakmul", "Calkiní", "Campeche", "Candelaria", "Carmen", "Champotón", "Escárcega", "Hecelchakán", "Hopelchén", "Palizada", "Tenabo"],
    
    "Chiapas": ["Tuxtla Gutiérrez", "San Cristóbal de las Casas", "Tapachula", "Comitán de Domínguez", "Chiapa de Corzo", "Palenque", "Ocosingo", "Villaflores", "Tonalá", "Cintalapa", "Arriaga"],
    
    "Chihuahua": ["Chihuahua", "Juárez", "Cuauhtémoc", "Delicias", "Hidalgo del Parral", "Nuevo Casas Grandes", "Camargo", "Jiménez", "Ojinaga", "Meoqui"],
    
    "Ciudad de México": ["Álvaro Obregón", "Azcapotzalco", "Benito Juárez", "Coyoacán", "Cuajimalpa de Morelos", "Cuauhtémoc", "Gustavo A. Madero", "Iztacalco", "Iztapalapa", "La Magdalena Contreras", "Miguel Hidalgo", "Milpa Alta", "Tláhuac", "Tlalpan", "Venustiano Carranza", "Xochimilco"],
    
    "Coahuila": ["Saltillo", "Torreón", "Monclova", "Piedras Negras", "Acuña", "Matamoros", "Frontera", "Parras", "Sabinas", "Múzquiz"],
    
    "Colima": ["Armería", "Colima", "Comala", "Coquimatlán", "Cuauhtémoc", "Ixtlahuacán", "Manzanillo", "Minatitlán", "Tecomán", "Villa de Álvarez"],
    
    "Durango": ["Durango", "Gómez Palacio", "Lerdo", "Guadalupe Victoria", "Canatlán", "Santiago Papasquiaro", "Cuencamé", "Nombre de Dios", "Mezquital", "Vicente Guerrero"],
    
    "Guanajuato": ["León", "Irapuato", "Celaya", "Salamanca", "Guanajuato", "San Miguel de Allende", "Silao de la Victoria", "Pénjamo", "Dolores Hidalgo", "San Francisco del Rincón", "Acámbaro", "Cortazar", "Moroleón", "Valle de Santiago", "Salvatierra", "Purísima del Rincón"],
    
    "Guerrero": ["Acapulco de Juárez", "Chilpancingo de los Bravo", "Iguala de la Independencia", "Zihuatanejo de Azueta", "Taxco de Alarcón", "Chilapa de Álvarez", "Tlapa de Comonfort", "Arcelia", "Coyuca de Benítez"],
    
    "Hidalgo": ["Pachuca de Soto", "Tulancingo de Bravo", "Tizayuca", "Tula de Allende", "Tepeapulco", "Actopan", "Huejutla de Reyes", "Mineral de la Reforma", "Ixmiquilpan", "Apan"],
    
    "Jalisco": ["Guadalajara", "Zapopan", "Tlaquepaque", "Tonalá", "Puerto Vallarta", "Lagos de Moreno", "Tlajomulco de Zúñiga", "El Salto", "Tepatitlán de Morelos", "Ocotlán", "Atotonilco el Alto", "Autlán de Navarro", "La Barca"],
    
    "Estado de México": ["Acambay de Ruíz Castañeda", "Acolman", "Aculco", "Almoloya de Alquisiras", "Almoloya de Juárez", "Almoloya del Río", "Amanalco", "Amatepec", "Amecameca", "Apaxco", "Atenco", "Atizapán", "Atizapán de Zaragoza", "Atlacomulco", "Atlautla", "Axapusco", "Ayapango", "Calimaya", "Capulhuac", "Chalco", "Chapa de Mota", "Chapultepec", "Chiautla", "Chicoloapan", "Chiconcuac", "Chimalhuacán", "Coacalco de Berriozábal", "Coatepec Harinas", "Cocotitlán", "Coyotepec", "Cuautitlán", "Cuautitlán Izcalli", "Donato Guerra", "Ecatepec de Morelos", "Ecatzingo", "El Oro", "Huehuetoca", "Hueypoxtla", "Huixquilucan", "Isidro Fabela", "Ixtapaluca", "Ixtapan de la Sal", "Ixtapan del Oro", "Ixtlahuaca", "Jaltenco", "Jilotepec", "Jilotzingo", "Jiquipilco", "Jocotitlán", "Joquicingo", "Juchitepec", "La Paz", "Lerma", "Luvianos", "Malinalco", "Melchor Ocampo", "Metepec", "Mexicaltzingo", "Morelos", "Naucalpan de Juárez", "Nextlalpan", "Nezahualcóyotl", "Nicolás Romero", "Nopaltepec", "Ocoyoacac", "Ocuilan", "Otumba", "Otzoloapan", "Otzolotepec", "Ozumba", "Papalotla", "Polotitlán", "Rayón", "San Antonio la Isla", "San Felipe del Progreso", "San José del Rincón", "San Martín de las Pirámides", "San Mateo Atenco", "San Simón de Guerrero", "Santo Tomás", "Soyaniquilpan de Juárez", "Sultepec", "Tecámac", "Tejupilco", "Temamatla", "Temascalapa", "Temascalcingo", "Temascaltepec", "Temoaya", "Tenancingo", "Tenango del Aire", "Tenango del Valle", "Teoloyucan", "Teotihuacán", "Tepetlaoxtoc", "Tepetlixpa", "Tepotzotlán", "Tequixquiac", "Texcaltitlán", "Texcalyacac", "Texcoco", "Tezoyuca", "Tianguistenco", "Timilpan", "Tlalmanalco", "Tlalnepantla de Baz", "Tlatlaya", "Toluca", "Tonanitla", "Tonatico", "Tultepec", "Tultitlán", "Valle de Bravo", "Valle de Chalco Solidaridad", "Villa de Allende", "Villa del Carbón", "Villa Guerrero", "Villa Victoria", "Xalatlaco", "Xonacatlán", "Zacazonapan", "Zacualpan", "Zinacantepec", "Zumpahuacán", "Zumpango"],
    
    "Michoacán": ["Morelia", "Uruapan", "Zamora", "Lázaro Cárdenas", "Pátzcuaro", "Apatzingán", "Zitácuaro", "Hidalgo", "La Piedad", "Sahuayo"],
    
    "Morelos": ["Cuernavaca", "Jiutepec", "Cuautla", "Temixco", "Yautepec", "Emiliano Zapata", "Puente de Ixtla", "Jojutla", "Tepoztlán", "Tlaltizapán de Zapata"],
    
    "Nayarit": ["Tepic", "Bahía de Banderas", "Santiago Ixcuintla", "Compostela", "Tuxpan", "Ixtlán del Río", "Tecuala", "Acaponeta", "San Blas", "Xalisco"],
    
    "Nuevo León": ["Monterrey", "Guadalupe", "San Nicolás de los Garza", "Apodaca", "General Escobedo", "Santa Catarina", "San Pedro Garza García", "García", "Cadereyta Jiménez", "Juárez"],
    
    "Oaxaca": ["Oaxaca de Juárez", "San Juan Bautista Tuxtepec", "Juchitán de Zaragoza", "Salina Cruz", "Heroica Ciudad de Huajuapan de León", "Heroica Ciudad de Tlaxiaco", "Matías Romero Avendaño", "Miahuatlán de Porfirio Díaz", "Puerto Escondido", "San Pedro Pochutla"],
    
    "Puebla": ["Puebla", "Tehuacán", "San Martín Texmelucan", "Atlixco", "Cholula", "Teziutlán", "Huauchinango", "Amozoc", "Cuetzalan del Progreso", "San Pedro Cholula"],
    
    "Querétaro": ["Querétaro", "San Juan del Río", "Corregidora", "El Marqués", "Cadereyta de Montes", "Pedro Escobedo", "Tequisquiapan", "Ezequiel Montes", "Jalpan de Serra", "Amealco de Bonfil"],
    
    "Quintana Roo": ["Benito Juárez", "Othón P. Blanco", "Solidaridad", "Cozumel", "Felipe Carrillo Puerto", "Tulum", "Bacalar", "José María Morelos", "Isla Mujeres", "Lázaro Cárdenas", "Puerto Morelos"],
    
    "San Luis Potosí": ["San Luis Potosí", "Soledad de Graciano Sánchez", "Ciudad Valles", "Matehuala", "Rioverde", "Tamazunchale", "Tamuín", "Cárdenas", "Ébano", "Cerritos"],
    
    "Sinaloa": ["Culiacán", "Mazatlán", "Ahome", "Guasave", "Los Mochis", "Navolato", "Salvador Alvarado", "Escuinapa", "El Fuerte", "Mocorito"],
    
    "Sonora": ["Hermosillo", "Cajeme", "Nogales", "San Luis Río Colorado", "Navojoa", "Guaymas", "Agua Prieta", "Caborca", "Huatabampo", "Puerto Peñasco"],
    
    "Tabasco": ["Centro", "Cárdenas", "Comalcalco", "Huimanguillo", "Macuspana", "Cunduacán", "Paraíso", "Jalpa de Méndez", "Nacajuca", "Tenosique", "Balancán"],
    
    "Tamaulipas": ["Reynosa", "Matamoros", "Nuevo Laredo", "Tampico", "Victoria", "Ciudad Madero", "Altamira", "Río Bravo", "Mante", "Valle Hermoso"],
    
    "Tlaxcala": ["Tlaxcala", "Apizaco", "Huamantla", "Chiautempan", "San Pablo del Monte", "Zacatelco", "Calpulalpan", "Tlaxco", "Papalotla de Xicohténcatl", "Ixtacuixtla de Mariano Matamoros"],
    
    "Veracruz": ["Veracruz", "Xalapa", "Coatzacoalcos", "Poza Rica de Hidalgo", "Córdoba", "Minatitlán", "Boca del Río", "Orizaba", "Tuxpan", "Papantla", "Martínez de la Torre", "San Andrés Tuxtla", "Cosoleacaque", "Pánuco"],
    
    "Yucatán": ["Mérida", "Kanasín", "Valladolid", "Tizimín", "Progreso", "Umán", "Motul", "Tekax", "Ticul", "Maxcanú"],
    
    "Zacatecas": ["Zacatecas", "Fresnillo", "Guadalupe", "Jerez de García Salinas", "Río Grande", "Sombrerete", "Loreto", "Calera", "Tlaltenango de Sánchez Román", "Pinos"]
};

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ESTADOS_MUNICIPIOS;
}