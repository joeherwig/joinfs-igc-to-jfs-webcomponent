'use strict';
// Writes src/joinfs-igc-to-jfs-<locale>.json from the table below (English lives in the script). Run: node tools/make-locales.cjs
// German uses the informal "du". Translations other than German are first drafts - corrections are welcome.
const fs = require('fs');
const path = require('path');

const KEYS = ['title', 'privacy', 'drop.prompt', 'drop.choose', 'drop.aria', 'loading', 'summary.pilot', 'summary.glider', 'summary.date',
  'summary.fixes', 'summary.duration', 'summary.altitudePressure', 'err.notIgc', 'err.noDate', 'err.noFixes', 'err.fewFixes', 'err.tooLarge',
  'err.read', 'err.noConverter'];

const T = {
  de: ['IGC-Flugaufzeichnung in eine JoinFS-Aufzeichnung umwandeln', 'Die Datei wird in deinem Browser gelesen und nirgendwohin hochgeladen.',
    'Zieh eine IGC-Datei hierher', 'Datei auswählen', 'Ablagebereich für eine IGC-Flugaufzeichnung', 'Flug wird gelesen…', 'Pilot', 'Segelflugzeug', 'Datum',
    'Positionen', 'Dauer', 'Höhe: vom Drucksensor (die Aufzeichnung enthält keine GPS-Höhe)', 'Das sieht nicht nach einer IGC-Datei aus.',
    'Das Flugdatum (HFDTE) fehlt oder ist ungültig.', 'In dieser Datei wurden keine GPS-Positionen (B-Zeilen) gefunden.',
    'Nur {n} Positionen gefunden; ein Flug braucht mindestens 2.', 'Die Datei ist zu groß (Limit {mb} MB).', 'Die Datei konnte nicht gelesen werden.',
    'Die GPX-Konverter-Komponente konnte nicht geladen werden ({src}).'],
  es: ['Convertir un registro de vuelo IGC en una grabación de JoinFS', 'El archivo se lee en tu navegador y no se sube a ningún sitio.',
    'Suelta aquí un archivo IGC', 'Elegir un archivo', 'Zona para soltar un registro de vuelo IGC', 'Leyendo el vuelo…', 'Piloto', 'Planeador', 'Fecha',
    'Posiciones', 'Duración', 'Altitud: del sensor de presión (el registro no tiene altitud GPS)', 'Esto no parece un archivo IGC.',
    'Falta la fecha del vuelo (HFDTE) o no es válida.', 'No se encontraron posiciones GPS (registros B) en este archivo.',
    'Solo se encontraron {n} posiciones; un vuelo necesita al menos 2.', 'El archivo es demasiado grande (límite: {mb} MB).', 'No se pudo leer el archivo.',
    'No se pudo cargar el componente conversor de GPX ({src}).'],
  fr: ['Convertir un journal de vol IGC en enregistrement JoinFS', 'Le fichier est lu dans ton navigateur et n’est envoyé nulle part.',
    'Dépose un fichier IGC ici', 'Choisir un fichier', 'Zone de dépôt pour un journal de vol IGC', 'Lecture du vol…', 'Pilote', 'Planeur', 'Date',
    'Positions', 'Durée', 'Altitude : issue du capteur de pression (le journal ne contient pas d’altitude GPS)', 'Ceci ne ressemble pas à un fichier IGC.',
    'La date du vol (HFDTE) est absente ou invalide.', 'Aucune position GPS (enregistrements B) trouvée dans ce fichier.',
    'Seulement {n} positions trouvées ; un vol en demande au moins 2.', 'Le fichier est trop volumineux (limite : {mb} Mo).', 'Le fichier n’a pas pu être lu.',
    'Le composant convertisseur GPX n’a pas pu être chargé ({src}).'],
  it: ['Converti un registro di volo IGC in una registrazione JoinFS', 'Il file viene letto nel tuo browser e non viene caricato da nessuna parte.',
    'Trascina qui un file IGC', 'Scegli un file', 'Area di rilascio per un registro di volo IGC', 'Lettura del volo…', 'Pilota', 'Aliante', 'Data',
    'Posizioni', 'Durata', 'Quota: dal sensore di pressione (il registro non contiene la quota GPS)', 'Questo non sembra un file IGC.',
    'La data del volo (HFDTE) manca o non è valida.', 'Nessuna posizione GPS (record B) trovata in questo file.',
    'Trovate solo {n} posizioni; un volo ne richiede almeno 2.', 'Il file è troppo grande (limite: {mb} MB).', 'Impossibile leggere il file.',
    'Impossibile caricare il componente convertitore GPX ({src}).'],
  ko: ['IGC 비행 기록을 JoinFS 녹화로 변환', '파일은 브라우저에서 읽으며 어디에도 업로드되지 않습니다.',
    'IGC 파일을 여기에 놓으세요', '파일 선택', 'IGC 비행 기록을 놓는 영역', '비행 기록을 읽는 중…', '조종사', '글라이더', '날짜',
    '위치 수', '소요 시간', '고도: 기압 센서 기준 (기록에 GPS 고도가 없습니다)', 'IGC 파일이 아닌 것 같습니다.',
    '비행 날짜(HFDTE)가 없거나 올바르지 않습니다.', '이 파일에서 GPS 위치(B 레코드)를 찾을 수 없습니다.',
    '위치가 {n}개뿐입니다. 비행에는 최소 2개가 필요합니다.', '파일이 너무 큽니다 (제한: {mb} MB).', '파일을 읽을 수 없습니다.',
    'GPX 변환기 구성 요소를 불러올 수 없습니다 ({src}).'],
  nl: ['Een IGC-vluchtlog omzetten naar een JoinFS-opname', 'Het bestand wordt in je browser gelezen en nergens geüpload.',
    'Sleep hier een IGC-bestand heen', 'Bestand kiezen', 'Dropzone voor een IGC-vluchtlog', 'Vlucht wordt gelezen…', 'Piloot', 'Zweefvliegtuig', 'Datum',
    'Posities', 'Duur', 'Hoogte: van de druksensor (de log bevat geen GPS-hoogte)', 'Dit lijkt geen IGC-bestand.',
    'De vluchtdatum (HFDTE) ontbreekt of is ongeldig.', 'In dit bestand zijn geen GPS-posities (B-records) gevonden.',
    'Slechts {n} posities gevonden; een vlucht heeft er minstens 2 nodig.', 'Het bestand is te groot (limiet: {mb} MB).', 'Het bestand kon niet worden gelezen.',
    'De GPX-converter-component kon niet worden geladen ({src}).'],
  pt: ['Converter um registo de voo IGC numa gravação do JoinFS', 'O ficheiro é lido no teu navegador e não é enviado para lado nenhum.',
    'Larga aqui um ficheiro IGC', 'Escolher um ficheiro', 'Área para largar um registo de voo IGC', 'A ler o voo…', 'Piloto', 'Planador', 'Data',
    'Posições', 'Duração', 'Altitude: do sensor de pressão (o registo não tem altitude GPS)', 'Isto não parece um ficheiro IGC.',
    'A data do voo (HFDTE) falta ou é inválida.', 'Não foram encontradas posições GPS (registos B) neste ficheiro.',
    'Só foram encontradas {n} posições; um voo precisa de pelo menos 2.', 'O ficheiro é demasiado grande (limite: {mb} MB).', 'Não foi possível ler o ficheiro.',
    'Não foi possível carregar o componente conversor de GPX ({src}).'],
  uk: ['Перетворення польотного журналу IGC на запис JoinFS', 'Файл читається у твоєму браузері й нікуди не завантажується.',
    'Перетягни сюди файл IGC', 'Вибрати файл', 'Область для скидання польотного журналу IGC', 'Читання польоту…', 'Пілот', 'Планер', 'Дата',
    'Позицій', 'Тривалість', 'Висота: з датчика тиску (у журналі немає висоти GPS)', 'Це не схоже на файл IGC.',
    'Дата польоту (HFDTE) відсутня або недійсна.', 'У цьому файлі не знайдено GPS-позицій (записів B).',
    'Знайдено лише {n} позицій; для польоту потрібно щонайменше 2.', 'Файл завеликий (ліміт: {mb} МБ).', 'Не вдалося прочитати файл.',
    'Не вдалося завантажити компонент конвертера GPX ({src}).'],
};

const out = path.join(__dirname, '..', 'src');
for (const [lang, values] of Object.entries(T)) {
  if (values.length !== KEYS.length) throw new Error(`${lang}: ${values.length} values for ${KEYS.length} keys`);
  const dict = Object.fromEntries(KEYS.map((k, i) => [k, values[i]]));
  fs.writeFileSync(path.join(out, `joinfs-igc-to-jfs-${lang}.json`), JSON.stringify(dict, null, 2) + '\n');
}
console.log('wrote', Object.keys(T).join(', '));
