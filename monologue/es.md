# Del Token al Torque — monólogo (español)

Guion hablado completo. Cada `##` es el `routeAlias` de una diapositiva, así que
reordenar `slides.md` nunca desincroniza el guion.

El comentario `<!-- target: Ns -->` es cuánto debería durar la sección. El modo
`/practice` compara ese objetivo con la estimación por conteo de palabras.

Presupuesto: ~50 min en total = ~35 min hablando + ~8 min de demo + Q&A.

---

## title
<!-- target: 45 -->

Buenas noches. Me llamo Juan Manuel.

Hace unos meses imprimí un brazo robótico en mi casa, lo armé, y le enseñé a
entender español. Hoy les vengo a contar cómo funciona eso por dentro — y en un
rato lo vamos a hacer en vivo, aquí, con este brazo.

Se llama **Del Token al Torque**, porque de eso se trata: de cómo una frase que
tú escribes termina convertida en un motor que se mueve.

## hook-provocation
<!-- target: 75 -->

Quiero empezar por una pregunta que me da vueltas hace rato.

En tres años pasamos de que la IA escribiera frases raras a que medio mundo la
use todos los días para trabajar. Fue rapidísimo.

La robótica lleva prometiendo lo mismo desde mucho antes. Y sigue sin llegar.
Seguimos viendo videos impresionantes de laboratorios, y seguimos sin tener un
robot que haga algo útil en una casa.

La respuesta fácil es que mover cosas es más difícil que escribir texto. Y es
verdad, pero no es *la* razón. La razón de fondo es otra, y es de datos.

## data-asymmetry
<!-- target: 120 -->

Miren esto, porque esta es la diapositiva que sostiene toda la charla.

A la izquierda, el texto. GPT y todos los modelos de lenguaje se entrenaron con
internet: texto que ya estaba escrito, que alguien más ya había producido,
que se puede descargar en paralelo, prácticamente gratis. Quince billones de
tokens.

A la derecha, datos de robot. Cada una de esas barras son treinta segundos de
una persona moviendo físicamente un brazo, en tiempo real. No se puede
paralelizar. No se puede raspar de la web. No existe.

Y el número de abajo: **un millón** de episodios en Open X-Embodiment, que es
el dataset abierto más grande que hay. Lo armaron treinta y cuatro laboratorios
juntos.

Esa es la asimetría. El texto ya estaba escrito. Cada episodio de robot hay que
vivirlo en tiempo real.

Todo lo que viene ahora — toda la ingeniería, todos los trucos — es gente
tratando de esquivar ese problema.

## act2-open
<!-- target: 15 -->

Para entender qué es un VLA y por qué importa, hay que ver rapidito de dónde
viene.

## timeline
<!-- target: 90 -->

Tres eras, cinco años.

Hasta más o menos 2020, robótica era control programado. Cinemática inversa,
trayectorias escritas a mano. Funciona perfecto, hasta que el objeto se mueve un
centímetro y todo se cae.

En 2023 llega el *imitation learning*. En vez de programar la trayectoria, le
muestras al robot cómo se hace y él aprende a copiarte. Ahí están ACT y
Diffusion Policy. Y ahí entré yo.

Casi al mismo tiempo aparecen los primeros VLA. RT-2 es el momento clave:
alguien conecta un modelo de lenguaje a un robot y descubre que funciona.

Y en 2025 y 2026 esto baja a hardware normal. Modelos de cuatrocientos cincuenta
millones de parámetros que corren en un portátil. En un momento les voy a
enseñar cuánto creció esto — el número los va a sorprender.

## act-reflex
<!-- target: 90 -->

Empecemos por ACT, porque es lo que yo tenía funcionando.

ACT es simple de describir. Entran imágenes de las cámaras y el estado de las
articulaciones — dónde está cada motor ahora mismo. Sale un bloque de acciones
futuras. Y ya. Es un mapeo directo de observación a movimiento.

Funciona sorprendentemente bien. Con cincuenta demostraciones aprende a hacer
una tarea con una fluidez que da gusto ver.

Pero fíjense en lo que **no** hay en este diagrama. No hay ninguna entrada de
texto. Ninguna. Aunque yo le hable al robot, no existe el cable por donde
entraría esa frase.

ACT es un reflejo. Buenísimo, y completamente sordo.

## my-build
<!-- target: 90 -->

Y aquí déjenme contarles por qué sé esto.

Imprimí un SO-101 completo, líder y seguidor, en una Ender 3. Y les cuento el
detalle que más me enseñó: los primeros agujeros me salieron medio milímetro
pequeños, y me comí los tornillos. Tuve que aprender a compensar tolerancias en
X e Y antes de poder armar nada.

Seis servos Feetech en un bus serie compartido. Tres cámaras USB: una cenital,
una en la muñeca y una en la base. Y políticas ACT entrenadas con LeRobot en una
RTX 5060 Ti.

No les cuento esto por biografía. Se lo cuento porque todo lo que viene ahora, yo
sé exactamente por dónde se rompe.

## act-limitation
<!-- target: 60 -->

Porque se rompe.

Mi política agarraba un cubo rojo perfectamente. Impecable.

Le puse un cubo azul al lado, y siguió yendo por el rojo. Le moví el rojo diez
centímetros, y falló. Le hablé, y por supuesto, no pasó nada.

Una política, una tarea. Para cada tarea nueva: volver a grabar, volver a
entrenar.

Y ahí es donde uno se hace la pregunta que abre todo lo demás: ¿y si en vez de
grabar mil tareas, el modelo ya supiera qué es un frasco?

## act3-open
<!-- target: 12 -->

Esta es la parte técnica de la charla. Aguántenme unos diez minutos, que es
donde está lo bueno.

## vla-architecture
<!-- target: 150 -->

Un VLA tiene tres componentes. Vamos armándolo.

Primero, las cámaras. Igual que en ACT: varias vistas del mundo.

Segundo, un *encoder* visual que convierte esos píxeles en tokens. SigLIP,
DINOv2 — los mismos que se usan en visión por computador normal.

Tercero, y aquí está lo nuevo: **la instrucción**. La frase entra tokenizada,
exactamente igual que en cualquier modelo de lenguaje.

Y ahora la pieza que lo cambia todo: un **VLM preentrenado**. PaliGemma,
SmolVLM2, Qwen-VL. Este modelo ya vio internet. Ya sabe qué es un frasco, ya sabe
qué significa "rojo", ya sabe que las cosas de vidrio se agarran con cuidado.
Nadie le enseñó eso con un robot. Lo aprendió leyendo.

Y al final, una cabeza pequeña — el *action expert* — que convierte todo eso en
movimiento: un bloque de cincuenta acciones futuras, más o menos un segundo.

Si de toda la charla se llevan una sola imagen, que sea esta.

## data-pipeline
<!-- target: 90 -->

¿Y de dónde salen los datos para entrenar esto? Del mismo sitio que en ACT.

Uno: teleoperación. Yo muevo el brazo líder con la mano, el seguidor copia.
Treinta segundos por episodio, en tiempo real. No hay atajo.

Dos: cada episodio queda guardado como tres videos sincronizados, más el estado
de las seis articulaciones a treinta hertz, más la instrucción en texto.

Tres: unos cincuenta episodios por tarea. Y esto es importante — cincuenta
repartidos entre **variaciones**. Cambiando la posición del objeto, la
iluminación, poniendo distractores. Cincuenta veces exactamente lo mismo no
sirve de nada. Ese punto vuelve más adelante.

Cuatro: entrenas. La política aprende a predecir qué acción tomó el humano dadas
esas mismas observaciones.

## action-tokenization
<!-- target: 150 -->

Ahora, el problema técnico más bonito de todo esto.

Un movimiento es una señal continua: números reales, a cincuenta hertz. Un
transformer predice símbolos discretos, de un vocabulario. Hay que cruzar ese
puente de alguna manera.

La forma obvia es cortar en cajones. Doscientos cincuenta y seis cajones por cada
dimensión. RT-2 hizo exactamente eso — y de hecho sobrescribió los doscientos
cincuenta y seis tokens menos usados del vocabulario del modelo de lenguaje para
meter ahí las acciones. Funciona. Pero miren la escalera: esa precisión que se
pierde, se pierde para siempre. Y son trescientos cincuenta tokens por chunk.

Entonces llega FAST, y la idea es preciosa: ¿y si en vez de tratarlo como números
sueltos lo tratamos como una **señal**?

Es literalmente JPEG. Le aplicas una transformada de coseno, y descubres que casi
toda la energía de una trayectoria de robot está en las frecuencias bajas —
porque los robots se mueven suave. Tiras las frecuencias altas, comprimes lo que
se repite con el mismo algoritmo que usan los tokenizadores de texto, y pasas de
trescientos cincuenta tokens a cuarenta.

Y la tercera opción es saltarse los tokens del todo: un *action expert* continuo
que genera el bloque entero por flow matching. Es lo que hacen π-cero, SmolVLA y
GR00T hoy.

El resumen, si se pierden: discreto para reusar la maquinaria del modelo de
lenguaje; continuo para ir rápido y preciso.

## action-chunking
<!-- target: 120 -->

La segunda idea clave: *action chunking*.

Empecemos por lo que pasa si no la usas. Predices una acción, la ejecutas,
vuelves a predecir. El brazo se **para** en cada inferencia — esas franjas son
el modelo pensando. Y como cada predicción ignora la anterior, el movimiento
tiembla.

Con chunking, una sola inferencia devuelve cincuenta acciones futuras. Entre
decisión y decisión el movimiento es continuo. ACT usa noventa o cien pasos a
cincuenta hertz — unos dos segundos de futuro.

Pero hay un problema del que casi nadie habla. Mientras se ejecuta un chunk, el
siguiente ya se está calculando. Y cuando llega, viene en desacuerdo con dónde
está el brazo de verdad. Esos círculos rojos son ese desacuerdo.

La solución se llama Real-Time Chunking: rellenas el solapamiento para que los
dos chunks concuerden. Y el detalle que a mí me encanta: eso es un paper de junio
de 2025, y hoy es una bandera en la línea de comandos de LeRobot.

## pretrain-finetune
<!-- target: 90 -->

Ahora, ¿por qué esto funciona con tan pocos datos tuyos?

Porque tú no entrenas un VLA. Tú haces *fine-tuning* de uno que ya existe.

SmolVLA se preentrenó con cuatrocientos ochenta y un datasets de la comunidad:
veintidós mil episodios, diez millones y medio de frames. Meses de GPU que tú no
pagaste.

Y tú aportas cincuenta episodios de tu tarea. En tu mesa. Con tu luz. Unas horas
de GPU.

Sin la fase uno, cincuenta episodios no alcanzan ni de lejos. Con la fase uno,
alcanzan. Eso es literalmente todo lo que significa "modelo fundacional" en
robótica.

## act-inside-vla
<!-- target: 75 -->

Una pregunta que seguro se están haciendo: ¿y dónde quedó ACT en todo esto?

No se fue a ninguna parte.

Miren la fila del medio. La cabeza de acción de un VLA hace exactamente lo mismo
que ACT: toma una representación de la situación y escupe un bloque de acciones
futuras. Mismo trabajo.

Lo que cambió es lo que hay **antes**. ACT construye su representación desde
cero, con un ResNet que sólo vio tus cincuenta videos. Un VLA la construye con un
modelo que vio internet.

La cabeza de acción de un VLA *es* una política de chunking. Lo que cambió no es
el músculo — es lo que le habla al músculo.

## rt2-insight
<!-- target: 60 -->

Y eso nos lleva a la intuición central, que es de RT-2.

Un modelo que nunca vio un robot ya sabe qué es un frasco. Ya sabe qué significa
"rojo". Ya sabe que las cosas frágiles se agarran con cuidado. Lo aprendió de
texto e imágenes.

RT-2 mostró que ese conocimiento **transfiere al control físico**. No hay que
enseñarle al robot qué es un objeto. Sólo hay que enseñarle cómo moverse hacia él.

Por eso un VLA generaliza donde ACT no. No es que aprenda mejor. Es que empieza
sabiendo muchísimo más.

## what-is-a-policy
<!-- target: 75 -->

Antes de seguir, una palabra que voy a usar veinte veces: **política**.

Suena raro en español, pero es simplemente una función. Le entra lo que el robot
ve, y devuelve qué hacer. Nada más.

Fíjense en el primer término: no devuelve *una* acción, devuelve un bloque —
qué hacer ahora y durante el próximo segundo. Ya volveremos a eso.

El segundo término es lo que ve: imágenes y el estado de las articulaciones.

Y el tercero es la instrucción. **ACT no tiene el tercer término. Un VLA sí.**
Toda esta charla cabe en esa diferencia.

Y una aclaración que confunde a mucha gente: esto **no** es reinforcement
learning. No hay recompensa, no hay exploración, no hay ensayo y error. Es
aprendizaje supervisado normal, donde la etiqueta es lo que hizo el humano.

## language-in
<!-- target: 90 -->

Bien, ¿cómo entra exactamente la instrucción?

Y aquí la respuesta es tranquilizadora, porque todo el mundo asume que tiene que
haber algo raro. No lo hay.

Primero, tu frase. Segundo — y esto sí es propio de los VLA — no se la pasas
suelta: la envuelven en una plantilla fija. "¿Qué acción debería tomar el robot
para {tu instrucción}?" Y eso es astuto, porque así el modelo no está aprendiendo
una tarea nueva. Sigue haciendo lo único que sabe hacer: predecir el siguiente
token de una pregunta.

Tercero, el tokenizador. **El mismo de texto.** Fíjense que "magnesio" se parte
en dos pedazos, y no pasa absolutamente nada.

Y cuarto: esos vectores se pegan detrás de los de la imagen. Para el transformer
es una sola secuencia. No sabe cuáles son píxeles y cuáles son palabras — y esa
es justamente la idea.

## attention
<!-- target: 105 -->

Y aquí la pregunta que siempre sale, así que me adelanto: ¿es la misma atención
que ChatGPT?

Sí. El backbone es un transformer decoder normal, con self-attention idéntica a
la de un modelo de texto. Mismas librerías, misma matemática, mismos kernels.

Lo que cambia está al final, y vale la pena entenderlo bien porque es la única
diferencia real. El action expert usa **cross-attention**.

¿Y cuál es la diferencia? Sólo de dónde salen las tres matrices. En
self-attention, la query, la key y el value salen de la **misma** secuencia:
cada token mira a todos los demás.

En cross-attention, la query sale de las acciones, y la key y el value salen del
VLM. Dicho en cristiano: **las acciones preguntan, y el modelo de visión y
lenguaje responde.**

Y eso tiene una consecuencia práctica muy concreta: puedes entrenar el experto
de acción dejando el backbone completamente congelado.

Así que sí — el noventa por ciento de un VLA es el transformer que ya conocen.
Lo nuevo son las últimas capas.

## detokenizer
<!-- target: 90 -->

Ya vimos cómo se entra al mundo discreto. ¿Cómo se sale?

Porque el modelo escupe siete IDs de token, y un motor necesita grados.

Le restas el offset, y te queda un número del cero al doscientos cincuenta y
cinco: el cajón. Lo llevas al rango continuo. Y después lo des-normalizas con
las estadísticas del dataset.

Y aquí un detalle que me parece precioso de ingeniería: se des-normaliza con los
percentiles uno y noventa y nueve, **no** con el mínimo y el máximo. ¿Por qué?
Porque si una sola demostración salió mal y el brazo pegó un tirón, ese valor
extremo te estiraría toda la escala y arruinaría la precisión de las otras
cuarenta y nueve.

Y miren el resultado: son **deltas**. El modelo no dice "ve a esta coordenada",
dice "muévete cuatro milímetros hacia allá". Y eso se repite treinta veces por
segundo.

## closed-loop
<!-- target: 75 -->

Juntemos todo.

Observar: tres cámaras y el estado. Tokenizar: parches de imagen más la
instrucción. El VLM: self-attention sobre esa secuencia. El action expert:
cross-attention, preguntándole al VLM. De-tokenizar: a milímetros y grados.
Y ejecutar.

Y vuelta a empezar. Treinta veces por segundo, mientras el brazo se está
moviendo.

El chunk es lo que permite que este bucle **no** tenga que cerrarse en cada
paso. Por eso el movimiento se ve continuo y no a tirones.

Eso es un VLA completo. Todo lo que sigue son variaciones sobre este dibujo.

## train-open
<!-- target: 12 -->

Ya sabemos cómo piensa. Ahora, cómo aprende.

## recording
<!-- target: 90 -->

Esto es lo que pasa exactamente cuando grabas un dataset, y tiene un detalle que
aclara todo lo demás.

Yo muevo el brazo líder con la mano. El seguidor copia. Fíjense que el seguidor
va siempre un pelín por detrás — no es un defecto, es física.

Y en cada timestep, treinta veces por segundo, se escribe un renglón en disco:
las tres imágenes, el estado, la acción, la instrucción, y los índices.

Ahora miren esas dos filas del medio, porque **no son lo mismo**.

`observation.state` es dónde **está** el seguidor. `action` es dónde lo **mandó**
el humano con el líder.

Y entrenar la política es exactamente esto: aprender a predecir la segunda a
partir de la primera. Aprender a ser la mano del humano.

Eso es todo el behavior cloning. No hay más.

## openvla-anatomy
<!-- target: 120 -->

Veamos uno de verdad por dentro. OpenVLA, que fue el primer VLA abierto serio y
es el más fácil de enseñar, porque cada caja es algo que ya conocen.

Uno: dos encoders visuales, no uno. DINOv2 y SigLIP, y se concatenan sus
features. Uno es bueno en geometría, el otro en semántica.

Dos: un MLP los proyecta al espacio de embeddings de Llama.

Tres: la instrucción entra por el tokenizador de Llama, sin tocar nada.

Cuatro: todo se convierte en una sola secuencia y entra a un Llama 2 de siete mil
millones de parámetros. Que hace exactamente lo de siempre: predecir el siguiente
token.

Sólo que los tokens que predice son acciones — porque le sobrescribieron los
doscientos cincuenta y seis tokens menos usados del vocabulario.

Y seis: el de-tokenizador los vuelve milímetros y grados.

No hay nada exótico aquí. Es un modelo de lenguaje al que le enseñaron un
vocabulario nuevo.

## smolvla-anatomy
<!-- target: 120 -->

Y ahora el que está corriendo en esta mesa.

Mismo esquema general: un modelo de visión y lenguaje que recibe las cámaras, la
tarea y el estado del robot.

Pero aquí viene la idea que más me gusta de todo el paper.

Usa sólo la **primera mitad** de las capas del VLM. Las corta.

¿Por qué se puede hacer eso? Porque las últimas capas de un modelo de lenguaje se
especializan en **producir lenguaje** — en elegir la palabra siguiente. Y un robot
no necesita hablar. Necesita entender la escena, y eso ya está resuelto a media
altura de la red.

Después, el action expert alterna cross-attention, que lee el VLM, con
self-attention propia.

Y parte de acciones con ruido que va limpiando paso a paso — eso es flow
matching, la misma familia de ideas que los modelos de imágenes.

Cortar esas capas es lo que convierte un modelo de quinientos millones en un VLA
de cuatrocientos cincuenta que corre en un portátil. Esa decisión es la razón de
que este demo sea posible.

## act4-open
<!-- target: 10 -->

Bien. ¿Y qué hay disponible hoy para usar?

## model-landscape
<!-- target: 120 -->

Este es el panorama, y todos estos números los verifiqué contra las fuentes
originales, porque hay mucha cifra suelta circulando por ahí.

RT-2: cerrado, gigante, pero es el que abrió la puerta.

OpenVLA: el primero abierto de verdad. Siete mil millones de parámetros, Llama 2
por debajo.

π-cero y π-cero-cinco, de Physical Intelligence. Ojo con esto: ellos ya van por
π-cero-siete, pero el último que liberaron es el cero-cinco.

GR00T N1.7, de NVIDIA. Lo interesante de este no es el tamaño, es esto: casi
nueve hertz corriendo en un Jetson montado **en el propio robot**. Sin PC.

Y SmolVLA. Cuatrocientos cincuenta millones de parámetros. Este es el que corre
en mi mesa, y del que va el demo.

## accessibility
<!-- target: 90 -->

Quiero detenerme aquí un segundo, porque este es el cambio real.

SmolVLA son cuatrocientos cincuenta millones de parámetros. Trescientos
cincuenta de modelo de lenguaje, y sólo usa la mitad de las capas. Cien millones
de cabeza de acción. Sesenta y cuatro tokens visuales por frame.

Se entrenó con datasets **de la comunidad**, no de un laboratorio frontera.

Y este dato me parece el más bonito de toda la charla: en tareas reales sobre un
brazo SO-100, **le gana a π-cero**, que tiene siete veces más parámetros.
Setenta y ocho por ciento contra sesenta y uno.

El brazo cuesta unos ciento cincuenta dólares. El modelo es abierto. El dataset
lo grabas tú en una tarde.

Eso es lo que cambió. Esto ya no es sólo de Google.

## when-to-use
<!-- target: 90 -->

Ahora, la parte honesta, y quiero que quede clara porque es la que más se me
olvida decir a mí mismo.

Si tienes **una** tarea fija, un objeto fijo, un entorno fijo: usa ACT o
Diffusion Policy. Punto. Va a ser más preciso, más rápido y más barato que
cualquier VLA.

Un VLA se paga solo cuando necesitas otra cosa: que el lenguaje cambie el
comportamiento, o que el sistema aguante objetos que no vio.

Y los modelos generalistas grandes, hoy por hoy, son para quien tenga la flota y
el presupuesto. Los mejores están cerrados.

O sea: vine a hablarles de VLA, y les estoy diciendo que muchas veces no es la
respuesta. Eso también es parte de entender la tecnología.

## act5-open
<!-- target: 20 -->

Bueno. Vamos a la parte que puede salir mal.

Y les cuento algo: puse el demo a mitad de charla a propósito. Si sale bien,
todavía nos queda la mejor parte. Y si sale mal, me quedan veinte minutos para
recuperarme. Nunca pongan un demo en vivo al final.

## demo-rig
<!-- target: 90 -->

Esto es lo que hay montado.

En casa tengo la torre con la 5060 Ti. Ahí hice el fine-tuning de SmolVLA sobre
mi dataset, y subí el modelo entrenado a Hugging Face.

Aquí, en esta Mac, no se entrena nada. Sólo descargo los pesos y corro
inferencia sobre MPS, que es el backend de Metal de PyTorch. Esa separación es
lo que hace que un demo de robot sea portátil.

Tres cámaras USB — y un consejo si van a hacer esto: los índices de las cámaras
cambian cada vez que las reconectan. Verifíquenlos en el sitio, no en su casa.

Y el brazo, el SO-101 seguidor.

Ah, y si nada de esto funciona: tengo una tecla. La letra B me lleva a un video
donde todo sale perfecto. Ya lo saben, así que ahora no puedo hacer trampa sin
que se den cuenta.

## demo-vla
<!-- target: 330 -->

Vamos.

Primero les muestro qué le voy a pedir. Fíjense bien en esto, porque es todo lo
que va a cambiar entre una corrida y la otra: **una frase**.

Corrida uno: "agarra el Complejo B".

*(ejecutar, dejar correr en silencio)*

Bien. Ahora recoloco los objetos exactamente igual.

Y ahora — y esto es lo único que voy a tocar — cambio la frase. Mismo modelo.
Mismos pesos. Mismo robot. Mismas cámaras. Sólo la frase.

"Agarra el frasco de magnesio."

*(ejecutar)*

Eso. Eso es un VLA.

No hay un `if` en ninguna parte. Yo no programé un detector de frascos. No hay
una tabla de objetos. La instrucción entra por la misma puerta que las imágenes,
y el comportamiento cambia.

Toda la charla de hoy es la explicación de cómo se llega hasta ahí.

## demo-act-video
<!-- target: 60 -->

Y para que vean el contraste, esto es la misma tarea con ACT.

Miren: lo hace bien. Muy bien, de hecho. Más suave que el VLA, incluso.

Pero lo hace **igual** sin importar lo que yo diga. Le puedo pedir el magnesio,
le puedo pedir el Complejo B, le puedo recitar poesía. Va a hacer exactamente lo
mismo, porque no me está oyendo.

Ese es el salto entero de esta charla, en dos videos.

## backup-demo
<!-- target: 30 -->

*(sólo si el demo en vivo falla)*

Bueno, pasa. Y honestamente es una transición perfecta, porque el siguiente acto
se llama "la parte honesta" y trata justamente de esto: de que estos sistemas
todavía son frágiles.

Este es el video de la misma prueba, grabado ayer. Miren el cambio de
instrucción.

## act6-open
<!-- target: 12 -->

Y ahora la parte que casi nadie pone en sus charlas.

## adoption
<!-- target: 75 -->

Primero, para dimensionar qué tan rápido se está moviendo esto.

Papers de VLA enviados a ICLR, que es una de las conferencias grandes de
machine learning.

En 2024: **uno**. Y lo rechazaron.

En 2025: nueve.

En 2026: ciento sesenta y cuatro.

Dieciocho veces en un año. La proyección para 2027 es de más de mil.

Y aquí una nota metodológica que quiero hacer explícita: hay cifras circulando
sobre adopción industrial — que los VLA ya respaldan el cuarenta por ciento de
los despliegues nuevos. Ese número viene de un informe de mercado privado, sin
metodología publicada. Yo se los menciono como dirección, no como dato. Prefiero
darles un número que puedan verificar que uno que suene mejor.

## limitations
<!-- target: 105 -->

Ahora, lo que no funciona.

Primero: los benchmarks están saturados. LIBERO, que es el que todo el mundo
reporta, vive entre noventa y cinco y noventa y nueve por ciento. Ya no
distingue nada.

Segundo, y este es el importante: esos benchmarks **esconden** la brecha real.
Hay una evaluación que se llama RoboArena, que compara políticas en robots
físicos, a ciegas, entre laboratorios distintos. Y ahí la foto es completamente
otra: casi ningún modelo abierto se acerca a los de Physical Intelligence.

Tercero: latencia. El modelo tarda más en pensar un chunk de lo que el robot
tarda en ejecutarlo. Por eso existe RTC.

Y cuarto: generalización frágil. Cambias la luz, cambias la mesa, mueves una
cámara — y el rendimiento se cae.

Si alguien les enseña un noventa y ocho por ciento en LIBERO, no les está
diciendo casi nada sobre lo que va a pasar en una mesa de verdad.

## data-economics
<!-- target: 90 -->

Y volvemos al principio: los datos.

Esto es DROID. Setenta y seis mil trayectorias. Trescientas cincuenta horas.
Quinientas sesenta y cuatro escenas. Cincuenta personas recolectando. Trece
instituciones. Doce meses.

Y eso es **un** dataset.

Por eso les decía que la unidad no son dólares por hora. La unidad son
**años-institución**.

Pero hay un resultado que cambia cómo hay que gastar ese presupuesto, y es
contraintuitivo. La generalización escala con la **diversidad** de escenas y
objetos, siguiendo una ley de potencias. Las demostraciones adicionales *en la
misma escena* se saturan rapidísimo.

O sea: no estás pagando por volumen. Estás pagando por variedad. Y ahí es donde
casi todo el mundo gasta mal.

Por eso insistí tanto, hace veinte minutos, en las variaciones.

## act7-open
<!-- target: 12 -->

Les quiero contar un proyecto que diseñé, porque la lección que me dejó no es de
modelos — es de arquitectura.

## chess-layers
<!-- target: 120 -->

Un robot que juega ajedrez.

Arriba, Stockfish. Evalúa millones de posiciones y decide la mejor jugada. No
sabe que existe un brazo. No sabe que existe un mundo físico.

Debajo, el orquestador. Y aquí está lo bonito: **una** jugada de ajedrez puede
ser **dos o tres** operaciones físicas. Una captura son dos: primero sacas del
tablero la pieza comida, después mueves la tuya. El enroque son dos: el rey y la
torre. Una promoción son tres: quitas el peón, lo sacas del tablero, pones la
dama.

Después, la visión: encuentra el tablero, y traduce "e5" a unas coordenadas en
milímetros.

Y aquí, en esta línea, **muere el ajedrez**.

Porque lo único que cruza hacia abajo son tres números. ACT recibe coordenadas y
agarra. No sabe qué es un caballo. No sabe qué es una captura. No sabe que hay
una partida.

## chess-lesson
<!-- target: 90 -->

Y esa es la lección.

Yo, cuando empecé a diseñarlo, quería meter el ajedrez dentro de la política.
Quería un modelo que "entendiera ajedrez y moviera piezas". Es el error por
defecto, y es carísimo: necesitarías datos de robot para cada situación de
ajedrez posible.

Lo correcto es lo contrario. Pon el razonamiento donde hay razonamiento — un
motor de ajedrez, que ya es sobrehumano y no necesita entrenamiento. Pon el
músculo donde hay músculo — una política que sólo sabe agarrar y soltar. Y que
se encuentren en el punto más estrecho posible: aquí, un par de coordenadas.

El músculo nunca se entera de la diferencia entre una captura y un enroque. Y
está bien que no se entere.

Esto lo tengo diseñado, no construido. Se los cuento igual, porque el error que
casi cometo es más útil que el proyecto terminado.

## act8-open
<!-- target: 10 -->

Y para cerrar, hacia dónde va esto.

## world-models
<!-- target: 120 -->

Todo lo que vimos hoy es **reactivo**. El robot ve, actúa, vuelve a ver, vuelve
a actuar. En ningún momento tiene una noción de lo que va a pasar. Sólo responde
a lo que tiene delante.

El siguiente paso son los **modelos del mundo**. La idea es que antes de moverse,
el modelo simule varios futuros posibles — qué pasa si agarro por aquí, qué pasa
si agarro por allá — y elija uno.

Dicho de otra forma: que pueda equivocarse en su cabeza en vez de equivocarse en
la mesa.

Y esto ya no es ciencia ficción. Hay un modelo que se llama VLA-JEPA que ya está
en LeRobot: usa un backbone Qwen3-VL, un modelo del mundo de video que se llama
V-JEPA2, y una cabeza de acción por flow matching.

Pero fíjense en el detalle, porque es el que dice dónde está exactamente la
frontera: en VLA-JEPA, el modelo del mundo se usa **sólo durante el
entrenamiento**. En inferencia se descarta.

O sea: hoy los modelos del mundo nos sirven para **aprender** mejor. Todavía no
para **planear**. Ese salto es lo que viene.

## generalist-models
<!-- target: 90 -->

Y una pregunta que seguro tienen: ¿en qué se diferencia esto de los modelos
generalistas de los que todo el mundo habla?

Los modelos de moda son generalistas de texto e imagen. Un VLA es un generalista
de **acción**. Y la diferencia no es de tamaño, es de naturaleza.

Un modelo de lenguaje se equivoca y tú reescribes el prompt. Un VLA se equivoca y
tira un frasco al suelo.

Un modelo de lenguaje se evalúa con benchmarks reproducibles. Un VLA sólo se
evalúa de verdad en una mesa física — y cada mesa del mundo es distinta.

Un modelo de lenguaje aprende de datos que ya existían. Un VLA necesita datos que
alguien tiene que generar moviendo un robot.

El cuello de botella de los modelos de lenguaje era el cómputo. El de los VLA es
el mundo físico. Y ese no escala comprando más GPUs.

## open-question
<!-- target: 60 -->

Entonces les dejo la pregunta abierta, que es de verdad abierta.

¿El cuello de botella son los **datos**? No existen a escala web, y generarlos
cuesta años-institución.

¿Es la **arquitectura**? Nadie ha demostrado todavía la receta que claramente
gana. Ciento sesenta y cuatro papers no se ponen de acuerdo.

¿O es el **hardware**? Manos baratas, precisas y fiables siguen sin existir.

Mi apuesta son los datos. Pero de verdad no lo sé, y por eso este campo está tan
divertido ahora mismo.

## resources
<!-- target: 45 -->

Aquí les dejo por dónde seguir. Los códigos funcionan desde el fondo del salón.

El primero es el survey, si quieren el mapa completo del campo. El segundo es
LeRobot, que es por donde se empieza si quieren construir algo. El tercero es
SmolVLA. Y el último son estas diapositivas, con todas las referencias.

## thanks
<!-- target: 30 -->

Gracias.

Si alguno trabaja en robótica, en manufactura, en logística — o simplemente
quiere armar uno de estos brazos y no sabe por dónde empezar — búsquenme.
Voy a estar aquí toda la noche y me encanta hablar de esto.

Ahora sí: preguntas.
