# Del Token al Torque: monólogo (español)

Guion hablado completo. Cada `##` es el `routeAlias` de una diapositiva, así que
reordenar `slides.md` nunca desincroniza el guion.

El comentario `<!-- target: Ns -->` es cuánto debería durar la sección. El modo
`/practice` compara ese objetivo con la estimación por conteo de palabras.

Presupuesto: 30-40 min. El guion son ~17 min de voz; con las animaciones de
cada click, las pausas y ~5 min de demo, la charla cae en ~30-35 min. Los
objetivos (`target`) incluyen el tiempo de animación, así que es normal que la
estimación por palabras quede por debajo. Después, preguntas.

---

## title
<!-- target: 45 -->

Buenas noches. Me llamo Juan Manuel.

Hace unos meses imprimí un brazo robótico en mi casa, lo armé y le enseñé a
entender español. Hoy les vengo a contar cómo funciona eso por dentro, y en un
rato lo vamos a hacer en vivo, aquí, con este brazo.

La charla se llama **Del Token al Torque**, porque de eso se trata: de cómo una
frase que tú escribes termina convertida en un motor que gira.

## hook
<!-- target: 60 -->

Quiero empezar con una pregunta. ¿Por qué ChatGPT explotó y los robots no?

En tres años pasamos de una IA que escribía frases raras a una que medio mundo
usa todos los días. La robótica lleva prometiendo lo mismo desde mucho antes, y
sigue sin llegar.

La respuesta fácil es que mover cosas es más difícil que escribir. Y es verdad,
pero no es eso. O no es sólo eso.

La razón de fondo es que los datos son de otra naturaleza.

## data-asymmetry
<!-- target: 90 -->

Miren esto. Un modelo como Llama 3 se entrenó con unos quince billones de
tokens. Quince millones de millones. Y casi todo ese texto ya estaba escrito:
alguien más lo produjo, lo publicó, y nosotros sólo lo descargamos.

Ahora, los datos de robot. Cada una de estas barras es un episodio: una
persona moviendo físicamente un brazo durante treinta segundos, en tiempo
real. No se puede acelerar, no se puede paralelizar, no se puede raspar de
internet. El dataset abierto más grande que juntó la comunidad, Open
X-Embodiment, tiene alrededor de un millón de episodios, de 34 laboratorios.

El texto ya estaba escrito. Cada episodio de robot hay que vivirlo en tiempo
real.

Quédense con esa idea, porque todo lo que viene hoy es, de una forma u otra,
una manera de sacarle más a muy pocos datos.

## ch-vla
<!-- target: 10 -->

Entonces, ¿qué es exactamente un VLA?

## vla-acronym
<!-- target: 75 -->

VLA son tres letras.

**Vision.** El modelo ve el mundo con cámaras. Cada imagen se corta en
pedacitos, parches, y cada parche se vuelve un token, igual que una palabra.

**Language.** Entiende lo que le pides. La instrucción pasa por el mismo
tokenizador que usa un modelo de lenguaje. Nada especial.

**Action.** Y aquí está lo nuevo. La salida no es texto. Son comandos de
motor: cuánto mover cada articulación, y si abrir o cerrar la pinza.

Ahora veamos las tres cosas pasar a la vez.

## vla-hero
<!-- target: 150 -->

Esta es la mesa del demo: el Complejo B, una taza, el frasco de magnesio y
una bandeja.

Primero, **ver**. La cámara captura la escena y la imagen se parte en parches.
El modelo reconoce qué hay en la mesa.

Segundo, **leer**. Le escribo: "pon el magnesio en la bandeja". La frase se
parte en tokens, igual que en ChatGPT. Fíjense que "magnesio" se parte en dos
pedazos, y no pasa absolutamente nada.

Tercero, **ubicar**. Las palabras "magnesio" y "bandeja" jalan la atención del
modelo hacia esos dos objetos, y todo lo demás se apaga.

Una aclaración honesta: las cajas y la máscara son para que lo veamos
nosotros. Un VLA no dibuja cajas. Esa ubicación ocurre implícitamente dentro
de su atención, y en un momento les muestro cómo.

Cuarto, **actuar**. Y lo único que sale del modelo son estos siete números: tres
de posición, tres de rotación y uno de la pinza. Treinta veces por segundo.

(Deja correr el pick en silencio.)

Un modelo. Ningún if. Nadie programó "si dice magnesio, ve a la izquierda".

## what-is-a-policy
<!-- target: 60 -->

Voy a usar mucho una palabra, así que la defino: **política**.

Una política es una función. Recibe **o**, la observación: lo que ven las
cámaras y dónde están las articulaciones. Recibe **ℓ**, la instrucción. Y
devuelve **a**: no una acción, un bloque de acciones hacia el futuro.

ACT, el modelo con el que empecé, no tiene ese término ℓ. Un VLA sí. Toda la
charla cabe en esa diferencia.

Y un detalle que mucha gente asume mal: esto no es reinforcement learning. No
hay recompensa, no hay prueba y error. Es aprendizaje supervisado, y la
etiqueta es lo que hizo el humano.

## act-vs-vla
<!-- target: 90 -->

Les cuento cómo me di cuenta de esto.

Entrené una política ACT para agarrar un cubo rojo. Funcionaba perfecto. Un
día le puse un cubo azul al lado y le dije "agarra el azul". Y agarró el rojo.
Claro: no existe el cable por donde entraría la frase. Aunque yo le hable, no
tiene cómo escucharme.

Peor: moví el cubo rojo diez centímetros y cerró la pinza en el aire. Había
aprendido muy bien esa tarea, en esa posición.

Un VLA recibe la frase por la misma puerta que las imágenes. Le dices "el
azul", va al azul. Le dices otra cosa, hace otra cosa.

ACT es un reflejo: buenísimo, y sordo. Un VLA es un reflejo que escucha.

## ch-inside
<!-- target: 10 -->

Esta es la parte técnica. Aguántenme unos diez minutos.

## language-in
<!-- target: 70 -->

Empecemos por cómo entra el lenguaje.

No le pasas la frase suelta. La envuelves en una plantilla fija. En OpenVLA es
literalmente: "In: What action should the robot take to... tu frase? Out:".

Eso es astuto, porque el modelo no está aprendiendo una tarea nueva. Sigue
haciendo lo que siempre hizo: predecir el siguiente token después de "Out".

La frase pasa por el tokenizador de siempre, el mismo de un modelo de texto.
Y cada token se vuelve un vector, una lista de números. Desde aquí, para el
modelo, todo son números.

## vision-in
<!-- target: 60 -->

La imagen entra de una forma muy parecida.

Se corta en una cuadrícula de parches. SmolVLA, el modelo del demo, usa 64
tokens por imagen. Cada parche se vuelve un token, igual que una palabra.

Y ahora lo importante: los tokens de la imagen, los de la frase y uno más con
el estado del brazo se pegan en una sola secuencia. Para el transformer es una
fila de números. No sabe cuáles eran píxeles y cuáles eran palabras.

## attention
<!-- target: 100 -->

Y aquí viene la pregunta que siempre sale: ¿esto es la misma atención de
ChatGPT?

Miren lo que pasa con la palabra "magnesio". Mira a toda la imagen, y le da
más peso a los parches donde está el frasco. Así es como el modelo "ubica" el
objeto sin dibujar ninguna caja.

Y sí: es exactamente la misma operación. Softmax de Q por K transpuesta, por
V. Mismas matemáticas, mismas librerías, el mismo transformer.

Lo que cambia está al final. El action expert usa cross-attention: las
acciones hacen las preguntas, y el modelo de visión y lenguaje responde.

Y la máscara, quién puede mirar a quién. Imagen y texto se miran entre sí; las
acciones sólo miran hacia atrás. En la práctica, casi toda la diferencia con
un LLM está en la máscara y en las últimas capas.

## action-tokens
<!-- target: 110 -->

Ahora la parte más interesante: ¿cómo convierte un transformer, que predice
símbolos, en movimiento?

Un movimiento es una señal continua. Esta curva es una articulación durante un
segundo.

La muestreas treinta veces por segundo.

Y cortas el rango en 256 cajones. Cada cajón es un token. RT-2 y OpenVLA
hacen justo esto: reusan los 256 tokens menos usados del vocabulario y les
dan un significado nuevo. Funciona, pero fíjense en la escalera: esa
precisión se pierde.

Hoy hay dos formas mejores. **FAST** trata la trayectoria como una señal, igual
que JPEG trata una imagen: la pasa a frecuencias y comprime. En una tarea de
doblar camisetas, de 700 tokens pasa a 53.

Y **flow matching** se salta los tokens del todo: parte de ruido y lo va
limpiando hasta tener la trayectoria. Es lo que usan π0, SmolVLA y GR00T.

## detokenizer
<!-- target: 60 -->

Y el camino de vuelta, que casi nadie explica.

El modelo escupe siete IDs de token. Le restas el offset y te queda el cajón,
de 0 a 255. Lo llevas a un rango de menos uno a uno.

Y lo des-normalizas con los percentiles 1 y 99 del dataset. No con el mínimo y
el máximo, para que una sola demostración mala no te estire toda la escala.

Eso ya son milímetros y grados, y eso mueve el servo. Seis son deltas,
"muévete un poquito hacia allá". La pinza es la excepción: es absoluta.

## action-chunking
<!-- target: 80 -->

Otro truco clave: predecir bloques, no pasos.

Si predices una acción por inferencia, el brazo se detiene a pensar en cada
tick, y como cada predicción ignora la anterior, tiembla.

Con chunking, una sola inferencia devuelve cincuenta acciones hacia el futuro,
y el movimiento es continuo. ACT usa unas cien; SmolVLA y π0, cincuenta.

Y el detalle fino de 2025: mientras ejecuta un bloque, ya está calculando el
siguiente, y los empalma para que no se note la costura. Se llama real-time
chunking, y en LeRobot hoy es una bandera en la línea de comandos.

## architecture
<!-- target: 110 -->

Juntemos todo. Esta es la máquina completa, al estilo SmolVLA.

Tres cámaras, la frase y el estado del brazo entran al modelo de visión y
lenguaje.

Y aquí está la idea que más me gusta del paper. SmolVLA usa sólo la primera
mitad de las capas: 16 de 32. Las últimas capas de un modelo de lenguaje se
especializan en producir lenguaje, y un robot no necesita hablar. Las cortan.

El action expert parte de ruido y lo limpia en diez pasos hasta tener cincuenta
acciones. El brazo se mueve, la cámara ve el resultado, y el ciclo vuelve a
empezar.

Para ponerlo en perspectiva: OpenVLA tiene 7 mil millones de parámetros, usa
tokens discretos y corre a unos 6 Hz en una 4090. SmolVLA tiene 450 millones y
corre en un portátil. Es el que van a ver en un rato.

## ch-train
<!-- target: 10 -->

Ya sabemos cómo piensa. Ahora, cómo aprende.

## recording
<!-- target: 75 -->

Todo empieza grabando datos. Y el montaje tiene dos brazos.

Yo muevo el brazo **líder** con la mano. El **seguidor** copia el movimiento, un
pelín tarde.

Treinta veces por segundo se escribe un renglón: las imágenes de las tres
cámaras, el estado del brazo y la acción.

Y miren estas dos filas, porque no son lo mismo. El estado es dónde **está** el
robot, el seguidor. La acción es dónde lo **mandó** el humano, el líder.
Entrenar una política es aprender a predecir la segunda a partir de la
primera. Eso es todo el behavior cloning.

## training
<!-- target: 70 -->

Entrenar es eso, repetido millones de veces.

El modelo mira una muestra y predice un bloque de acciones. Lo comparas con lo
que hizo el humano, y la diferencia es el error.

Veinte mil pasos después, la predicción cae encima de lo que hizo el humano.

Sin recompensa, sin prueba y error: copia. Para SmolVLA con unos cincuenta
episodios, son unas cuatro horas en una A100.

## pretrain-finetune
<!-- target: 70 -->

¿Y de dónde sale que baste con cincuenta episodios?

Del pre-entrenamiento. SmolVLA se entrenó primero con 481 datasets de la
comunidad: más de diez millones de fotogramas. Meses de GPU que ustedes no
pagaron.

Ustedes aportan su parte: cincuenta episodios, por ejemplo cinco posiciones
con diez repeticiones cada una. Unas horas.

Sin la primera fase, cincuenta episodios no alcanzan ni de lejos. Con ella,
alcanzan. Eso es todo lo que significa "modelo fundacional" en robótica.

## ch-demo
<!-- target: 20 -->

Y ahora, la parte que puede salir mal.

Puse el demo a mitad de la charla a propósito. Si falla, todavía me queda
media charla para recuperarme.

## my-build
<!-- target: 60 -->

Primero, el brazo. Es un SO-101, un diseño abierto, y lo imprimí en una Ender 3.

Seis servos por brazo, todos en un mismo bus serial, y tres cámaras USB:
arriba, en la muñeca y en la base.

La anécdota que lo resume: los primeros agujeros me salieron medio milímetro
pequeños y me comí los tornillos. Tuve que calibrar la compensación de la
impresora antes de poder armar nada.

El par, líder y seguidor, sale en unos 230 dólares en piezas.

## demo-video
<!-- target: 60 -->

Esto es en mi mesa, en mi casa, con el modelo que entrené. Mismo brazo, mismos
objetos.

(Deja correr el vídeo.)

Ahora lo vamos a hacer aquí, en vivo, con la luz de esta sala.

## demo-live
<!-- target: 240 -->

Mismo robot. Mismo modelo. Mismos pesos. Lo único que va a cambiar es la
frase.

Primero: "agarra el Complejo B".

(Ejecuta. Silencio. Deja que la sala lo mire.)

Ahora cambio sólo la frase: "agarra el frasco de magnesio".

(Ejecuta. Cuando vaya al otro objeto, calla.)

No hay un if en ninguna parte. Eso es un VLA. Todo lo demás en esta charla
explica cómo llega ahí.

## demo-act-video
<!-- target: 30 -->

Y para comparar: esta es la misma tarea con ACT. La hace muy bien. Pero la
hace igual, diga yo lo que diga.

## backup-demo
<!-- target: 5 -->

(Sólo si el demo falló.) Esto pasa, y es justo de lo que vamos a hablar en un
momento. Así se ve cuando sale bien.

## ch-future
<!-- target: 10 -->

¿Y para dónde va todo esto?

## field-growth
<!-- target: 45 -->

Primero, el campo explotó. Envíos a ICLR que mencionan Vision-Language-Action:
uno en 2024, y fue rechazado. Nueve en 2025. Ciento sesenta y cuatro en 2026.
Son búsquedas por palabra clave, no un censo, pero la tendencia es clarísima.

Y en el último año salieron π0.5, SmolVLA, GR00T, π0.7, Gemini Robotics 2... La
mitad ya se puede usar desde LeRobot.

## limitations
<!-- target: 60 -->

Pero seamos honestos con lo que todavía no funciona.

Los benchmarks de simulación están saturados. En LIBERO todos sacan entre 95 y
98 por ciento. Ya no separan a nadie.

En el mundo real, evaluando a ciegas en robots físicos, como hace RoboArena, la
foto es muy distinta. Y juntar datos reales sigue siendo carísimo: DROID
necesitó cincuenta personas durante un año.

Y lo más contraintuitivo: lo que mejora la generalización no es el número de
demostraciones, es la diversidad. Más escenas y más objetos, no más
repeticiones de lo mismo.

## world-models
<!-- target: 110 -->

Todo lo que vimos hoy es reactivo: ve y actúa. No tiene idea de qué va a pasar
después.

Un modelo del mundo aprende a predecir el futuro: "si hago esto, la escena se
verá así". Y eso se combina con un VLA de cuatro formas.

Como **planificador**: imagina varios futuros antes de moverse y elige el
mejor. V-JEPA 2, de Meta, hace pick-and-place sin haber visto esos objetos.

Como **generador de datos**: con un video de un robot haciendo una tarea,
genera videos de tareas nuevas. Justo lo que nos falta.

Como **señal de entrenamiento**: el modelo aprende a predecir el futuro mientras
aprende a actuar. VLA-JEPA ya está en LeRobot, y el detalle es que el modelo
del mundo se usa sólo al entrenar.

Y como **evaluador**: probar políticas en simulación aprendida antes de
tocar un robot real.

Hoy, la mayor ganancia viene de usarlo para entrenar mejor. Planear en tiempo
real todavía es caro.

## generalist-models
<!-- target: 90 -->

¿Y cómo encaja esto con los modelos generalistas de los que todo el mundo
habla?

Piénsenlo en capas. Arriba, un modelo generalista razona. Le dices "limpia la
mesa" y lo convierte en pasos. Es lento, pero sabe del mundo y puede usar
herramientas.

Abajo, el VLA ejecuta cada paso: "agarra el frasco de magnesio". Rápido,
decenas o cientos de veces por segundo.

El generalista decide **qué**. El VLA decide **cómo**. Y ya hay sistemas donde
el generalista llama al VLA como una herramienta más.

Y una diferencia de fondo: un LLM se equivoca y reescribes el prompt. Un VLA
se equivoca y tira un frasco al suelo.

## when-to-use
<!-- target: 75 -->

Entonces, ¿cuándo usar qué?

Si tienes **una tarea fija** y poco presupuesto: ACT. Unas cincuenta demos, unas
horas en una GPU. Es la línea base barata, aunque no siempre la mejor.

Si **el lenguaje elige** el objeto o la tarea, como en el demo: afina un VLA
pequeño como SmolVLA.

Y si la tarea es **larga y abierta**, necesita saber del mundo: un planificador
generalista que llama al VLA como herramienta.

Y lo digo sin matices: lo que vine a contarles hoy muchas veces no es la
respuesta. Úsenlo cuando el lenguaje de verdad tiene que cambiar el
comportamiento.

## thanks
<!-- target: 20 -->

Muchas gracias.

El código QR lleva a las diapositivas, con todas las referencias. Con gusto
respondo preguntas.

## references
<!-- target: 5 -->

(No se presenta. Está para quien descargue las diapositivas.)
