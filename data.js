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
window.RAW = `Arroz Costeño Graneadito 5kg|Costeño|abarrotes|23.90|5
Arroz Paisana Extra 5kg|Paisana|abarrotes|22.50|5
Arroz Faraón Naranja 5kg|Faraón|abarrotes|24.90|5
Arroz Valle Norte Superior 750g|Valle Norte|abarrotes|4.20|20
Arroz Costeño Extra saco 50kg|Costeño|abarrotes|189.00|1
Arroz Pilado Selva Norte saco 49kg|Selva Norte|abarrotes|165.00|1
Azúcar Rubia Cartavio 1kg|Cartavio|abarrotes|4.30|10
Azúcar Rubia Paramonga 5kg|Paramonga|abarrotes|19.90|5
Azúcar Blanca Dulfina 1kg|Dulfina|abarrotes|5.20|10
Azúcar Rubia saco 50kg|Casa Grande|abarrotes|172.00|1
Sal de Mesa Emsal 1kg|Emsal|abarrotes|1.80|25
Aceite Primor Clásico 900ml|Primor|aceites|10.90|12
Aceite Cocinero 900ml|Cocinero|aceites|9.50|12
Aceite Ideal 1L|Ideal|aceites|9.20|12
Aceite Capri 900ml|Capri|aceites|9.90|12
Aceite Primor Premium 1.8L|Primor|aceites|21.50|6
Aceite Vegetal balde 18L|Cil|aceites|135.00|1
Manteca Famosa 400g|Famosa|aceites|6.40|20
Margarina Dorina 200g|Dorina|aceites|4.50|24
Fideo Spaghetti Don Vittorio 450g|Don Vittorio|fideos|3.90|20
Fideo Tallarín Molitalia 500g|Molitalia|fideos|3.50|20
Fideo Canuto Lavaggi 250g|Lavaggi|fideos|1.80|40
Fideo Cabello de Ángel Nicolini 250g|Nicolini|fideos|1.90|40
Fideo Corbata Don Vittorio 250g|Don Vittorio|fideos|2.20|40
Harina Blanca Flor 1kg|Blanca Flor|fideos|5.50|10
Harina Nicolini Preparada 1kg|Nicolini|fideos|5.90|10
Atún Florida Filete 140g|Florida|conservas|6.90|48
Atún Campomar Trozos 170g|Campomar|conservas|5.20|48
Grated de Atún A-1 170g|A-1|conservas|4.10|48
Sardina en Salsa de Tomate Gloria 425g|Gloria|conservas|6.50|24
Filete de Caballa Real 425g|Real|conservas|7.20|24
Durazno en Almíbar Aconcagua 820g|Aconcagua|conservas|9.90|12
Leche Gloria Azul Lata 400g|Gloria|lacteos|4.20|48
Leche Gloria Light 400g|Gloria|lacteos|4.40|48
Leche Ideal Amanecer 395g|Ideal|lacteos|3.50|48
Leche Pura Vida Nutrimax 395g|Pura Vida|lacteos|3.30|48
Leche Laive Sin Lactosa 400g|Laive|lacteos|4.50|24
Leche Condensada Nestlé 393g|Nestlé|lacteos|6.90|24
Yogurt Gloria Fresa 1L|Gloria|lacteos|7.50|12
Mantequilla Laive con Sal 200g|Laive|lacteos|9.90|20
Café Nescafé Tradición 180g|Nescafé|desayuno|19.90|12
Café Altomayo Instantáneo 190g|Altomayo|desayuno|17.50|12
Café Kirma 50g|Kirma|desayuno|6.90|24
Cocoa Winter's 160g|Winter's|desayuno|5.50|24
Avena Quaker 900g|Quaker|desayuno|8.90|12
Avena 3 Ositos Precocida 900g|3 Ositos|desayuno|7.20|12
Chocolate Sol del Cusco 90g|Sol del Cusco|desayuno|3.20|30
Mermelada Fanny Fresa 1kg|Fanny|desayuno|9.50|12
Infusión Manzanilla Herbi 25 sobres|Herbi|desayuno|3.20|24
Lenteja Costeño 500g|Costeño|menestras|4.90|20
Frejol Canario Costeño 500g|Costeño|menestras|6.90|20
Arveja Partida Valle Norte 500g|Valle Norte|menestras|3.90|20
Pallar Bebé Costeño 500g|Costeño|menestras|7.90|20
Garbanzo Costeño 500g|Costeño|menestras|5.90|20
Mayonesa Alacena 475g|Alacena|condimentos|10.90|12
Ketchup Alacena 400g|Alacena|condimentos|6.50|12
Sillao Kikko 500ml|Kikko|condimentos|5.20|12
Sibarita Ajinomen Sazonador 30 sobres|Sibarita|condimentos|4.80|20
Ajinomoto Ajino-sillao 500ml|Ajinomoto|condimentos|5.90|12
Doña Gusta Caldo de Gallina 8 cubos|Doña Gusta|condimentos|2.80|48
Vinagre Tinto Venturo 1L|Venturo|condimentos|3.90|12
Ají Panca Tarí 85g|Alacena|condimentos|3.20|24
Galleta Soda Field 6 pack|Field|galletas|3.90|20
Galleta Casino Menta 6 pack|Field|galletas|4.20|20
Galleta Morochas 8 pack|Nestlé|galletas|4.50|20
Galleta Oreo 6 pack|Oreo|galletas|4.90|20
Galleta Ritz Original 8 pack|Ritz|galletas|4.80|20
Galleta Chomp 6 pack|Chomp|galletas|3.60|20
Wafer Nik Fresa 6 pack|Nik|galletas|3.40|20
Chocolate Sublime Clásico 30g|Nestlé|galletas|1.80|24
Caramelos Halls Menta x 12|Halls|galletas|7.50|12
Papas Lay's Clásicas 150g|Lay's|snacks|7.90|20
Doritos Queso 140g|Doritos|snacks|7.50|20
Cheese Tris 145g|Karinto|snacks|5.90|20
Piqueo Snax 210g|Frito Lay|snacks|8.50|20
Inka Chips Clásicas 125g|Inka Crops|snacks|6.20|20
Chifles Selva Piuranos 150g|Selva|snacks|3.50|30
Maní Salado Karinto 140g|Karinto|snacks|3.90|30
Agua Cielo sin gas 625ml|Cielo|bebidas|1.20|15
Agua San Luis sin gas 2.5L|San Luis|bebidas|3.50|6
Agua San Mateo con gas 600ml|San Mateo|bebidas|1.80|15
Bebida Frugos Durazno 1L|Frugos|bebidas|4.50|12
Néctar Pulp Durazno 315ml|Pulp|bebidas|1.20|24
Sporade Tropical 500ml|Sporade|bebidas|2.20|12
Energizante Volt Maracuyá 300ml|Volt|bebidas|1.90|12
Té Helado Lipton 500ml|Lipton|bebidas|2.50|12
Inca Kola 3L|Inca Kola|gaseosas|12.50|4
Inca Kola 500ml|Inca Kola|gaseosas|2.50|12
Coca-Cola Sin Azúcar 3L|Coca-Cola|gaseosas|12.50|4
Coca-Cola 1.5L|Coca-Cola|gaseosas|7.20|6
Guaraná Backus 3L|Guaraná|gaseosas|8.90|4
Kola Real Amarilla 3.3L|Kola Real|gaseosas|7.50|4
Big Cola 3.03L|Big Cola|gaseosas|6.90|6
Oro Amarilla 3L|Oro|gaseosas|6.50|4
Sprite 1.5L|Sprite|gaseosas|6.20|6
Cerveza San Juan lata 355ml six pack|San Juan|cervezas|22.90|4
Cerveza Pilsen Callao 630ml|Pilsen|cervezas|6.90|12
Cerveza Cristal 650ml caja x12|Cristal|cervezas|72.00|1
Cerveza Cusqueña Dorada 330ml six pack|Cusqueña|cervezas|26.90|4
Cerveza Corona 355ml|Corona|cervezas|5.90|24
Ron Cartavio Black 750ml|Cartavio|cervezas|29.90|12
Pisco Quebranta Santiago Queirolo 700ml|Queirolo|cervezas|34.90|12
Vino Tabernero Borgoña 750ml|Tabernero|cervezas|19.90|12
Detergente Ariel 2kg|Ariel|limpieza|25.90|6
Detergente Bolívar 2.6kg|Bolívar|limpieza|29.90|6
Detergente Opal Ultra 900g|Opal|limpieza|9.90|12
Detergente Ace Limón 4kg|Ace|limpieza|39.90|4
Jabón Bolívar Bebé 190g|Bolívar|limpieza|3.90|50
Lavavajilla Sapolio Limón 900g|Sapolio|limpieza|7.90|12
Lejía Clorox 4L|Clorox|limpieza|12.90|4
Limpiatodo Poett Lavanda 900ml|Poett|limpieza|5.90|12
Papel Higiénico Elite Doble Hoja x 24|Elite|limpieza|26.90|4
Papel Higiénico Suave x 4|Suave|limpieza|5.50|12
Shampoo Head & Shoulders 375ml|Head & Shoulders|cuidado|19.90|12
Shampoo Sedal Ceramidas 340ml|Sedal|cuidado|12.90|12
Pasta Dental Colgate Triple Acción 75ml|Colgate|cuidado|4.50|24
Pasta Dental Dento 75ml|Dento|cuidado|2.90|24
Jabón Protex Avena x 3|Protex|cuidado|9.90|12
Toallas Higiénicas Nosotras Natural x 10|Nosotras|cuidado|5.50|24
Desodorante Rexona Clinical 48g|Rexona|cuidado|16.90|12
Máquina de Afeitar Gillette Prestobarba x 2|Gillette|cuidado|6.90|24
Pañales Huggies Natural Care G x 52|Huggies|bebes|62.90|4
Pañales Babysec Ultrasec M x 58|Babysec|bebes|49.90|4
Pañales Pampers Confort Sec XG x 40|Pampers|bebes|54.90|4
Toallitas Húmedas Huggies x 80|Huggies|bebes|8.90|12
Leche NAN 2 Optipro 800g|Nestlé|bebes|79.90|6
Comida Perro Ricocan Adulto 15kg|Ricocan|mascotas|89.90|1
Comida Perro Mimaskot Cachorro 1kg|Mimaskot|mascotas|9.90|10
Comida Gato Ricocat Pescado 1kg|Ricocat|mascotas|11.90|10
Comida Perro Thor 25kg|Thor|mascotas|99.00|1
Vasos Descartables 7oz x 50|Fénix|descartables|4.50|20
Platos Tecnopor N°9 x 25|Fénix|descartables|5.90|20
Bolsas Chequeras 14x20 x 100|Plastisur|descartables|6.50|20
Servilletas Elite x 300|Elite|descartables|4.90|20
Papel Aluminio Reynolds 7m|Reynolds|descartables|5.90|24
Tápers Descartables 1L x 25|Fénix|descartables|12.90|10`;

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
// Productos con foto en assets/p/<id>.webp (47 de Open Food Facts, el resto generadas con IA local); el resto cae al dibujo SVG.
window.FOTOS = new Set(["P1001", "P1002", "P1003", "P1004", "P1005", "P1006", "P1007", "P1008", "P1009", "P1010", "P1011", "P1012", "P1013", "P1014", "P1015", "P1016", "P1017", "P1018", "P1019", "P1020", "P1021", "P1022", "P1023", "P1024", "P1025", "P1026", "P1027", "P1028", "P1029", "P1030", "P1031", "P1032", "P1033", "P1034", "P1035", "P1036", "P1037", "P1038", "P1039", "P1040", "P1041", "P1042", "P1043", "P1044", "P1045", "P1046", "P1047", "P1048", "P1049", "P1050", "P1051", "P1052", "P1053", "P1054", "P1055", "P1056", "P1057", "P1058", "P1059", "P1060", "P1061", "P1062", "P1063", "P1064", "P1065", "P1066", "P1067", "P1068", "P1069", "P1070", "P1071", "P1072", "P1073", "P1074", "P1075", "P1076", "P1077", "P1078", "P1079", "P1080", "P1081", "P1082", "P1083", "P1084", "P1085", "P1086", "P1087", "P1088", "P1089", "P1090", "P1091", "P1092", "P1093", "P1094", "P1095", "P1096", "P1097", "P1098", "P1099", "P1100", "P1101", "P1102", "P1103", "P1104", "P1105", "P1106", "P1107", "P1108", "P1109", "P1110", "P1111", "P1112", "P1113", "P1114", "P1115", "P1116", "P1117", "P1118", "P1119", "P1120", "P1121", "P1122", "P1123", "P1124", "P1125", "P1126", "P1127", "P1128", "P1129", "P1130", "P1131", "P1132", "P1133", "P1134", "P1135", "P1136"]);
