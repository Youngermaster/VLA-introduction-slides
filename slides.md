---
theme: default
title: Del Token al Torque
titleTemplate: '%s'
# Local and relative: the default is fetched from a CDN (breaks offline), and a
# relative path keeps working if the deck is served from a subpath.
favicon: 'favicon.svg'
author: Juan Manuel Young Hoyos
info: |
  Del Token al Torque: cómo la IA aprendió a mover cosas en el mundo físico.
  Charla sobre modelos Vision-Language-Action para AI Medellín.
routeAlias: title
layout: scene
colorSchema: dark
aspectRatio: 16/9
canvasWidth: 980
routerMode: hash
mdc: true
selectable: false
# LEFT is this deck's current: every ordinary boundary uses it, and pressing
# left genuinely reverses rather than repeating. UP and the inverse-zoom
# ARRIVE are reserved vectors, spent only where they mean something.
transition: cut-left | cut-right
# Google's font CDN is resolved by the BROWSER at runtime, so `provider: google`
# is how an "offline" deck actually fails at a venue. Fonts are npm packages,
# imported in styles/index.ts.
fonts:
  provider: none
  sans: 'Instrument Sans Variable'
  mono: 'Geist Mono Variable'
drawings:
  persist: false
---

<Scene name="title" />

<!--
APERTURA (45 s). Habla ANTES de avanzar; deja que el título termine solo.

"Buenas noches. Me llamo Juan Manuel. Construí un brazo robótico en mi casa y le
enseñé a entender español. De eso vengo a hablar."

No te presentes largo. La credibilidad se gana en el demo, no aquí.
-->

---
layout: scene
routeAlias: hook
clicks: 2
---

<Scene name="hook" />

<!--
GANCHO (1 min). Haz la pregunta y CÁLLATE dos segundos.

Click 1: la respuesta fácil aparece... y se tacha sola. "Mover cosas es más
difícil que escribir. No es eso. O no es sólo eso."
Click 2: "Los datos son de otra naturaleza." Y pasas a la siguiente.
-->

---
layout: scene
routeAlias: data-asymmetry
clicks: 3
---

<Scene name="asymmetry" />

<!--
LA ASIMETRÍA (1 min 30 s). Esta diapositiva sostiene toda la charla.

Click 1: el torrente de texto. "GPT se entrenó con internet: texto que ya
estaba escrito, gratis."
Click 2: el brazo, episodio por episodio. "Cada barra son treinta segundos de
alguien moviendo un brazo. No se paraleliza, no se raspa de la web."
Click 3: el remate. PAUSA LARGA. Es el corazón de la charla.
-->

---
layout: scene
routeAlias: ch-vla
transition: rise-up
---

<Scene name="chapter" v="vla" />

<!-- TRANSICIÓN (10 s). "Entonces, ¿qué es exactamente un VLA?" -->

---
layout: scene
routeAlias: vla-acronym
clicks: 3
---

<Scene name="acronym" />

<!--
V · L · A (1 min 15 s). Una letra por click, una frase por letra.

Click 1 (V): "Vision. Ve el mundo con cámaras, y cada imagen se corta en
parches que se vuelven tokens."
Click 2 (L): "Language. Entiende lo que le pides, con el MISMO tokenizador de
un modelo de lenguaje."
Click 3 (A): "Action. Y aquí está lo nuevo: la salida no es texto, son
comandos de motor."

Cierra: "Ahora veamos las tres cosas pasar a la vez."
-->

---
layout: scene
routeAlias: vla-hero
clicks: 5
transition: arrive
---

<Scene name="vlaHero" />

<!--
UN PASO DE UN VLA (2 min 30 s). LA diapositiva de la charla. Ve lento.

Click 1 (ver): "La cámara ve la mesa. La imagen se parte en parches, y el
modelo reconoce qué hay: el Complejo B, la taza, el zinc, la bandeja."
Click 2 (leer): "Le escribo la instrucción. Se parte en tokens, igual que en
ChatGPT. Cada pedazo se vuelve un número."
Click 3 (ubicar): "Y aquí pasa la magia: las palabras 'zinc' y 'bandeja'
jalan la atención hacia esos dos objetos."
  HONESTIDAD: "las cajas son para que lo veamos nosotros. El modelo no dibuja
  cajas; esto pasa implícitamente dentro de su atención."
Click 4 (actuar): "Y salen siete números, treinta veces por segundo. Eso es
todo lo que el modelo produce." Deja correr el pick en silencio.
Click 5: "Un modelo. Ningún if."
-->

---
layout: scene
routeAlias: what-is-a-policy
clicks: 3
---

<Scene name="policy" />

<!--
QUÉ ES UNA POLÍTICA (1 min). Define el término antes de usarlo veinte veces.

Click 1: "o, la observación: las cámaras y dónde están las articulaciones."
Click 2: "ℓ, lo que le pediste. ACT no tiene este término; un VLA sí. Toda la
charla cabe en esa diferencia."
Click 3: "a, un BLOQUE de acciones, no una sola. Y ojo: esto NO es
reinforcement learning. No hay recompensa. Es copiar lo que hizo el humano."
-->

---
layout: scene
routeAlias: act-vs-vla
clicks: 3
---

<Scene name="actVsVla" />

<!--
ACT VS VLA (1 min 30 s). Tu anécdota real. Cuéntala como una decepción concreta.

Click 1: "Entrené ACT para agarrar el cubo rojo. Le hablo: 'agarra el azul'.
No existe el cable por donde entraría la frase. Agarra el rojo. Y si muevo el
cubo diez centímetros, cierra la pinza en el aire."
Click 2: "El VLA recibe la frase por la misma puerta que las imágenes."
Click 3: "ACT es un reflejo: buenísimo, y sordo. Un VLA es un reflejo que escucha."
-->

---
layout: scene
routeAlias: ch-inside
transition: rise-up
---

<Scene name="chapter" v="inside" />

<!-- TRANSICIÓN (10 s). "Esta es la parte técnica. Aguántenme diez minutos." -->

---
layout: scene
routeAlias: language-in
clicks: 3
---

<Scene name="langTokens" />

<!--
CÓMO ENTRA EL LENGUAJE (1 min 15 s).

Click 1: la plantilla. "No le pasas la frase suelta: la envuelves en una
pregunta fija. El modelo no aprende una tarea nueva, sigue prediciendo el
siguiente token."
Click 2: "El tokenizador es el MISMO de texto. 'Frasco' se parte en dos y no
pasa nada."
Click 3: "Cada token se vuelve un vector. Desde aquí, son sólo números."
-->

---
layout: scene
routeAlias: vision-in
clicks: 3
---

<Scene name="visionTokens" />

<!--
CÓMO ENTRA LA IMAGEN (1 min).

Click 1: "La imagen se corta en parches. SmolVLA usa 64 tokens por imagen."
Click 2: "Cada parche se vuelve un token, igual que una palabra."
Click 3: "Y todo se pega en UNA sola secuencia: imagen, texto y el estado del
brazo. El transformer no sabe cuáles eran píxeles y cuáles palabras."
-->

---
layout: scene
routeAlias: attention
clicks: 4
---

<Scene name="attention" />

<!--
ATENCIÓN (1 min 45 s). La pregunta que SIEMPRE sale en el Q&A. Adelántate.

Click 1: "La palabra 'zinc' mira a toda la imagen, y pesa más los parches
donde está el frasco. Así es como 'ubica' sin dibujar cajas."
Click 2: "¿Es la misma atención de ChatGPT? Sí. Misma operación, misma
matemática, mismas librerías."
Click 3: "Lo que cambia está al final: las acciones PREGUNTAN y el VLM
RESPONDE. Eso es cross-attention."
Click 4: "Y la máscara: quién puede mirar a quién. Ahí está casi toda la diferencia."
-->

---
layout: scene
routeAlias: action-tokens
clicks: 4
---

<Scene name="actionTokens" />

<!--
DE MOVIMIENTO A TOKENS (2 min). La parte más técnica. Ve despacio.

Click 1: "Un movimiento es una señal continua."
Click 2: "La muestreas treinta veces por segundo."
Click 3: "Y la cortas en 256 cajones. Cada cajón es un token. RT-2 y OpenVLA
reusan los 256 tokens menos usados del vocabulario."
Click 4: "Hoy hay dos formas mejores. FAST la trata como JPEG: comprime la
señal, de 700 tokens a 53. Y flow matching se salta los tokens: parte de
ruido y lo limpia hasta tener la trayectoria."
-->

---
layout: scene
routeAlias: detokenizer
clicks: 3
---

<Scene name="detokenize" />

<!--
DE TOKENS A TORQUE (1 min). La mitad que nadie explica.

Click 1: "Le restas el offset: te queda el cajón, de 0 a 255."
Click 2: "Lo llevas a -1..1 y lo des-normalizas con los percentiles 1 y 99 del
dataset. No con mínimo y máximo, para que UNA demo mala no estire la escala."
Click 3: "Y eso mueve el servo. Seis deltas y la pinza, que es absoluta."
-->

---
layout: scene
routeAlias: action-chunking
clicks: 3
---

<Scene name="chunking" />

<!--
CHUNKING (1 min 30 s).

Click 1: "Un paso por inferencia: el brazo se para a pensar en cada tick. Tiembla."
Click 2: "Un chunk: una inferencia devuelve cincuenta acciones. El movimiento
es continuo."
Click 3: "Y el truco de 2025: mientras ejecuta un chunk, ya calcula el
siguiente y los empalma. En LeRobot es una bandera: --inference.type=rtc."
-->

---
layout: scene
routeAlias: architecture
clicks: 4
---

<Scene name="architecture" />

<!--
LA MÁQUINA COMPLETA (2 min). Aquí se juntan todas las piezas.

Click 1: "Tres cámaras, la frase y el estado entran al VLM."
Click 2: LA TIJERA: "SmolVLA usa sólo la primera MITAD de las capas. Las
últimas se especializan en producir lenguaje, y un robot no necesita hablar."
Click 3: "El action expert parte de ruido y lo limpia en diez pasos hasta
tener cincuenta acciones. El brazo se mueve, la cámara ve el resultado, y el
ciclo se repite."
Click 4: "OpenVLA: 7 mil millones, tokens discretos, unos 6 Hz en una 4090.
SmolVLA: 450 millones, corre en un portátil. Es el que van a ver en el demo."
-->

---
layout: scene
routeAlias: ch-train
transition: rise-up
---

<Scene name="chapter" v="train" />

<!-- TRANSICIÓN (10 s). "Ya sabemos cómo piensa. Ahora, cómo aprende." -->

---
layout: scene
routeAlias: recording
clicks: 3
---

<Scene name="recording" />

<!--
GRABAR UN DATASET (1 min 15 s).

Click 1: "Yo muevo el brazo líder con la mano. El seguidor copia, un pelín tarde."
Click 2: "Y treinta veces por segundo se escribe un renglón: las tres
cámaras, el estado y la acción."
Click 3 (EL PUNTO): "Esas dos filas NO son lo mismo. El estado es dónde ESTÁ
el robot. La acción es dónde lo MANDÓ el humano. Entrenar es aprender a
predecir la segunda a partir de la primera."
-->

---
layout: scene
routeAlias: training
clicks: 3
---

<Scene name="training" />

<!--
ENTRENAR (1 min 15 s).

Click 1: "El modelo predice un chunk. Lo comparas con lo que hizo el humano.
La diferencia es el error."
Click 2: "Veinte mil pasos después, la predicción cae encima."
Click 3: "Sin recompensa, sin prueba y error: copia. Unas cuatro horas en una A100."
-->

---
layout: scene
routeAlias: pretrain-finetune
clicks: 3
---

<Scene name="pretrain" />

<!--
PRE-ENTRENAMIENTO (1 min 15 s). Responde "¿y si lo preentreno?".

Click 1: "SmolVLA se preentrenó con 481 datasets de la comunidad. Meses de
GPU que ustedes no pagaron."
Click 2: "Ustedes aportan cincuenta episodios. Unas horas."
Click 3: "Sin la fase 1, cincuenta episodios no alcanzan. Con ella, sí. Eso es
todo lo que significa 'modelo fundacional' en robótica."
-->

---
layout: scene
routeAlias: ch-demo
transition: rise-up
---

<Scene name="chapter" v="demo" />

<!--
TRANSICIÓN AL DEMO (20 s). Respira hondo, literalmente.
"Vamos a la parte que puede salir mal." Mientras hablas, enciende el brazo.
-->

---
layout: split
routeAlias: my-build
ratio: 1fr 1.1fr
clicks: 2
---

::left::

# {{ $t('build.title') }}

<div class="stats">
  <div v-click="1" class="stat"><span class="stat__n">6</span><span class="stat__l">{{ $t('build.servos') }}</span></div>
  <div v-click="1" class="stat"><span class="stat__n">3</span><span class="stat__l">{{ $t('build.cams') }}</span></div>
  <div v-click="1" class="stat"><span class="stat__n">1</span><span class="stat__l">{{ $t('build.printer') }}</span></div>
  <div v-click="2" class="stat stat--hero"><span class="stat__n">$232</span><span class="stat__l">{{ $t('build.cost') }}</span></div>
</div>

::right::

<PhotoSlot src="/images/so100-build.jpg" :label="$t('build.placeholder')" />

<div class="cite">{{ $t('build.cite') }}</div>

<!--
MI BRAZO (1 min). Aquí te ganas a la sala. Con gusto, sin alargarte.

Click 1: "Lo imprimí en una Ender 3. Seis servos en un bus serial, tres
cámaras." La anécdota de las tolerancias: "los primeros agujeros salieron
medio milímetro pequeños y me comí los tornillos."
Click 2: "Líder y seguidor, unos 230 dólares en piezas, sin contar el filamento."
-->

---
layout: split
routeAlias: demo-video
ratio: 1.15fr 1fr
---

::left::

# {{ $t('demo1.title') }}

<div class="instrs">
  <span class="instr instr--a t-mono">«{{ $t('demo1.instr') }}»</span>
</div>

<p class="t-lead">{{ $t('demo1.lead') }}</p>

::right::

<VideoSlot src="/video/demo-complejo-b.mp4" :label="$t('demo1.placeholder')" class="demo-clip" />

<!--
DEMO 1, GRABADO (45 s). En casa, con la política que entrené.

Déjalo correr y narra poco: "esto es en mi mesa. Le escribo 'agarra la caja
de Complejo B'... y va por la caja." No hables encima del agarre.

Si el demo en vivo falla más tarde, la tecla B te trae de vuelta aquí.
-->

---
layout: split
routeAlias: demo-zinc
ratio: 1.15fr 1fr
---

::left::

# {{ $t('demo2.title') }}

<div class="instrs">
  <span class="instr instr--b t-mono">«{{ $t('demo2.instr') }}»</span>
</div>

<p class="t-lead">{{ $t('demo2.lead') }}</p>

::right::

<VideoSlot src="/video/demo-zinc.mp4" :label="$t('demo2.placeholder')" class="demo-clip" />

<!--
DEMO 2, GRABADO (45 s) Y LUEGO EN VIVO (4 min).

El vídeo: "mismos pesos, mismo brazo. Sólo cambio la frase: 'agarra el frasco
de zinc'." Cuando el brazo vaya al frasco: "no hay un if en ninguna parte."

EN VIVO: cambia a la terminal / ventana de rerun. No hables encima del robot.

1. Ejecuta con "agarra la caja de Complejo B". DÉJALO CORRER EN SILENCIO.
2. Recoloca los objetos.
3. Cambia SÓLO la frase a "agarra el frasco de zinc". Dilo en voz alta
   mientras lo escribes.
4. Ejecuta. Cuando el brazo vaya al otro objeto: CÁLLATE Y DEJA QUE APLAUDAN.

SI FALLA: no lo repitas más de dos veces. Tecla B: vuelves al demo 1 grabado,
y ya lo vieron funcionar. "Esto pasa, y por eso existe la sección de límites."

El comando está en docs/PRESENTING.md. OJO: --device en rollout,
--policy.device en train.
-->

---
layout: scene
routeAlias: ch-future
transition: rise-up
---

<Scene name="chapter" v="future" />

<!-- TRANSICIÓN (10 s). "¿Y para dónde va todo esto?" -->

---
layout: scene
routeAlias: field-growth
clicks: 2
---

<Scene name="growth" />

<!--
EL CAMPO EXPLOTÓ (45 s).

Click 1: "Uno. Nueve. Ciento sesenta y cuatro." Dilos uno a uno. El de 2024 fue
rechazado, eso hace gracia y es verdad. Son búsquedas por palabra clave, no un
censo: dilo.
Click 2: los modelos de este año. No los leas todos.
-->

---
layout: scene
routeAlias: limitations
clicks: 3
---

<Scene name="limits" />

<!--
LO QUE TODAVÍA NO FUNCIONA (1 min 30 s). Aquí salen las mejores preguntas.

Click 1: "Un benchmark es un examen estándar: las mismas tareas, en simulación,
para todos. En 2024 OpenVLA sacaba 76. Hoy todos sacan 97 o 98. El examen se
volvió fácil y ya no separa a nadie. Por eso, si alguien les muestra un 98 %
en LIBERO, eso no les dice cómo le va a ir en su mesa."
Click 2: "La prueba de verdad es un robot real, evaluado a ciegas."
Click 3: "Y lo que escala no es el número de demos: es la DIVERSIDAD."
-->

---
layout: scene
routeAlias: world-models
clicks: 4
---

<Scene name="worldModels" />

<!--
MODELOS DEL MUNDO (2 min).

Arranque: "Todo lo que vimos hoy es reactivo: ve y actúa."
Click 1: "Un modelo del mundo imagina futuros antes de moverse, y elige uno."
Clicks 2 a 4: las otras tres formas de combinarlos: generar datos, entrenar
mejor y evaluar sin robot.
Remate: "Y fíjense: VLA-JEPA ya está en LeRobot, pero el modelo del mundo se
usa SÓLO durante el entrenamiento. Hoy sirve para aprender, todavía no para planear."
-->

---
layout: scene
routeAlias: generalist-models
clicks: 3
---

<Scene name="generalists" />

<!--
VS. GENERALISTAS (1 min 30 s). Primero la comparación, al final la combinación.

Click 1: entra, sale, velocidad. "El generalista recibe texto e imágenes y
devuelve texto. El VLA recibe cámaras y el estado del brazo, y devuelve
movimiento. Uno piensa unas pocas veces por segundo; el otro actúa de 30 a
200 veces por segundo."
Click 2: "Uno aprendió de internet, lo que ya existía. El otro, de
demostraciones grabadas. Y cuando se equivocan: uno te hace reescribir el
prompt, el otro tira un frasco al suelo."
Click 3: "No compiten, se combinan. El generalista decide QUÉ; el VLA decide CÓMO."
-->

---
layout: scene
routeAlias: when-to-use
clicks: 3
---

<Scene name="whenToUse" />

<!--
CUÁNDO USAR CUÁL (1 min 15 s). Te da credibilidad con la gente de industria.

Click 1: "Una tarea fija y poco presupuesto: ACT."
Click 2: "Si el lenguaje elige el objeto: un VLA pequeño afinado."
Click 3: "Tareas largas y abiertas: un planificador que llama al VLA como herramienta."
Dilo sin matices: "lo que vine a venderles muchas veces NO es la respuesta."
-->

---
layout: scene
routeAlias: thanks
---

<div class="thanks">
  <div class="thanks__words">
    <h1 class="thanks__big"><span>Gracias</span><span class="c-action">Thank you</span></h1>
    <p class="thanks__q">{{ $t('thanks.questions') }}</p>
    <p class="thanks__contact t-mono">github.com/Youngermaster</p>
  </div>
  <QrCard url="https://github.com/Youngermaster/VLA-introduction-slides" :label="$t('thanks.qr')" sub="github.com/Youngermaster/VLA-introduction-slides" :size="230" />
</div>

<!--
CIERRE Y PREGUNTAS. "Gracias." Y punto. No resumas la charla.

Deja esta diapositiva durante el Q&A: el QR lleva a las diapositivas, con
todas las referencias. La gente fotografía.
-->

---
layout: viz
routeAlias: references
---

# {{ $t('refs.title') }}

<div class="viz-fill">
  <References />
</div>

<!--
REFERENCIAS. No se presenta; está para quien descargue las diapositivas.
Si alguien pregunta por una fuente, está aquí y en docs/RESEARCH.md.
-->
