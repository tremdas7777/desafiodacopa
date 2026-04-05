// Real Centauro store locations in Brazil
// Source: brasil-shoppings.com.br (verified addresses)

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
  { name: "Centauro - Shopping Morumbi", city: "São Paulo", uf: "SP", number: "1003", address: "Av. Roque Petroni Junior, 1089 - Vila Gertrudes" },
  { name: "Centauro - Shopping Anália Franco", city: "São Paulo", uf: "SP", number: "1004", address: "Av. Regente Feijó, 1739 - Tatuapé" },
  { name: "Centauro - Shopping Center Norte", city: "São Paulo", uf: "SP", number: "1005", address: "Travessa Casalbuono, 120 - Vila Guilherme" },
  { name: "Centauro - Shopping Aricanduva", city: "São Paulo", uf: "SP", number: "1006", address: "Av. Aricanduva, 5555 - Vila Matilde" },
  { name: "Centauro - Shopping SP Market", city: "São Paulo", uf: "SP", number: "1008", address: "Av. das Nações Unidas, 22540 - Jurubatuba" },
  { name: "Centauro - Shopping Vila Olímpia", city: "São Paulo", uf: "SP", number: "1010", address: "Rua Olimpíadas, 360 - Vila Olímpia" },
  { name: "Centauro - Shopping Bourbon", city: "São Paulo", uf: "SP", number: "1011", address: "Rua Turiassú, 2100 - Pompéia" },
  { name: "Centauro - Shopping D", city: "São Paulo", uf: "SP", number: "1012", address: "Av. Cruzeiro do Sul, 1100 - Canindé" },
  { name: "Centauro - Shopping Pátio Higienópolis", city: "São Paulo", uf: "SP", number: "1013", address: "Av. Higienópolis, 618 - Higienópolis" },
  { name: "Centauro - Jardim Sul Shopping", city: "São Paulo", uf: "SP", number: "1014", address: "Av. Giovanni Gronchi, 5819 - Morumbi" },
  { name: "Centauro - Mooca Shopping Plaza", city: "São Paulo", uf: "SP", number: "1015", address: "R. Capitão Pacheco e Chaves, 313 - Mooca" },
  { name: "Centauro - Santana Parque Shopping", city: "São Paulo", uf: "SP", number: "1016", address: "R. Conselheiro Moreira de Barros, 2780 - Lauzane Paulista" },
  { name: "Centauro - Shopping Metrô Tucuruvi", city: "São Paulo", uf: "SP", number: "1017", address: "Av. Dr Antonio Maria Laet, 566 - Tucuruvi" },
  { name: "Centauro - West Plaza", city: "São Paulo", uf: "SP", number: "1018", address: "Av. Francisco Matarazzo, s/n - Água Branca" },
  { name: "Centauro - Tietê Plaza Shopping", city: "São Paulo", uf: "SP", number: "1019", address: "Av. Raimundo Pereira de Magalhães, 1465 - Pirituba" },
  { name: "Centauro - Boavista Shopping", city: "São Paulo", uf: "SP", number: "1050", address: "Rua Borba Gato, 59 - Santo Amaro" },
  { name: "Centauro - Shopping Central Plaza", city: "São Paulo", uf: "SP", number: "1051", address: "Av. Dr. Francisco Mesquita, 1000 - Vila Prudente" },
  { name: "Centauro - Shopping Metrô Santa Cruz", city: "São Paulo", uf: "SP", number: "1052", address: "Rua Domingos de Morais, 2564 - Vila Mariana" },
  { name: "Centauro - Raposo Shopping", city: "São Paulo", uf: "SP", number: "1053", address: "Rodovia Raposo Tavares, Km 14,5 - Jardim Boa Vista" },
  // São Paulo - Interior / Grande SP
  { name: "Centauro - Shopping Tamboré", city: "Barueri", uf: "SP", number: "1020", address: "Av. Piracema, 669 - Tamboré" },
  { name: "Centauro - Shopping Granja Vianna", city: "Cotia", uf: "SP", number: "1021", address: "Rodovia Raposo Tavares, 23500 - Lageadinho" },
  { name: "Centauro - Mogi Shopping", city: "Mogi das Cruzes", uf: "SP", number: "1022", address: "Av. Vereador Narciso Yague Guimarães, 1001 - Centro Cívico" },
  { name: "Centauro - Golden Square Shopping", city: "São Bernardo do Campo", uf: "SP", number: "1023", address: "Av. Kennedy, 700 - Jardim do Mar" },
  { name: "Centauro - Grand Plaza Shopping", city: "Santo André", uf: "SP", number: "1024", address: "Av. Industrial, 600 - Jardim" },
  { name: "Centauro - Shopping Internacional", city: "Guarulhos", uf: "SP", number: "1025", address: "Rodovia Presidente Dutra, Saída 225 - Itapejica" },
  { name: "Centauro - Shopping Bonsucesso", city: "Guarulhos", uf: "SP", number: "1026", address: "Av. Juscelino Kubitschek de Oliveira, 5308 - Jd. Albertina" },
  { name: "Centauro - Campinas Shopping", city: "Campinas", uf: "SP", number: "1030", address: "R. Jacy Teixeira de Camargo, 940 - Jardim do Lago" },
  { name: "Centauro - Parque D. Pedro Shopping", city: "Campinas", uf: "SP", number: "1031", address: "Av. Guilherme Campos, 500 - Jardim Santa Genebra" },
  { name: "Centauro - Shopping Parque das Bandeiras", city: "Campinas", uf: "SP", number: "1032", address: "Av. John Boyd Dunlop, 3900" },
  { name: "Centauro - RibeirãoShopping", city: "Ribeirão Preto", uf: "SP", number: "1033", address: "Av. Coronel Fernando Ferreira Leite, 1540 - Jardim Califórnia" },
  { name: "Centauro - Shopping Piracicaba", city: "Piracicaba", uf: "SP", number: "1034", address: "Av. Limeira, 722 - Vila Areião" },
  { name: "Centauro - Bauru Shopping", city: "Bauru", uf: "SP", number: "1035", address: "Rua Henrique Savi, 15-55 - Vila Nova Cidade Universitária" },
  { name: "Centauro - Prudenshopping", city: "Presidente Prudente", uf: "SP", number: "1036", address: "Av. Manoel Goulart, 2400 - Jd. das Rosas" },
  { name: "Centauro - Shopping Cidade Sorocaba", city: "Sorocaba", uf: "SP", number: "1037", address: "Av. Itavuvu, 3373 - Jd. Santa Cecília" },
  { name: "Centauro - Jundiaí Shopping", city: "Jundiaí", uf: "SP", number: "1038", address: "Av. Nove de Julho, 3333 - Anhangabaú" },
  { name: "Centauro - Litoral Plaza Shopping", city: "Praia Grande", uf: "SP", number: "1039", address: "Av. Ayrton Senna da Silva, 1511 - Boqueirão" },
  { name: "Centauro - Shopping Pátio Limeira", city: "Limeira", uf: "SP", number: "1040", address: "Rua Carlos Gomes, 1321 - Centro" },
  { name: "Centauro - CenterVale Shopping", city: "São José dos Campos", uf: "SP", number: "1042", address: "Av. Deputado Benedito Matarazzo, 9403 - Jd. Oswaldo Cruz" },
  { name: "Centauro - Shopping ABC", city: "Santo André", uf: "SP", number: "1044", address: "Av. Pereira Barreto, 42 - Vila Dora" },
  { name: "Centauro - Park Shopping São Caetano", city: "São Caetano do Sul", uf: "SP", number: "1045", address: "Alameda Terracota, 545 - Espaço Cerâmica" },
  { name: "Centauro - Super Shopping Osasco", city: "Osasco", uf: "SP", number: "1046", address: "Av. Autonomistas, 1828" },
  { name: "Centauro - Shopping União Osasco", city: "Osasco", uf: "SP", number: "1047", address: "Av. dos Autonomistas, 1400 - Vila Yara" },
  { name: "Centauro - Shopping Taboão", city: "Taboão da Serra", uf: "SP", number: "1048", address: "Rodovia Régis Bittencourt, 2643 - Cidade Intercap" },
  { name: "Centauro - São Bernardo Plaza", city: "São Bernardo do Campo", uf: "SP", number: "1049", address: "Av. Rotary, 624 - Ferrazópolis" },
  { name: "Centauro - Shopping Praça da Moça", city: "Diadema", uf: "SP", number: "1054", address: "Rua Manoel da Nóbrega, 712 - Centro" },
  { name: "Centauro - Shopping Rio Claro", city: "Rio Claro", uf: "SP", number: "1055", address: "Av. Conde Francisco Matarazzo Jr., 205 - Vila Paulista" },
  { name: "Centauro - Franca Shopping", city: "Franca", uf: "SP", number: "1056", address: "Av. Rio Negro, 1100 - Jardim Roselândia" },
  { name: "Centauro - Marília Shopping", city: "Marília", uf: "SP", number: "1057", address: "Rua Tucunarés, 500 - Jd. Maria Martha" },
  { name: "Centauro - Plaza Shopping Itu", city: "Itu", uf: "SP", number: "1058", address: "Av. Dr. Ermelindo Maffei, 1199 - Jd. Paraíso" },
  { name: "Centauro - Polo Shopping Indaiatuba", city: "Indaiatuba", uf: "SP", number: "1059", address: "Alameda Filtros Mann, 670" },
  { name: "Centauro - Suzano Shopping", city: "Suzano", uf: "SP", number: "1060", address: "Rua Sete de Setembro, 555 - Jardim Iraí" },
  // Rio de Janeiro
  { name: "Centauro - BarraShopping", city: "Rio de Janeiro", uf: "RJ", number: "2001", address: "Av. das Américas, 4666 - Barra da Tijuca" },
  { name: "Centauro - Shopping Tijuca", city: "Rio de Janeiro", uf: "RJ", number: "2002", address: "Av. Maracanã, 987 - Tijuca" },
  { name: "Centauro - NorteShopping", city: "Rio de Janeiro", uf: "RJ", number: "2003", address: "Av. Dom Hélder Câmara, 5474 - Cachambi" },
  { name: "Centauro - Shopping Nova América", city: "Rio de Janeiro", uf: "RJ", number: "2004", address: "Av. Pastor Martin Luther King Jr., 126 - Del Castilho" },
  { name: "Centauro - West Shopping", city: "Rio de Janeiro", uf: "RJ", number: "2005", address: "Estrada do Mendanha, 555 - Campo Grande" },
  { name: "Centauro - Botafogo Praia Shopping", city: "Rio de Janeiro", uf: "RJ", number: "2006", address: "Praia de Botafogo, 400 - Botafogo" },
  { name: "Centauro - Boulevard Rio Shopping", city: "Rio de Janeiro", uf: "RJ", number: "2007", address: "Rua Barão de São Francisco, 236 - Vila Isabel" },
  { name: "Centauro - Shopping Rio Sul", city: "Rio de Janeiro", uf: "RJ", number: "2008", address: "Rua Lauro Sodré, 446 - Botafogo" },
  { name: "Centauro - Shopping Leblon", city: "Rio de Janeiro", uf: "RJ", number: "2009", address: "Av. Afrânio de Melo Franco, 290 - Leblon" },
  { name: "Centauro - Park Shopping Campo Grande", city: "Rio de Janeiro", uf: "RJ", number: "2013", address: "Estrada do Monteiro, 1200 - Campo Grande" },
  { name: "Centauro - Madureira Shopping", city: "Rio de Janeiro", uf: "RJ", number: "2014", address: "Estrada do Portela, 222 - Madureira" },
  { name: "Centauro - Shopping Bangu", city: "Rio de Janeiro", uf: "RJ", number: "2015", address: "Rua Fonseca, 240 - Bangu" },
  { name: "Centauro - Shopping Jardim Guadalupe", city: "Rio de Janeiro", uf: "RJ", number: "2016", address: "Av. Brasil, 22155 - Barros Filho" },
  { name: "Centauro - Shopping Via Brasil", city: "Rio de Janeiro", uf: "RJ", number: "2017", address: "Rua Itapera, 500 - Irajá" },
  { name: "Centauro - Ilha Plaza Shopping", city: "Rio de Janeiro", uf: "RJ", number: "2018", address: "Av. Maestro Paulo e Silva, 400 - Ilha do Governador" },
  { name: "Centauro - Shopping Metropolitano Barra", city: "Rio de Janeiro", uf: "RJ", number: "2019", address: "Av. Abelardo Bueno, 1300 - Barra da Tijuca" },
  { name: "Centauro - Plaza Shopping Niterói", city: "Niterói", uf: "RJ", number: "2011", address: "Rua Quinze de Novembro, 8 - Centro" },
  { name: "Centauro - São Gonçalo Shopping", city: "São Gonçalo", uf: "RJ", number: "2020", address: "Av. São Gonçalo, 100 - Boa Vista" },
  { name: "Centauro - Shopping Grande Rio", city: "São João de Meriti", uf: "RJ", number: "2021", address: "Rua Maria Soares Sendas, 111" },
  { name: "Centauro - Boulevard Shopping Campos", city: "Campos dos Goytacazes", uf: "RJ", number: "2022", address: "Av. Dr. Sílvio Bastos Tavares, 330 - Parque Rodoviário" },
  { name: "Centauro - Shopping Plaza Macaé", city: "Macaé", uf: "RJ", number: "2023", address: "Av. Aluísio da Silva Gomes, 800 - Granja dos Cavaleiros" },
  // Minas Gerais
  { name: "Centauro - BH Shopping", city: "Belo Horizonte", uf: "MG", number: "3001", address: "BR 356, 3049 - Belvedere" },
  { name: "Centauro - Shopping Del Rey", city: "Belo Horizonte", uf: "MG", number: "3002", address: "Av. Presidente Carlos Luz, 3001 - Pampulha" },
  { name: "Centauro - Pátio Savassi", city: "Belo Horizonte", uf: "MG", number: "3003", address: "Av. do Contorno, 6061 - Funcionários" },
  { name: "Centauro - Boulevard Shopping BH", city: "Belo Horizonte", uf: "MG", number: "3004", address: "Av. dos Andradas, 3000 - Santa Efigênia" },
  { name: "Centauro - Minas Shopping", city: "Belo Horizonte", uf: "MG", number: "3005", address: "Av. Cristiano Machado, 4000 - União" },
  { name: "Centauro - Shopping Estação BH", city: "Belo Horizonte", uf: "MG", number: "3006", address: "Av. Cristiano Machado, 11833 - Venda Nova" },
  { name: "Centauro - Shopping Cidade BH", city: "Belo Horizonte", uf: "MG", number: "3007", address: "Rua Tupis, 337 - Centro" },
  { name: "Centauro - ViaShopping", city: "Belo Horizonte", uf: "MG", number: "3008", address: "Av. Afonso Vaz de Melo, 640 - Barreiro" },
  { name: "Centauro - Center Shopping", city: "Uberlândia", uf: "MG", number: "3010", address: "Av. João Naves de Ávila, 1331" },
  { name: "Centauro - Praça Uberaba Shopping", city: "Uberaba", uf: "MG", number: "3011", address: "Av. Leopoldino de Oliveira, 5100 - Mercês" },
  { name: "Centauro - Independência Shopping", city: "Juiz de Fora", uf: "MG", number: "3012", address: "Av. Presidente Itamar Franco, 3600 - Cascatinha" },
  { name: "Centauro - Metropolitan Shopping Betim", city: "Betim", uf: "MG", number: "3013", address: "BR-381, Km 492, 601 - São João" },
  { name: "Centauro - Montes Claros Shopping", city: "Montes Claros", uf: "MG", number: "3014", address: "Av. Donato Quintino, 90" },
  { name: "Centauro - Shopping Poços de Caldas", city: "Poços de Caldas", uf: "MG", number: "3015", address: "Av. Silvio Monteiro dos Santos, 180" },
  { name: "Centauro - Shopping Sete Lagoas", city: "Sete Lagoas", uf: "MG", number: "3016", address: "Rua Otávio Campelo Ribeiro, 2801 - Bairro Eldorado" },
  // Paraná
  { name: "Centauro - ParkShopping Barigüi", city: "Curitiba", uf: "PR", number: "4002", address: "Rua Prof. Pedro Viriato Parigot de Souza, 600 - Ecoville" },
  { name: "Centauro - Shopping Estação Curitiba", city: "Curitiba", uf: "PR", number: "4003", address: "Av. Sete de Setembro, 2775 - Rebouças" },
  { name: "Centauro - Shopping Palladium Curitiba", city: "Curitiba", uf: "PR", number: "4004", address: "Av. Presidente Kennedy, 4121 - Portão" },
  { name: "Centauro - Pátio Batel", city: "Curitiba", uf: "PR", number: "4005", address: "Av. do Batel, 1868 - Batel" },
  { name: "Centauro - Shopping Mueller", city: "Curitiba", uf: "PR", number: "4006", address: "Av. Cândido de Abreu, 127 - Centro Cívico" },
  { name: "Centauro - Catuaí Shopping Londrina", city: "Londrina", uf: "PR", number: "4010", address: "Rodovia Celso Garcia Cid, km 377 - Gleba Fazenda Palhano" },
  { name: "Centauro - Boulevard Londrina", city: "Londrina", uf: "PR", number: "4011", address: "Av. Theodoro Victorelli, 150 - Helena" },
  { name: "Centauro - Palladium Ponta Grossa", city: "Ponta Grossa", uf: "PR", number: "4012", address: "Rua Ermelino Leão, 703 - Olarias" },
  { name: "Centauro - Catuaí Shopping Maringá", city: "Maringá", uf: "PR", number: "4013", address: "Av. Colombo, 9161" },
  { name: "Centauro - Shopping São José", city: "São José dos Pinhais", uf: "PR", number: "4014", address: "Rua Izabel A Redentora, 1434 - Centro" },
  // Rio Grande do Sul
  { name: "Centauro - Bourbon Country", city: "Porto Alegre", uf: "RS", number: "5001", address: "Av. Túlio de Rose, 80" },
  { name: "Centauro - Bourbon Ipiranga", city: "Porto Alegre", uf: "RS", number: "5002", address: "Av. Ipiranga, 5200" },
  { name: "Centauro - Bourbon Wallig", city: "Porto Alegre", uf: "RS", number: "5003", address: "Av. Assis Brasil, 2611" },
  { name: "Centauro - Bourbon Novo Hamburgo", city: "Novo Hamburgo", uf: "RS", number: "5010", address: "Av. Nações Unidas, 2001" },
  { name: "Centauro - Bourbon São Leopoldo", city: "São Leopoldo", uf: "RS", number: "5011", address: "Av. Primeiro de Março, 821" },
  { name: "Centauro - Iguatemi Caxias do Sul", city: "Caxias do Sul", uf: "RS", number: "5012", address: "Rodovia RSC 453, 2780 Km 3,5" },
  { name: "Centauro - Shopping Pelotas", city: "Pelotas", uf: "RS", number: "5013", address: "Av. Ferreira Viana, 1526 - Areal" },
  // Santa Catarina
  { name: "Centauro - Beiramar Shopping", city: "Florianópolis", uf: "SC", number: "6001", address: "Rua Bocaiúva, 2468 - Centro" },
  { name: "Centauro - Floripa Shopping", city: "Florianópolis", uf: "SC", number: "6005", address: "Rodovia SC-401, 3116 - Saco Grande" },
  { name: "Centauro - Shopping Neumarkt", city: "Blumenau", uf: "SC", number: "6002", address: "Rua Sete de Setembro, 1213 - Centro" },
  { name: "Centauro - Blumenau Norte Shopping", city: "Blumenau", uf: "SC", number: "6006", address: "Rodovia BR 470, 300 - Salto do Norte" },
  { name: "Centauro - Garten Shopping", city: "Joinville", uf: "SC", number: "6003", address: "Av. Rolf Wiest, 333 - Bom Retiro" },
  { name: "Centauro - Balneário Shopping", city: "Balneário Camboriú", uf: "SC", number: "6004", address: "Av. Santa Catarina, 1 - Bairro dos Estados" },
  { name: "Centauro - Continente Park Shopping", city: "São José", uf: "SC", number: "6007", address: "Rodovia BR 101 KM 211, Esquina Rod. SC 407 - Distrito Industrial" },
  { name: "Centauro - Shopping Pátio Chapecó", city: "Chapecó", uf: "SC", number: "6008", address: "Av. Fernando Machado-D, 4000 - Líder" },
  // Distrito Federal
  { name: "Centauro - ParkShopping Brasília", city: "Brasília", uf: "DF", number: "7001", address: "SAI/SO Área 6580 - Guará" },
  { name: "Centauro - Conjunto Nacional", city: "Brasília", uf: "DF", number: "7002", address: "SDN Conjunto A - Asa Norte" },
  { name: "Centauro - Brasília Shopping", city: "Brasília", uf: "DF", number: "7003", address: "SCN Qd. 05 Bloco A" },
  { name: "Centauro - Pátio Brasil Shopping", city: "Brasília", uf: "DF", number: "7004", address: "SCS Quadra 07 Bl. A s/n" },
  { name: "Centauro - Boulevard Shopping Brasília", city: "Brasília", uf: "DF", number: "7005", address: "Setor Terminal Norte Conjunto J" },
  { name: "Centauro - Taguatinga Shopping", city: "Taguatinga", uf: "DF", number: "7006", address: "QS 01 Rua 210, lote 40 - Pistão Sul" },
  { name: "Centauro - Alameda Shopping", city: "Taguatinga", uf: "DF", number: "7007", address: "CSB 02 Lotes 01 a 04" },
  // Goiás
  { name: "Centauro - Goiânia Shopping", city: "Goiânia", uf: "GO", number: "7010", address: "Av. T-10, 1300 - Setor Bueno" },
  { name: "Centauro - Flamboyant Shopping", city: "Goiânia", uf: "GO", number: "7011", address: "Av. Jamel Cecílio, 3300 - Jardim Goiás" },
  { name: "Centauro - Shopping Bougainville", city: "Goiânia", uf: "GO", number: "7012", address: "Rua 9, 1855 - Setor Marista" },
  { name: "Centauro - Buriti Shopping", city: "Goiânia", uf: "GO", number: "7013", address: "Av. Rio Verde, Quadra 102/104 - Vila São Tomaz" },
  { name: "Centauro - Brasil Park Shopping", city: "Anápolis", uf: "GO", number: "7014", address: "Av. Brasil, 505 - Centro" },
  // Bahia
  { name: "Centauro - Shopping da Bahia", city: "Salvador", uf: "BA", number: "8001", address: "Av. Tancredo Neves, 148 - Caminho das Árvores" },
  { name: "Centauro - Shopping Barra", city: "Salvador", uf: "BA", number: "8002", address: "Av. Centenário, 2992 - Chame-Chame" },
  { name: "Centauro - Shopping Paralela", city: "Salvador", uf: "BA", number: "8003", address: "Av. Luiz Viana, 8544 - Paralela" },
  { name: "Centauro - Salvador Shopping", city: "Salvador", uf: "BA", number: "8004", address: "Av. Tancredo Neves, 3133 - Caminho das Árvores" },
  { name: "Centauro - Salvador Norte Shopping", city: "Salvador", uf: "BA", number: "8005", address: "Rodovia BA-526, 305 - São Cristóvão" },
  { name: "Centauro - Shopping Bela Vista", city: "Salvador", uf: "BA", number: "8006", address: "Al. Euvaldo Luz, 92 - Horto Bela Vista" },
  { name: "Centauro - Boulevard Shopping Feira", city: "Feira de Santana", uf: "BA", number: "8007", address: "Av. João Durval Carneiro, 3665 - Caseb" },
  // Pernambuco
  { name: "Centauro - Shopping Recife", city: "Recife", uf: "PE", number: "8010", address: "Rua Pe. Carapuceiro, 777 - Boa Viagem" },
  { name: "Centauro - RioMar Shopping Recife", city: "Recife", uf: "PE", number: "8011", address: "Av. República do Líbano, 251 - Pina" },
  { name: "Centauro - Shopping Tacaruna", city: "Recife", uf: "PE", number: "8012", address: "Av. Gov. Agamenon Magalhães, 153 - Santo Amaro" },
  { name: "Centauro - Shopping Plaza Casa Forte", city: "Recife", uf: "PE", number: "8013", address: "Rua Dr. João Santos Filho, 255 - Casa Forte" },
  { name: "Centauro - Shopping Guararapes", city: "Jaboatão dos Guararapes", uf: "PE", number: "8014", address: "Av. Barreto de Menezes, 800 - Piedade" },
  // Ceará
  { name: "Centauro - Shopping Iguatemi Fortaleza", city: "Fortaleza", uf: "CE", number: "8020", address: "Av. Washington Soares, 85 - Água Fria" },
  { name: "Centauro - RioMar Fortaleza", city: "Fortaleza", uf: "CE", number: "8021", address: "R. Des. Lauro Nogueira, 1500 - Papicu" },
  { name: "Centauro - North Shopping Fortaleza", city: "Fortaleza", uf: "CE", number: "8022", address: "Av. Bezerra de Menezes, 2450" },
  { name: "Centauro - Shopping Aldeota", city: "Fortaleza", uf: "CE", number: "8023", address: "Av. Dom Luís, 500 - Aldeota" },
  { name: "Centauro - Shopping Via Sul", city: "Fortaleza", uf: "CE", number: "8024", address: "Av. Washington Soares, 4335" },
  { name: "Centauro - Cariri Garden Shopping", city: "Juazeiro do Norte", uf: "CE", number: "8025", address: "Av. Padre Cícero, 2555 - Triângulo" },
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
  { name: "Centauro - Shopping Vila Velha", city: "Vila Velha", uf: "ES", number: "9002", address: "Av. Jerônimo Monteiro, 825 - Glória" },
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
 * Returns the store if found in the same city, or the first store in the same state (usually capital).
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
