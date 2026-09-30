# Del Token al Torque: monólogo (español)

Guion hablado completo. Cada `##` es el `routeAlias` de una diapositiva, así que
reordenar `slides.md` nunca desincroniza el guion.

El comentario `<!-- target: Ns -->` es cuánto debería durar la sección. El modo
`/practice` compara ese objetivo con la estimación por conteo de palabras.

Presupuesto: 30-40 min. El guion son ~25 min de voz; con las animaciones de
cada click, las pausas y ~5 min de demo, la charla cae en ~35 min. Los
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

Esta es la mesa del demo: el Complejo B, una taza, el frasco de zinc y una
bandeja.

Primero, **ver**. La cámara captura la escena y la imagen se parte en parches.
El modelo reconoce qué hay en la mesa.

Segundo, **leer**. Le escribo: "pon el zinc en la bandeja". La frase se parte en
pedacitos llamados tokens, igual que en ChatGPT, y cada pedacito se vuelve un
número.

Tercero, **ubicar**. Las palabras "zinc" y "bandeja" jalan la atención del
modelo hacia esos dos objetos, y todo lo demás se apaga.

Una aclaración honesta: las cajas y la máscara son para que lo veamos
nosotros. Un VLA no dibuja cajas. Esa ubicación ocurre implícitamente dentro
de su atención, y en un momento les explico qué es eso.

Cuarto, **actuar**. Y lo único que sale del modelo son estos números: cuánto
mover cada articulación y qué hacer con la pinza. Treinta veces por segundo.

(Deja correr el pick en silencio.)

Un modelo. Ningún if. Nadie programó "si dice zinc, ve a la izquierda".

## what-is-a-policy
<!-- target: 65 -->

Voy a usar mucho una palabra, así que la defino: **política**.

En robótica, la política es el cerebro de control. Es una función, como las
del colegio: le entra algo y le sale algo.

Le entra **o**, la observación: lo que ven las cámaras y dónde están las
articulaciones en este momento. Le entra **ℓ**, la instrucción, lo que le
pediste. Y le sale **a**, la acción: no un solo movimiento, sino un bloque de
movimientos hacia el futuro, como un segundo y medio de plan.

ACT, el modelo con el que empecé, no tiene ese término ℓ. Un VLA sí. Toda la
charla cabe en esa diferencia.

Y un detalle que mucha gente asume mal: esto no es reinforcement learning, no
es un robot que aprende a punta de prueba y error con premios. Es aprender por
imitación: le mostramos cómo lo hace una persona y lo copia.

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

Esta es la parte técnica. Aguántenme unos doce minutos; lo voy a contar
paso a paso.

## language-in
<!-- target: 100 -->

Empecemos por cómo entra el lenguaje. Y para eso hay que entender qué es un
token.

Un modelo de lenguaje no lee letras ni palabras completas. Tiene un
diccionario fijo de decenas de miles de pedacitos de texto, y parte cualquier
frase en esos pedacitos. A cada pedacito lo llamamos **token**. Las palabras
comunes son un solo token; las raras se parten en dos o tres. Aquí "frasco"
se parte en dos, y no pasa absolutamente nada.

Cada token tiene un número en ese diccionario, su ID. Pero un número suelto no
dice nada del significado. Así que el modelo tiene una tabla enorme donde cada
ID apunta a una lista de números, un **vector**. En SmolVLA son 960 números por
token. Esa lista es como la huella del significado: palabras parecidas tienen
listas parecidas. "Frasco" y "botella" quedan cerca; "frasco" y "caminar",
lejos.

Y un truco astuto: no le pasamos la frase suelta. En OpenVLA se envuelve en
una plantilla fija: "In: What action should the robot take to... tu frase?
Out:". Así el modelo no aprende una tarea rara y nueva. Sigue haciendo lo de
siempre, lo mismo que ChatGPT: completar lo que viene después de "Out".

Desde aquí, para el modelo, la frase ya no es texto. Es una fila de vectores.

## vision-in
<!-- target: 75 -->

La imagen entra de una forma muy parecida.

Para un computador, una foto es una cuadrícula de píxeles, y cada píxel son
tres números: cuánto rojo, cuánto verde y cuánto azul. Nada más.

Lo que hacemos es cortar la foto en cuadritos, parches, como un
rompecabezas. Cada parche pasa por un codificador de visión, una red que ya
se entrenó viendo millones de imágenes con su descripción. Esa red convierte
cada parche en un vector del mismo tamaño que los de las palabras. Un parche
donde está el frasco termina con una lista de números que "se parece" a la
idea de frasco.

SmolVLA resume cada imagen en 64 tokens, y como tengo tres cámaras, son unos
doscientos tokens de imagen en cada momento.

Y falta un ingrediente: dónde está el brazo. Cada motor reporta su ángulo, y
esos seis números también se convierten en un vector, un token de estado.

Ahora lo importante: los tokens de las imágenes, los de la frase y el del
estado se pegan en una sola fila. Para el transformer es una secuencia de
vectores. No sabe cuáles eran píxeles y cuáles eran palabras, y no le hace
falta.

## attention
<!-- target: 145 -->

Y ahora sí: ¿qué es la **atención**? Porque la palabra se usa mucho y casi
nadie la explica.

Imaginen una reunión donde cada token puede hacerle una pregunta a todos los
demás. Para eso, cada token prepara tres cosas. Una **pregunta**: qué estoy
buscando. Una **etiqueta**: qué tengo yo para ofrecer. Y un **contenido**: la
información que entrego si alguien me escoge. En los papers se llaman Q, K y
V: query, key y value.

Tomemos la palabra "zinc". Su pregunta es algo como "¿dónde hay un frasco
pequeño con etiqueta?". Esa pregunta se compara con la etiqueta de todos los
demás tokens, y cada comparación da un puntaje: qué tanto encaja. Los
parches donde está el frasco encajan mucho; los de la taza, poco; los de la
mesa vacía, casi nada.

Esos puntajes se convierten en porcentajes que suman cien. Eso es el
softmax. Y el token "zinc" se lleva una mezcla del contenido de todos, en esas
proporciones: casi todo lo que aporta el frasco, un poquito del resto. Así,
después de la atención, el vector de "zinc" ya sabe dónde está el zinc en la
imagen. Eso es "ubicar" sin dibujar ninguna caja.

Y esto no pasa una vez. Pasa en paralelo, con varias preguntas distintas a la
vez, y se repite capa tras capa, dieciséis veces en SmolVLA.

¿Es la misma atención de ChatGPT? Sí, exactamente la misma operación: la
fórmula que ven en pantalla. ChatGPT la usa para decidir qué palabras
anteriores importan para escribir la siguiente. Aquí la usamos para mezclar
palabras con pedazos de imagen.

Lo nuevo está al final. Los tokens de acción solo preguntan, y el modelo de
visión y lenguaje responde. Eso es cross-attention: las acciones preguntan
"¿qué hago?", y la respuesta sale de lo que el modelo vio y leyó.

Y la máscara decide quién puede mirar a quién. En ChatGPT cada palabra solo
mira hacia atrás, para no hacer trampa viendo el futuro. Aquí la imagen y la
frase se miran completas entre sí, y cada acción solo mira las acciones
anteriores. Casi toda la diferencia con un LLM está en esa máscara y en las
últimas capas.

## action-tokens
<!-- target: 130 -->

Ahora la parte más interesante: ¿cómo sale movimiento de un modelo que fue
hecho para escribir?

Empecemos por lo que hay de verdad en el brazo. Cada motor tiene un sensor
que dice en qué posición está: un número de 0 a 4095 por vuelta. Al calibrar,
LeRobot convierte ese número en grados. Treinta veces por segundo leemos seis
números: la base, el hombro, el codo, la muñeca, su giro y la pinza.

Entonces un movimiento, visto por el computador, es solo una tabla de
números en el tiempo. Esta curva es una sola articulación durante un segundo.

La muestreamos treinta veces por segundo: treinta puntos.

Y aquí está el problema. Un transformer no escribe números con decimales.
Escoge fichas de un diccionario. Así que hay que convertir cada número en una
ficha.

La forma más simple: tomas el rango en que se mueve esa articulación y lo
cortas en 256 cajones iguales, como una regla con 256 rayitas. Cada valor cae
en un cajón, y el número del cajón es el token. Es como redondear un precio al
peso más cercano. RT-2 y OpenVLA hacen justo esto: toman los 256 tokens menos
usados del diccionario y les dan un significado nuevo, "cajón 0" hasta "cajón
255". Funciona, pero miren la escalera: al redondear, se pierde precisión.

Hoy hay dos formas mejores. **FAST** no redondea punto por punto: describe la
curva completa como una suma de ondas, como hace JPEG con una foto. Un
movimiento suave necesita pocas ondas, así que se guardan esas pocas y se
comprime muchísimo. En una tarea de doblar camisetas, de 700 tokens pasa a 53.

Y **flow matching**, que es lo que usa el modelo del demo, se salta los tokens
del todo. No escoge fichas: produce los números directamente. Arranca con un
bloque de números al azar, puro ruido, y en diez pasos lo va puliendo, como
revelar una foto, hasta que queda una trayectoria. Eso usan π0, SmolVLA y
GR00T.

## detokenizer
<!-- target: 85 -->

Y el camino de vuelta, que casi nadie explica. Del token al torque.

En OpenVLA, el modelo escupe siete tokens: tres para mover la mano de
posición, tres para girarla y uno para la pinza. Cada token es una ficha del
diccionario, así que le restas dónde empiezan esas fichas y te queda el número
del cajón, de 0 a 255.

Ese cajón se lleva a una escala de menos uno a uno. Y luego se "des-normaliza":
se vuelve a la escala real, milímetros y grados, usando cómo se movía el
brazo en los datos de entrenamiento. Un detalle fino: se usan los
percentiles 1 y 99, no el mínimo y el máximo, para que una sola demostración
mala no estire toda la regla.

En SmolVLA es más directo, porque no hay cajones: los números ya salen del
modelo y solo hay que devolverlos a grados con el promedio y la dispersión
que se midieron en el dataset.

¿Y dónde está el torque? Ese número final se le envía a cada motor como
"quiero que estés en esta posición". El motor tiene su propio control
adentro: mide dónde está, ve cuánto le falta, y aplica la fuerza necesaria
para llegar. Ese es el torque del título. El modelo decide a dónde; el motor
se encarga del empujón.

## action-chunking
<!-- target: 85 -->

Otro truco clave: predecir bloques, no pasos.

Piénsenlo como manejar. Si solo pudieran mirar la carretera una vez por
segundo y decidir un solo movimiento del timón cada vez, manejarían a
tirones. Eso le pasa a un robot que predice una acción por inferencia: se
detiene a pensar en cada paso, y como cada decisión ignora la anterior, tiembla.

Con chunking, una sola inferencia devuelve un bloque de cincuenta acciones
hacia el futuro, y el brazo las ejecuta seguidas. Cincuenta acciones a treinta
por segundo son casi dos segundos de movimiento. En mi 5060 Ti, calcular un
bloque tarda unos 150 milisegundos. Pensar poco, moverse mucho.

ACT usa bloques de unas cien acciones; SmolVLA y π0, de cincuenta.

Pero queda una costura: al pasar de un bloque al siguiente, el brazo puede
dar un saltito. La solución de 2025 es calcular el siguiente bloque mientras
todavía ejecuta el actual, y mezclar el pedazo donde se solapan para que no se
note el cambio. Se llama real-time chunking, y en LeRobot hoy es una bandera en
la línea de comandos.

## architecture
<!-- target: 115 -->

Juntemos todo. Esta es la máquina completa, al estilo SmolVLA, y vamos a
seguir un ciclo de principio a fin.

Entran tres fotos, una por cámara, cada una resumida en 64 tokens. Entra la
frase, unos pocos tokens. Y entra el token del estado, dónde está el brazo.
Unos doscientos tokens en una sola fila.

Esa fila pasa por el modelo de visión y lenguaje, capa por capa, y en cada
capa la atención mezcla la información: la palabra zinc encuentra el frasco,
el frasco se relaciona con dónde está la pinza.

Y aquí está la idea que más me gusta del paper. El modelo original tiene 32
capas, y SmolVLA usa solo las primeras 16. Las últimas capas de un modelo de
lenguaje se especializan en producir texto bonito, y un robot no necesita
hablar. Las cortan, y el modelo queda la mitad de pesado.

Después viene el action expert, un modelo pequeño de unos cien millones de
parámetros. Arranca con ruido, le pregunta al modelo grande con
cross-attention, y en diez pasos limpia ese ruido hasta tener cincuenta
acciones. El brazo las ejecuta, la cámara ve el resultado, y el ciclo vuelve
a empezar.

Para ponerlo en perspectiva: OpenVLA tiene 7 mil millones de parámetros, usa
tokens discretos y corre a unos 6 ciclos por segundo en una 4090. SmolVLA
tiene 450 millones y corre en un portátil. Es el que van a ver en un rato.

## ch-train
<!-- target: 10 -->

Ya sabemos cómo piensa. Ahora, cómo aprende.

## recording
<!-- target: 80 -->

Todo empieza grabando datos. Y el montaje tiene dos brazos iguales.

Yo muevo el brazo **líder** con la mano, como un titiritero. El **seguidor**
copia el movimiento, un pelín tarde. Mientras tanto, las tres cámaras graban.

Treinta veces por segundo se escribe un renglón, como en una hoja de cálculo:
las tres imágenes de ese instante, los seis ángulos del seguidor, los seis
ángulos del líder y la frase de la tarea. Cada vez que hago la tarea completa,
eso es un episodio.

Y miren estas dos filas, porque no son lo mismo. El **estado** es dónde está el
robot, lo que lee el seguidor. La **acción** es a dónde lo mandó el humano, lo
que marca el líder. Entrenar una política es aprender a adivinar la segunda a
partir de la primera y de las imágenes. Eso es todo el behavior cloning.

## training
<!-- target: 85 -->

¿Y qué significa entrenar, concretamente?

El modelo tiene millones de perillas, sus parámetros. Al principio adivina
mal. Le mostramos un instante del dataset, las imágenes, la frase y el estado,
y le pedimos el bloque de acciones que viene. Lo comparamos con lo que de
verdad hizo el humano. La diferencia entre las dos curvas es el **error**.

Entonces se ajustan todas las perillas un poquito, justo en la dirección que
hace ese error más pequeño. Eso es un paso de entrenamiento. Y se repite con
otro instante, y con otro, miles de veces.

Veinte mil pasos después, la predicción cae encima de lo que hizo el humano.

Sin recompensa, sin prueba y error: copia. Para SmolVLA con unos cincuenta
episodios, son unas cuatro horas en una A100.

## pretrain-finetune
<!-- target: 70 -->

¿Y cómo basta con cincuenta episodios, si dijimos que los datos son el
problema?

Por el pre-entrenamiento. Antes de que yo lo tocara, SmolVLA ya se había
entrenado con 481 datasets de la comunidad: más de diez millones de
fotogramas de robots haciendo cosas. Y antes de eso, su parte de visión y
lenguaje ya había visto millones de imágenes con texto. Ya sabe qué es un
frasco y cómo se mueve un brazo en general. Meses de GPU que ustedes no
pagaron.

Ustedes aportan su parte: cincuenta episodios, por ejemplo cinco posiciones
con diez repeticiones cada una. Unas horas. Eso solo le enseña los detalles
de su mesa, su brazo y sus objetos.

Sin la primera fase, cincuenta episodios no alcanzan ni de lejos. Con ella,
alcanzan. Eso es todo lo que significa "modelo fundacional" en robótica.

## ch-demo
<!-- target: 20 -->

Y ahora, la parte que puede salir mal.

Puse el demo a mitad de la charla a propósito. Si falla, todavía me queda
media charla para recuperarme.

## my-build
<!-- target: 60 -->

Primero, el brazo. Es un SO-100, un diseño abierto, y lo imprimí en una Ender 3.

Seis servos por brazo, todos en un mismo bus serial, y tres cámaras USB:
arriba, en la muñeca y en la base.

La anécdota que lo resume: los primeros agujeros me salieron medio milímetro
pequeños y me comí los tornillos. Tuve que calibrar la compensación de la
impresora antes de poder armar nada.

El par, líder y seguidor, sale en unos 230 dólares en piezas.

## demo-video
<!-- target: 50 -->

Esto es en mi mesa, en mi casa, con la política que entrené.

Le escribo una frase: "agarra la caja de Complejo B".

(Deja correr el vídeo. Cuando el brazo tome la caja, una pausa.)

Y va por la caja. Ahora fíjense en lo que cambia en el siguiente vídeo.

## demo-zinc
<!-- target: 250 -->

Mismo brazo. Mismos pesos. Misma mesa. Lo único que cambio es la frase:
"agarra el frasco de zinc".

(Deja correr el vídeo.)

Y ahora va por el frasco. Cambió la frase, y cambió lo que hace. No hay un if
en ninguna parte.

Ahora lo vamos a hacer aquí, en vivo, con la luz de esta sala.

(Cambia a la terminal para el demo en vivo.)

Primero: "agarra la caja de Complejo B".

(Ejecuta. Silencio. Deja que la sala lo mire.)

Ahora cambio sólo la frase: "agarra el frasco de zinc".

(Ejecuta. Cuando vaya al otro objeto, calla.)

Eso es un VLA. Todo lo demás en esta charla explica cómo llega ahí.

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
<!-- target: 90 -->

Pero seamos honestos con lo que todavía no funciona.

Primero, una palabra que van a ver en todos los papers: benchmark. Un
benchmark es un examen estándar: las mismas tareas, en un simulador, para
todos los modelos. Así es como los papers se comparan entre sí.

En 2024, OpenVLA sacaba 76 % en el examen más usado, LIBERO. Hoy todos sacan 97
o 98. Eso es lo que llamamos un benchmark saturado: el examen se volvió fácil
y ya no separa a los buenos de los mejores.

¿Por qué les importa? Porque si alguien les muestra un 98 % en LIBERO, eso no
les dice casi nada de cómo le va a ir a ese modelo en su mesa, con su luz y
sus objetos.

La prueba de verdad es un robot real. RoboArena, por ejemplo, pone dos
políticas a hacer la misma tarea en robots físicos, y la gente vota sin saber
cuál es cuál. Y juntar datos reales sigue siendo carísimo: DROID necesitó
cincuenta personas durante un año.

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
<!-- target: 100 -->

Y la pregunta que seguro tienen: ¿qué tiene que ver esto con los modelos
generalistas de los que todo el mundo habla, como GPT, Gemini o Claude?

Comparémoslos lado a lado.

Lo que **entra**: al generalista le entra texto e imágenes. Al VLA le entran
las cámaras, la instrucción y el estado del brazo.

Lo que **sale**: el generalista devuelve texto, planes o llamadas a
herramientas. El VLA devuelve movimientos de motor.

La **velocidad**: el generalista piensa unas pocas veces por segundo, o menos.
El VLA tiene que actuar de 30 a 200 veces por segundo, porque el mundo no espera.

De **dónde aprende**: el generalista aprendió de internet, de texto e imágenes
que ya existían. El VLA, de demostraciones que alguien tuvo que grabar.

Y **cuando se equivoca**: con el generalista, reescribes el prompt. Con el
VLA, se cae un frasco al suelo.

Entonces no compiten: se combinan. El generalista toma "limpia la mesa" y lo
convierte en pasos. El VLA ejecuta cada paso. El generalista decide **qué**; el
VLA decide **cómo**. Y ya hay sistemas donde el generalista llama al VLA como
una herramienta más, igual que llamaría a una API.

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
