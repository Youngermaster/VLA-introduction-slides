---
theme: default
title: Del Token al Torque
titleTemplate: '%s'
author: Juan Manuel Younes
info: |
  Del Token al Torque — cómo la IA aprendió a mover cosas en el mundo físico.
  Charla sobre modelos Vision-Language-Action para AI Medellín.
routeAlias: title
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

# {{ $t('deck.title') }}

<T k="deck.subtitle" />

<div class="mt-8">
  <TokenToTorque />
</div>

<div class="cite">{{ $t('deck.author') }} · {{ $t('deck.venue') }}</div>

<!--
APERTURA — 45 s. Habla ANTES de avanzar; deja que la animación del título termine sola.

"Buenas noches. Me llamo Juan Manuel. Construí un brazo robótico en mi casa y le
enseñé a entender español. Eso es de lo que vengo a hablar."

No te presentes largo. La credibilidad se gana en la diapositiva 7, no aquí.
-->

---
routeAlias: hook-provocation
clicks: 2
---

# {{ $t('hook.title') }}

<div v-click="1">
  <T k="hook.body" block />
</div>

<p v-click="2" class="t-lead mt-6 c-action">{{ $t('hook.aside') }}</p>

<!--
GANCHO — 1 min 15 s.

Haz la pregunta y CÁLLATE dos segundos. Deja que la sala la sienta.

Click 1: "Los LLMs pasaron de curiosidad a infraestructura en tres años.
La robótica lleva prometiendo lo mismo desde antes, y sigue sin llegar."

Click 2 — el giro: "La respuesta fácil es que mover cosas es más difícil que
escribir texto. No es eso. O no es sólo eso."

CUIDADO: no te enamores de esta diapositiva. Es un trampolín.
-->

---
layout: viz
routeAlias: data-asymmetry
clicks: 4
---

# {{ $t('asymmetry.title') }}

<div class="viz-fill">
  <DataAsymmetry :stage="$clicks" />
</div>

<div class="cite">{{ $t('asymmetry.cite') }}</div>

<!--
LA TENSIÓN CENTRAL — 2 min. Esta es la diapositiva que sostiene toda la charla.

Click 1 (la marea de texto): "GPT se entrenó con internet. Texto que ya estaba
escrito, que alguien más ya había producido, gratis."

Click 2 (los episodios, uno a uno): "Esto son datos de robot. Cada barra son
treinta segundos de alguien moviendo físicamente un brazo. No se pueden
paralelizar. No se pueden raspar de la web."

Click 3 (los números): déjalos respirar. No los leas en voz alta, ya se leen solos.

Click 4 (el remate): "El texto ya estaba escrito. Cada episodio de robot hay que
vivirlo en tiempo real." — PAUSA LARGA aquí. Es el corazón de la charla.

Si vas retrasado, esta diapositiva NO se recorta. Recorta el Acto 4.
-->

---
layout: act
routeAlias: act2-open
transition: rise-up
---

# {{ $t('act2.title') }}

{{ $t('act2.sub') }}

<!--
TRANSICIÓN — 15 s. Respira. "Para entender qué es un VLA hay que ver de dónde viene."
-->

---
layout: viz
routeAlias: timeline
clicks: 4
---

# {{ $t('timeline.title') }}

<div class="viz-fill">
  <Timeline :stage="$clicks" />
</div>

<!--
LINAJE — 1 min 30 s. Cuatro clicks, ~20 s cada uno. No te extiendas.

1. Control programado: "funciona perfecto hasta que algo se mueve un centímetro."
2. Imitation learning: "aprende de demostraciones. Es 2023, es ACT, y es donde
   entré yo."
3. Los primeros VLA: "RT-2 es el momento en que alguien conecta un modelo de
   lenguaje a un robot y funciona."
4. Al alcance: "y en 2025-26 esto baja a hardware de consumo."

El dato de 164 papers vuelve en el Acto 6 — anúncialo aquí sin desarrollarlo.
-->

---
layout: viz
routeAlias: act-reflex
clicks: 4
---

# {{ $t('reflex.title') }}

<div class="viz-fill">
  <ActReflex :stage="$clicks" />
</div>

<div class="cite">{{ $t('reflex.cite') }}</div>

<!--
QUÉ ES ACT — 1 min 30 s.

Click 1-2: "Entran imágenes y el estado de las articulaciones. Sale un bloque de
acciones futuras. Eso es todo. Es un mapeo directo."

Click 3 (la instrucción tachada): "Fíjate en lo que NO hay. No hay ninguna
entrada de texto. Aunque yo le hable, no existe el cable por donde entraría."

Click 4: "ACT es un reflejo. Buenísimo, y completamente sordo."

Esta diapositiva prepara la 8. No adelantes la conclusión.
-->

---
layout: split
routeAlias: my-build
clicks: 3
---

::left::

# {{ $t('build.title') }}

<p v-click="1" class="t-lead"><T k="build.lead" /></p>

<div v-click="2">
  <T k="build.points" block />
</div>

<p v-click="3" class="mt-5"><T k="build.aside" /></p>

::right::

<!-- IMAGEN: foto del SO-101 montado. Ver docs/ASSETS.md -->
<div class="ph ph--tall">
  <span class="t-mono">IMAGEN — SO-101 montado, las tres cámaras visibles</span>
</div>

<!--
CREDIBILIDAD — 1 min 30 s. Aquí te ganas a la sala. Cuéntalo con gusto pero sin alargarte.

Click 1: "Lo imprimí en una Ender 3. Líder y seguidor."
Click 2: la anécdota de las tolerancias — es la que hace reír y la que demuestra
   que de verdad lo hiciste. "Los primeros agujeros salieron medio milímetro
   pequeños y me comí los tornillos."
Click 3: "No les cuento esto por biografía. Se lo cuento porque todo lo que
   viene ahora lo sé por dónde se rompe."

Si alguien pregunta el precio: unos 150 USD en piezas, más el filamento.
-->

---
layout: claim
routeAlias: act-limitation
clicks: 2
---

# {{ $t('limitation.title') }}

<div v-click="1">
  <T k="limitation.body" block />
</div>

<p v-click="2" class="t-lead c-action mt-5">{{ $t('limitation.punch') }}</p>

<!--
EL LÍMITE QUE MOTIVA TODO — 1 min.

Cuéntalo como lo que fue: una decepción concreta.

Click 1: el cubo rojo, el cubo azul, los diez centímetros. Tres fracasos, rápido.
Click 2: "Una política, una tarea." — y aquí haces la pregunta que abre el Acto 3:
   "¿Y si en vez de grabar mil tareas, el modelo ya supiera qué es un frasco?"
-->

---
layout: act
routeAlias: act3-open
transition: rise-up
---

# {{ $t('act3.title') }}

{{ $t('act3.sub') }}

<!--
TRANSICIÓN — 10 s. "Esta es la parte técnica. Aguántenme diez minutos."
-->

---
layout: viz
routeAlias: what-is-a-policy
clicks: 4
---

# {{ $t('policy.title') }}

<div class="viz-fill">
  <PolicyDef :stage="$clicks" />
</div>

<!--
QUÉ ES UNA POLÍTICA — 1 min 15 s. Define el término antes de usarlo veinte veces.

Click 1: "Una política devuelve qué hacer." Señala el subíndice: no una acción,
   un BLOQUE de acciones.
Click 2: "…dado lo que ve."
Click 3: "…y dado lo que le pediste. ACT no tiene este tercer término. Un VLA sí.
   Toda la charla cabe en esa diferencia."
Click 4 — importante, mucha gente lo asume mal: "esto NO es reinforcement
   learning. No hay recompensa. Es aprendizaje supervisado, y la etiqueta es lo
   que hizo el humano."
-->

---
layout: viz
routeAlias: vla-architecture
clicks: 6
transition: arrive
---

# {{ $t('architecture.title') }}

<div class="viz-fill">
  <VlaArchitecture :stage="$clicks" />
</div>

<div class="cite">{{ $t('architecture.cite') }}</div>

<!--
LA ARQUITECTURA — 2 min 30 s. LA diapositiva de la charla. Vale la pena ir lento.

1. Las cámaras: "tres vistas, como las mías."
2. El encoder visual: "convierte píxeles en tokens. SigLIP, DINOv2."
3. La instrucción: "y aquí entra la frase, tokenizada como en cualquier LLM."
4. El VLM PREENTRENADO — pausa aquí, es el corazón: "esto ya vio internet.
   Ya sabe qué es un frasco. Nadie se lo enseñó con un robot."
5. El action expert: "y esta cabecita convierte todo eso en movimiento."
6. El chunk: "cincuenta pasos futuros, como un segundo de movimiento."

Si sólo se llevan una diapositiva de la charla, que sea ésta.
-->

---
layout: viz
routeAlias: language-in
clicks: 4
---

# {{ $t('langin.title') }}

<div class="viz-fill">
  <LanguageIn :stage="$clicks" />
</div>

<div class="cite">{{ $t('langin.cite') }}</div>

<!--
CÓMO ENTRA EL LENGUAJE — 1 min 30 s. Responde una pregunta que todos tienen.

Click 1: la frase, tal cual.
Click 2 — la plantilla: "no le pasas la frase suelta. La envuelves en una
   pregunta fija. Y eso es astuto, porque el modelo no está aprendiendo una
   tarea nueva: sigue prediciendo el siguiente token."
Click 3: "el tokenizador es el MISMO de texto. Fíjate que 'magnesio' se parte en
   dos pedazos y no pasa absolutamente nada."
Click 4: "y los vectores resultantes se pegan detrás de los de la imagen. Para
   el transformer es una sola secuencia — no sabe cuáles son píxeles y cuáles
   son palabras."
-->

---
layout: viz
routeAlias: attention
clicks: 4
---

# {{ $t('attention.title') }}

<div class="viz-fill">
  <AttentionExplained :stage="$clicks" />
</div>

<!--
ATENCIÓN — 1 min 45 s. La pregunta que SIEMPRE sale en el Q&A. Adelántate.

Click 1: "Sí. El backbone es un transformer decoder normal, con self-attention
   idéntica a la de un modelo de texto. Mismas librerías, misma matemática."
Click 2: "Lo que cambia está al final. El action expert usa CROSS-attention."
Click 3: "Y la diferencia es sólo de dónde salen Q, K y V. En self-attention las
   tres salen de la misma secuencia. En cross-attention, la Q sale de las
   acciones y las K y V del VLM. Las acciones PREGUNTAN, el VLM RESPONDE."
Click 4: "Por eso puedes entrenar el experto dejando el backbone congelado."

Si alguien pregunta por π0: usa un esquema distinto, con los pesos del experto
dentro de la misma operación de atención, tipo mixture-of-experts.
-->

---
layout: viz
routeAlias: action-tokenization
clicks: 4
---

# {{ $t('tokenizer.title') }}

<div class="viz-fill">
  <ActionTokenizer :stage="$clicks" />
</div>

<div class="cite">{{ $t('tokenizer.cite') }}</div>

<!--
TOKENIZACIÓN — 2 min 30 s. La parte más técnica. Ve despacio y usa la analogía.

Click 1: "Un movimiento es una señal continua. Un transformer predice símbolos
   discretos. Hay que cruzar ese puente."

Click 2 (binning): "La forma obvia: cortar en 256 cajones. RT-2 hizo esto —
   sobrescribió los 256 tokens menos usados del vocabulario. Funciona, pero
   mira la escalera: esa precisión se pierde para siempre. Y son 350 tokens por
   chunk."

Click 3 (FAST) — AQUÍ la analogía, es la que hace clic en la sala:
   "¿Y si en vez de tratarlo como números lo tratamos como una SEÑAL? Es
   exactamente JPEG. DCT, tiras las frecuencias altas, comprimes lo que se
   repite. De 350 tokens a 40."

Click 4 (flow matching): "O te saltas los tokens del todo. Es lo que hacen
   π-cero, SmolVLA y GR00T hoy."

Si la sala se pierde, el resumen es: "discreto para reusar la maquinaria del
LLM; continuo para ir rápido y preciso."
-->

---
layout: viz
routeAlias: detokenizer
clicks: 5
---

# {{ $t('detok.title') }}

<div class="viz-fill">
  <ActionDetokenizer :stage="$clicks" />
</div>

<div class="cite">{{ $t('detok.cite') }}</div>

<!--
DE-TOKENIZADOR — 1 min 30 s. La mitad que nadie explica.

Click 1: "El modelo escupe siete IDs de token. Un motor necesita grados."
Click 2: "Le restas el offset y te queda un número del 0 al 255 — el cajón."
Click 3: "Lo llevas al rango continuo."
Click 4 — el detalle bonito: "y lo des-normalizas con los percentiles 1 y 99 del
   dataset. No con el mínimo y el máximo, para que UNA demostración mala no te
   estire toda la escala."
Click 5: "Y fíjense: son DELTAS. No dice 've a esta coordenada', dice 'muévete
   cuatro milímetros hacia allá'."
-->

---
layout: viz
routeAlias: action-chunking
clicks: 4
---

# {{ $t('chunking.title') }}

<div class="viz-fill">
  <ActionChunking :stage="$clicks" />
</div>

<div class="cite">{{ $t('chunking.cite') }}</div>

<!--
CHUNKING — 2 min.

Click 1: "Un paso por inferencia. El brazo se para en cada tick — esas franjas
   son el modelo pensando. Y como cada predicción ignora la anterior, tiembla."
Click 2: "Chunking: una inferencia devuelve cincuenta acciones. Entre decisiones
   el movimiento es continuo. ACT usa unos 90-100 pasos a 50 Hz."
Click 3: "Pero hay un problema del que casi nadie habla..." — los círculos rojos.
   "Mientras se ejecuta un chunk, el siguiente ya se está calculando, y vuelve
   en desacuerdo con dónde está el brazo de verdad."
Click 4: "RTC rellena el solapamiento. Y el detalle bonito: eso es un paper de
   junio de 2025 que hoy es una bandera en la línea de comandos."
-->

---
layout: viz
routeAlias: closed-loop
clicks: 6
---

# {{ $t('loop.title') }}

<div class="viz-fill">
  <ClosedLoop :stage="$clicks" />
</div>

<!--
EL BUCLE COMPLETO — 1 min 30 s. Aquí se juntan todas las piezas del acto.

Un click por etapa, rápido, siguiendo el punto que viaja por el anillo:
observar → tokenizar → VLM → action expert → de-tokenizar → ejecutar.

Al cerrar el círculo: "y esto se repite treinta veces por segundo mientras el
brazo se mueve. El chunk es lo que permite que el bucle NO tenga que cerrarse
en cada paso — por eso el movimiento se ve continuo y no a tirones."

Es la diapositiva que convierte una lista de componentes en un mecanismo.
-->

---
layout: act
routeAlias: train-open
transition: rise-up
---

# {{ $t('train.title') }}

{{ $t('train.sub') }}

<!-- TRANSICIÓN — 10 s. "Ya sabemos cómo piensa. Ahora, cómo aprende." -->

---
layout: viz
routeAlias: data-pipeline
clicks: 4
---

# {{ $t('pipeline.title') }}

<div class="viz-fill">
  <DataPipeline :stage="$clicks" />
</div>

<div class="cite">{{ $t('pipeline.cite') }}</div>

<!--
DE DÓNDE SALEN LOS DATOS — 1 min 30 s.

Cuatro pasos, ~20 s cada uno. Conéctalo con la diapositiva 3: "esto es
exactamente lo que hacía que cada barra costara treinta segundos."

Click 3, insiste: "cincuenta episodios, pero repartidos entre VARIACIONES.
Cincuenta veces la misma posición no sirve de nada. Eso vuelve en el Acto 6."
-->

---
layout: viz
routeAlias: recording
clicks: 3
---

# {{ $t('recording.title') }}

<div class="viz-fill">
  <RecordingLoop :stage="$clicks" />
</div>

<div class="cite">{{ $t('recording.cite') }}</div>

<!--
GRABACIÓN — 1 min 30 s. El detalle que casi nadie explica y que lo aclara todo.

Click 1: "Yo muevo el líder con la mano. El seguidor copia. Fíjense que el
   seguidor va siempre un pelín por detrás."
Click 2: "Y en cada timestep, a treinta hertz, se escribe un renglón con esto."
Click 3 — EL PUNTO: "miren esas dos filas. NO son lo mismo.
   `observation.state` es dónde ESTÁ el robot. `action` es dónde lo MANDÓ el
   humano. Entrenar la política es aprender a predecir la segunda a partir de
   la primera. Eso es todo el behavior cloning."

Si alguien pregunta por qué no se graba sólo una: porque la diferencia entre
las dos es exactamente la señal de control que quieres aprender.
-->

---
layout: viz
routeAlias: pretrain-finetune
clicks: 3
---

# {{ $t('pretrain.title') }}

<div class="viz-fill">
  <PretrainFinetune :stage="$clicks" />
</div>

<div class="cite">{{ $t('pretrain.cite') }}</div>

<!--
PRE-ENTRENAMIENTO — 1 min 30 s. Responde a la pregunta "¿y si lo preentreno?".

Click 1: "SmolVLA se preentrenó con 481 datasets de la comunidad. Meses de GPU
   que tú no pagaste."
Click 2: "Tú aportas cincuenta episodios. Unas horas."
Click 3: "Sin la fase 1, cincuenta episodios no alcanzan ni de lejos. Con ella,
   alcanzan. Eso es literalmente todo lo que significa 'modelo fundacional'
   en robótica."
-->

---
layout: viz
routeAlias: act-inside-vla
clicks: 3
---

# {{ $t('inside.title') }}

<div class="viz-fill">
  <ActInsideVla :stage="$clicks" />
</div>

<!--
DÓNDE QUEDÓ ACT — 1 min 15 s. Cierra el bucle del Acto 2.

Click 1: deja que lean la tabla, no la leas tú.
Click 2: resalta la fila de la cabeza de acción.
Click 3: "La cabeza de acción de un VLA ES una política de chunking. Lo que
   cambió no es el músculo — es lo que le habla al músculo."

Es una de las frases que más se recuerdan. Dila despacio.
-->

---
layout: claim
routeAlias: rt2-insight
clicks: 2
---

# {{ $t('rt2.title') }}

<div v-click="1">
  <T k="rt2.body" block />
</div>

<p v-click="2" class="t-lead c-lang mt-5"><T k="rt2.punch" /></p>

<div class="cite">{{ $t('rt2.cite') }}</div>

<!--
LA INTUICIÓN DE RT-2 — 1 min. Cierra el Acto 3.

Click 1: "Un modelo que nunca vio un robot ya sabe qué es un frasco."
Click 2: "No es que aprenda mejor. Es que empieza sabiendo mucho más."
-->

---
layout: act
routeAlias: act4-open
transition: rise-up
---

# {{ $t('act4.title') }}

{{ $t('act4.sub') }}

<!-- TRANSICIÓN — 10 s. -->

---
layout: viz
routeAlias: openvla-anatomy
clicks: 6
---

# {{ $t('openvla.title') }}

<div class="viz-fill">
  <OpenVlaAnatomy :stage="$clicks" />
</div>

<div class="cite">{{ $t('openvla.cite') }}</div>

<!--
OPENVLA POR DENTRO — 2 min. El primer VLA abierto, y el más fácil de enseñar
porque cada caja es algo que ya conocen.

1. "Dos encoders visuales, no uno: DINOv2 y SigLIP, y se concatenan sus features."
2. "Un MLP los proyecta al espacio de embeddings de Llama."
3. "La instrucción por el tokenizador de Llama, sin tocar nada."
4. "Todo se vuelve UNA secuencia y entra a un Llama 2 de 7B. Que hace lo de
   siempre: predecir el siguiente token."
5. "Sólo que los tokens que predice son acciones."
6. "Y el de-tokenizador los vuelve milímetros y grados."

Remate: "no hay nada exótico aquí. Es un modelo de lenguaje al que le
enseñaron un vocabulario nuevo."
-->

---
layout: viz
routeAlias: smolvla-anatomy
clicks: 5
---

# {{ $t('smolvla.title') }}

<div class="viz-fill">
  <SmolVlaAnatomy :stage="$clicks" />
</div>

<div class="cite">{{ $t('smolvla.cite') }}</div>

<!--
SMOLVLA POR DENTRO — 2 min. El modelo del demo, así que vale la pena.

Click 1: "Mismo esquema: un VLM que recibe cámaras, tarea y estado."
Click 2 — LA TIJERA, es lo más memorable: "y aquí viene la idea que más me
   gusta de todo el paper. Usa sólo la PRIMERA MITAD de las capas. Las últimas
   capas de un modelo de lenguaje se especializan en producir lenguaje… y un
   robot no necesita hablar. Las cortan y ya."
Click 3: "El action expert alterna cross-attention, que lee el VLM, con
   self-attention propia."
Click 4: "Y parte de acciones con ruido que va limpiando — eso es flow matching."
Click 5: "Cortar esas capas es lo que convierte un VLM de 500 millones en un VLA
   de 450 que corre en un portátil."
-->

---
layout: viz
routeAlias: model-landscape
clicks: 5
---

# {{ $t('landscape.title') }}

<div class="viz-fill">
  <ModelLandscape :stage="$clicks" />
</div>

<div class="cite"><T k="landscape.cite" /></div>

<!--
PANORAMA — 2 min. Un click por modelo, ~20 s. No te enamores de ninguno.

RT-2: "cerrado, gigante, pero es el que abrió la puerta."
OpenVLA: "el primero abierto de verdad."
π-cero: "Physical Intelligence. Ojo: van por π-cero-siete, pero el abierto es el 0.5."
GR00T N1.7: "NVIDIA. 8.9 Hz montado en el propio robot — eso es lo interesante."
SmolVLA: "y este es el que corre en mi mesa. 450 millones. Sigue."

Si preguntan por números de VRAM: están todos verificados contra las fuentes
primarias, y lo que no pude verificar no está en la tabla.
-->

---
layout: split
routeAlias: accessibility
ratio: 1.1fr 1fr
clicks: 3
---

::left::

# {{ $t('access.title') }}

<p v-click="1" class="t-lead"><T k="access.lead" /></p>

<div v-click="2">
  <T k="access.points" block />
</div>

<p v-click="3" class="t-lead c-action mt-5"><T k="access.punch" /></p>

::right::

<!-- IMAGEN: foto del brazo trabajando sobre la mesa. Ver docs/ASSETS.md -->
<div class="ph ph--tall">
  <span class="t-mono">IMAGEN — el brazo en la mesa, con los objetos del demo</span>
</div>

<div class="cite">{{ $t('access.cite') }}</div>

<!--
ACCESIBILIDAD — 1 min 30 s. Esta es la diapositiva que hace que alguien se
anime a construirlo. Dale energía.

Click 3 — el remate: "El brazo cuesta ciento cincuenta dólares. El modelo es
abierto. El dataset lo grabas tú en una tarde." PAUSA.
-->

---
layout: viz
routeAlias: when-to-use
clicks: 4
---

# {{ $t('choose.title') }}

<div class="viz-fill">
  <WhenToUse :stage="$clicks" />
</div>

<!--
CUÁNDO USAR CUÁL — 1 min 30 s. Esta diapositiva te da credibilidad con la
gente de industria, porque dice que lo que vine a vender muchas veces NO es
la respuesta.

Click 4: "Para UNA tarea fija, ACT casi siempre gana. Un VLA se paga solo
cuando necesitas que el lenguaje cambie el comportamiento."

Dilo sin matices. La honestidad aquí vale más que el entusiasmo.
-->

---
layout: act
routeAlias: act5-open
transition: rise-up
---

# {{ $t('act5.title') }}

{{ $t('act5.sub') }}

<!--
TRANSICIÓN AL DEMO — 20 s. Respira hondo, literalmente.

"Vamos a la parte que puede salir mal."

Di en voz alta que está a mitad de charla a propósito. La sala lo agradece
y te compra margen si algo falla.
-->

---
layout: viz
routeAlias: demo-rig
clicks: 4
---

# {{ $t('rig.title') }}

<div class="viz-fill">
  <RigDiagram :stage="$clicks" />
</div>

<!--
EL MONTAJE — 1 min 30 s. Mientras hablas, ENCIENDE el robot y verifica cámaras.

Click 1-2: "Entrené en la torre, en casa. Subí los pesos al Hub. Aquí sólo
   descargo y ejecuto. La Mac no entrena nada."
Click 3: "Tres cámaras USB y el brazo."
Click 4: menciona el modo pánico EN VOZ ALTA y con humor. Baja la tensión de
   la sala y la tuya: "y si nada de esto funciona, tengo una tecla."

CHECKLIST ANTES DE SEGUIR:
  [ ] índices de cámara verificados AQUÍ (cambian al reconectar)
  [ ] brazo calibrado y en posición inicial
  [ ] objetos colocados: Complejo B y frasco de magnesio
  [ ] la lámpara encendida si la luz de la sala es distinta a la de casa
-->

---
layout: split
routeAlias: demo-vla
ratio: 1fr 1.15fr
clicks: 3
---

::left::

# {{ $t('demo.title') }}

<p v-click="1" class="t-lead"><T k="demo.lead" /></p>

<div v-click="2" class="instrs">
  <span class="instr instr--a t-mono">«{{ $t('demo.instr1') }}»</span>
  <span class="instr instr--b t-mono">«{{ $t('demo.instr2') }}»</span>
</div>

<p v-click="3" class="t-lead c-action mt-4">{{ $t('demo.punch') }}</p>

::right::

```bash
lerobot-rollout \
  --strategy.type=base \
  --inference.type=rtc \
  --policy.path=$HF_USER/smolvla-medicamentos \
  --robot.type=so101_follower \
  --robot.port=/dev/tty.usbmodem58FA0929601 \
  --task="agarra el frasco de magnesio" \
  --device=mps
```

<p class="t-caption mt-3">
  <code>--device</code> en rollout, <code>--policy.device</code> en train. No los confundas en vivo.
</p>

<!--
EL DEMO — 5 a 6 min. ES EL MOMENTO. No hables encima del robot.

1. Ejecuta con "agarra el Complejo B". DÉJALO CORRER EN SILENCIO.
   La sala necesita ver el movimiento sin tu voz encima.
2. Cuando termine: para, recoloca los objetos.
3. Cambia SÓLO la frase a "agarra el frasco de magnesio". Dilo en voz alta
   mientras lo escribes, para que quede claro que es lo único que cambió.
4. Ejecuta. Y cuando el brazo vaya al otro objeto: CÁLLATE Y DEJA QUE APLAUDAN.

Después: "No hay un if en ninguna parte."

SI FALLA: no lo repitas más de dos veces. Tecla B, vídeo de respaldo, sigue
sin dramatismo. Di algo como "esto pasa, y por eso el Acto 6 se llama
'la parte honesta'." Convierte el fallo en el argumento.
-->

---
layout: split
routeAlias: demo-act-video
clicks: 2
---

::left::

# {{ $t('demoact.title') }}

<div v-click="1">
  <T k="demoact.body" block />
</div>

::right::

<!-- VÍDEO: política ACT ejecutando la tarea. Ver docs/ASSETS.md -->
<div class="ph ph--video">
  <span class="t-mono">{{ $t('demoact.placeholder') }}</span>
</div>

<!--
CONTRASTE ACT — 1 min. Vídeo corto, 20-30 s, en bucle.

"ACT hace su tarea muy bien. Pero la hace igual sin importar lo que yo diga.
Ese es el salto entero de esta charla, en un vídeo."

Si el demo en vivo salió bien, puedes acortar esto a 30 s.
-->

---
layout: viz
routeAlias: backup-demo
clicks: 1
---

# {{ $t('backup.title') }}

<p class="t-lead c-muted">{{ $t('backup.sub') }}</p>

<div class="viz-fill">
  <!-- VÍDEO: demo completo grabado. Ver docs/ASSETS.md -->
  <div class="ph ph--video ph--wide">
    <span class="t-mono">{{ $t('backup.placeholder') }}</span>
  </div>
</div>

<div class="cite">{{ $t('backup.note') }}</div>

<!--
MODO PÁNICO — variable.

Llegas aquí con la tecla B desde cualquier diapositiva. La tecla V te devuelve
a donde estabas.

Si aterrizaste aquí porque el demo falló: reproduce el vídeo, comenta por
encima lo que se ve, y sigue. No pidas disculpas más de una vez.
-->

---
layout: act
routeAlias: act6-open
transition: rise-up
---

# {{ $t('act6.title') }}

{{ $t('act6.sub') }}

<!-- TRANSICIÓN — 10 s. "Ahora la parte que casi nadie pone en sus charlas." -->

---
layout: split
routeAlias: adoption
clicks: 3
---

::left::

# {{ $t('adoption.title') }}

<p v-click="1" class="t-lead"><T k="adoption.lead" /></p>

<div v-click="1" class="growth">
  <div class="growth__row"><span class="growth__n t-mono">{{ $t('adoption.n2024') }}</span><span class="growth__l">{{ $t('adoption.l2024') }}</span></div>
  <div class="growth__row"><span class="growth__n t-mono">{{ $t('adoption.n2025') }}</span><span class="growth__l">{{ $t('adoption.l2025') }}</span></div>
  <div class="growth__row growth__row--hero"><span class="growth__n t-mono">{{ $t('adoption.n2026') }}</span><span class="growth__l">{{ $t('adoption.l2026') }}</span></div>
</div>

::right::

<div v-click="2" class="mt-16">
  <T k="adoption.body" block />
</div>

<p v-click="3" class="t-caption mt-5"><T k="adoption.aside" /></p>

<div class="cite">{{ $t('adoption.cite') }}</div>

<!--
CRECIMIENTO — 1 min 15 s.

Click 1: "Uno. Nueve. Ciento sesenta y cuatro." Dilos en voz alta, uno a uno.
   El de 2024 fue rechazado — eso hace gracia y es verdad.
Click 2: "18× en un año."
Click 3 — IMPORTANTE para tu credibilidad: menciona que las cifras de adopción
   industrial que circulan vienen de un informe privado sin metodología, y que
   por eso las das como dirección y no como dato. Esa frase te compra a la sala
   técnica entera.
-->

---
layout: claim
routeAlias: limitations
clicks: 2
---

# {{ $t('limits.title') }}

<div v-click="1" class="limits-wide">
  <T k="limits.points" block />
</div>

<p v-click="2" class="t-lead c-action mt-5"><T k="limits.punch" /></p>

<div class="cite">{{ $t('limits.cite') }}</div>

<!--
LÍMITES — 1 min 45 s. Aquí salen las mejores preguntas. Déjales espacio.

Click 1: los cuatro puntos. El segundo es el importante y el menos conocido:
   "los benchmarks de simulación están saturados y esconden la brecha real.
   En RoboArena, que evalúa en robots físicos a ciegas, la foto es muy distinta."
Click 2: "Si alguien te enseña un 98% en LIBERO, no te está diciendo casi nada."
-->

---
layout: viz
routeAlias: data-economics
clicks: 2
---

# {{ $t('economics.title') }}

<div class="viz-fill">
  <DataEconomics :stage="$clicks" />
</div>

<div class="cite">{{ $t('economics.cite') }}</div>

<!--
ECONOMÍA DE LOS DATOS — 1 min 30 s.

Click 1: recorre los números de DROID. "Cincuenta personas. Trece instituciones.
   Un año. Y eso es UN dataset."
   El remate: "la unidad no son dólares por hora, son años-institución."

Click 2 — la ley de escalado, y es contraintuitiva: "lo que escala no es el
   número de demostraciones, es la DIVERSIDAD. Las demos extra en la misma
   escena se saturan. La gente gasta mal su presupuesto de datos."

Conecta con la diapositiva 11: "por eso insistía en las variaciones."
-->

---
layout: act
routeAlias: act7-open
transition: rise-up
---

# {{ $t('act7.title') }}

{{ $t('act7.sub') }}

<!-- TRANSICIÓN — 10 s. -->

---
layout: viz
routeAlias: chess-layers
clicks: 4
---

# {{ $t('chess.title') }}

<div class="viz-fill">
  <ChessLayers :stage="$clicks" />
</div>

<!--
AJEDREZ — 2 min. Es una historia, cuéntala como historia.

Click 1: "Stockfish evalúa millones de posiciones. No sabe que existe un brazo."
Click 2: "El orquestador traduce. Y aquí está lo bonito: UNA jugada de ajedrez
   pueden ser DOS o TRES operaciones físicas. Una captura son dos: primero
   sacas la pieza comida, después mueves la tuya."
Click 3: "La visión ancla el tablero al mundo. Y aquí muere el ajedrez."
Click 4: "Lo único que cruza son coordenadas. ACT no sabe qué es un caballo."

Aclara que está diseñado pero no construido. La honestidad no te cuesta nada aquí.
-->

---
layout: claim
routeAlias: chess-lesson
clicks: 3
---

# {{ $t('lesson.title') }}

<div v-click="1">
  <T k="lesson.body" block />
</div>

<p v-click="2" class="t-lead c-action mt-5"><T k="lesson.punch" /></p>

<p v-click="3" class="t-caption mt-4"><T k="lesson.aside" /></p>

<!--
LA LECCIÓN — 1 min 30 s. Esto es lo que se llevan los que ya construyen sistemas.

Click 2 es la frase de la sección: "pon el razonamiento donde hay razonamiento
y el músculo donde hay músculo, y que se encuentren en el punto más estrecho
posible."

Si hay gente de industria en la sala, ésta es la diapositiva por la que se te
acercan después.
-->

---
layout: act
routeAlias: act8-open
transition: rise-up
---

# {{ $t('act8.title') }}

{{ $t('act8.sub') }}

<!-- TRANSICIÓN — 10 s. -->

---
layout: viz
routeAlias: world-models
clicks: 4
---

# {{ $t('world.title') }}

<div class="viz-fill">
  <ReactiveVsPredictive :stage="$clicks" />
</div>

<div class="cite">{{ $t('world.cite') }}</div>

<!--
MODELOS DEL MUNDO — 2 min.

Click 1: "Todo lo que vimos hoy es reactivo. Ve y actúa."
Click 2: "El siguiente paso es que imagine varios futuros antes de moverse."
Click 3: "Y elija uno."
Click 4 — el ancla concreta, y es lo que hace que esto no suene a ciencia
   ficción: "VLA-JEPA ya está en LeRobot. Pero fíjense en el detalle: el modelo
   del mundo se usa SÓLO durante el entrenamiento. Hoy sirve para aprender,
   todavía no para planear. Ahí está exactamente la frontera."
-->

---
layout: split
routeAlias: generalist-models
clicks: 3
---

::left::

# {{ $t('generalist.title') }}

<p v-click="1" class="t-lead"><T k="generalist.lead" /></p>

<div v-click="2">
  <T k="generalist.points" block />
</div>

::right::

<p v-click="3" class="t-lead c-action mt-16"><T k="generalist.punch" /></p>

<!--
VS. GENERALISTAS — 1 min 30 s. Responde la pregunta que la sala ya tiene.

Click 2, el primer punto es el que se recuerda: "un LLM se equivoca y reescribes
   el prompt. Un VLA se equivoca y tira un frasco al suelo."
Click 3: "El cuello de botella de los LLM era el cómputo. El de los VLA es el
   mundo físico — y ése no escala comprando más GPUs."
-->

---
layout: viz
routeAlias: open-question
clicks: 4
transition: arrive
---

# {{ $t('question.title') }}

<div class="viz-fill">
  <div class="q3">
    <div class="q3__c" :class="{ 'is-on': $clicks >= 1 }">
      <span class="q3__k">{{ $t('question.a') }}</span>
      <span class="q3__d">{{ $t('question.adesc') }}</span>
    </div>
    <div class="q3__c" :class="{ 'is-on': $clicks >= 2 }">
      <span class="q3__k">{{ $t('question.b') }}</span>
      <span class="q3__d">{{ $t('question.bdesc') }}</span>
    </div>
    <div class="q3__c" :class="{ 'is-on': $clicks >= 3 }">
      <span class="q3__k">{{ $t('question.cc') }}</span>
      <span class="q3__d">{{ $t('question.cdesc') }}</span>
    </div>
  </div>
  <p class="q3__punch" :class="{ 'is-on': $clicks >= 4 }">{{ $t('question.punch') }}</p>
</div>

<!--
LA PREGUNTA ABIERTA — 1 min. El cierre conceptual.

Tres clicks, uno por opción, sin desarrollar mucho.
Click 4: "Mi apuesta son los datos. Pero está genuinamente abierta, y por eso
   el campo está tan divertido ahora mismo."

Deja esta diapositiva en pantalla dos segundos antes de pasar a recursos.
-->

---
layout: viz
routeAlias: resources
---

# {{ $t('resources.title') }}

<div class="viz-fill">
  <div class="res">
    <div class="res__col">
      <span class="res__h t-mono">{{ $t('resources.papers') }}</span>
      <QrCard url="https://arxiv.org/abs/2505.04769" label="Survey de VLA" sub="arXiv:2505.04769" />
    </div>
    <div class="res__col">
      <span class="res__h t-mono">{{ $t('resources.code') }}</span>
      <QrCard url="https://github.com/huggingface/lerobot" label="LeRobot" sub="huggingface/lerobot" />
    </div>
    <div class="res__col">
      <span class="res__h t-mono">SmolVLA</span>
      <QrCard url="https://huggingface.co/lerobot/smolvla_base" label="smolvla_base" sub="hf.co/lerobot" />
    </div>
    <div class="res__col">
      <span class="res__h t-mono">{{ $t('resources.mine') }}</span>
      <QrCard url="https://github.com/Youngermaster/VLA-introduction-slides" label="Estas diapositivas" sub="github.com/Youngermaster" />
    </div>
  </div>
</div>

<!--
RECURSOS — 45 s. No los leas. Di sólo:

"Los códigos funcionan desde el fondo de la sala. El primero es el survey si
quieren el mapa completo, el segundo es LeRobot que es por donde se empieza, y
el último son estas diapositivas con todas las referencias."

DEJA ESTA DIAPOSITIVA MIENTRAS RESPONDES PREGUNTAS. La gente fotografía.
-->

---
layout: claim
routeAlias: thanks
clicks: 1
---

# {{ $t('thanks.title') }}

<p class="t-lead">{{ $t('thanks.sub') }}</p>

<div v-click="1" class="mt-6">
  <T k="thanks.invite" block />
</div>

<div class="contact">
  <span class="t-mono">github.com/Youngermaster</span>
  <span class="t-mono">juanmanuel12.13.jmyh81@gmail.com</span>
</div>

<!--
CIERRE — Q&A, el resto del tiempo.

"Gracias." Y punto. No resumas la charla, ya la dieron.

Click 1 sólo si quieres invitar explícitamente a que se acerquen. Si la sala
tiene gente de industria, hazlo.

Mientras respondes preguntas, vuelve a la diapositiva de recursos (tecla ← una vez)
para que puedan fotografiar los QR.
-->
