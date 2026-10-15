// Datos de DEMO (ficticios). En producción vienen de SiempreSoft ERP.
window.CATS = [
  ['abarrotes','Arroz y azúcar','🍚','bag'],['aceites','Aceites','🫒','bottle'],['fideos','Fideos y harinas','🍝','pack'],
  ['conservas','Conservas','🥫','can'],['lacteos','Lácteos','🥛','box'],['desayuno','Desayuno','☕','jar'],
  ['menestras','Menestras','🫘','bag'],['condimentos','Salsas y condimentos','🧂','jar'],['galletas','Galletas y dulces','🍪','pack'],
  ['snacks','Snacks','🥨','pack'],['bebidas','Aguas y bebidas','💧','bottle'],['gaseosas','Gaseosas','🥤','bottle'],
  ['cervezas','Cervezas y licores','🍺','can'],['limpieza','Limpieza','🧴','bottle'],['cuidado','Cuidado personal','🧼','box'],
  ['bebes','Bebés','🍼','pack'],['mascotas','Mascotas','🐾','bag'],['descartables','Descartables','🥡','box']
];
// [nombre, marca, cat, precio público, unidades por caja]
window.RAW = `Arroz Costeño Extra 5kg|Costeño|abarrotes|23.90|5
Arroz Paisana Extra 5kg|Paisana|abarrotes|22.50|5
Arroz Faraón Naranja 5kg|Faraón|abarrotes|24.90|5
Arroz Valle Norte Superior 750g|Valle Norte|abarrotes|4.20|20
Arroz Añejo Extra Costeñito saco 50kg|Costeñito|abarrotes|195.00|1
Arroz Extra Añejo Faraón saco 50kg|Faraón|abarrotes|168.00|1
Azúcar Rubia Cartavio 1kg|Cartavio|abarrotes|4.30|10
Azúcar Rubia Paramonga 5kg|Paramonga|abarrotes|19.90|5
Azúcar Blanca Dulfina 1kg|Dulfina|abarrotes|5.20|10
Azúcar Blanca Refinada Cartavio saco 50kg|Cartavio|abarrotes|165.00|1
Sal de Mesa Emsal 1kg|Emsal|abarrotes|1.80|25
Aceite Primor Clásico 900ml|Primor|aceites|10.90|12
Aceite Cocinero 900ml|Cocinero|aceites|9.50|12
Aceite de Girasol Basso 1L|Basso|aceites|12.50|12
Aceite de Canola Bell's 1L|Bell's|aceites|11.20|12
Aceite Primor Premium 1.8L|Primor|aceites|21.50|6
Aceite Vegetal Primor Clásico 5L|Primor|aceites|52.90|4
Margarina La Danesa barra 500g|La Danesa|aceites|11.90|20
Margarina Orasi pote 250g|Orasi|aceites|5.50|24
Fideo Spaghetti Don Vittorio 500g|Don Vittorio|fideos|3.30|20
Fideo Tallarín Molitalia 450g|Molitalia|fideos|2.90|20
Fideo Canuto Rayado Lavaggi 235g|Lavaggi|fideos|1.60|40
Fideo Cabello de Ángel Nicolini 250g|Nicolini|fideos|1.90|40
Fideo Corbata Don Vittorio 250g|Don Vittorio|fideos|2.20|40
Harina Blanca Flor 1kg|Blanca Flor|fideos|5.50|10
Harina Nicolini Preparada 1kg|Nicolini|fideos|5.90|10
Atún Florida Filete 140g|Florida|conservas|6.90|48
Atún Campomar Trozos 150g|Campomar|conservas|5.00|48
Grated de Atún A-1 140g|A-1|conservas|4.30|48
Jurel Entero en Salsa de Tomate Portola 425g|Portola|conservas|16.50|24
Filete de Caballa Marinero 140g|Marinero|conservas|5.50|48
Durazno en Almíbar Aconcagua 820g|Aconcagua|conservas|9.90|12
Leche Gloria Entera Lata 390g|Gloria|lacteos|4.20|48
Leche Gloria Light Lata 390g|Gloria|lacteos|4.40|48
Mezcla Láctea Ideal Amanecer 390g|Ideal|lacteos|3.50|48
Mezcla Láctea Pura Vida 390g|Pura Vida|lacteos|3.40|48
Leche Laive Sin Lactosa 400g|Laive|lacteos|4.50|24
Leche Condensada Nestlé 393g|Nestlé|lacteos|6.90|24
Yogurt Gloria Zero Lacto Fresa 1kg|Gloria|lacteos|6.80|12
Mantequilla Laive con Sal 180g|Laive|lacteos|9.90|20
Café Nescafé Tradición 170g|Nescafé|desayuno|22.90|12
Café Altomayo Instantáneo 190g|Altomayo|desayuno|17.50|12
Café Nescafé Kirma 180g|Nescafé|desayuno|20.50|12
Cocoa Winter's Doypack 150g|Winter's|desayuno|16.50|24
Avena Quaker 900g|Quaker|desayuno|8.90|12
Avena 3 Ositos Precocida 900g|3 Ositos|desayuno|7.20|12
Chocolate Sol del Cusco 90g|Sol del Cusco|desayuno|3.20|30
Mermelada Compass Fresa 1kg|Compass|desayuno|14.50|12
Infusión Manzanilla Lipton 20 sobres|Lipton|desayuno|9.50|24
Lenteja Costeño 500g|Costeño|menestras|4.90|20
Frejol Canario Costeño 500g|Costeño|menestras|6.90|20
Arveja Verde Valle Norte 500g|Valle Norte|menestras|3.90|20
Pallar Costeño 500g|Costeño|menestras|7.90|20
Garbanzo Costeño 500g|Costeño|menestras|5.90|20
Mayonesa Alacena 475g|Alacena|condimentos|10.90|12
Ketchup Alacena 380g|Alacena|condimentos|8.20|12
Sillao Kikko Shoyu 350ml|Kikko|condimentos|6.20|12
Sazonador Sibarita frasco 80g|Sibarita|condimentos|5.50|20
Sillao Ajinomoto Ajino-sillao 500ml|Ajinomoto|condimentos|4.90|12
Doña Gusta Caldo de Gallina 6 sobres|Doña Gusta|condimentos|2.80|48
Vinagre Tinto Derby 1L|Derby|condimentos|2.90|12
Ají Amarillo Tarí Alacena 85g|Alacena|condimentos|3.20|24
Galleta Soda Field 6 pack|Field|galletas|3.90|20
Galleta Casino Menta 6 pack|Field|galletas|4.80|20
Galleta Morochas 6 pack|Nestlé|galletas|4.90|20
Galleta Oreo Original pack 6 x 2|Oreo|galletas|8.20|10
Galleta Ritz Original 6 pack|Ritz|galletas|4.40|20
Galleta Chomp 6 pack|Chomp|galletas|3.60|20
Wafer Nik Fresa 6 pack|Nik|galletas|3.40|20
Chocolate Sublime Clásico 26g|Nestlé|galletas|2.40|24
Caramelos Halls Menta x 9|Halls|galletas|2.20|24
Papas Lay's Clásicas 140g|Lay's|snacks|6.50|20
Doritos Queso Fuego 90g|Doritos|snacks|5.20|20
Cheese Tris Queso 120g|Cheese Tris|snacks|5.00|20
Piqueo Snax Original 190g|Frito Lay|snacks|9.00|20
Inka Chips Chifle Salado 135g|Inka Chips|snacks|6.90|20
Tostones Inka Chips 100g|Inka Chips|snacks|5.90|30
Maní Karinto Clásico Salado 100g|Karinto|snacks|4.20|30
Agua Cielo sin gas 625ml|Cielo|bebidas|1.20|15
Agua San Mateo sin gas 2.5L|San Mateo|bebidas|3.20|6
Agua San Mateo con gas 600ml|San Mateo|bebidas|1.80|15
Bebida Frugos Durazno 1L|Frugos|bebidas|4.50|12
Néctar Pulp Durazno 315ml|Pulp|bebidas|1.20|24
Sporade Tropical 500ml|Sporade|bebidas|2.20|12
Energizante Volt Original 300ml|Volt|bebidas|1.90|12
Té Helado Lipton Limón 500ml|Lipton|bebidas|2.50|12
Inca Kola 3L|Inca Kola|gaseosas|12.50|4
Inca Kola 600ml|Inca Kola|gaseosas|3.60|12
Coca-Cola Sin Azúcar 2.25L|Coca-Cola|gaseosas|9.90|6
Coca-Cola 1.5L|Coca-Cola|gaseosas|7.20|6
Guaraná Backus 3L|Guaraná|gaseosas|7.90|4
Gaseosa KR Piña 3.03L|KR|gaseosas|4.90|6
Big Cola 3.03L|Big Cola|gaseosas|6.90|6
Oro Amarilla 3.03L|Oro|gaseosas|6.50|4
Sprite 2.25L|Sprite|gaseosas|6.50|6
Cerveza San Juan lata 355ml six pack|San Juan|cervezas|22.90|4
Cerveza Pilsen Callao lata 269ml|Pilsen|cervezas|4.50|24
Cerveza Cristal lata 355ml x12|Cristal|cervezas|29.90|2
Cerveza Cusqueña Dorada 310ml six pack|Cusqueña|cervezas|26.90|4
Cerveza Corona Extra lata 473ml|Corona|cervezas|5.90|24
Ron Cartavio Black 750ml|Cartavio|cervezas|29.90|12
Pisco Quebranta Santiago Queirolo 750ml|Queirolo|cervezas|27.90|12
Vino Tabernero Borgoña 750ml|Tabernero|cervezas|19.90|12
Detergente Líquido Ariel Revitacolor 1.2L|Ariel|limpieza|24.90|6
Detergente Bolívar Cuidado y Suavidad 2.4kg|Bolívar|limpieza|26.50|6
Detergente Opal Ultra 730g|Opal|limpieza|8.50|12
Detergente Ace Limón 4kg|Ace|limpieza|39.90|4
Jabón Bolívar Bebé 190g|Bolívar|limpieza|3.90|50
Lavavajilla Sapolio Limón en pasta 800g|Sapolio|limpieza|6.40|12
Lejía Clorox 4L|Clorox|limpieza|12.90|4
Limpiatodo Poett Lavanda 900ml|Poett|limpieza|5.90|12
Papel Higiénico Elite Doble Hoja x 40|Elite|limpieza|20.50|2
Papel Higiénico Suave x 4|Suave|limpieza|5.50|12
Shampoo Head & Shoulders 375ml|Head & Shoulders|cuidado|19.90|12
Shampoo Sedal Ceramidas 340ml|Sedal|cuidado|12.90|12
Pasta Dental Colgate Triple Acción 75ml|Colgate|cuidado|4.50|24
Pasta Dental Dento Máxima Blancura 75ml|Dento|cuidado|4.50|24
Jabón Protex Avena x 3|Protex|cuidado|9.90|12
Toallas Higiénicas Nosotras Invisible Natural x 30|Nosotras|cuidado|10.60|12
Desodorante Rexona Clinical 48g|Rexona|cuidado|16.90|12
Máquina de Afeitar Gillette Prestobarba x 2|Gillette|cuidado|6.90|24
Pañales Huggies Natural Care G x 52|Huggies|bebes|62.90|4
Pañales Babysec Premium M x 68|Babysec|bebes|50.90|4
Pañales Pampers Recién Nacido RN x 20|Pampers|bebes|15.90|12
Toallitas Húmedas Huggies x 80|Huggies|bebes|8.90|12
Fórmula Infantil NAN 1 Optipro HMO 400g|Nestlé|bebes|54.90|6
Comida Perro Ricocan Adulto Razas Pequeñas 15kg|Ricocan|mascotas|89.90|1
Comida Perro Mimaskot Cachorro 1kg|Mimaskot|mascotas|9.90|10
Comida Gato Ricocat Gatito Pescado y Leche 1kg|Ricocat|mascotas|11.90|10
Comida Perro Thor 25kg|Thor|mascotas|99.00|1
Vasos Descartables Pamolsa 6.5oz x 50|Pamolsa|descartables|3.50|20
Platos Biodegradables U-Thil 6 pulg x 25|U-Thil|descartables|9.90|20
Bolsas de Basura Virutex 75L x 10|Virutex|descartables|8.90|20
Servilletas Elite x 300|Elite|descartables|4.90|20
Papel Aluminio Reynolds 7.6m|Reynolds|descartables|5.90|24
Bolsas Herméticas con Cierre Bell's x 20|Bell's|descartables|8.50|20`;

const COLORS = ['#d7141a','#1e5aa8','#0b8a3e','#f2a900','#6a2c91','#e35d0e','#0a7f8c','#8b5a2b','#c2185b','#1b1b1b'];
const hash = s => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
window.PRODUCTS = RAW.trim().split('\n').map((l, i) => {
  const [n, m, c, p, caja] = l.split('|');
  const h = hash(n), price = +p;
  return {
    id: 'P' + String(1001 + i), sku: '775' + String(h % 1e10).padStart(10, '0'), n, m, c, price,
    caja: +caja, color: COLORS[h % COLORS.length], stock: h % 9 === 0 ? 0 : 6 + (h % 240),
    oferta: h % 5 === 0 ? Math.round(price * (0.85 + (h % 3) * 0.03) * 10) / 10 : null,
    nuevo: h % 11 === 0,
  };
});
// Escalas por volumen (en producción: las de SiempreSoft). factor sobre el precio base.
window.TIERS = { publico: [[1, 1], [6, 0.96], [12, 0.92]], bodega: [[1, 0.9], [6, 0.87], [12, 0.84], [48, 0.81]] };
// Zonas estimadas desde Nueva Cajamarca (ajustables en el panel; se confirman en la demo)
window.ZONAS = [
  { id: 'nc', n: 'Nueva Cajamarca (radio urbano)', costo: 3, km: 0, gratis: 300 },
  { id: 'ucr', n: 'Ucrania', costo: 5, km: 3 },
  { id: 'tah', n: 'Tahuantinsuyo', costo: 5, km: 4 },
  { id: 'jer', n: 'Segunda Jerusalén', costo: 6, km: 7 },
  { id: 'sfe', n: 'San Fernando', costo: 7, km: 8 },
  { id: 'aza', n: 'Azunguillo', costo: 10, km: 13 },
  { id: 'yur', n: 'Yuracyacu', costo: 12, km: 16 },
  { id: 'nar', n: 'Naranjos', costo: 14, km: 18 },
  { id: 'pos', n: 'Posic', costo: 16, km: 21 },
  { id: 'rio', n: 'Rioja', costo: 20, km: 25 },
];
// Productos con foto en assets/p/<id>.webp (imágenes referenciales de fabricantes y tiendas peruanas, ver assets/p/creditos.json); el resto cae al dibujo SVG.
window.FOTOS = new Set(["P1001", "P1002", "P1003", "P1004", "P1005", "P1006", "P1007", "P1008", "P1009", "P1010", "P1011", "P1012", "P1013", "P1014", "P1015", "P1016", "P1017", "P1018", "P1019", "P1020", "P1021", "P1022", "P1023", "P1024", "P1025", "P1026", "P1027", "P1028", "P1029", "P1030", "P1031", "P1032", "P1033", "P1034", "P1035", "P1036", "P1037", "P1038", "P1039", "P1040", "P1041", "P1042", "P1043", "P1044", "P1045", "P1046", "P1047", "P1048", "P1049", "P1050", "P1051", "P1052", "P1053", "P1054", "P1055", "P1056", "P1057", "P1058", "P1059", "P1060", "P1061", "P1062", "P1063", "P1064", "P1065", "P1066", "P1067", "P1068", "P1069", "P1070", "P1071", "P1072", "P1073", "P1074", "P1075", "P1076", "P1077", "P1078", "P1079", "P1080", "P1081", "P1082", "P1083", "P1084", "P1085", "P1086", "P1087", "P1088", "P1089", "P1090", "P1091", "P1092", "P1093", "P1094", "P1095", "P1096", "P1097", "P1098", "P1099", "P1100", "P1101", "P1102", "P1103", "P1104", "P1105", "P1106", "P1107", "P1108", "P1109", "P1110", "P1111", "P1112", "P1113", "P1114", "P1115", "P1116", "P1117", "P1118", "P1119", "P1120", "P1121", "P1122", "P1123", "P1124", "P1125", "P1126", "P1127", "P1128", "P1129", "P1130", "P1131", "P1132", "P1133", "P1134", "P1135", "P1136"]);
