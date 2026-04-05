// Real Centauro store locations in Brazil

export interface CentauroStore {
  name: string;
  city: string;
  uf: string;
  number: string;
  address: string;
}

export const CENTAURO_STORES: CentauroStore[] = [
  // São Paulo - Capital
  { name: "Centauro - Shopping Ibirapuera", city: "São Paulo", uf: "SP", number: "1001", address: "Av. Ibirapuera, 3103 - Moema" },
  { name: "Centauro - Shopping Eldorado", city: "São Paulo", uf: "SP", number: "1002", address: "Av. Rebouças, 3970 - Pinheiros" },
  { name: "Centauro - Shopping Morumbi", city: "São Paulo", uf: "SP", number: "1003", address: "Av. Roque Petroni Júnior, 1089 - Morumbi" },
  { name: "Centauro - Shopping Anália Franco", city: "São Paulo", uf: "SP", number: "1004", address: "Av. Regente Feijó, 1739 - Tatuapé" },
  { name: "Centauro - Shopping Center Norte", city: "São Paulo", uf: "SP", number: "1005", address: "Trav. Casalbuono, 120 - Vila Guilherme" },
  { name: "Centauro - Shopping Aricanduva", city: "São Paulo", uf: "SP", number: "1006", address: "Av. Aricanduva, 5555 - Aricanduva" },
  { name: "Centauro - Shopping Interlagos", city: "São Paulo", uf: "SP", number: "1007", address: "Av. Interlagos, 2255 - Interlagos" },
  { name: "Centauro - Shopping SP Market", city: "São Paulo", uf: "SP", number: "1008", address: "Av. das Nações Unidas, 22540 - Interlagos" },
  { name: "Centauro - Shopping Tatuapé", city: "São Paulo", uf: "SP", number: "1009", address: "R. Domingos Agostim, 91 - Tatuapé" },
  { name: "Centauro - Shopping Vila Olímpia", city: "São Paulo", uf: "SP", number: "1010", address: "R. Olimpíadas, 360 - Vila Olímpia" },
  // São Paulo - Interior / Grande SP
  { name: "Centauro - Shopping Tamboré", city: "Barueri", uf: "SP", number: "1020", address: "Av. Piracema, 669 - Tamboré" },
  { name: "Centauro - Shopping Granja Vianna", city: "Cotia", uf: "SP", number: "1021", address: "Rod. Raposo Tavares, km 23,5 - Granja Vianna" },
  { name: "Centauro - Shopping Mogi", city: "Mogi das Cruzes", uf: "SP", number: "1022", address: "Av. Vereador Narciso Yague Guimarães, 1001" },
  { name: "Centauro - Shopping Metrópole", city: "São Bernardo do Campo", uf: "SP", number: "1023", address: "Pç. Samuel Sabatini, 200 - Centro" },
  { name: "Centauro - Shopping ABC", city: "Santo André", uf: "SP", number: "1024", address: "Av. Pereira Barreto, 42 - Centro" },
  { name: "Centauro - Internacional Shopping", city: "Guarulhos", uf: "SP", number: "1025", address: "Rod. Presidente Dutra, s/n - Itapegica" },
  { name: "Centauro - Parque Shopping", city: "Campinas", uf: "SP", number: "1030", address: "R. Jacy Teixeira de Camargo, 940 - Parque Itália" },
  { name: "Centauro - Shopping Iguatemi Campinas", city: "Campinas", uf: "SP", number: "1031", address: "Av. Iguatemi, 777 - Vila Brandina" },
  { name: "Centauro - Shopping Iguatemi São José", city: "São José do Rio Preto", uf: "SP", number: "1032", address: "Av. Juscelino Kubitschek, 4335 - Iguatemi" },
  { name: "Centauro - RibeirãoShopping", city: "Ribeirão Preto", uf: "SP", number: "1033", address: "Av. Cel. Fernando Ferreira Leite, 1540" },
  { name: "Centauro - Shopping Piracicaba", city: "Piracicaba", uf: "SP", number: "1034", address: "Av. Limeira, 722 - Areião" },
  { name: "Centauro - Bauru Shopping", city: "Bauru", uf: "SP", number: "1035", address: "R. Henrique Savi, 15-55 - Vl. Sta. Tereza" },
  { name: "Centauro - Prudenshopping", city: "Presidente Prudente", uf: "SP", number: "1036", address: "Av. Manoel Goulart, 2400 - Centro" },
  { name: "Centauro - Shopping Sorocaba", city: "Sorocaba", uf: "SP", number: "1037", address: "Av. Itavuvu, 3373 - Jardim Santa Rosália" },
  { name: "Centauro - Shopping Jundiaí", city: "Jundiaí", uf: "SP", number: "1038", address: "Av. 9 de Julho, 1650 - Centro" },
  { name: "Centauro - Litoral Plaza Shopping", city: "Praia Grande", uf: "SP", number: "1039", address: "Av. Ayrton Senna da Silva, 1511 - Boqueirão" },
  { name: "Centauro - Shopping Pátio Limeira", city: "Limeira", uf: "SP", number: "1040", address: "R. Boa Morte, 225 - Centro" },
  { name: "Centauro - Taubaté Shopping", city: "Taubaté", uf: "SP", number: "1041", address: "Av. Charles Schnneider, 1700 - Centro" },
  { name: "Centauro - Shopping Colinas", city: "São José dos Campos", uf: "SP", number: "1042", address: "Av. São João, 2200 - Colinas" },
  { name: "Centauro - Shopping Santos", city: "Santos", uf: "SP", number: "1043", address: "R. Comendador Martins, 52 - Centro" },
  // Rio de Janeiro
  { name: "Centauro - BarraShopping", city: "Rio de Janeiro", uf: "RJ", number: "2001", address: "Av. das Américas, 4666 - Barra da Tijuca" },
  { name: "Centauro - Shopping Tijuca", city: "Rio de Janeiro", uf: "RJ", number: "2002", address: "Av. Maracanã, 987 - Tijuca" },
  { name: "Centauro - NorteShopping", city: "Rio de Janeiro", uf: "RJ", number: "2003", address: "Av. Dom Hélder Câmara, 5474 - Cachambi" },
  { name: "Centauro - Shopping Nova América", city: "Rio de Janeiro", uf: "RJ", number: "2004", address: "Av. Pastor Martin Luther King Jr., 126 - Del Castilho" },
  { name: "Centauro - West Shopping", city: "Rio de Janeiro", uf: "RJ", number: "2005", address: "Estr. do Mendanha, 555 - Campo Grande" },
  { name: "Centauro - Shopping Nova Iguaçu", city: "Nova Iguaçu", uf: "RJ", number: "2010", address: "Av. Abílio Augusto Távora, 1111 - Centro" },
  { name: "Centauro - Shopping Niterói", city: "Niterói", uf: "RJ", number: "2011", address: "R. da Conceição, 188 - Centro" },
  { name: "Centauro - Shopping Park Lagos", city: "Cabo Frio", uf: "RJ", number: "2012", address: "Av. Henrique Terra, 1700 - Parque Burle" },
  // Minas Gerais
  { name: "Centauro - BH Shopping", city: "Belo Horizonte", uf: "MG", number: "3001", address: "Rod. BR-356, 3049 - Belvedere" },
  { name: "Centauro - Shopping Del Rey", city: "Belo Horizonte", uf: "MG", number: "3002", address: "Av. Presidente Carlos Luz, 3001 - Caiçaras" },
  { name: "Centauro - Shopping Pátio Savassi", city: "Belo Horizonte", uf: "MG", number: "3003", address: "Av. do Contorno, 6061 - Savassi" },
  { name: "Centauro - Uberlândia Shopping", city: "Uberlândia", uf: "MG", number: "3010", address: "Av. Paulo Roberto C. Santos, 401 - Santa Mônica" },
  { name: "Centauro - Shopping Uberaba", city: "Uberaba", uf: "MG", number: "3011", address: "Av. Filomena Cartafina, 1111 - Estados Unidos" },
  { name: "Centauro - Independência Shopping", city: "Juiz de Fora", uf: "MG", number: "3012", address: "Av. Independência, 3500 - Cascatinha" },
  // Paraná
  { name: "Centauro - Shopping Curitiba", city: "Curitiba", uf: "PR", number: "4001", address: "R. Brigadeiro Franco, 2300 - Centro" },
  { name: "Centauro - ParkShopping Barigüi", city: "Curitiba", uf: "PR", number: "4002", address: "R. Prof. Pedro Viriato Parigot de Souza, 600 - Mossunguê" },
  { name: "Centauro - Shopping Estação", city: "Curitiba", uf: "PR", number: "4003", address: "Av. Sete de Setembro, 2775 - Rebouças" },
  { name: "Centauro - Catuaí Shopping", city: "Londrina", uf: "PR", number: "4010", address: "Rod. Celso Garcia Cid, km 377 - Gleba Palhano" },
  { name: "Centauro - Shopping Palladium", city: "Ponta Grossa", uf: "PR", number: "4011", address: "Av. Visconde de Taunay, 3990 - Ronda" },
  { name: "Centauro - Cataratas JL Shopping", city: "Foz do Iguaçu", uf: "PR", number: "4012", address: "Av. José Lopes Ferreira, 600 - Jd. Lancaster" },
  { name: "Centauro - Shopping Cidade Maringá", city: "Maringá", uf: "PR", number: "4013", address: "Av. São Paulo, 3800 - Zona 1" },
  // Rio Grande do Sul
  { name: "Centauro - Shopping Iguatemi POA", city: "Porto Alegre", uf: "RS", number: "5001", address: "Av. João Wallig, 1800 - Passo d'Areia" },
  { name: "Centauro - BarraShoppingSul", city: "Porto Alegre", uf: "RS", number: "5002", address: "Av. Diário de Notícias, 300 - Cristal" },
  { name: "Centauro - Shopping Praia de Belas", city: "Porto Alegre", uf: "RS", number: "5003", address: "Av. Praia de Belas, 1181 - Menino Deus" },
  { name: "Centauro - Shopping Bourbon Novo Hamburgo", city: "Novo Hamburgo", uf: "RS", number: "5010", address: "Av. José Pedro Steigleder, 300 - Canudos" },
  { name: "Centauro - Shopping Pelotas", city: "Pelotas", uf: "RS", number: "5011", address: "Av. Ferreira Viana, 1526 - Areal" },
  // Santa Catarina
  { name: "Centauro - Beiramar Shopping", city: "Florianópolis", uf: "SC", number: "6001", address: "R. Bocaiúva, 2468 - Centro" },
  { name: "Centauro - Shopping Neumarkt", city: "Blumenau", uf: "SC", number: "6002", address: "R. 7 de Setembro, 1213 - Centro" },
  { name: "Centauro - Shopping Garten", city: "Joinville", uf: "SC", number: "6003", address: "R. Max Colin, 1575 - América" },
  { name: "Centauro - Balneário Shopping", city: "Balneário Camboriú", uf: "SC", number: "6004", address: "Av. Santa Catarina, 1 - Dos Estados" },
  // Distrito Federal
  { name: "Centauro - ParkShopping Brasília", city: "Brasília", uf: "DF", number: "7001", address: "SAI/SO Área 6580 - Guará" },
  { name: "Centauro - Shopping Conjunto Nacional", city: "Brasília", uf: "DF", number: "7002", address: "SDN Conj. A - Asa Norte" },
  { name: "Centauro - Taguatinga Shopping", city: "Brasília", uf: "DF", number: "7003", address: "QS 1, Pistão Sul - Taguatinga" },
  // Goiás
  { name: "Centauro - Goiânia Shopping", city: "Goiânia", uf: "GO", number: "7010", address: "Av. T-10, 1300 - St. Bueno" },
  { name: "Centauro - Flamboyant Shopping", city: "Goiânia", uf: "GO", number: "7011", address: "Av. Jamel Cecílio, 3300 - Jd. Goiás" },
  // Bahia
  { name: "Centauro - Shopping da Bahia", city: "Salvador", uf: "BA", number: "8001", address: "Av. Tancredo Neves, 148 - Caminho das Árvores" },
  { name: "Centauro - Shopping Barra", city: "Salvador", uf: "BA", number: "8002", address: "Av. Centenário, 2992 - Chame-Chame" },
  { name: "Centauro - Shopping Paralela", city: "Salvador", uf: "BA", number: "8003", address: "Av. Luís Viana Filho, 8544 - Paralela" },
  // Pernambuco
  { name: "Centauro - Shopping Recife", city: "Recife", uf: "PE", number: "8010", address: "R. Padre Carapuceiro, 777 - Boa Viagem" },
  { name: "Centauro - Shopping RioMar Recife", city: "Recife", uf: "PE", number: "8011", address: "Av. República do Líbano, 251 - Pina" },
  // Ceará
  { name: "Centauro - Shopping Iguatemi Fortaleza", city: "Fortaleza", uf: "CE", number: "8020", address: "Av. Washington Soares, 85 - Edson Queiroz" },
  { name: "Centauro - RioMar Fortaleza", city: "Fortaleza", uf: "CE", number: "8021", address: "R. Des. Lauro Nogueira, 1500 - Papicu" },
  // Pará
  { name: "Centauro - Shopping Grão Pará", city: "Belém", uf: "PA", number: "8030", address: "Rod. Augusto Montenegro, km 8 - Coqueiro" },
  { name: "Centauro - Parque Shopping Belém", city: "Belém", uf: "PA", number: "8031", address: "Rod. Augusto Montenegro, km 8,5 - Parque Verde" },
  // Amazonas
  { name: "Centauro - Amazonas Shopping", city: "Manaus", uf: "AM", number: "8040", address: "Av. Djalma Batista, 482 - Chapada" },
  { name: "Centauro - Manauara Shopping", city: "Manaus", uf: "AM", number: "8041", address: "Av. Mário Ypiranga, 1300 - Adrianópolis" },
  // Maranhão
  { name: "Centauro - Shopping da Ilha", city: "São Luís", uf: "MA", number: "8050", address: "Av. Daniel de La Touche, 17 - Cohama" },
  // Rio Grande do Norte
  { name: "Centauro - Midway Mall", city: "Natal", uf: "RN", number: "8060", address: "Av. Bernardo Vieira, 3775 - Tirol" },
  // Paraíba
  { name: "Centauro - Manaíra Shopping", city: "João Pessoa", uf: "PB", number: "8070", address: "Av. Gov. Flávio Ribeiro Coutinho, 805 - Manaíra" },
  // Alagoas
  { name: "Centauro - Parque Shopping Maceió", city: "Maceió", uf: "AL", number: "8080", address: "Av. Gov. Gustavo Paiva, 2990 - Mangabeiras" },
  // Sergipe
  { name: "Centauro - Shopping Jardins", city: "Aracaju", uf: "SE", number: "8090", address: "Av. Min. Geraldo Barreto Sobral, 215 - Jardins" },
  // Piauí
  { name: "Centauro - Riverside Shopping", city: "Teresina", uf: "PI", number: "8100", address: "Av. Raul Lopes, 1000 - Noivos" },
  // Espírito Santo
  { name: "Centauro - Shopping Vitória", city: "Vitória", uf: "ES", number: "9001", address: "Av. Américo Buaiz, 200 - Enseada do Suá" },
  { name: "Centauro - Shopping Vila Velha", city: "Vila Velha", uf: "ES", number: "9002", address: "R. Luciano das Neves, 2418 - Centro" },
  // Mato Grosso
  { name: "Centauro - Shopping Pantanal", city: "Cuiabá", uf: "MT", number: "9010", address: "Av. Historiador Rubens de Mendonça, 945 - Bosque da Saúde" },
  // Mato Grosso do Sul
  { name: "Centauro - Shopping Campo Grande", city: "Campo Grande", uf: "MS", number: "9020", address: "Av. Afonso Pena, 4909 - Santa Fé" },
  // Rondônia
  { name: "Centauro - Porto Velho Shopping", city: "Porto Velho", uf: "RO", number: "9030", address: "Av. Calama, 4596 - Flodoaldo Pontes Pinto" },
  // Tocantins
  { name: "Centauro - Capim Dourado Shopping", city: "Palmas", uf: "TO", number: "9040", address: "Quadra 104 Sul, Av. LO-01 - Plano Diretor Sul" },
];

/**
 * Find the nearest Centauro store based on city and UF.
 * Returns the store if found in the same city, or the first store in the same state.
 * Returns null if no store exists in the state.
 */
export function findNearestStore(city: string, uf: string): CentauroStore | null {
  const normalizedCity = city.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  // Try exact city match first
  const cityMatch = CENTAURO_STORES.find(store => {
    const storeCity = store.city.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return storeCity === normalizedCity && store.uf === uf;
  });
  if (cityMatch) return cityMatch;

  // Try partial city match
  const partialMatch = CENTAURO_STORES.find(store => {
    const storeCity = store.city.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return (storeCity.includes(normalizedCity) || normalizedCity.includes(storeCity)) && store.uf === uf;
  });
  if (partialMatch) return partialMatch;

  // Fallback: first store in the same state (usually capital)
  const stateMatch = CENTAURO_STORES.find(store => store.uf === uf);
  return stateMatch || null;
}
